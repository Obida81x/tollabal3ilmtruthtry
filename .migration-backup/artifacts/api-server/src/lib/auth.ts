import crypto from "node:crypto";
import type { Request, Response, NextFunction } from "express";

export function hashPassword(password: string): {
  hash: string;
  salt: string;
} {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .scryptSync(password, salt, 64)
    .toString("hex");
  return { hash, salt };
}

export function verifyPassword(
  password: string,
  hash: string,
  salt: string,
): boolean {
  const computed = crypto.scryptSync(password, salt, 64).toString("hex");
  const a = Buffer.from(computed, "hex");
  const b = Buffer.from(hash, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

export function requireUser(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!req.session.userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  next();
}

export function getUserId(req: Request): number | null {
  return req.session.userId ?? null;
}
