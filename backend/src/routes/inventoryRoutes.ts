import { Router } from "express";

import { inventoryController } from "../controllers/inventoryController.js";

export const inventoryRoutes = Router();

inventoryRoutes.get("/", inventoryController.getInventory);
