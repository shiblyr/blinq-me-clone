
import { db } from '../db';
import { businessCardsTable } from '../db/schema';
import { type GetBusinessCardByIdInput, type BusinessCard } from '../schema';
import { eq } from 'drizzle-orm';

export const getBusinessCardById = async (input: GetBusinessCardByIdInput): Promise<BusinessCard | null> => {
  try {
    const results = await db.select()
      .from(businessCardsTable)
      .where(eq(businessCardsTable.id, input.id))
      .execute();

    if (results.length === 0) {
      return null;
    }

    return results[0];
  } catch (error) {
    console.error('Get business card by ID failed:', error);
    throw error;
  }
};
