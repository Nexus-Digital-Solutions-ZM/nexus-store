import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError.js";
import { env } from "../config/env.js";

export function adminAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = req.headers["x-admin-token"] as string | undefined;
  if (token !== env.adminToken) {
    next(new AppError(401, "UNAUTHORIZED", "Invalid admin token"));
    return;
  }
  next();
}