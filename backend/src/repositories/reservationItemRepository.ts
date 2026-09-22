import { db } from "../database/db.js";
import type { ReservationItemRecord } from "../types/reservation.js";

export const reservationItemRepository = {
  async create(item: ReservationItemRecord): Promise<ReservationItemRecord> {
    return new Promise((resolve, reject) => {
      db.run(
        `
          INSERT INTO reservation_items (id, reservation_id, product_id, quantity)
          VALUES (?, ?, ?, ?)
        `,
        [item.id, item.reservationId, item.productId, item.quantity],
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

  async createMany(items: ReservationItemRecord[]): Promise<ReservationItemRecord[]> {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        const stmt = db.prepare(
          `
            INSERT INTO reservation_items (id, reservation_id, product_id, quantity)
            VALUES (?, ?, ?, ?)
          `,
        );

        for (const item of items) {
          stmt.run(item.id, item.reservationId, item.productId, item.quantity);
        }

        stmt.finalize();
      });

      resolve(items);
    });
  },

  async findByReservationId(reservationId: string): Promise<ReservationItemRecord[]> {
    return new Promise((resolve, reject) => {
      db.all(
        `
          SELECT id, reservation_id, product_id, quantity
          FROM reservation_items
          WHERE reservation_id = ?
        `,
        [reservationId],
        (error, rows) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(
            (rows as Array<{
              id: string;
              reservation_id: string;
              product_id: string;
              quantity: number;
            }>).map((row) => ({
              id: row.id,
              reservationId: row.reservation_id,
              productId: row.product_id,
              quantity: row.quantity,
            })),
          );
        },
      );
    });
  },
};