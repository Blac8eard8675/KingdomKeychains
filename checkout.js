/* Kingdom Keychains — embedded Square checkout */
(() => {
  const CART_KEY = "kingdomKeychainsCartV1";
  const config = window.KK_CHECKOUT_CONFIG || {};
  const apiBase = String(config.apiBaseUrl || "").replace(/\/+$/, "");
  const environment = config.environment === "production" ? "production" : "sandbox";
  const money = value => "$" + Number(value || 0).toFixed(2);
  const priceOf = item => {
    if (["Bracelets", "Chainlinks", "Ropes"].includes(item.category)) return 5;
    if (item.category === "Crosses") {
      return ["eternity cross", "shalom"].includes(String(item.subcategory || "").trim().toLowerCase()) ? 15 : 10;
    }
    return 0;
  };

  let cart = [];
  let card = null;
  const shippingQuoteId = "flat-rate-10";
  const shippingCents = 1000;
  let idempotencyKey = "";
  let busy = false;
  let paymentComplete = false;

  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    if (Array.isArray(saved)) cart = saved.filter(item => item && item.key);
  } catch {
    cart = [];
  }

  const form = document.getElementById("kkDeliveryForm");
  const shippingStatus = document.getElementById("kkShippingStatus");
  const paymentStatus = document.getElementById("kkPaymentStatus");
  const payButton = document.getElementById("kkPayButton");
  const subtotalCents = cart.reduce(
    (sum, item) => sum + Math.round(priceOf(item) * 100), 0
  );

  function status(element, message, kind = "") {
    if (!element) return;
    element.textContent = message;
    element.classList.remove("error", "success");
    if (kind) element.classList.add(kind);
  }

  function buyerDetails() {
    const data = new FormData(form);
    return {
      name: String(data.get("fullName") || "").trim(),
      email: String(data.get("email") || "").trim(),
      phone: String(data.get("phone") || "").trim(),
      address: String(data.get("address") || "").trim(),
      address2: String(data.get("address2") || "").trim(),
      city: String(data.get("city") || "").trim(),
      state: String(data.get("state") || "").trim().toUpperCase(),
      postalCode: String(data.get("zip") || "").trim()
    };
  }

  function updateTotal() {
    document.getElementById("kkCheckoutShipping").textContent =
      cart.length ? money(shippingCents / 100) : "—";
    document.getElementById("kkCheckoutTotal").textContent =
      cart.length ? money((subtotalCents + shippingCents) / 100) : "—";
  }

  function updatePayButton() {
    if (!payButton) return;
    const ready = Boolean(cart.length && card && apiBase && !busy && !paymentComplete);
    payButton.disabled = !ready;
    payButton.setAttribute("aria-disabled", String(!ready));
    payButton.style.opacity = ready ? "1" : ".65";
    payButton.style.cursor = ready ? "pointer" : "not-allowed";
  }

  function loadSquareSdk() {
    return new Promise((resolve, reject) => {
      if (window.Square) return resolve();
      const script = document.createElement("script");
      script.src = environment === "production"
        ? "https://web.squarecdn.com/v1/square.js"
        : "https://sandbox.web.squarecdn.com/v1/square.js";
      script.onload = resolve;
      script.onerror = () => reject(new Error("Square's secure payment library could not be loaded."));
      document.head.appendChild(script);
    });
  }

  async function initializeSquare() {
    if (!config.applicationId || !config.locationId || !apiBase) {
      status(paymentStatus, "The secure Square connection will be activated after the store settings are added.");
      updatePayButton();
      return;
    }
    try {
      await loadSquareSdk();
      const payments = window.Square.payments(config.applicationId, config.locationId);
      card = await payments.card();
      await card.attach("#kk-card-container");
      status(paymentStatus, "Secure card entry is ready. Your card details go directly to Square.");
      updatePayButton();
    } catch (error) {
      status(paymentStatus, error.message || "Square card entry could not be initialized.", "error");
    }
  }

  if (!cart.length) {
    status(shippingStatus, "Your cart is empty. Add a keychain before checkout.");
    updateTotal();
    updatePayButton();
    return;
  }

  status(shippingStatus, "Flat-rate shipping and handling: $10.00 per order.");
  updateTotal();

  payButton.addEventListener("click", async () => {
    if (busy || !card || !form.reportValidity()) return;
    busy = true;
    updatePayButton();
    status(paymentStatus, "Securely preparing your payment…");

    try {
      const buyer = buyerDetails();
      const tokenResult = await card.tokenize();
      if (tokenResult.status !== "OK" || !tokenResult.token) {
        throw new Error(tokenResult.errors?.[0]?.message || "Please check your card information.");
      }

      const payments = window.Square.payments(config.applicationId, config.locationId);
      const nameParts = buyer.name.split(/\s+/);
      const verification = await payments.verifyBuyer(tokenResult.token, {
        amount: ((subtotalCents + shippingCents) / 100).toFixed(2),
        currencyCode: "USD",
        intent: "CHARGE",
        customerInitiated: true,
        sellerKeyedIn: false,
        billingContact: {
          givenName: nameParts[0] || "",
          familyName: nameParts.slice(1).join(" "),
          email: buyer.email,
          phone: buyer.phone || undefined,
          addressLines: [buyer.address, buyer.address2].filter(Boolean),
          city: buyer.city,
          state: buyer.state,
          postalCode: buyer.postalCode,
          countryCode: "US"
        }
      });

      if (!idempotencyKey) idempotencyKey = crypto.randomUUID();
      const response = await fetch(apiBase + "/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceId: tokenResult.token,
          verificationToken: verification?.token || "",
          idempotencyKey,
          cartKeys: cart.map(item => item.key),
          shippingQuoteId,
          buyer
        })
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        if (response.status === 402 || response.status === 409) idempotencyKey = "";
        throw new Error(result.error || "Square could not confirm your payment.");
      }

      paymentComplete = true;
      localStorage.removeItem(CART_KEY);
      status(paymentStatus, "Payment successful! Thank you for supporting Kingdom Keychains.", "success");
      if (result.receiptUrl) {
        const receipt = document.createElement("a");
        receipt.href = result.receiptUrl;
        receipt.target = "_blank";
        receipt.rel = "noopener noreferrer";
        receipt.textContent = " View Square receipt";
        paymentStatus.appendChild(receipt);
      }
      payButton.textContent = "Payment Complete";
    } catch (error) {
      status(paymentStatus, error.message || "Payment could not be completed. Your cart has been kept.", "error");
    } finally {
      busy = false;
      updatePayButton();
    }
  });

  updateTotal();
  initializeSquare();
})();
