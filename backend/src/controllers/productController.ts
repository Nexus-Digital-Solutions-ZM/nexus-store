import type { Request, Response } from "express";
import { productService } from "../services/productService.js";
import { AppError } from "../errors/AppError.js";

export const productController = {
  getProducts: async (_req: Request, res: Response): Promise<void> => {
    try {
      const products = await productService.listProducts();
      res.json({ products });
    } catch (error) {
      res.status(500).json({ error: "SERVER_ERROR", message: "Internal server error" });
    }
  },

  getProductById: async (req: Request, res: Response): Promise<void> => {
    try {
      const product = await productService.getProduct(req.params.id);
      if (!product) {
        throw new AppError(404, "PRODUCT_NOT_FOUND", `Product ${req.params.id} not found`);
      }
      res.json({ product });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.error, message: error.message });
        return;
      }
      res.status(500).json({ error: "SERVER_ERROR", message: "Internal server error" });
    }
  },
};