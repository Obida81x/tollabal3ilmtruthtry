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

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

declare module "express-serve-static-core" {
  interface Request {
    userId?: number;
  }
}

export function requireUser(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!req.userId && !req.session.userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  next();
}

export function getUserId(req: Request): number | null {
  return req.userId ?? req.session.userId ?? null;
}
