PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price REAL NOT NULL CHECK (price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  description TEXT,
  image_url TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL CHECK (
    status IN ('pending_payment', 'paid', 'failed', 'expired')
  ),
  total REAL NOT NULL CHECK (total >= 0),
  reservation_expires_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  unit_price REAL NOT NULL CHECK (unit_price >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  subtotal REAL NOT NULL CHECK (subtotal >= 0),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  transaction_id TEXT NOT NULL UNIQUE,
  method TEXT NOT NULL CHECK (
    method IN ('mobile_money', 'card')
  ),
  status TEXT NOT NULL CHECK (
    status IN ('pending', 'success', 'failed')
  ),
  amount REAL NOT NULL CHECK (amount >= 0),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reservations (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (
    status IN ('active', 'released', 'finalized')
  ),
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  released_at TEXT,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reservation_items (
  id TEXT PRIMARY KEY,
  reservation_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  UNIQUE (reservation_id, product_id),
  FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (
    type IN ('restock', 'correction', 'sale')
  ),
  previous_stock INTEGER NOT NULL CHECK (previous_stock >= 0),
  new_stock INTEGER NOT NULL CHECK (new_stock >= 0),
  order_id TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id
  ON order_items(order_id);

CREATE INDEX IF NOT EXISTS idx_order_items_product_id
  ON order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_payments_order_id
  ON payments(order_id);

CREATE INDEX IF NOT EXISTS idx_reservations_expires_at
  ON reservations(expires_at);

CREATE INDEX IF NOT EXISTS idx_reservation_items_reservation_id
  ON reservation_items(reservation_id);

CREATE INDEX IF NOT EXISTS idx_reservation_items_product_id
  ON reservation_items(product_id);

CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id
  ON stock_movements(product_id);

CREATE INDEX IF NOT EXISTS idx_stock_movements_order_id
  ON stock_movements(order_id);