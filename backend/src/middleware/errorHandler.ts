import type { ErrorRequestHandler } from "express";
import { AppError } from "../errors/AppError.js";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error(error);

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: error.error,
      message: error.message,
    });
    return;
  }

  res.status(500).json({
    error: "INTERNAL_ERROR",
    message: "Internal server error",
  });
};