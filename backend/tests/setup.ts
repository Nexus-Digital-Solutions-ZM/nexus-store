import { beforeAll, afterAll, beforeEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const testDbPath = path.join(os.tmpdir(), `nexus-store-test-${Date.now()}-${Math.random().toString(36).slice(2)}.db`);
process.env.DATABASE_PATH = testDbPath;
process.env.PORT = "3000";
process.env.ADMIN_TOKEN = "test-admin-token";

const { db, initializeDatabase } = await import("../src/database/db.js");

beforeAll(async () => {
  await initializeDatabase();

  await new Promise<void>((resolve, reject) => {
    db.serialize(() => {
      db.run("DELETE FROM products", (error) => {
        if (error) { reject(error); return; }
        const stmt = db.prepare(
          `INSERT INTO products (id, name, price, stock, description, image_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        );
        try {
          stmt.run("product-1", "Test Product A", 100, 10, "Description A", null, "2026-01-01", "2026-01-01");
          stmt.run("product-2", "Test Product B", 50, 5, "Description B", null, "2026-01-01", "2026-01-01");
          stmt.run("product-3", "Test Product C", 200, 0, "Description C", null, "2026-01-01", "2026-01-01");
          stmt.finalize();
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  });
});

afterAll(async () => {
  // Keep DB open; OS cleans up temp files on process exit
});

beforeEach(async () => {
  for (const sql of [
    "DELETE FROM stock_movements",
    "DELETE FROM reservation_items",
    "DELETE FROM reservations",
    "DELETE FROM order_items",
    "DELETE FROM payments",
    "DELETE FROM orders",
  ]) {
    await new Promise<void>((resolve, reject) => {
      db.run(sql, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  await new Promise<void>((resolve, reject) => {
    db.run(
      "UPDATE products SET stock = CASE WHEN id = 'product-1' THEN 10 WHEN id = 'product-2' THEN 5 WHEN id = 'product-3' THEN 0 END",
      (error) => {
        if (error) reject(error);
        else resolve();
      },
    );
  });
});