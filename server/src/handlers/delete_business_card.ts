
import { db } from '../db';
import { businessCardsTable } from '../db/schema';
import { type GetBusinessCardByIdInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteBusinessCard = async (input: GetBusinessCardByIdInput): Promise<{ success: boolean }> => {
  try {
    // Delete the business card record
    const result = await db.delete(businessCardsTable)
      .where(eq(businessCardsTable.id, input.id))
      .returning()
      .execute();

    // Return success status based on whether a record was deleted
    return { success: result.length > 0 };
  } catch (error) {
    console.error('Business card deletion failed:', error);
    throw error;
  }
};
