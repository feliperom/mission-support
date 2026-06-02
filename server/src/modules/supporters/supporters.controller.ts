import { Response, NextFunction } from "express";
import { eq, and, ilike, or, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../config/database.js";
import { supporters, offerings, contactLog } from "../../db/schema.js";
import { AuthRequest } from "../../middleware/auth.js";
import { createError } from "../../middleware/error-handler.js";

// ─── Validation Schemas ──────────────────────────────────────────────────────

const createSupporterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  partnerName: z.string().optional(),
  type: z.enum(["individual", "couple", "church"]).optional(),
  status: z
    .enum(["prospect", "contacted", "confirmed", "active", "inactive"])
    .optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  birthday: z.string().optional(),
  hasResponded: z.boolean().optional(),
  hasReturnedContact: z.boolean().optional(),
  estimatedOffering: z.string().optional(),
  notes: z.string().optional(),
});

const updateSupporterSchema = createSupporterSchema.partial();

// ─── Controllers ─────────────────────────────────────────────────────────────

export async function listSupporters(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const missionaryId = req.missionary!.missionaryId;
    const { search, type, status } = req.query;

    const conditions = [eq(supporters.missionaryId, missionaryId)];

    if (type && typeof type === "string") {
      conditions.push(
        eq(supporters.type, type as "individual" | "couple" | "church")
      );
    }

    if (status && typeof status === "string") {
      conditions.push(
        eq(
          supporters.status,
          status as
            | "prospect"
            | "contacted"
            | "confirmed"
            | "active"
            | "inactive"
        )
      );
    }

    let query = db
      .select()
      .from(supporters)
      .where(and(...conditions))
      .orderBy(supporters.name);

    let results = await query;

    // Apply search filter in-app for ilike on name/email/city
    if (search && typeof search === "string") {
      const searchResults = await db
        .select()
        .from(supporters)
        .where(
          and(
            ...conditions,
            or(
              ilike(supporters.name, `%${search}%`),
              ilike(supporters.email, `%${search}%`),
              ilike(supporters.city, `%${search}%`)
            )
          )
        )
        .orderBy(supporters.name);
      results = searchResults;
    }

    res.json({ supporters: results, count: results.length });
  } catch (error) {
    next(error);
  }
}

export async function getSupporterById(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const missionaryId = req.missionary!.missionaryId;
    const id = req.params.id as string;

    const [supporter] = await db
      .select()
      .from(supporters)
      .where(
        and(eq(supporters.id, id), eq(supporters.missionaryId, missionaryId))
      )
      .limit(1);

    if (!supporter) {
      throw createError("Supporter not found", 404);
    }

    // Fetch related offerings
    const supporterOfferings = await db
      .select()
      .from(offerings)
      .where(eq(offerings.supporterId, id))
      .orderBy(sql`${offerings.offeringDate} DESC`);

    // Fetch related contacts
    const supporterContacts = await db
      .select()
      .from(contactLog)
      .where(eq(contactLog.supporterId, id))
      .orderBy(sql`${contactLog.contactDate} DESC`);

    res.json({
      supporter,
      offerings: supporterOfferings,
      contacts: supporterContacts,
    });
  } catch (error) {
    next(error);
  }
}

export async function createSupporter(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const missionaryId = req.missionary!.missionaryId;

    const parsed = createSupporterSchema.safeParse(req.body);
    if (!parsed.success) {
      throw createError(parsed.error.errors[0].message, 400);
    }

    const data = parsed.data;

    const [supporter] = await db
      .insert(supporters)
      .values({
        missionaryId,
        name: data.name,
        partnerName: data.partnerName || null,
        type: data.type || "individual",
        status: data.status || "prospect",
        email: data.email || null,
        phone: data.phone || null,
        city: data.city || null,
        state: data.state || null,
        country: data.country || "Brasil",
        birthday: data.birthday || null,
        hasResponded: data.hasResponded ?? false,
        hasReturnedContact: data.hasReturnedContact ?? false,
        estimatedOffering: data.estimatedOffering || "0",
        notes: data.notes || null,
      })
      .returning();

    res.status(201).json({ supporter });
  } catch (error) {
    next(error);
  }
}

export async function updateSupporter(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const missionaryId = req.missionary!.missionaryId;
    const id = req.params.id as string;

    const parsed = updateSupporterSchema.safeParse(req.body);
    if (!parsed.success) {
      throw createError(parsed.error.errors[0].message, 400);
    }

    // Verify ownership
    const [existing] = await db
      .select({ id: supporters.id })
      .from(supporters)
      .where(
        and(eq(supporters.id, id), eq(supporters.missionaryId, missionaryId))
      )
      .limit(1);

    if (!existing) {
      throw createError("Supporter not found", 404);
    }

    const data = parsed.data;

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.partnerName !== undefined) updateData.partnerName = data.partnerName || null;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.email !== undefined) updateData.email = data.email || null;
    if (data.phone !== undefined) updateData.phone = data.phone || null;
    if (data.city !== undefined) updateData.city = data.city || null;
    if (data.state !== undefined) updateData.state = data.state || null;
    if (data.country !== undefined) updateData.country = data.country || null;
    if (data.birthday !== undefined)
      updateData.birthday = data.birthday || null;
    if (data.hasResponded !== undefined)
      updateData.hasResponded = data.hasResponded;
    if (data.hasReturnedContact !== undefined)
      updateData.hasReturnedContact = data.hasReturnedContact;
    if (data.estimatedOffering !== undefined)
      updateData.estimatedOffering = data.estimatedOffering;
    if (data.notes !== undefined) updateData.notes = data.notes || null;

    const [updated] = await db
      .update(supporters)
      .set(updateData)
      .where(eq(supporters.id, id))
      .returning();

    res.json({ supporter: updated });
  } catch (error) {
    next(error);
  }
}

export async function deleteSupporter(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const missionaryId = req.missionary!.missionaryId;
    const id = req.params.id as string;

    // Verify ownership
    const [existing] = await db
      .select({ id: supporters.id })
      .from(supporters)
      .where(
        and(eq(supporters.id, id), eq(supporters.missionaryId, missionaryId))
      )
      .limit(1);

    if (!existing) {
      throw createError("Supporter not found", 404);
    }

    // Soft delete: set status to inactive
    const [updated] = await db
      .update(supporters)
      .set({ status: "inactive", updatedAt: new Date() })
      .where(eq(supporters.id, id))
      .returning();

    res.json({ supporter: updated, message: "Supporter set to inactive" });
  } catch (error) {
    next(error);
  }
}

export async function getBirthdays(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const missionaryId = req.missionary!.missionaryId;
    const now = new Date();
    const currentMonth = String(now.getMonth() + 1).padStart(2, "0");

    // Get supporters whose birthday month matches current month
    const results = await db
      .select()
      .from(supporters)
      .where(
        and(
          eq(supporters.missionaryId, missionaryId),
          sql`EXTRACT(MONTH FROM ${supporters.birthday}::date) = ${parseInt(currentMonth)}`
        )
      )
      .orderBy(sql`EXTRACT(DAY FROM ${supporters.birthday}::date)`);

    res.json({ supporters: results, month: currentMonth });
  } catch (error) {
    next(error);
  }
}
