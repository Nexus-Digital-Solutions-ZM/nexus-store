import type { Request, Response } from "express";

export const orderController = {
  createOrder: async (_req: Request, res: Response): Promise<void> => {
    res.json({ message: "Orders controller ready" });
  },
};
