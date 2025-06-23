
import { db } from '../db';
import { businessCardsTable } from '../db/schema';
import { type BusinessCard } from '../schema';

export const getBusinessCards = async (): Promise<BusinessCard[]> => {
  try {
    const results = await db.select()
      .from(businessCardsTable)
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to get business cards:', error);
    throw error;
  }
};
