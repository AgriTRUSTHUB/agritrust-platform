import type { Request, Response, NextFunction } from "express";
import { extractBearerToken, verifyToken } from "../lib/auth-utils.js";

declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = extractBearerToken(req.headers.authorization);
  if (!token) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  const userId = verifyToken(token);
  if (!userId) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }
  req.userId = userId;
  next();
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = extractBearerToken(req.headers.authorization);
  if (token) {
    const userId = verifyToken(token);
    if (userId) req.userId = userId;
  }
  next();
}
