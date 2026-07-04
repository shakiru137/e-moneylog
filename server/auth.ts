import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "emoneylog_jwt_secret_key_2026_prod";

export interface TokenPayload {
  userId: string;
  email: string;
  fullName: string;
  businessName?: string;
}

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

/**
 * Hash password securely with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare password against bcrypt hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) return false;
  return bcrypt.compare(password, hash);
}

/**
 * Generate short-lived JWT access token (15 mins) & long-lived refresh token (7 days)
 */
export function generateTokens(payload: TokenPayload) {
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ userId: payload.userId, email: payload.email }, JWT_SECRET, { expiresIn: "7d" });
  return { accessToken, refreshToken };
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Express middleware to authenticate API requests via Bearer token or cookie
 */
export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    // Check query param fallback if needed
    const queryToken = req.query.token as string;
    if (queryToken) {
      const decoded = verifyToken(queryToken);
      if (decoded) {
        req.user = decoded;
        return next();
      }
    }
    return res.status(401).json({ error: "Access denied. Valid authorization token required." });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: "Invalid or expired session token. Please log in again." });
  }

  req.user = decoded;
  next();
}

/**
 * Helper to validate email format strictly
 */
export function isValidEmailFormat(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email.trim())) return false;
  const domain = email.trim().split("@")[1]?.toLowerCase();
  if (!domain || domain.length < 3 || !domain.includes(".")) return false;
  return true;
}
