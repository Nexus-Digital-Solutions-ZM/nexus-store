import { db } from "../database/db.js";
import { productRepository } from "../repositories/productRepository.js";
import { orderRepository } from "../repositories/orderRepository.js";
import { orderItemRepository } from "../repositories/orderItemRepository.js";
import { reservationRepository } from "../repositories/reservationRepository.js";
import { reservationItemRepository } from "../repositories/reservationItemRepository.js";
import { paymentRepository } from "../repositories/paymentRepository.js";
import { inventoryRepository } from "../repositories/inventoryRepository.js";
import type { OrderRecord, OrderStatus } from "../types/order.js";
import type { PaymentRecord, PaymentMethod } from "../types/payment.js";
import type { ReservationItemRecord } from "../types/reservation.js";
import { AppError } from "../errors/AppError.js";
import { generateId } from "../utils/generateId.js";
import { formatDateForStorage } from "../utils/date.js";
import { mockMobileMoney } from "../providers/mockMobileMoney.js";
import { mockCard } from "../providers/mockCard.js";

function run(sql: string, params?: unknown[]): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

function runStatement(sql: string, params?: unknown[]): Promise<number> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (error) {
      if (error) reject(error);
      else resolve(this.changes);
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

export interface CheckoutInput {
  items: Array<{ productId: string; quantity: number }>;
  paymentMethod: PaymentMethod;
  customer: { name: string; phone: string };
}

export interface CheckoutResult {
  order: OrderRecord;
  payment: PaymentRecord;
}

export const checkoutService = {
  async checkout(input: CheckoutInput): Promise<CheckoutResult> {
    const { items, paymentMethod, customer } = input;

    if (items.length === 0) {
      throw new AppError(400, "INVALID_INPUT", "Checkout must contain at least one item");
    }

    for (const item of items) {
      if (item.quantity <= 0) {
        throw new AppError(400, "INVALID_QUANTITY", `Quantity must be positive for product ${item.productId}`);
      }
    }

    const seenProductIds = new Set<string>();
    for (const item of items) {
      if (seenProductIds.has(item.productId)) {
        throw new AppError(
          400,
          "DUPLICATE_PRODUCT",
          `Duplicate product in checkout: ${item.productId}`,
        );
      }
      seenProductIds.add(item.productId);
    }

    const products = await Promise.all(items.map((item) => productRepository.findById(item.productId)));

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      if (!product) {
        throw new AppError(404, "PRODUCT_NOT_FOUND", `Product not found`);
      }
      if (product.stock < items[i].quantity) {
        throw new AppError(409, "OUT_OF_STOCK", "Insufficient stock for one or more items");
      }
    }

    const now = formatDateForStorage();
    const expiresAt = formatDateForStorage(new Date(Date.now() + 10 * 60 * 1000));
    const orderId = generateId("order");
    const total = items.reduce((sum, item, index) => {
      const product = products[index]!;
      return sum + product.price * item.quantity;
    }, 0);

    try {
      await run("BEGIN TRANSACTION");

      await run(
        `INSERT INTO orders (id, status, total, customer_name, customer_phone, reservation_expires_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderId, "pending_payment", total, customer.name, customer.phone, expiresAt, now, now],
      );

      const reservationId = generateId("res");
      await run(
        `INSERT INTO reservations (id, order_id, status, expires_at, created_at) VALUES (?, ?, ?, ?, ?)`,
        [reservationId, orderId, "active", expiresAt, now],
      );

      for (let index = 0; index < items.length; index++) {
        const item = items[index]!;
        const product = products[index]!;

        await orderItemRepository.create({
          id: generateId("oi"),
          orderId,
          productId: item.productId,
          productName: product.name,
          unitPrice: product.price,
          quantity: item.quantity,
          subtotal: product.price * item.quantity,
        });

        await reservationItemRepository.create({
          id: generateId("ri"),
          reservationId,
          productId: item.productId,
          quantity: item.quantity,
        });
      }

      for (const item of items) {
        const changes = await runStatement(
          `UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?`,
          [item.quantity, item.productId, item.quantity],
        );
        if (changes === 0) {
          throw new AppError(409, "OUT_OF_STOCK", "Insufficient stock for one or more items");
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
      throw new AppError(500, "CHECKOUT_FAILED", "Checkout operation failed");
    }

    // Process payment
    const provider = paymentMethod === "mobile_money" ? mockMobileMoney : mockCard;
    const paymentResult = await provider.process(total, paymentMethod);

    const paymentId = generateId("pay");
    try {
      await run("BEGIN TRANSACTION");

      await run(
        `INSERT INTO payments (id, order_id, transaction_id, amount, method, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [paymentId, orderId, `txn-${paymentId}`, total, paymentMethod, paymentResult.success ? "success" : "failed", now, now],
      );

      const reservation = await reservationRepository.findByOrderId(orderId);
      const reservationItems = reservation
        ? await reservationItemRepository.findByReservationId(reservation.id)
        : [];

      if (paymentResult.success) {
        await run(`UPDATE orders SET status = 'paid', updated_at = ? WHERE id = ?`, [now, orderId]);
        if (reservation) {
          await run(`UPDATE reservations SET status = 'finalized' WHERE id = ?`, [reservation.id]);
        }

        for (const item of reservationItems) {
          const productRow = await get<{ stock: number }>(`SELECT stock FROM products WHERE id = ?`, [item.productId]);
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
        if (reservation) {
          await run(`UPDATE reservations SET status = 'released', released_at = ? WHERE id = ?`, [now, reservation.id]);
        }

        for (const item of reservationItems) {
          const productRow = await get<{ stock: number }>(`SELECT stock FROM products WHERE id = ?`, [item.productId]);
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

    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new AppError(500, "ORDER_NOT_FOUND", "Order not found after payment");
    }

    return {
      order,
      payment: {
        id: paymentId,
        orderId,
        transactionId: `txn-${paymentId}`,
        amount: total,
        method: paymentMethod,
        status: paymentResult.success ? "success" : "failed",
        createdAt: now,
        updatedAt: now,
      },
    };
  },
};