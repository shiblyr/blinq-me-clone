
import { db } from '../db';
import { businessCardsTable } from '../db/schema';
import { type CreateBusinessCardInput, type BusinessCard } from '../schema';

export const createBusinessCard = async (input: CreateBusinessCardInput, userId: number): Promise<BusinessCard> => {
  try {
    // Generate a unique URL identifier
    const uniqueUrl = Math.random().toString(36).substring(2, 12);

    // Insert business card record
    const result = await db.insert(businessCardsTable)
      .values({
        user_id: userId,
        name: input.name,
        title: input.title || null,
        company: input.company || null,
        email: input.email || null,
        phone_number: input.phone_number || null,
        linkedin_url: input.linkedin_url || null,
        twitter_url: input.twitter_url || null,
        instagram_url: input.instagram_url || null,
        profile_picture_url: input.profile_picture_url || null,
        company_logo_url: input.company_logo_url || null,
        unique_url: uniqueUrl
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Business card creation failed:', error);
    throw error;
  }
};
