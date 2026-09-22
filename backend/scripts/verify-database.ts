import sqlite3 from "sqlite3";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const sqlite = sqlite3.verbose();

const testDirectory = resolve(process.cwd(), "data");
mkdirSync(testDirectory, { recursive: true });

const databasePath = resolve(testDirectory, "schema-verification.db");

if (existsSync(databasePath)) {
  rmSync(databasePath);
}

const db = new sqlite.Database(databasePath);

function run(sql: string, params: unknown[] = []): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

function all<T = Record<string, unknown>>(
  sql: string,
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, (error, rows) => {
      if (error) reject(error);
      else resolve(rows as T[]);
    });
  });
}

async function main(): Promise<void> {
  await run("PRAGMA foreign_keys = ON;");

  const schemaPath = resolve(
    process.cwd(),
    "backend/src/database/schema.sql",
  );

  const { readFileSync } = await import("node:fs");
  const schema = readFileSync(schemaPath, "utf8");

  await new Promise<void>((resolve, reject) => {
    db.exec(schema, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });

  const tables = await all<{ name: string }>(
    `
      SELECT name
      FROM sqlite_master
      WHERE type = 'table'
      ORDER BY name;
    `,
  );

  const expectedTables = [
    "order_items",
    "orders",
    "payments",
    "products",
    "reservation_items",
    "reservations",
    "stock_movements",
  ];

  const actualTables = tables.map((table) => table.name);

  for (const table of expectedTables) {
    if (!actualTables.includes(table)) {
      throw new Error(`Missing table: ${table}`);
    }
  }

  const foreignKeys = await all<{ foreign_keys: number }>(
    "PRAGMA foreign_keys;",
  );

  if (foreignKeys[0]?.foreign_keys !== 1) {
    throw new Error("SQLite foreign keys are not enabled.");
  }

  await run(`
    INSERT INTO products (
      id,
      name,
      price,
      stock,
      created_at,
      updated_at
    )
    VALUES ('product-1', 'Test Product', 100, 5, '2026-01-01', '2026-01-01');
  `);

  await run(`
    INSERT INTO orders (
      id,
      status,
      total,
      reservation_expires_at,
      created_at,
      updated_at
    )
    VALUES (
      'order-1',
      'pending_payment',
      200,
      '2026-01-01T00:10:00Z',
      '2026-01-01',
      '2026-01-01'
    );
  `);

  await run(`
    INSERT INTO reservations (
      id,
      order_id,
      status,
      expires_at,
      created_at
    )
    VALUES (
      'reservation-1',
      'order-1',
      'active',
      '2026-01-01T00:10:00Z',
      '2026-01-01'
    );
  `);

  await run(`
    INSERT INTO payments (
      id,
      order_id,
      transaction_id,
      method,
      status,
      amount,
      created_at,
      updated_at
    )
    VALUES (
      'payment-1',
      'order-1',
      'transaction-1',
      'mobile_money',
      'pending',
      200,
      '2026-01-01',
      '2026-01-01'
    );
  `);

  console.log("✓ All required tables created");
  console.log("✓ Foreign keys enabled");
  console.log("✓ Core records inserted successfully");
  console.log("✓ Database schema verification passed");
}

main()
  .catch((error) => {
    console.error("✗ Database schema verification failed");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    db.close();
  });
  