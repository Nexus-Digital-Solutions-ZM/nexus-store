import type { Request, Response, NextFunction } from "express";
import { inventoryService } from "../services/inventoryService.js";
import { AppError } from "../errors/AppError.js";

export const inventoryController = {
  getInventory: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const movements = await inventoryService.getMovements();
      res.json({ movements });
    } catch (error) {
      next(error);
    }
  },

  restock: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { productId, quantity } = req.body;
      const movement = await inventoryService.restock(productId, quantity);
      res.status(201).json({ movement });
    } catch (error) {
      next(error);
    }
  },

  correction: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { productId, newStock } = req.body;
      const movement = await inventoryService.correction(productId, newStock);
      res.status(201).json({ movement });
    } catch (error) {
      next(error);
    }
  },
};