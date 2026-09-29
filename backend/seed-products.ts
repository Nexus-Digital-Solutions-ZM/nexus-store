import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { readFileSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sqlite = sqlite3.verbose();
const db = new sqlite.Database('./data/nexus-store.db');

db.exec("PRAGMA busy_timeout = 10000;");
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");

// Initialize schema
const schema = readFileSync(resolve(__dirname, "src/database/schema.sql"), "utf8");
const statements = schema.split(";").filter(s => s.trim());

for (const stmt of statements) {
  await new Promise((resolve, reject) => {
    db.run(stmt.trim(), (err) => {
      if (err) reject(err);
      else resolve(true);
    });
  });
}

const products = [
  { id: '1', name: 'Wireless Headphones', price: 149.99, stock: 50, description: 'Premium wireless headphones with noise cancellation', image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400' },
  { id: '2', name: 'Smart Watch', price: 299.99, stock: 30, description: 'Latest smartwatch with health monitoring', image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400' },
  { id: '3', name: 'Laptop Stand', price: 49.99, stock: 100, description: 'Ergonomic aluminum laptop stand', image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400' },
  { id: '4', name: 'Mechanical Keyboard', price: 129.99, stock: 40, description: 'RGB mechanical keyboard with blue switches', image_url: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=400' },
  { id: '5', name: 'USB-C Hub', price: 79.99, stock: 60, description: '7-in-1 USB-C hub with HDMI and SD card reader', image_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400' },
  { id: '6', name: 'Monitor Arm', price: 89.99, stock: 25, description: 'Adjustable monitor arm for dual screens', image_url: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=400' },
  { id: '7', name: 'Webcam 4K', price: 199.99, stock: 35, description: '4K webcam with auto-focus and privacy cover', image_url: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=400' },
  { id: '8', name: 'Wireless Mouse', price: 39.99, stock: 80, description: 'Ergonomic wireless mouse with 12-month battery', image_url: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400' },
];

async function seedProducts() {
  for (const p of products) {
    await new Promise((resolve, reject) => {
      const now = new Date().toISOString();
      db.run(
        `INSERT INTO products (id, name, price, stock, description, image_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.id, p.name, p.price, p.stock, p.description, p.image_url, now, now],
        (err) => {
          if (err) reject(err);
          else {
            console.log(`Inserted: ${p.name}`);
            resolve(true);
          }
        }
      );
    });
  }
  console.log('Seeding complete!');
  db.close(() => console.log('DB closed'));
}

seedProducts().catch(console.error);