/**
 * Kingdom Keychains — secure checkout API.
 *
 * Square credentials are Cloudflare Worker secrets, never browser code.
 * The server calculates prices from the trusted catalog and only accepts
 * a shipping quote that was created and stored by the server.
 */

import catalog from "./catalog.json";

const CATALOG = new Map(catalog.map(item => [item.key, item]));
const SQUARE_API_VERSION = "2026-11-18";

const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...headers
    }
  });

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin") || "";
  const allowed = String(env.ALLOWED_ORIGINS || "")
    .split(",")
    .map(value => value.trim())
    .filter(Boolean);

  if (!origin || !allowed.includes(origin)) return {};

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

function isAllowedOrigin(request, env) {
  const origin = request.headers.get("Origin");
  if (!origin) return true;
  return String(env.ALLOWED_ORIGINS || "")
    .split(",")
    .map(value => value.trim())
    .includes(origin);
}

function cleanText(value, max = 200) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function squarePhoneNumber(value) {
  const trimmed = cleanText(value, 30);
  const digits = trimmed.replace(/\D/g, "");

  if (/^\d{10}$/.test(digits)) return "+1" + digits;
  if (/^1\d{10}$/.test(digits)) return "+" + digits;
  if (/^\+[1-9]\d{8,15}$/.test(trimmed)) return trimmed;

  // Phone is optional. Do not let an incorrectly formatted optional number
  // cause Square to reject an otherwise valid card payment.
  return null;
}

