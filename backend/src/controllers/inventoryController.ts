import type { Request, Response } from "express";

export const inventoryController = {
  getInventory: async (_req: Request, res: Response): Promise<void> => {
    res.json({ message: "Inventory controller ready" });
  },
};
