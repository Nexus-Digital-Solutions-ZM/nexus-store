import type { Request, Response, NextFunction } from "express";
import { checkoutService } from "../services/checkoutService.js";
import { orderService } from "../services/orderService.js";
import { orderExpiryService } from "../services/orderExpiryService.js";
import { paymentRepository } from "../repositories/paymentRepository.js";
import { AppError } from "../errors/AppError.js";

export const orderController = {
  checkout: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { items, paymentMethod, customer } = req.body;
      const result = await checkoutService.checkout({
        items,
        paymentMethod: paymentMethod || "mobile_money",
        customer: {
          name: customer?.name || "",
          phone: customer?.phone || "",
        },
      });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  getOrder: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await orderExpiryService.checkExpiry(req.params.id);
      const order = await orderService.getOrder(req.params.id);
      if (!order) {
        throw new AppError(404, "ORDER_NOT_FOUND", "Order not found");
      }
      const payment = await paymentRepository.findByOrderId(req.params.id);
      res.json({
        id: order.id,
        status: order.status,
        items: [],
        total: order.total,
        payment: payment
          ? {
              status: payment.status,
              method: payment.method,
              transactionId: payment.transactionId,
            }
          : null,
        createdAt: order.createdAt,
      });
    } catch (error) {
      next(error);
    }
  },
};