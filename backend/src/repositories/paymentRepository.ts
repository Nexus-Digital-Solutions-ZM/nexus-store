import { db } from "../database/db.js";
import type { PaymentRecord, PaymentStatus } from "../types/payment.js";

function mapPayment(row: {
  id: string;
  order_id: string;
  transaction_id: string;
  amount: number;
  method: string;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
}): PaymentRecord {
  return {
    id: row.id,
    orderId: row.order_id,
    transactionId: row.transaction_id,
    amount: row.amount,
    method: row.method as PaymentRecord["method"],
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const paymentRepository = {
  async create(payment: {
    id: string;
    orderId: string;
    transactionId: string;
    amount: number;
    method: PaymentRecord["method"];
    status: PaymentStatus;
    createdAt: string;
    updatedAt: string;
  }): Promise<PaymentRecord> {
    return new Promise((resolve, reject) => {
      db.run(
        `
          INSERT INTO payments (id, order_id, transaction_id, amount, method, status, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          payment.id,
          payment.orderId,
          payment.transactionId,
          payment.amount,
          payment.method,
          payment.status,
          payment.createdAt,
          payment.updatedAt,
        ],
        (error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(payment);
        },
      );
    });
  },

  async findByTransactionId(transactionId: string): Promise<PaymentRecord | null> {
    return new Promise((resolve, reject) => {
      db.get(
        `
          SELECT
            id, order_id, transaction_id, amount, method, status, created_at, updated_at
          FROM payments
          WHERE transaction_id = ?
        `,
        [transactionId],
        (error, row) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(row ? mapPayment(row as Parameters<typeof mapPayment>[0]) : null);
        },
      );
    });
  },

  async findByOrderId(orderId: string): Promise<PaymentRecord | null> {
    return new Promise((resolve, reject) => {
      db.get(
        `
          SELECT
            id, order_id, transaction_id, amount, method, status, created_at, updated_at
          FROM payments
          WHERE order_id = ?
          ORDER BY created_at DESC
          LIMIT 1
        `,
        [orderId],
        (error, row) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(row ? mapPayment(row as Parameters<typeof mapPayment>[0]) : null);
        },
      );
    });
  },

  async updateStatus(id: string, status: PaymentStatus): Promise<void> {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE payments SET status = ?, updated_at = ? WHERE id = ?`,
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