import type { Request, Response } from "express";
import { AppError } from "../errors/AppError.js";

export function notFound(req: Request, res: Response): void {
  res.status(404).json({
    error: "NOT_FOUND",
    message: `Route ${req.method} ${req.url} not found`,
  });
}