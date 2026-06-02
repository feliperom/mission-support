import { Response, NextFunction } from "express";
import { eq, and, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../config/database.js";
import {
  offerings,
  supporters,
  missionaries,
} from "../../db/schema.js";
import { AuthRequest } from "../../middleware/auth.js";
import { createError } from "../../middleware/error-handler.js";

// ─── Validation Schemas ──────────────────────────────────────────────────────

const createOfferingSchema = z.object({
  supporterId: z.string().uuid("Invalid supporter ID").optional(),
  supporterName: z.string().optional(),
  amount: z.string().min(1, "Amount is required"),
  offeringDate: z.string().min(1, "Offering date is required"),
  monthReference: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "Month reference must be in YYYY-MM format"),
  isReceived: z.boolean().optional(),
  notes: z.string().optional(),
});

const updateOfferingSchema = z.object({
  amount: z.string().optional(),
  offeringDate: z.string().optional(),
  monthReference: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "Month reference must be in YYYY-MM format")
    .optional(),
  isReceived: z.boolean().optional(),
  notes: z.string().optional(),
});

// ─── Controllers ─────────────────────────────────────────────────────────────

export async function listOfferings(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const missionaryId = req.missionary!.missionaryId;
    const { month } = req.query;

    const conditions = [eq(offerings.missionaryId, missionaryId)];

    if (month && typeof month === "string") {
      conditions.push(eq(offerings.monthReference, month));
    }

    const results = await db
      .select({
        id: offerings.id,
        supporterId: offerings.supporterId,
        supporterName: supporters.name,
        amount: offerings.amount,
        offeringDate: offerings.offeringDate,
        monthReference: offerings.monthReference,
        isReceived: offerings.isReceived,
        notes: offerings.notes,
        createdAt: offerings.createdAt,
      })
      .from(offerings)
      .leftJoin(supporters, eq(offerings.supporterId, supporters.id))
      .where(and(...conditions))
      .orderBy(sql`${offerings.offeringDate} DESC`);

    res.json({ offerings: results, count: results.length });
  } catch (error) {
    next(error);
  }
}

export async function createOffering(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const missionaryId = req.missionary!.missionaryId;

    const parsed = createOfferingSchema.safeParse(req.body);
    if (!parsed.success) {
      throw createError(parsed.error.errors[0].message, 400);
    }

    const data = parsed.data;

    // Verify supporter belongs to this missionary if provided
    if (data.supporterId) {
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
    } else if (!data.supporterName) {
      throw createError("Either supporterId or supporterName must be provided", 400);
    }

    const [offering] = await db
      .insert(offerings)
      .values({
        supporterId: data.supporterId || null,
        supporterName: data.supporterName || null,
        missionaryId,
        amount: data.amount,
        offeringDate: data.offeringDate,
        monthReference: data.monthReference,
        isReceived: data.isReceived ?? false,
        notes: data.notes || null,
      })
      .returning();

    res.status(201).json({ offering });
  } catch (error) {
    next(error);
  }
}

export async function updateOffering(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const missionaryId = req.missionary!.missionaryId;
    const id = req.params.id as string;

    const parsed = updateOfferingSchema.safeParse(req.body);
    if (!parsed.success) {
      throw createError(parsed.error.errors[0].message, 400);
    }

    // Verify ownership
    const [existing] = await db
      .select({ id: offerings.id })
      .from(offerings)
      .where(
        and(eq(offerings.id, id), eq(offerings.missionaryId, missionaryId))
      )
      .limit(1);

    if (!existing) {
      throw createError("Offering not found", 404);
    }

    const data = parsed.data;
    const updateData: Record<string, unknown> = {};

    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.offeringDate !== undefined)
      updateData.offeringDate = data.offeringDate;
    if (data.monthReference !== undefined)
      updateData.monthReference = data.monthReference;
    if (data.isReceived !== undefined) updateData.isReceived = data.isReceived;
    if (data.notes !== undefined) updateData.notes = data.notes || null;

    const [updated] = await db
      .update(offerings)
      .set(updateData)
      .where(eq(offerings.id, id))
      .returning();

    res.json({ offering: updated });
  } catch (error) {
    next(error);
  }
}

