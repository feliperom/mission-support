import { NextFunction, Response } from "express";
import { AuthRequest } from "../../middleware/auth.js";
import { db } from "../../config/database.js";
import { supporters, offerings, contactLog, missionaries } from "../../db/schema.js";
import { eq, and, sql, gte, lte } from "drizzle-orm";

export async function getDashboardSummary(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const missionaryId = req.missionary!.missionaryId;

    const today = new Date();
    const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    
    // Get missionary goal
    const [missionary] = await db.select({ monthlyGoal: missionaries.monthlyGoal })
      .from(missionaries)
      .where(eq(missionaries.id, missionaryId));

    const goal = parseFloat(missionary?.monthlyGoal?.toString() || "0");

    // Get received this month
    const [receivedResult] = await db.select({
      totalReceived: sql<string>`sum(${offerings.amount})`
    })
    .from(offerings)
    .where(
      and(
        eq(offerings.missionaryId, missionaryId),
        eq(offerings.monthReference, currentMonthStr),
        eq(offerings.isReceived, true)
      )
    );

    const received = parseFloat(receivedResult?.totalReceived || "0");
    const achievedPercent = goal > 0 ? (received / goal) * 100 : 0;

    // Get counts by status
    const statusCounts = await db.select({
      status: supporters.status,
      count: sql<number>`count(${supporters.id})`
    })
    .from(supporters)
    .where(eq(supporters.missionaryId, missionaryId))
    .groupBy(supporters.status);

    const counts = statusCounts.reduce((acc, curr) => {
      acc[curr.status as string] = Number(curr.count);
      return acc;
    }, {} as Record<string, number>);

    // Get expenses this month
    const startDate = `${currentMonthStr}-01`;
    const endDate = `${currentMonthStr}-31`;
    
    // We import expenses schema dynamically here or at the top
    const { expenses } = await import('../../db/schema.js');
    
    const [expensesResult] = await db.select({
      totalExpenses: sql<string>`sum(${expenses.amount})`
    })
    .from(expenses)
    .where(
      and(
        eq(expenses.missionaryId, missionaryId),
        gte(expenses.expenseDate, startDate),
        lte(expenses.expenseDate, endDate)
      )
    );

    const totalExpenses = parseFloat(expensesResult?.totalExpenses || "0");
    const netIncome = received - totalExpenses;

    res.json({
      summary: {
        goal,
        received,
        totalExpenses,
        netIncome,
        achievedPercent: Math.round(achievedPercent * 100) / 100
      },
      counts
    });
  } catch (error) {
    next(error);
  }
}

export async function getDashboardEvolution(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const missionaryId = req.missionary!.missionaryId;

    // Group offerings by monthReference for the last 12 months
    const today = new Date();
    today.setMonth(today.getMonth() - 11);
    const startMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

    const evolution = await db.select({
      month: offerings.monthReference,
      total: sql<string>`sum(${offerings.amount})`
    })
    .from(offerings)
    .where(
      and(
        eq(offerings.missionaryId, missionaryId),
        eq(offerings.isReceived, true),
        gte(offerings.monthReference, startMonthStr)
      )
    )
    .groupBy(offerings.monthReference)
    .orderBy(offerings.monthReference);

    res.json({ evolution });
  } catch (error) {
    next(error);
  }
}

export async function getDashboardBirthdays(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const missionaryId = req.missionary!.missionaryId;

    // A simplified birthday check: get all and filter in memory, or use complex sql
    // Since SQL date manipulation can be tricky across different DBs, and the dataset is usually small:
    const allSupporters = await db.select({
      id: supporters.id,
      name: supporters.name,
      birthday: supporters.birthday
    })
    .from(supporters)
    .where(
      and(
        eq(supporters.missionaryId, missionaryId),
        sql`${supporters.birthday} IS NOT NULL`
      )
    );

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();
    
    // Find birthdays in the next 7 days
    const upcomingBirthdays = allSupporters.filter(s => {
      if (!s.birthday) return false;
      const bdate = new Date(s.birthday);
      const bMonth = bdate.getMonth();
      const bDay = bdate.getDate();
      
      const nextBirthday = new Date(today.getFullYear(), bMonth, bDay);
      if (nextBirthday < today) {
        nextBirthday.setFullYear(today.getFullYear() + 1);
      }
      const diffTime = nextBirthday.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays <= 7;
    });

    res.json({ birthdays: upcomingBirthdays });
  } catch (error) {
    next(error);
  }
}

export async function getDashboardPendingCalls(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const missionaryId = req.missionary!.missionaryId;

    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Format to YYYY-MM-DD
    const firstDayStr = firstDayOfMonth.toISOString().split('T')[0];

    // active supporters not contacted this month
    const allActiveSupporters = await db.select({
      id: supporters.id,
      name: supporters.name,
      phone: supporters.phone
    })
    .from(supporters)
    .where(
      and(
        eq(supporters.missionaryId, missionaryId),
        eq(supporters.status, 'active')
      )
    );

    const contactsThisMonth = await db.select({
      supporterId: contactLog.supporterId
    })
    .from(contactLog)
    .where(
      and(
        eq(contactLog.missionaryId, missionaryId),
        gte(contactLog.contactDate, firstDayStr)
      )
    );

    const contactedIds = new Set(contactsThisMonth.map(c => c.supporterId));

    const pending = allActiveSupporters.filter(s => !contactedIds.has(s.id));

    res.json({ pendingCalls: pending });
  } catch (error) {
    next(error);
  }
}

export async function getDashboardRegionStats(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const missionaryId = req.missionary!.missionaryId;

    const stats = await db.select({
      state: supporters.state,
      count: sql<number>`count(${supporters.id})`
    })
    .from(supporters)
    .where(
      and(
        eq(supporters.missionaryId, missionaryId),
        sql`${supporters.state} IS NOT NULL`,
        sql`${supporters.state} != ''`
      )
    )
    .groupBy(supporters.state);

    res.json({ regionStats: stats });
  } catch (error) {
    next(error);
  }
}
