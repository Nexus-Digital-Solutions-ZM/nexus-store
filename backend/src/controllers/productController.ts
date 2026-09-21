import type { Request, Response } from "express";

export const productController = {
  getProducts: async (_req: Request, res: Response): Promise<void> => {
    res.json({ message: "Products controller ready" });
  },
};
