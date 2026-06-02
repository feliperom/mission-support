import { Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../config/database.js";
import { missionaries } from "../../db/schema.js";
import { AuthRequest, AuthPayload } from "../../middleware/auth.js";
import { createError } from "../../middleware/error-handler.js";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "fallback-refresh-secret";
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

// ─── Validation Schemas ──────────────────────────────────────────────────────

const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  monthlyGoal: z.string().optional(),
  preferredLanguage: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateTokens(payload: AuthPayload) {
  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
  return { accessToken, refreshToken };
}

// ─── Controllers ─────────────────────────────────────────────────────────────

export async function register(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw createError(parsed.error.errors[0].message, 400);
    }

    const { email, password, name, phone, monthlyGoal, preferredLanguage } =
      parsed.data;

    // Check if email already exists
    const existing = await db
      .select({ id: missionaries.id })
      .from(missionaries)
      .where(eq(missionaries.email, email))
      .limit(1);

    if (existing.length > 0) {
      throw createError("Email already registered", 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [missionary] = await db
      .insert(missionaries)
      .values({
        email,
        passwordHash,
        name,
        phone,
        monthlyGoal: monthlyGoal || "0",
        preferredLanguage: preferredLanguage || "pt-BR",
      })
      .returning({
        id: missionaries.id,
        email: missionaries.email,
        name: missionaries.name,
        phone: missionaries.phone,
        monthlyGoal: missionaries.monthlyGoal,
        preferredLanguage: missionaries.preferredLanguage,
        themePreference: missionaries.themePreference,
        createdAt: missionaries.createdAt,
      });

    const tokens = generateTokens({
      missionaryId: missionary.id,
      email: missionary.email,
    });

    res.status(201).json({
      missionary,
      ...tokens,
    });
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw createError(parsed.error.errors[0].message, 400);
    }

    const { email, password } = parsed.data;

    const [missionary] = await db
      .select()
      .from(missionaries)
      .where(eq(missionaries.email, email))
      .limit(1);

    if (!missionary) {
      throw createError("Invalid email or password", 401);
    }

    const isValidPassword = await bcrypt.compare(
      password,
      missionary.passwordHash
    );
    if (!isValidPassword) {
      throw createError("Invalid email or password", 401);
    }

    const tokens = generateTokens({
      missionaryId: missionary.id,
      email: missionary.email,
    });

    res.json({
      missionary: {
        id: missionary.id,
        email: missionary.email,
        name: missionary.name,
        phone: missionary.phone,
        monthlyGoal: missionary.monthlyGoal,
        preferredLanguage: missionary.preferredLanguage,
        themePreference: missionary.themePreference,
      },
      ...tokens,
    });
  } catch (error) {
    next(error);
  }
}

export async function refresh(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = refreshSchema.safeParse(req.body);
    if (!parsed.success) {
      throw createError(parsed.error.errors[0].message, 400);
    }

    const { refreshToken } = parsed.data;

    let decoded: AuthPayload;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as AuthPayload;
    } catch {
      throw createError("Invalid or expired refresh token", 401);
    }

    // Verify missionary still exists
    const [missionary] = await db
      .select({ id: missionaries.id, email: missionaries.email })
      .from(missionaries)
      .where(eq(missionaries.id, decoded.missionaryId))
      .limit(1);

    if (!missionary) {
      throw createError("Missionary not found", 404);
    }

    const tokens = generateTokens({
      missionaryId: missionary.id,
      email: missionary.email,
    });

    res.json(tokens);
  } catch (error) {
    next(error);
  }
}
