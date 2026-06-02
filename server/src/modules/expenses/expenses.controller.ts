import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.js';
import { db } from '../../config/database.js';
import { expenses } from '../../db/schema.js';
import { eq, and, sql, gte, lte } from 'drizzle-orm';

export const getExpenses = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const missionaryId = req.missionary!.missionaryId;
    const { month } = req.query; // format: YYYY-MM
    
    let query = db.select().from(expenses).where(eq(expenses.missionaryId, missionaryId));
    
    if (month && typeof month === 'string') {
      const startDate = `${month}-01`;
      const endDate = `${month}-31`; // good enough for comparison
      
      query = db.select().from(expenses).where(
        and(
          eq(expenses.missionaryId, missionaryId),
          gte(expenses.expenseDate, startDate),
          lte(expenses.expenseDate, endDate)
        )
      );
    }
    
    const results = await query;
    res.json(results);
  } catch (error) {
    next(error);
  }
};

export const createExpense = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const missionaryId = req.missionary!.missionaryId;
    const { description, amount, expenseDate, category } = req.body;
    
    const [newExpense] = await db.insert(expenses).values({
      missionaryId,
      description,
      amount: String(amount),
      expenseDate,
      category
    }).returning();
    
    res.status(201).json(newExpense);
  } catch (error) {
    next(error);
  }
};

export const deleteExpense = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const missionaryId = req.missionary!.missionaryId;
    const id = req.params.id as string;
    
    await db.delete(expenses).where(
      and(
        eq(expenses.id, id),
        eq(expenses.missionaryId, missionaryId)
      )
    );
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
