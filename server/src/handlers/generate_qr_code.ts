
import { db } from '../db';
import { businessCardsTable } from '../db/schema';
import { type GenerateQrCodeInput, type BusinessCard } from '../schema';
import { eq, and } from 'drizzle-orm';

export const generateQrCode = async (input: GenerateQrCodeInput, userId: number): Promise<BusinessCard> => {
  try {
    // First, check if the business card exists and belongs to the user
    const existingCard = await db.select()
      .from(businessCardsTable)
      .where(and(
        eq(businessCardsTable.id, input.id),
        eq(businessCardsTable.user_id, userId)
      ))
      .execute();

    if (existingCard.length === 0) {
      throw new Error(`Business card with id ${input.id} not found or you don't have permission to access it`);
    }

    const card = existingCard[0];
    
    // Generate QR code URL based on the unique_url
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://businesscard.com/card/${card.unique_url}`)}`;

    // Update the business card with the QR code URL
    const result = await db.update(businessCardsTable)
      .set({
        qr_code_url: qrCodeUrl,
        updated_at: new Date()
      })
      .where(and(
        eq(businessCardsTable.id, input.id),
        eq(businessCardsTable.user_id, userId)
      ))
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('QR code generation failed:', error);
    throw error;
  }
};
