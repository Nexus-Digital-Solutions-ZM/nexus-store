export type PaymentMethod = "mobile_money" | "card";

export interface PaymentRecord {
  id: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  status: "pending" | "success" | "failed";
  createdAt: string;
}
