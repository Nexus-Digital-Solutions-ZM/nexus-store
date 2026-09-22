import { reservationRepository } from "../repositories/reservationRepository.js";
import type { ReservationRecord } from "../types/reservation.js";
import { AppError } from "../errors/AppError.js";

export const reservationService = {
  async findByOrderId(orderId: string): Promise<ReservationRecord | null> {
    return reservationRepository.findByOrderId(orderId);
  },

  async release(orderId: string): Promise<void> {
    const reservation = await reservationRepository.findByOrderId(orderId);
    if (!reservation) return;
    await reservationRepository.release(reservation.id);
  },

  async finalize(orderId: string): Promise<void> {
    const reservation = await reservationRepository.findByOrderId(orderId);
    if (!reservation) return;
    await reservationRepository.updateStatus(reservation.id, "finalized");
  },
};