import { db } from "../database/db.js";
import { productRepository } from "../repositories/productRepository.js";
import { orderRepository } from "../repositories/orderRepository.js";
import { reservationRepository } from "../repositories/reservationRepository.js";
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

export interface CheckoutItem {
  productId: string;
  quantity: number;
}

export interface CheckoutResult {
  orderId: string;
  reservationExpiresAt: string;
}

export const checkoutService = {
  async checkout(
    items: CheckoutItem[],
    method: "mobile_money" | "card",
  ): Promise<CheckoutResult> {
    if (items.length === 0) {
      throw new AppError(400, "INVALID_INPUT", "Checkout must contain at least one item");
    }

    for (const item of items) {
      if (item.quantity <= 0) {
        throw new AppError(400, "INVALID_QUANTITY", `Quantity must be positive for product ${item.productId}`);
      }
    }

    const products = await Promise.all(items.map((item) => productRepository.findById(item.productId)));

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      if (!product) {
        throw new AppError(404, "PRODUCT_NOT_FOUND", `Product ${items[i].productId} not found`);
      }
      if (product.stock < items[i].quantity) {
        throw new AppError(409, "OUT_OF_STOCK", `Product ${items[i].productId} has insufficient stock`);
      }
    }

    const now = formatDateForStorage();
    const expiresDate = new Date(Date.now() + 10 * 60 * 1000);
    const expiresAt = formatDateForStorage(expiresDate);
    const orderId = generateId("order");

    const total = items.reduce((sum, item, index) => {
      const product = products[index]!;
      return sum + product.price * item.quantity;
    }, 0);

    try {
      await run("BEGIN TRANSACTION");

      await run(
        `INSERT INTO orders (id, status, total, reservation_expires_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, "pending_payment", total, expiresAt, now, now],
      );

      const reservationId = generateId("res");
      await run(
        `INSERT INTO reservations (id, order_id, status, expires_at, created_at) VALUES (?, ?, ?, ?, ?)`,
        [reservationId, orderId, "active", expiresAt, now],
      );

      const orderItemStmt = db.prepare(
        `INSERT INTO order_items (id, order_id, product_id, product_name, unit_price, quantity, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      );

      for (const item of items) {
        const product = products.find((p) => p!.id === item.productId)!;
        orderItemStmt.run(
          generateId("oi"),
          orderId,
          item.productId,
          product.name,
          product.price,
          item.quantity,
          product.price * item.quantity,
        );
      }
      orderItemStmt.finalize();

      const reservationItemStmt = db.prepare(
        `INSERT INTO reservation_items (id, reservation_id, product_id, quantity) VALUES (?, ?, ?, ?)`,
      );

      for (const item of items) {
        reservationItemStmt.run(
          generateId("ri"),
          reservationId,
          item.productId,
          item.quantity,
        );
      }
      reservationItemStmt.finalize();

      const updateStmt = db.prepare(
        `UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?`,
      );

      for (const item of items) {
        const result = updateStmt.run(item.quantity, item.productId, item.quantity);
        if ((result as unknown as { changes: number }).changes === 0) {
          updateStmt.finalize();
          await run("ROLLBACK");
          throw new AppError(409, "OUT_OF_STOCK", "Insufficient stock for one or more items");
        }
      }
      updateStmt.finalize();

      await run("COMMIT");
    } catch (error: unknown) {
      try {
        await run("ROLLBACK");
      } catch {
        // ignore rollback error
      }
      if (error instanceof AppError) throw error;
      throw new AppError(500, "CHECKOUT_FAILED", "Checkout operation failed");
    }

    return { orderId, reservationExpiresAt: expiresAt };
  },
};