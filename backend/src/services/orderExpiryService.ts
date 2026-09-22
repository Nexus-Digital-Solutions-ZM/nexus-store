import { db } from "../database/db.js";
import { productRepository } from "../repositories/productRepository.js";
import { reservationRepository } from "../repositories/reservationRepository.js";
import { reservationItemRepository } from "../repositories/reservationItemRepository.js";
import { orderRepository } from "../repositories/orderRepository.js";
import type { InventoryMovement } from "../types/inventory.js";
import { AppError } from "../errors/AppError.js";
import { generateId } from "../utils/generateId.js";
import { formatDateForStorage } from "../utils/date.js";

function run(sql: string, params?: unknown[]): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

function get<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T | null> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => {
      if (error) reject(error);
      else resolve((row as T | undefined) ?? null);
    });
  });
}

export const orderExpiryService = {
  checkExpiry,
};

async function checkExpiry(orderId: string): Promise<void> {
  const order = await orderRepository.findById(orderId);
  if (!order || order.status !== "pending_payment") return;

  if (!order.reservationExpiresAt) return;
  if (Date.now() >= new Date(order.reservationExpiresAt).getTime()) {
    const reservation = await reservationRepository.findByOrderId(orderId);
    const reservationItems = reservation
      ? await reservationItemRepository.findByReservationId(reservation.id)
      : [];
    const nowStr = formatDateForStorage();

    try {
      await run("BEGIN TRANSACTION");

      await run(`UPDATE orders SET status = 'expired', updated_at = ? WHERE id = ?`, [nowStr, orderId]);
      if (reservation) {
        await run(`UPDATE reservations SET status = 'released', released_at = ? WHERE id = ?`, [nowStr, reservation.id]);
      }

      for (const item of reservationItems) {
        await run(`UPDATE products SET stock = stock + ? WHERE id = ?`, [item.quantity, item.productId]);

        const productRow = await get<{ stock: number }>(
          `SELECT stock FROM products WHERE id = ?`,
          [item.productId],
        );
        if (productRow) {
          await run(
            `INSERT INTO stock_movements (id, product_id, quantity, type, previous_stock, new_stock, order_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              generateId("sm"),
              item.productId,
              item.quantity,
              "correction",
              productRow.stock - item.quantity,
              productRow.stock,
              orderId,
              nowStr,
            ],
          );
        }
      }

      await run("COMMIT");
    } catch (error) {
      try {
        await run("ROLLBACK");
      } catch {
        // ignore
      }
      throw error;
    }
  }
}