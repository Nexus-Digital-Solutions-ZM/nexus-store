import { orderRepository } from "../repositories/orderRepository.js";
import type { OrderRecord, OrderStatus } from "../types/order.js";
import { AppError } from "../errors/AppError.js";

export const orderService = {
  async getOrder(id: string): Promise<OrderRecord | null> {
    const order = await orderRepository.findById(id);
    if (!order) return null;
    return order;
  },

  async markExpired(id: string): Promise<void> {
    await orderRepository.updateStatus(id, "expired");
  },
};