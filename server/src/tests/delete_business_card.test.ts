
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { businessCardsTable } from '../db/schema';
import { type GetBusinessCardByIdInput, type CreateBusinessCardInput } from '../schema';
import { deleteBusinessCard } from '../handlers/delete_business_card';
import { eq } from 'drizzle-orm';

// Test input for creating a business card
const testBusinessCard: CreateBusinessCardInput = {
  name: 'John Doe',
  title: 'Software Engineer',
  company: 'Tech Corp',
  email: 'john.doe@example.com',
  phone_number: '+1234567890',
  linkedin_url: 'https://linkedin.com/in/johndoe',
  twitter_url: 'https://twitter.com/johndoe',
  instagram_url: 'https://instagram.com/johndoe',
  profile_picture_url: 'https://example.com/profile.jpg',
  company_logo_url: 'https://example.com/logo.png'
};

describe('deleteBusinessCard', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing business card', async () => {
    // Create a business card first
    const createResult = await db.insert(businessCardsTable)
      .values({
        ...testBusinessCard,
        unique_url: 'john-doe-123'
      })
      .returning()
      .execute();

    const businessCardId = createResult[0].id;

    // Delete the business card
    const deleteInput: GetBusinessCardByIdInput = {
      id: businessCardId
    };

    const result = await deleteBusinessCard(deleteInput);

    // Verify deletion was successful
    expect(result.success).toBe(true);

    // Verify the business card no longer exists in database
    const businessCards = await db.select()
      .from(businessCardsTable)
      .where(eq(businessCardsTable.id, businessCardId))
      .execute();

    expect(businessCards).toHaveLength(0);
  });

  it('should return false when deleting non-existent business card', async () => {
    const deleteInput: GetBusinessCardByIdInput = {
      id: 999 // Non-existent ID
    };

    const result = await deleteBusinessCard(deleteInput);

    // Verify deletion was unsuccessful
    expect(result.success).toBe(false);
  });

  it('should not affect other business cards when deleting one', async () => {
    // Create two business cards
    const firstCard = await db.insert(businessCardsTable)
      .values({
        ...testBusinessCard,
        name: 'John Doe',
        unique_url: 'john-doe-123'
      })
      .returning()
      .execute();

    const secondCard = await db.insert(businessCardsTable)
      .values({
        ...testBusinessCard,
        name: 'Jane Smith',
        unique_url: 'jane-smith-456'
      })
      .returning()
      .execute();

    // Delete the first business card
    const deleteInput: GetBusinessCardByIdInput = {
      id: firstCard[0].id
    };

    const result = await deleteBusinessCard(deleteInput);

    // Verify deletion was successful
    expect(result.success).toBe(true);

    // Verify only the first card was deleted
    const remainingCards = await db.select()
      .from(businessCardsTable)
      .execute();

    expect(remainingCards).toHaveLength(1);
    expect(remainingCards[0].id).toBe(secondCard[0].id);
    expect(remainingCards[0].name).toBe('Jane Smith');
  });
});
