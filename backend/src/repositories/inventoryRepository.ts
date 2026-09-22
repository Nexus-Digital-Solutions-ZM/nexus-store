import { db } from "../database/db.js";
import type { InventoryMovement } from "../types/inventory.js";

function mapMovement(row: {
  id: string;
  product_id: string;
  quantity: number;
  type: string;
  previous_stock: number;
  new_stock: number;
  order_id: string | null;
  created_at: string;
}): InventoryMovement {
  return {
    id: row.id,
    productId: row.product_id,
    quantity: row.quantity,
    type: row.type as InventoryMovement["type"],
    previousStock: row.previous_stock,
    newStock: row.new_stock,
    ...(row.order_id !== null && { orderId: row.order_id }),
    createdAt: row.created_at,
  };
}

export const inventoryRepository = {
  async findAll(): Promise<InventoryMovement[]> {
    return new Promise((resolve, reject) => {
      db.all(
        `
          SELECT
            id, product_id, quantity, type, previous_stock, new_stock, order_id, created_at
          FROM stock_movements
          ORDER BY created_at DESC
        `,
        (error, rows) => {
          if (error) {
            reject(error);
            return;
          }

          resolve((rows as Array<{
            id: string;
            product_id: string;
            quantity: number;
            type: string;
            previous_stock: number;
            new_stock: number;
            order_id: string | null;
            created_at: string;
          }>).map(mapMovement));
        },
      );
    });
  },

  async create(movement: {
    id: string;
    productId: string;
    quantity: number;
    type: InventoryMovement["type"];
    previousStock: number;
    newStock: number;
    createdAt: string;
    orderId?: string;
  }): Promise<InventoryMovement> {
    return new Promise((resolve, reject) => {
      db.run(
        `
          INSERT INTO stock_movements (id, product_id, quantity, type, previous_stock, new_stock, order_id, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          movement.id,
          movement.productId,
          movement.quantity,
          movement.type,
          movement.previousStock,
          movement.newStock,
          movement.orderId ?? null,
          movement.createdAt,
        ],
        (error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(movement);
        },
      );
    });
  },

  async createMany(movements: Array<{
    id: string;
    productId: string;
    quantity: number;
    type: InventoryMovement["type"];
    previousStock: number;
    newStock: number;
    createdAt: string;
    orderId?: string;
  }>): Promise<InventoryMovement[]> {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        const stmt = db.prepare(
          `
            INSERT INTO stock_movements (id, product_id, quantity, type, previous_stock, new_stock, order_id, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `,
        );

        for (const movement of movements) {
          stmt.run(
            movement.id,
            movement.productId,
            movement.quantity,
            movement.type,
            movement.previousStock,
            movement.newStock,
            movement.orderId ?? null,
            movement.createdAt,
          );
        }

        stmt.finalize();
      });

      resolve(movements);
    });
  },
};