import { db } from "../database/db.js";
import { productRepository } from "../repositories/productRepository.js";
import { orderRepository } from "../repositories/orderRepository.js";
import { paymentRepository } from "../repositories/paymentRepository.js";
import { reservationRepository } from "../repositories/reservationRepository.js";
import { reservationItemRepository } from "../repositories/reservationItemRepository.js";
import { inventoryRepository } from "../repositories/inventoryRepository.js";
import type { PaymentRecord, PaymentMethod } from "../types/payment.js";
import type { InventoryMovement } from "../types/inventory.js";
import type { ReservationItemRecord } from "../types/reservation.js";
import { AppError } from "../errors/AppError.js";
import { generateId } from "../utils/generateId.js";
import { formatDateForStorage } from "../utils/date.js";
import { mockMobileMoney, mockCard } from "../providers/mockMobileMoney.js";

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

export interface PaymentConfirmInput {
  orderId: string;
  transactionId: string;
  method: PaymentMethod;
  amount: number;
}

export const paymentService = {
  async confirmPayment(input: PaymentConfirmInput): Promise<PaymentRecord> {
    const { orderId, transactionId, method, amount } = input;

    const existing = await paymentRepository.findByTransactionId(transactionId);
    if (existing && existing.status === "success") {
      return existing;
    }

    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new AppError(404, "ORDER_NOT_FOUND", `Order ${orderId} not found`);
    }
    if (order.status !== "pending_payment") {
      throw new AppError(400, "ORDER_NOT_PENDING", `Order ${orderId} is not pending payment`);
    }

    const reservation = await reservationRepository.findByOrderId(orderId);
    if (!reservation || reservation.status !== "active") {
      throw new AppError(400, "RESERVATION_INVALID", `No active reservation for order ${orderId}`);
    }

    const provider = method === "mobile_money" ? mockMobileMoney : mockCard;
    const result = await provider.process(amount, method);

    const now = formatDateForStorage();
    const paymentId = generateId("pay");

    try {
      await run("BEGIN TRANSACTION");

      await run(
        `INSERT INTO payments (id, order_id, transaction_id, amount, method, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [paymentId, orderId, transactionId, amount, method, result.success ? "success" : "failed", now, now],
      );

      const reservationItems = await reservationItemRepository.findByReservationId(reservation.id);

      if (result.success) {
        await run(`UPDATE orders SET status = 'paid', updated_at = ? WHERE id = ?`, [now, orderId]);
        await run(`UPDATE reservations SET status = 'finalized' WHERE id = ?`, [reservation.id]);

        for (const item of reservationItems) {
          const productRow = await get<{ stock: number }>(
            `SELECT stock FROM products WHERE id = ?`,
            [item.productId],
          );
          if (productRow) {
            await inventoryRepository.create({
              id: generateId("sm"),
              productId: item.productId,
              quantity: item.quantity,
              type: "sale",
              previousStock: productRow.stock,
              newStock: productRow.stock,
              createdAt: now,
              orderId,
            });
          }
        }
      } else {
        await run(`UPDATE orders SET status = 'failed', updated_at = ? WHERE id = ?`, [now, orderId]);
        await run(`UPDATE reservations SET status = 'released', released_at = ? WHERE id = ?`, [now, reservation.id]);

        for (const item of reservationItems) {
          const productRow = await get<{ stock: number }>(
            `SELECT stock FROM products WHERE id = ?`,
            [item.productId],
          );
          if (productRow) {
            await inventoryRepository.create({
              id: generateId("sm"),
              productId: item.productId,
              quantity: item.quantity,
              type: "correction",
              previousStock: productRow.stock,
              newStock: productRow.stock + item.quantity,
              createdAt: now,
              orderId,
            });
            await run(`UPDATE products SET stock = stock + ? WHERE id = ?`, [item.quantity, item.productId]);
          }
        }
      }

      await run("COMMIT");
    } catch (error: unknown) {
      try {
        await run("ROLLBACK");
      } catch {
        // ignore
      }
      if (error instanceof AppError) throw error;
      throw new AppError(500, "PAYMENT_FAILED", "Payment operation failed");
    }

    return {
      id: paymentId,
      orderId,
      transactionId,
      amount,
      method,
      status: result.success ? "success" : "failed",
      createdAt: now,
      updatedAt: now,
    };
  },
};