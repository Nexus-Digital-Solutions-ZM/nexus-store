import { db } from "../database/db.js";
import type { OrderRecord, OrderStatus } from "../types/order.js";

function mapOrder(row: {
  id: string;
  status: OrderStatus;
  total: number;
  reservation_expires_at: string | null;
  created_at: string;
  updated_at: string;
}): OrderRecord {
  return {
    id: row.id,
    status: row.status,
    total: row.total,
    ...(row.reservation_expires_at !== null && {
      reservationExpiresAt: row.reservation_expires_at,
    }),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const orderRepository = {
  async create(order: {
    id: string;
    status: OrderStatus;
    total: number;
    reservationExpiresAt?: string;
    createdAt: string;
    updatedAt: string;
  }): Promise<OrderRecord> {
    return new Promise((resolve, reject) => {
      db.run(
        `
          INSERT INTO orders (id, status, total, reservation_expires_at, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          order.id,
          order.status,
          order.total,
          order.reservationExpiresAt ?? null,
          order.createdAt,
          order.updatedAt,
        ],
        (error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(order);
        },
      );
    });
  },

  async findById(id: string): Promise<OrderRecord | null> {
    return new Promise((resolve, reject) => {
      db.get(
        `
          SELECT
            id, status, total, reservation_expires_at, created_at, updated_at
          FROM orders
          WHERE id = ?
        `,
        [id],
        (error, row) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(row ? mapOrder(row as Parameters<typeof mapOrder>[0]) : null);
        },
      );
    });
  },

  async updateStatus(id: string, status: OrderStatus): Promise<void> {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE orders SET status = ?, updated_at = ? WHERE id = ?`,
        [status, new Date().toISOString(), id],
        (error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        },
      );
    });
  },
};