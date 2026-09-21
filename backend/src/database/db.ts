import sqlite3 from "sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

import { env } from "../config/env.js";

const dbDirectory = dirname(env.databasePath);
mkdirSync(dbDirectory, { recursive: true });

const sqlite = sqlite3.verbose();

export const db = new sqlite.Database(env.databasePath);

export async function initializeDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(
      `
        CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          price REAL NOT NULL,
          stock INTEGER NOT NULL,
          description TEXT,
          image_url TEXT,
          created_at TEXT NOT NULL
        );
      `,
      (error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      },
    );
  });
}
