import { NextFunction, Response } from "express";
import { AuthRequest } from "../../middleware/auth.js";
import { db } from "../../config/database.js";
import { supporters, offerings, contactLog } from "../../db/schema.js";
import { eq, and, sql, gte, lt } from "drizzle-orm";

export async function getMonthlyReport(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const missionaryId = req.missionary!.missionaryId;
    const year = req.params.year as string;
    const month = req.params.month as string;

    const monthStr = `${year}-${month.padStart(2, '0')}`;

    // Get all expected offerings vs received
    const offeringsData = await db.select({
      supporterId: offerings.supporterId,
      supporterName: supporters.name,
      amount: offerings.amount,
      isReceived: offerings.isReceived,
      offeringDate: offerings.offeringDate
    })
    .from(offerings)
    .innerJoin(supporters, eq(offerings.supporterId, supporters.id))
    .where(
      and(
        eq(offerings.missionaryId, missionaryId),
        eq(offerings.monthReference, monthStr)
      )
    );

    // Calculate totals
    let totalExpected = 0;
    let totalReceived = 0;

    const offeringsList = offeringsData.map(o => {
      const amount = parseFloat(o.amount.toString());
      totalExpected += amount;
      if (o.isReceived) {
        totalReceived += amount;
      }
      return {
        ...o,
        amount
      };
    });

    // Get contact logs for the month
    const firstDay = `${monthStr}-01`;
    let lastDayObj = new Date(parseInt(year), parseInt(month), 0);
    const lastDay = `${year}-${month.padStart(2, '0')}-${String(lastDayObj.getDate()).padStart(2, '0')}`;

    const contactsData = await db.select({
      supporterName: supporters.name,
      contactType: contactLog.contactType,
      contactDate: contactLog.contactDate,
      notes: contactLog.notes
    })
    .from(contactLog)
    .innerJoin(supporters, eq(contactLog.supporterId, supporters.id))
    .where(
      and(
        eq(contactLog.missionaryId, missionaryId),
        gte(contactLog.contactDate, firstDay),
        lt(contactLog.contactDate, lastDay)
      )
    );

    res.json({
      report: {
        month: monthStr,
        summary: {
          totalExpected,
          totalReceived,
          totalMissing: totalExpected - totalReceived,
          receivedPercentage: totalExpected > 0 ? (totalReceived / totalExpected) * 100 : 0
        },
        offerings: offeringsList,
        contacts: contactsData
      }
    });

  } catch (error) {
    next(error);
  }
}
