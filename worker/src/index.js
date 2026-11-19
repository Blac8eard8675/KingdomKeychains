/**
 * Kingdom Keychains — secure store API
 *
 * Initial deployment step: a safe health/configuration endpoint.
 * Square credentials and database bindings are added as Cloudflare secrets/bindings,
 * never committed to this repository.
 */

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
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

export default {
  async fetch(request, env) {
    const headers = corsHeaders(request, env);

    if (request.method === "OPTIONS") {
      if (!headers["Access-Control-Allow-Origin"]) {
        return new Response(null, { status: 403 });
      }
      return new Response(null, { status: 204, headers });
    }

    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/health") {
      return json({
        service: "Kingdom Keychains Store API",
        status: "ok",
        stage: "initial-connection",
        integrations: {
          squareTokenConfigured: Boolean(env.SQUARE_ACCESS_TOKEN),
          squareLocationConfigured: Boolean(env.SQUARE_LOCATION_ID),
          databaseConfigured: Boolean(env.DB)
        }
      }, 200, headers);
    }

    return json({ error: "Not found" }, 404, headers);
  }
};
