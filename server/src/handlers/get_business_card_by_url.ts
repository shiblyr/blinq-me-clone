
import { db } from '../db';
import { businessCardsTable } from '../db/schema';
import { type GetBusinessCardByUrlInput, type BusinessCard } from '../schema';
import { eq } from 'drizzle-orm';

export const getBusinessCardByUrl = async (input: GetBusinessCardByUrlInput): Promise<BusinessCard | null> => {
  try {
    const results = await db.select()
      .from(businessCardsTable)
      .where(eq(businessCardsTable.unique_url, input.unique_url))
      .execute();

    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error('Failed to get business card by URL:', error);
    throw error;
  }
};
