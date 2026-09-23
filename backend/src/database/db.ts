import sqlite3 from "sqlite3";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { env } from "../config/env.js";

const dbDirectory = dirname(env.databasePath);
mkdirSync(dbDirectory, { recursive: true });

const sqlite = sqlite3.verbose();

export const db = new sqlite.Database(env.databasePath);

db.exec("PRAGMA busy_timeout = 10000;");
db.exec("PRAGMA journal_mode = WAL;");

export type DatabaseConnection = sqlite3.Database;

export async function initializeDatabase(): Promise<void> {
  const schemaPath = resolve(import.meta.dirname, "schema.sql");
  const schema = readFileSync(schemaPath, "utf8");

  return new Promise((resolveDatabase, reject) => {
    db.exec(schema, (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolveDatabase();
    });
  });
}

export async function runTransaction<T>(
  callback: (connection: DatabaseConnection) => Promise<T>,
): Promise<T> {
  await runSql("BEGIN IMMEDIATE");

  try {
    const result = await callback(db);
    await runSql("COMMIT");
    return result;
  } catch (error) {
    try {
      await runSql("ROLLBACK");
    } catch {
      // Preserve the original transaction error.
    }

    throw error;
  }
}

function runSql(sql: string): Promise<void> {
  return new Promise((resolveSql, reject) => {
    db.run(sql, (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolveSql();
    });
  });
}