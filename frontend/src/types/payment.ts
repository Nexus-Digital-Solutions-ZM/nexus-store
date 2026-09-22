export type PaymentMethod = "mobile_money" | "card";

export interface PaymentRequest {
  orderId: string;
  amount: number;
  method: PaymentMethod;
  phone?: string;
  cardNumber?: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId: string;
  message: string;
}