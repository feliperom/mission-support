import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.js';
import { db } from '../../config/database.js';
import { missionaries } from '../../db/schema.js';
import { eq } from 'drizzle-orm';

export const getSettings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const missionaryId = req.missionary!.missionaryId;
    
    const [missionary] = await db
      .select({ monthlyGoal: missionaries.monthlyGoal })
      .from(missionaries)
      .where(eq(missionaries.id, missionaryId))
      .limit(1);
      
    res.json(missionary);
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const missionaryId = req.missionary!.missionaryId;
    const { monthlyGoal } = req.body;
    
    const updateData: any = {};
    if (monthlyGoal !== undefined) updateData.monthlyGoal = String(monthlyGoal);
    
    const [updated] = await db
      .update(missionaries)
      .set(updateData)
      .where(eq(missionaries.id, missionaryId))
      .returning({ monthlyGoal: missionaries.monthlyGoal });
      
    res.json(updated);
  } catch (error) {
    next(error);
  }
};
