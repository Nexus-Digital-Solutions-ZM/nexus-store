import { db } from "../database/db.js";
import type { OrderItemRecord } from "../types/orderItem.js";

function mapOrderItem(row: {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
}): OrderItemRecord {
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

export const orderItemRepository = {
  async create(item: OrderItemRecord): Promise<OrderItemRecord> {
    return new Promise((resolve, reject) => {
      db.run(
        `
          INSERT INTO order_items (id, order_id, product_id, product_name, unit_price, quantity, subtotal)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [item.id, item.orderId, item.productId, item.productName, item.unitPrice, item.quantity, item.subtotal],
        (error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(item);
        },
      );
    });
  },

  async createMany(items: OrderItemRecord[]): Promise<OrderItemRecord[]> {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        const stmt = db.prepare(
          `
            INSERT INTO order_items (id, order_id, product_id, product_name, unit_price, quantity, subtotal)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `,
        );

        for (const item of items) {
          stmt.run(item.id, item.orderId, item.productId, item.productName, item.unitPrice, item.quantity, item.subtotal);
        }

        stmt.finalize();
      });

      resolve(items);
    });
  },

  async findByOrderId(orderId: string): Promise<OrderItemRecord[]> {
    return new Promise((resolve, reject) => {
      db.all(
        `
          SELECT id, order_id, product_id, product_name, unit_price, quantity, subtotal
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

          resolve((rows as Array<{
            id: string;
            order_id: string;
            product_id: string;
            product_name: string;
            unit_price: number;
            quantity: number;
            subtotal: number;
          }>).map(mapOrderItem));
        },
      );
    });
  },
};