export async function getMonthlySummary(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const missionaryId = req.missionary!.missionaryId;
    const month =
      (req.query.month as string) ||
      new Date().toISOString().substring(0, 7);

    // Get total received for the month
    const [totals] = await db
      .select({
        totalReceived: sql<string>`COALESCE(SUM(CASE WHEN ${offerings.isReceived} = true THEN ${offerings.amount}::numeric ELSE 0 END), 0)`,
        totalPending: sql<string>`COALESCE(SUM(CASE WHEN ${offerings.isReceived} = false THEN ${offerings.amount}::numeric ELSE 0 END), 0)`,
        totalAmount: sql<string>`COALESCE(SUM(${offerings.amount}::numeric), 0)`,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(offerings)
      .where(
        and(
          eq(offerings.missionaryId, missionaryId),
          eq(offerings.monthReference, month)
        )
      );

    // Get missionary's monthly goal
    const [missionary] = await db
      .select({ monthlyGoal: missionaries.monthlyGoal })
      .from(missionaries)
      .where(eq(missionaries.id, missionaryId))
      .limit(1);

    const goal = parseFloat(missionary?.monthlyGoal || "0");
    const received = parseFloat(totals?.totalReceived || "0");
    const percentage = goal > 0 ? Math.round((received / goal) * 100) : 0;

    res.json({
      month,
      totalReceived: totals?.totalReceived || "0",
      totalPending: totals?.totalPending || "0",
      totalAmount: totals?.totalAmount || "0",
      offeringsCount: totals?.count || 0,
      monthlyGoal: missionary?.monthlyGoal || "0",
      percentageAchieved: percentage,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMonthlyCheck(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const missionaryId = req.missionary!.missionaryId;
    const month =
      (req.query.month as string) ||
      new Date().toISOString().substring(0, 7);

    // Get all active supporters with their offering status for the month
    const activeSupporters = await db
      .select({
        id: supporters.id,
        name: supporters.name,
        type: supporters.type,
        estimatedOffering: supporters.estimatedOffering,
        email: supporters.email,
        phone: supporters.phone,
      })
      .from(supporters)
      .where(
        and(
          eq(supporters.missionaryId, missionaryId),
          eq(supporters.status, "active")
        )
      )
      .orderBy(supporters.name);

    // Get offerings for the month
    const monthOfferings = await db
      .select({
        id: offerings.id,
        supporterId: offerings.supporterId,
        supporterName: offerings.supporterName,
        amount: offerings.amount,
        isReceived: offerings.isReceived,
      })
      .from(offerings)
      .where(
        and(
          eq(offerings.missionaryId, missionaryId),
          eq(offerings.monthReference, month)
        )
      );

    // Build a map of supporter offerings
    const offeringMap = new Map<
      string,
      { amount: string; isReceived: boolean | null }
    >();
    
    const avulsoOfferings: any[] = [];

    for (const o of monthOfferings) {
      if (o.supporterId) {
        offeringMap.set(o.supporterId, {
          amount: o.amount,
          isReceived: o.isReceived,
        });
      } else {
        avulsoOfferings.push({
          id: o.id,
          name: o.supporterName,
          type: 'avulso',
          estimatedOffering: o.amount,
          offeringStatus: o.isReceived ? "received" : "pending",
          offeringAmount: o.amount
        });
      }
    }

    const checkList = activeSupporters.map((s) => {
      const offering = offeringMap.get(s.id);
      return {
        ...s,
        offeringStatus: offering
          ? offering.isReceived
            ? "received"
            : "pending"
          : "no_offering",
        offeringAmount: offering?.amount || null,
      };
    });

    const finalCheckList = [...checkList, ...avulsoOfferings];

    res.json({ month, supporters: finalCheckList });
  } catch (error) {
    next(error);
  }
}
