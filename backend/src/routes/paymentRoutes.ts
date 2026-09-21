import { Router } from "express";

import { paymentController } from "../controllers/paymentController.js";

export const paymentRoutes = Router();

paymentRoutes.post("/", paymentController.processPayment);
