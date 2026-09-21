import type { Request, Response, NextFunction } from "express";

export function adminAuth(_req: Request, res: Response, next: NextFunction): void {
  const token = _req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    res.status(401).json({ message: "Admin authentication required" });
    return;
  }

  next();
}
