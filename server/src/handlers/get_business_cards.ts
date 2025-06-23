
import { db } from '../db';
import { businessCardsTable } from '../db/schema';
import { type BusinessCard } from '../schema';
import { eq } from 'drizzle-orm';

export const getBusinessCards = async (userId: number): Promise<BusinessCard[]> => {
  try {
    const results = await db.select()
      .from(businessCardsTable)
      .where(eq(businessCardsTable.user_id, userId))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to get business cards:', error);
    throw error;
  }
};
