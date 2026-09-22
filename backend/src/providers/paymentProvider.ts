import type { PaymentMethod } from "../types/payment.js";

export interface PaymentProvider {
  process(amount: number, method: PaymentMethod): Promise<{ success: boolean }>;
}
