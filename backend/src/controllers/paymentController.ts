import type { Request, Response, NextFunction } from "express";
import { paymentService } from "../services/paymentService.js";
import { AppError } from "../errors/AppError.js";

export const paymentController = {
  confirmPayment: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orderId, transactionId, method, amount } = req.body;
      const payment = await paymentService.confirmPayment({
        orderId,
        transactionId,
        method,
        amount,
      });
      res.json({ payment });
    } catch (error) {
      next(error);
    }
  },
};