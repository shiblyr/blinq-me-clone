
import { db } from '../db';
import { businessCardsTable } from '../db/schema';
import { type CreateBusinessCardInput, type BusinessCard } from '../schema';
import { nanoid } from 'nanoid';

export const createBusinessCard = async (input: CreateBusinessCardInput): Promise<BusinessCard> => {
  try {
    // Generate a unique URL identifier
    const uniqueUrl = nanoid(10);

    // Insert business card record
    const result = await db.insert(businessCardsTable)
      .values({
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
