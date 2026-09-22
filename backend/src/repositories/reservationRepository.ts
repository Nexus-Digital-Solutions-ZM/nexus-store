import { db } from "../database/db.js";
import type { ReservationRecord, ReservationStatus } from "../types/reservation.js";

function mapReservation(row: {
  id: string;
  order_id: string;
  status: ReservationStatus;
  expires_at: string;
  created_at: string;
  released_at: string | null;
}): ReservationRecord {
  return {
    id: row.id,
    orderId: row.order_id,
    status: row.status,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    ...(row.released_at !== null && { releasedAt: row.released_at }),
  };
}

export const reservationRepository = {
  async create(reservation: {
    id: string;
    orderId: string;
    status: ReservationStatus;
    expiresAt: string;
    createdAt: string;
  }): Promise<ReservationRecord> {
    return new Promise((resolve, reject) => {
      db.run(
        `
          INSERT INTO reservations (id, order_id, status, expires_at, created_at)
          VALUES (?, ?, ?, ?, ?)
        `,
        [reservation.id, reservation.orderId, reservation.status, reservation.expiresAt, reservation.createdAt],
        (error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve({ ...reservation, releasedAt: undefined });
        },
      );
    });
  },

  async findByOrderId(orderId: string): Promise<ReservationRecord | null> {
    return new Promise((resolve, reject) => {
      db.get(
        `
          SELECT
            id, order_id, status, expires_at, created_at, released_at
          FROM reservations
          WHERE order_id = ?
        `,
        [orderId],
        (error, row) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(row ? mapReservation(row as Parameters<typeof mapReservation>[0]) : null);
        },
      );
    });
  },

  async updateStatus(id: string, status: ReservationStatus): Promise<void> {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE reservations SET status = ? WHERE id = ?`,
        [status, id],
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

  async release(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE reservations SET status = 'released', released_at = ? WHERE id = ?`,
        [new Date().toISOString(), id],
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