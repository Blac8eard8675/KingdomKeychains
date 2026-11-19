-- Kingdom Keychains checkout database (Cloudflare D1 / SQLite)
-- This migration creates the tables used by worker/src/index.js.

CREATE TABLE IF NOT EXISTS store_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS inventory (
  product_key TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'available',
  reservation_id TEXT,
  reserved_until TEXT,
  square_payment_id TEXT,
  sold_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_inventory_status
  ON inventory(status);

CREATE INDEX IF NOT EXISTS idx_inventory_reservation
  ON inventory(reservation_id);

CREATE TABLE IF NOT EXISTS shipping_quotes (
  id TEXT PRIMARY KEY,
  postal_code TEXT NOT NULL,
  cart_signature TEXT NOT NULL,
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
  service TEXT NOT NULL,
  package_code TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_shipping_quotes_expiry
  ON shipping_quotes(expires_at);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  shipping_address_json TEXT NOT NULL,
  subtotal_cents INTEGER NOT NULL CHECK (subtotal_cents >= 0),
  shipping_cents INTEGER NOT NULL CHECK (shipping_cents >= 0),
  total_cents INTEGER NOT NULL CHECK (total_cents >= 0),
  shipping_quote_id TEXT NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  square_payment_id TEXT,
  paid_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_orders_square_payment
  ON orders(square_payment_id);

CREATE INDEX IF NOT EXISTS idx_orders_status
  ON orders(status);

CREATE TABLE IF NOT EXISTS order_items (
  order_id TEXT NOT NULL,
  product_key TEXT NOT NULL,
  item_price_cents INTEGER NOT NULL CHECK (item_price_cents >= 0),
  PRIMARY KEY (order_id, product_key),
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE INDEX IF NOT EXISTS idx_order_items_product
  ON order_items(product_key);

CREATE TABLE IF NOT EXISTS square_webhook_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL
);