async function signatureFor(keys) {
  const bytes = new TextEncoder().encode([...keys].sort().join("\n"));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function ensureCatalogSeeded(db) {
  const seeded = await db.prepare(
    "SELECT value FROM store_meta WHERE key = ?"
  ).bind("catalog_seeded_v1").first();

  if (seeded) return;

  const statements = CATALOG.size
    ? [...CATALOG.keys()].map(key =>
        db.prepare(
          "INSERT OR IGNORE INTO inventory (product_key, status) VALUES (?, 'available')"
        ).bind(key)
      )
    : [];

  for (let index = 0; index < statements.length; index += 100) {
    await db.batch(statements.slice(index, index + 100));
  }

  await db.prepare(
    "INSERT OR IGNORE INTO store_meta (key, value) VALUES (?, ?)"
  ).bind("catalog_seeded_v1", String(CATALOG.size)).run();
}

function squareBaseUrl(env) {
  return String(env.SQUARE_ENVIRONMENT || "sandbox").toLowerCase() === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com";
}

async function handlePayment(request, env) {
  if (!env.DB) {
    return json({ error: "Checkout storage is not configured yet." }, 503);
  }
  if (!env.SQUARE_ACCESS_TOKEN || !env.SQUARE_LOCATION_ID) {
    return json({ error: "Square is not connected yet." }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Please submit a valid checkout request." }, 400);
  }

  const sourceId = cleanText(body.sourceId, 500);
  const idempotencyKey = cleanText(body.idempotencyKey, 45);
  const shippingQuoteId = cleanText(body.shippingQuoteId, 100);
  const verificationToken = cleanText(body.verificationToken, 2000);
  const keys = Array.isArray(body.cartKeys)
    ? body.cartKeys.map(key => cleanText(key, 1200))
    : [];

  const buyer = body.buyer && typeof body.buyer === "object" ? body.buyer : {};
  const name = cleanText(buyer.name, 120);
  const email = cleanText(buyer.email, 255);
  const phone = cleanText(buyer.phone, 30);
  const address = cleanText(buyer.address, 150);
  const address2 = cleanText(buyer.address2, 100);
  const city = cleanText(buyer.city, 100);
  const state = cleanText(buyer.state, 2).toUpperCase();
  const postalCode = cleanText(buyer.postalCode, 10);

  if (!sourceId || !/^[A-Za-z0-9-]{8,45}$/.test(idempotencyKey)) {
    return json({ error: "The secure card token or payment request ID is missing." }, 400);
  }
  if (!keys.length || keys.length > 100 || new Set(keys).size !== keys.length) {
    return json({ error: "Your cart is empty or contains duplicate items." }, 400);
  }
  if (keys.some(key => !CATALOG.has(key))) {
    return json({ error: "One or more items could not be verified. Please refresh your cart." }, 409);
  }
  if (!name || !validEmail(email) || !address || !city ||
      !/^[A-Z]{2}$/.test(state) || !/^\d{5}(-\d{4})?$/.test(postalCode)) {
    return json({ error: "Please complete the required delivery information." }, 400);
  }
  if (!shippingQuoteId) {
    return json({ error: "Please calculate USPS Ground Advantage shipping before paying." }, 400);
  }

  await ensureCatalogSeeded(env.DB);

  const signature = await signatureFor(keys);
  const quote = await env.DB.prepare(
    "SELECT id, postal_code, cart_signature, amount_cents, expires_at FROM shipping_quotes WHERE id = ?"
  ).bind(shippingQuoteId).first();

  if (!quote || quote.postal_code !== postalCode ||
      quote.cart_signature !== signature ||
      !Number.isInteger(quote.amount_cents) ||
      Date.parse(quote.expires_at) <= Date.now()) {
    return json({ error: "Your shipping quote has expired or no longer matches your cart. Please recalculate shipping." }, 409);
  }

  const subtotalCents = keys.reduce((sum, key) => sum + CATALOG.get(key).priceCents, 0);
  const shippingCents = quote.amount_cents;
  const totalCents = subtotalCents + shippingCents;
  const shippingAddress = {
    address_line_1: address,
    address_line_2: address2 || undefined,
    locality: city,
    administrative_district_level_1: state,
    postal_code: postalCode,
    country: "US"
  };

  let order = await env.DB.prepare(
    "SELECT id, status, subtotal_cents, shipping_cents, total_cents, shipping_quote_id FROM orders WHERE idempotency_key = ?"
  ).bind(idempotencyKey).first();

  if (order && (order.subtotal_cents !== subtotalCents ||
      order.shipping_cents !== shippingCents ||
      order.total_cents !== totalCents ||
      order.shipping_quote_id !== shippingQuoteId)) {
    return json({ error: "This payment request does not match the original order." }, 409);
  }

  if (order) {
    const savedItems = await env.DB.prepare(
      "SELECT product_key FROM order_items WHERE order_id = ? ORDER BY product_key"
    ).bind(order.id).all();
    const savedKeys = (savedItems.results || []).map(item => item.product_key);
    const requestedKeys = [...keys].sort();
    if (savedKeys.length !== requestedKeys.length ||
        savedKeys.some((key, index) => key !== requestedKeys[index])) {
      return json({ error: "This payment request does not match the original items." }, 409);
    }
  }

  if (order?.status === "paid") {
    return json({ success: true, alreadyPaid: true, orderId: order.id }, 200);
  }

  if (order?.status === "needs_review") {
    return json({ error: "This payment is awaiting confirmation. Your items are being held; please contact Kingdom Keychains before trying again." }, 202);
  }

  if (!order) {
    const orderId = crypto.randomUUID();
    const reserve = await env.DB.prepare(
      `UPDATE inventory
       SET status = 'reserved', reservation_id = ?, reserved_until = datetime('now', '+20 minutes')
       WHERE product_key IN (${keys.map(() => "?").join(",")})
         AND status = 'available'
         AND (SELECT COUNT(*) FROM inventory
              WHERE product_key IN (${keys.map(() => "?").join(",")})
                AND status = 'available') = ?`
    ).bind(orderId, ...keys, ...keys, keys.length).run();

    if (reserve.meta.changes !== keys.length) {
      return json({ error: "One or more keychains have just been purchased or are being checked out. Please review your cart." }, 409);
    }

    try {
      await env.DB.batch([
        env.DB.prepare(
          `INSERT INTO orders
           (id, status, customer_name, customer_email, customer_phone,
            shipping_address_json, subtotal_cents, shipping_cents, total_cents,
            shipping_quote_id, idempotency_key)
           VALUES (?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(orderId, name, email, phone || null, JSON.stringify(shippingAddress),
          subtotalCents, shippingCents, totalCents, shippingQuoteId, idempotencyKey),
        ...keys.map(key => env.DB.prepare(
          "INSERT INTO order_items (order_id, product_key, item_price_cents) VALUES (?, ?, ?)"
        ).bind(orderId, key, CATALOG.get(key).priceCents))
      ]);
    } catch (error) {
      await env.DB.prepare(
        "UPDATE inventory SET status='available', reservation_id=NULL, reserved_until=NULL WHERE reservation_id=?"
      ).bind(orderId).run();
      throw error;
    }

    order = { id: orderId, status: "pending" };
  } else if (order.status !== "pending" && order.status !== "needs_review") {
    return json({ error: "This order can no longer be paid. Please contact Kingdom Keychains." }, 409);
  }

  const squarePayload = {
    source_id: sourceId,
    idempotency_key: idempotencyKey,
    amount_money: { amount: totalCents, currency: "USD" },
    location_id: env.SQUARE_LOCATION_ID,
    autocomplete: true,
    buyer_email_address: email,
    shipping_address: shippingAddress,
    reference_id: order.id.slice(0, 40),
    note: "Kingdom Keychains website order"
  };
  const squarePhone = squarePhoneNumber(phone);
  if (squarePhone) squarePayload.buyer_phone_number = squarePhone;
  if (verificationToken) squarePayload.verification_token = verificationToken;

  let squareResponse;
  let squareResult;
  try {
    squareResponse = await fetch(squareBaseUrl(env) + "/v2/payments", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + env.SQUARE_ACCESS_TOKEN,
        "Content-Type": "application/json",
        "Square-Version": SQUARE_API_VERSION
      },
      body: JSON.stringify(squarePayload)
    });
    squareResult = await squareResponse.json();
  } catch {
    await env.DB.prepare(
      "UPDATE orders SET status='needs_review' WHERE id=?"
    ).bind(order.id).run();
    return json({ error: "Square could not confirm the payment yet. Your items are temporarily held; please contact us before trying a new payment." }, 502);
  }

  if (!squareResponse.ok) {
    const errorCodes = (squareResult?.errors || []).map(error => error.code);
    if (errorCodes.includes("IDEMPOTENCY_KEY_REUSED") ||
        errorCodes.includes("INTERNAL_SERVER_ERROR") ||
        errorCodes.includes("SERVICE_UNAVAILABLE")) {
      await env.DB.prepare(
        "UPDATE orders SET status='needs_review' WHERE id=?"
      ).bind(order.id).run();
      return json({
        error: "Square could not safely confirm this attempt. Your items are being held; please contact Kingdom Keychains before trying again."
      }, 202);
    }
    await env.DB.batch([
      env.DB.prepare(
        "UPDATE orders SET status='payment_failed' WHERE id=?"
      ).bind(order.id),
      env.DB.prepare(
        "UPDATE inventory SET status='available', reservation_id=NULL, reserved_until=NULL WHERE reservation_id=?"
      ).bind(order.id)
    ]);
    return json({
      error: squareResult?.errors?.[0]?.detail || "Square could not process this payment. Please check the card details and try again."
    }, 402);
  }

  const payment = squareResult?.payment;
  if (!payment?.id || payment.status !== "COMPLETED") {
    await env.DB.prepare(
      "UPDATE orders SET status='needs_review', square_payment_id=? WHERE id=?"
    ).bind(payment?.id || null, order.id).run();
    return json({ error: "Square has not confirmed the payment as complete yet. Your items are being held for review." }, 202);
  }

  await env.DB.batch([
    env.DB.prepare(
      "UPDATE orders SET status='paid', square_payment_id=?, paid_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?"
    ).bind(payment.id, order.id),
    env.DB.prepare(
      "UPDATE inventory SET status='sold', square_payment_id=?, sold_at=strftime('%Y-%m-%dT%H:%M:%fZ','now'), reserved_until=NULL WHERE reservation_id=?"
    ).bind(payment.id, order.id)
  ]);

  return json({
    success: true,
    orderId: order.id,
    paymentId: payment.id,
    receiptUrl: payment.receipt_url || null,
    totalCents
  }, 200);
}

export default {
  async fetch(request, env) {
    const headers = corsHeaders(request, env);
    const url = new URL(request.url);

    if (!isAllowedOrigin(request, env)) {
      return json({ error: "This website is not allowed to use the store API." }, 403);
    }

    if (request.method === "OPTIONS") {
      if (!headers["Access-Control-Allow-Origin"]) {
        return new Response(null, { status: 403 });
      }
      return new Response(null, { status: 204, headers });
    }

    if (request.method === "GET" && url.pathname === "/health") {
      return json({
        service: "Kingdom Keychains Store API",
        status: "ok",
        stage: "square-payment-backend",
        integrations: {
          squareTokenConfigured: Boolean(env.SQUARE_ACCESS_TOKEN),
          squareLocationConfigured: Boolean(env.SQUARE_LOCATION_ID),
          databaseConfigured: Boolean(env.DB),
          catalogProducts: CATALOG.size
        }
      }, 200, headers);
    }

    if (request.method === "POST" && url.pathname === "/payments") {
      const response = await handlePayment(request, env);
      const responseHeaders = new Headers(response.headers);
      Object.entries(headers).forEach(([key, value]) => responseHeaders.set(key, value));
      return new Response(response.body, { status: response.status, headers: responseHeaders });
    }

    return json({ error: "Not found" }, 404, headers);
  }
};
