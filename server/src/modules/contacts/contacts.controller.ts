import { Response, NextFunction } from "express";
import { eq, and, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../config/database.js";
import { contactLog, supporters } from "../../db/schema.js";
import { AuthRequest } from "../../middleware/auth.js";
import { createError } from "../../middleware/error-handler.js";

// ─── Validation Schemas ──────────────────────────────────────────────────────

const createContactSchema = z.object({
  supporterId: z.string().uuid("Invalid supporter ID"),
  contactType: z.enum(["call", "whatsapp", "email", "in_person"]),
  contactDate: z.string().min(1, "Contact date is required"),
  notes: z.string().optional(),
  supporterInitiated: z.boolean().optional(),
});

// ─── Controllers ─────────────────────────────────────────────────────────────

export async function listContacts(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const missionaryId = req.missionary!.missionaryId;
    const { supporterId } = req.query;

    const conditions = [eq(contactLog.missionaryId, missionaryId)];

    if (supporterId && typeof supporterId === "string") {
      conditions.push(eq(contactLog.supporterId, supporterId));
    }

    const results = await db
      .select({
        id: contactLog.id,
        supporterId: contactLog.supporterId,
        supporterName: supporters.name,
        contactType: contactLog.contactType,
        contactDate: contactLog.contactDate,
        notes: contactLog.notes,
        supporterInitiated: contactLog.supporterInitiated,
        createdAt: contactLog.createdAt,
      })
      .from(contactLog)
      .leftJoin(supporters, eq(contactLog.supporterId, supporters.id))
      .where(and(...conditions))
      .orderBy(sql`${contactLog.contactDate} DESC`);

    res.json({ contacts: results, count: results.length });
  } catch (error) {
    next(error);
  }
}

export async function createContact(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const missionaryId = req.missionary!.missionaryId;

    const parsed = createContactSchema.safeParse(req.body);
    if (!parsed.success) {
      throw createError(parsed.error.errors[0].message, 400);
    }

    const data = parsed.data;

    // Verify supporter belongs to this missionary
    const [supporter] = await db
      .select({ id: supporters.id })
      .from(supporters)
      .where(
        and(
          eq(supporters.id, data.supporterId),
          eq(supporters.missionaryId, missionaryId)
        )
      )
      .limit(1);

    if (!supporter) {
      throw createError("Supporter not found", 404);
    }

    const [contact] = await db
      .insert(contactLog)
      .values({
        supporterId: data.supporterId,
        missionaryId,
        contactType: data.contactType,
        contactDate: data.contactDate,
        notes: data.notes || null,
        supporterInitiated: data.supporterInitiated ?? false,
      })
      .returning();

    res.status(201).json({ contact });
  } catch (error) {
    next(error);
  }
}

export async function getPendingContacts(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const missionaryId = req.missionary!.missionaryId;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // Get active supporters who have NOT been contacted this month
    const contactedThisMonth = db
      .select({ supporterId: contactLog.supporterId })
      .from(contactLog)
      .where(
        and(
          eq(contactLog.missionaryId, missionaryId),
          sql`EXTRACT(YEAR FROM ${contactLog.contactDate}::date) = ${currentYear}`,
          sql`EXTRACT(MONTH FROM ${contactLog.contactDate}::date) = ${currentMonth}`
        )
      );

    const pendingSupporters = await db
      .select()
      .from(supporters)
      .where(
        and(
          eq(supporters.missionaryId, missionaryId),
          eq(supporters.status, "active"),
          sql`${supporters.id} NOT IN (${contactedThisMonth})`
        )
      )
      .orderBy(supporters.name);

    res.json({
      supporters: pendingSupporters,
      count: pendingSupporters.length,
      month: `${currentYear}-${String(currentMonth).padStart(2, "0")}`,
    });
  } catch (error) {
    next(error);
  }
}
