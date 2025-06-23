
import { db } from '../db';
import { businessCardsTable } from '../db/schema';
import { type UpdateBusinessCardInput, type BusinessCard } from '../schema';
import { eq, and } from 'drizzle-orm';

export const updateBusinessCard = async (input: UpdateBusinessCardInput, userId: number): Promise<BusinessCard> => {
  try {
    // Extract id from input and create update object without id
    const { id, ...updateData } = input;
    
    // Only include fields that are actually provided (not undefined)
    const fieldsToUpdate = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );
    
    // Add updated_at timestamp
    const finalUpdateData = {
      ...fieldsToUpdate,
      updated_at: new Date()
    };

    // Update the business card record (only if it belongs to the user)
    const result = await db.update(businessCardsTable)
      .set(finalUpdateData)
      .where(and(
        eq(businessCardsTable.id, id),
        eq(businessCardsTable.user_id, userId)
      ))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Business card with id ${id} not found or you don't have permission to update it`);
    }

    return result[0];
  } catch (error) {
    console.error('Business card update failed:', error);
    throw error;
  }
};
