import { Router } from "express";
import { productController } from "../controllers/productController.js";

export const productRoutes = Router();

productRoutes.get("/", productController.getProducts);
productRoutes.get("/:id", productController.getProductById);