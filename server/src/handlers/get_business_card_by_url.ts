
import { db } from '../db';
import { businessCardsTable } from '../db/schema';
import { type GetBusinessCardByUrlInput, type BusinessCard } from '../schema';
import { eq } from 'drizzle-orm';

export const getBusinessCardByUrl = async (input: GetBusinessCardByUrlInput): Promise<BusinessCard> => {
  try {
    const results = await db.select()
      .from(businessCardsTable)
      .where(eq(businessCardsTable.unique_url, input.unique_url))
      .execute();

    if (results.length === 0) {
      throw new Error(`Business card with URL '${input.unique_url}' not found`);
    }

    return results[0];
  } catch (error) {
    console.error('Failed to get business card by URL:', error);
    throw error;
  }
};
