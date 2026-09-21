CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  stock INTEGER NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TEXT NOT NULL
);

-- TODO: add orders, reservations, payments, stock movements, and inventory tables in later tasks.
