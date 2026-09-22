export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "failed"
  | "expired";

export interface OrderRecord {
  id: string;
  status: OrderStatus;
  total: number;
  customerName: string;
  customerPhone: string;
  reservationExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
}