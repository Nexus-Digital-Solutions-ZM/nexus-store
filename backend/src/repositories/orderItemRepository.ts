import { db } from "../database/db.js";
import type { OrderRecord, OrderStatus } from "../types/order.js";
import type { OrderItemRecord } from "../types/orderItem.js";

type OrderRow = {
  id: string;
  status: OrderStatus;
  total: number;
  reservation_expires_at: string | null;
  created_at: string;
  updated_at: string;
};

type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
};

function mapOrder(row: OrderRow): OrderRecord {
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

function mapOrderItem(row: OrderItemRow): OrderItemRecord {
  return {
    id: row.id,
    orderId: row.order_id,
    productId: row.product_id,
    productName: row.product_name,
    unitPrice: row.unit_price,
    quantity: row.quantity,
    subtotal: row.subtotal,
  };
}

export const orderRepository = {
  async create(order: OrderRecord): Promise<void> {
    return new Promise((resolve, reject) => {
      db.run(
        `
          INSERT INTO orders (
            id,
            status,
            total,
            reservation_expires_at,
            created_at,
            updated_at
          )
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

          resolve();
        },
      );
    });
  },

  async findById(id: string): Promise<OrderRecord | null> {
    return new Promise((resolve, reject) => {
      db.get(
        `
          SELECT
            id,
            status,
            total,
            reservation_expires_at,
            created_at,
            updated_at
          FROM orders
          WHERE id = ?
        `,
        [id],
        (error, row) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(row ? mapOrder(row as OrderRow) : null);
        },
      );
    });
  },

  async updateStatus(
    id: string,
    status: OrderStatus,
    updatedAt: string,
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      db.run(
        `
          UPDATE orders
          SET
            status = ?,
            updated_at = ?
          WHERE id = ?
        `,
        [status, updatedAt, id],
        function (error) {
          if (error) {
            reject(error);
            return;
          }

          resolve(this.changes === 1);
        },
      );
    });
  },

  async createItem(item: OrderItemRecord): Promise<void> {
    return new Promise((resolve, reject) => {
      db.run(
        `
          INSERT INTO order_items (
            id,
            order_id,
            product_id,
            product_name,
            unit_price,
            quantity,
            subtotal
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          item.id,
          item.orderId,
          item.productId,
          item.productName,
          item.unitPrice,
          item.quantity,
          item.subtotal,
        ],
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

  async findItemsByOrderId(
    orderId: string,
  ): Promise<OrderItemRecord[]> {
    return new Promise((resolve, reject) => {
      db.all(
        `
          SELECT
            id,
            order_id,
            product_id,
            product_name,
            unit_price,
            quantity,
            subtotal
          FROM order_items
          WHERE order_id = ?
          ORDER BY id ASC
        `,
        [orderId],
        (error, rows) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(
            (rows as OrderItemRow[]).map(mapOrderItem),
          );
        },
      );
    });
  },
};
