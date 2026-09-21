import { Router } from "express";

import { orderController } from "../controllers/orderController.js";

export const orderRoutes = Router();

orderRoutes.post("/", orderController.createOrder);
