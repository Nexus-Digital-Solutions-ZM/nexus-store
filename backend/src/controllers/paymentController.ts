import type { Request, Response } from "express";

export const paymentController = {
  processPayment: async (_req: Request, res: Response): Promise<void> => {
    res.json({ message: "Payment controller ready" });
  },
};
