export type PaymentMethod = "mobile_money" | "card";

export type PaymentStatus = "pending" | "success" | "failed";

export interface PaymentRecord {
  id: string;
  orderId: string;
  transactionId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}