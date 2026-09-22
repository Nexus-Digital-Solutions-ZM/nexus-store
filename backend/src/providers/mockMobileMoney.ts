import type { PaymentProvider } from "./paymentProvider.js";
import type { PaymentMethod } from "../types/payment.js";

let failNext = false;

export function setMockFailure(fail: boolean): void {
  failNext = fail;
}

export const mockMobileMoney: PaymentProvider = {
  async process(amount: number, _method: PaymentMethod): Promise<{ success: boolean }> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    return { success: !failNext };
  },
};

export const mockCard: PaymentProvider = {
  async process(amount: number, _method: PaymentMethod): Promise<{ success: boolean }> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    return { success: !failNext };
  },
};