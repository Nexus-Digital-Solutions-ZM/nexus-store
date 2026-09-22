import type { Request, Response, NextFunction } from "express";
import { checkoutService } from "../services/checkoutService.js";
import { orderService } from "../services/orderService.js";
import { orderExpiryService } from "../services/orderExpiryService.js";
import type { CheckoutItem } from "../services/checkoutService.js";
import { AppError } from "../errors/AppError.js";

export const orderController = {
  checkout: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { items, method } = req.body;
      const result = await checkoutService.checkout(
        items as CheckoutItem[],
        method || "mobile_money",
      );
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
        throw new AppError(404, "ORDER_NOT_FOUND", `Order ${req.params.id} not found`);
      }
      res.json({ order });
    } catch (error) {
      next(error);
    }
  },
};