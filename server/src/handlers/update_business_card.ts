
import { db } from '../db';
import { businessCardsTable } from '../db/schema';
import { type UpdateBusinessCardInput, type BusinessCard } from '../schema';
import { eq } from 'drizzle-orm';

export const updateBusinessCard = async (input: UpdateBusinessCardInput): Promise<BusinessCard> => {
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

    // Update the business card record
    const result = await db.update(businessCardsTable)
      .set(finalUpdateData)
      .where(eq(businessCardsTable.id, id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Business card with id ${id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Business card update failed:', error);
    throw error;
  }
};
