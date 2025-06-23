
import { db } from '../db';
import { businessCardsTable } from '../db/schema';
import { type GetBusinessCardByIdInput } from '../schema';
import { eq, and } from 'drizzle-orm';

export const deleteBusinessCard = async (input: GetBusinessCardByIdInput, userId: number): Promise<{ success: boolean }> => {
  try {
    // Delete the business card record (only if it belongs to the user)
    const result = await db.delete(businessCardsTable)
      .where(and(
        eq(businessCardsTable.id, input.id),
        eq(businessCardsTable.user_id, userId)
      ))
      .returning()
      .execute();

    // Return success status based on whether a record was deleted
    return { success: result.length > 0 };
  } catch (error) {
    console.error('Business card deletion failed:', error);
    throw error;
  }
};
