import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT ?? 3000),
  adminToken: process.env.ADMIN_TOKEN ?? "development-admin-token",
  databasePath: process.env.DATABASE_PATH ?? "./data/nexus-store.db",
};
