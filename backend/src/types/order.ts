export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "failed"
  | "expired";

export interface OrderRecord {
  id: string;
  status: OrderStatus;
  total: number;
  reservationExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
}