export type ReservationStatus =
  | "active"
  | "released"
  | "finalized";

export interface ReservationRecord {
  id: string;
  orderId: string;
  status: ReservationStatus;
  expiresAt: string;
  createdAt: string;
  releasedAt?: string;
}

export interface ReservationItemRecord {
  id: string;
  reservationId: string;
  productId: string;
  quantity: number;
}