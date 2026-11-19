-- Kingdom Keychains secure checkout storage.
CREATE TABLE IF NOT EXISTS inventory (
  product_key TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'available'
    CHECK (status IN ('available', 'reserved', 'sold')),
  reservation_id TEXT,
  reserved_until TEXT,
  square_payment_id TEXT,
  sold_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory(status);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL
    CHECK (status IN ('pending', 'paid', 'payment_failed', 'needs_review')),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  shipping_address_json TEXT NOT NULL,
  subtotal_cents INTEGER NOT NULL,
  shipping_cents INTEGER NOT NULL,
  total_cents INTEGER NOT NULL,
  shipping_quote_id TEXT NOT NULL,
  square_payment_id TEXT,
  idempotency_key TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  paid_at TEXT
);

CREATE TABLE IF NOT EXISTS order_items (
  order_id TEXT NOT NULL REFERENCES orders(id),
  product_key TEXT NOT NULL,
  item_price_cents INTEGER NOT NULL,
  PRIMARY KEY (order_id, product_key)
);

CREATE TABLE IF NOT EXISTS shipping_quotes (
  id TEXT PRIMARY KEY,
  postal_code TEXT NOT NULL,
  cart_signature TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  service TEXT NOT NULL,
  package_code TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_shipping_quotes_expiry ON shipping_quotes(expires_at);
