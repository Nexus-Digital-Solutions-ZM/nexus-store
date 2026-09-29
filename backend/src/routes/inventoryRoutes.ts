import { Router } from "express";
import { inventoryController } from "../controllers/inventoryController.js";
import { adminAuth } from "../middleware/adminAuth.js";

export const inventoryRoutes = Router();

inventoryRoutes.get("/", inventoryController.getInventory);
inventoryRoutes.post("/restock", adminAuth, inventoryController.restock);
inventoryRoutes.post("/correction", adminAuth, inventoryController.correction);