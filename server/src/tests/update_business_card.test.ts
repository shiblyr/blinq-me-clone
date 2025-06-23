
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { businessCardsTable, usersTable } from '../db/schema';
import { type UpdateBusinessCardInput, type SignupInput } from '../schema';
import { updateBusinessCard } from '../handlers/update_business_card';
import { signup } from '../handlers/auth/signup';
import { eq } from 'drizzle-orm';

// Test user for authentication
const testUser: SignupInput = {
  email: 'test@example.com',
  password: 'testpassword123'
};

describe('updateBusinessCard', () => {
  let userId: number;

  beforeEach(async () => {
    await createDB();
    
    // Create test user
    await signup(testUser);
    
    // Get user ID
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.email, testUser.email))
      .execute();
    
    userId = users[0].id;
  });
  
  afterEach(resetDB);

  // Helper function to create a test business card
  const createTestBusinessCard = async (): Promise<number> => {
    const testCardData = {
      user_id: userId,
      name: 'John Doe',
      title: 'Software Engineer',
      company: 'Tech Corp',
      email: 'john@techcorp.com',
      phone_number: '+1234567890',
      linkedin_url: 'https://linkedin.com/in/johndoe',
      twitter_url: 'https://twitter.com/johndoe',
      instagram_url: 'https://instagram.com/johndoe',
      profile_picture_url: 'https://example.com/profile.jpg',
      company_logo_url: 'https://example.com/logo.jpg',
      unique_url: 'john-doe-123'
    };

    const result = await db.insert(businessCardsTable)
      .values(testCardData)
      .returning()
      .execute();

    return result[0].id;
  };

  it('should update a business card with all fields', async () => {
    const cardId = await createTestBusinessCard();

    const updateInput: UpdateBusinessCardInput = {
      id: cardId,
      name: 'Jane Smith',
      title: 'Senior Developer',
      company: 'New Tech Inc',
      email: 'jane@newtech.com',
      phone_number: '+9876543210',
      linkedin_url: 'https://linkedin.com/in/janesmith',
      twitter_url: 'https://twitter.com/janesmith',
      instagram_url: 'https://instagram.com/janesmith',
      profile_picture_url: 'https://example.com/jane-profile.jpg',
      company_logo_url: 'https://example.com/newtech-logo.jpg'
    };

    const result = await updateBusinessCard(updateInput, userId);

    // Verify updated fields
    expect(result.id).toEqual(cardId);
    expect(result.user_id).toEqual(userId);
    expect(result.name).toEqual('Jane Smith');
    expect(result.title).toEqual('Senior Developer');
    expect(result.company).toEqual('New Tech Inc');
    expect(result.email).toEqual('jane@newtech.com');
    expect(result.phone_number).toEqual('+9876543210');
    expect(result.linkedin_url).toEqual('https://linkedin.com/in/janesmith');
    expect(result.twitter_url).toEqual('https://twitter.com/janesmith');
    expect(result.instagram_url).toEqual('https://instagram.com/janesmith');
    expect(result.profile_picture_url).toEqual('https://example.com/jane-profile.jpg');
    expect(result.company_logo_url).toEqual('https://example.com/newtech-logo.jpg');
    expect(result.updated_at).toBeInstanceOf(Date);
    
    // Verify unique_url wasn't changed (not in update schema)
    expect(result.unique_url).toEqual('john-doe-123');
  });

  it('should update only provided fields', async () => {
    const cardId = await createTestBusinessCard();

    const updateInput: UpdateBusinessCardInput = {
      id: cardId,
      name: 'John Updated',
      email: 'john.updated@techcorp.com'
    };

    const result = await updateBusinessCard(updateInput, userId);

    // Verify updated fields
    expect(result.name).toEqual('John Updated');
    expect(result.email).toEqual('john.updated@techcorp.com');
    
    // Verify unchanged fields
    expect(result.title).toEqual('Software Engineer');
    expect(result.company).toEqual('Tech Corp');
    expect(result.phone_number).toEqual('+1234567890');
    expect(result.linkedin_url).toEqual('https://linkedin.com/in/johndoe');
  });

  it('should set fields to null when explicitly provided', async () => {
    const cardId = await createTestBusinessCard();

    const updateInput: UpdateBusinessCardInput = {
      id: cardId,
      title: null,
      company: null,
      email: null
    };

    const result = await updateBusinessCard(updateInput, userId);

    // Verify fields set to null
    expect(result.title).toBeNull();
    expect(result.company).toBeNull();
    expect(result.email).toBeNull();
    
    // Verify unchanged fields
    expect(result.name).toEqual('John Doe');
    expect(result.phone_number).toEqual('+1234567890');
  });

  it('should not allow updating cards belonging to other users', async () => {
    // Create another user
    const otherUser: SignupInput = {
      email: 'other@example.com',
      password: 'otherpassword123'
    };
    await signup(otherUser);
    
    const otherUsers = await db.select()
      .from(usersTable)
      .where(eq(usersTable.email, otherUser.email))
      .execute();
    
    const otherUserId = otherUsers[0].id;

    // Create a business card for the other user
    const otherUserCard = await db.insert(businessCardsTable)
      .values({
        user_id: otherUserId,
        name: 'Other User',
        unique_url: 'other-user-card'
      })
      .returning()
      .execute();

    const updateInput: UpdateBusinessCardInput = {
      id: otherUserCard[0].id,
      name: 'Hacked Name'
    };

    // Should throw error when trying to update other user's card
    await expect(updateBusinessCard(updateInput, userId)).rejects.toThrow(/not found.*permission/i);
  });

  it('should update the updated_at timestamp', async () => {
    const cardId = await createTestBusinessCard();

    // Get original updated_at
    const originalCard = await db.select()
      .from(businessCardsTable)
      .where(eq(businessCardsTable.id, cardId))
      .execute();
    
    const originalUpdatedAt = originalCard[0].updated_at;

    // Wait a bit to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const updateInput: UpdateBusinessCardInput = {
      id: cardId,
      name: 'Updated Name'
    };

    const result = await updateBusinessCard(updateInput, userId);

    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });

  it('should save changes to database', async () => {
    const cardId = await createTestBusinessCard();

    const updateInput: UpdateBusinessCardInput = {
      id: cardId,
      name: 'Database Test',
      email: 'database@test.com'
    };

    await updateBusinessCard(updateInput, userId);

    // Verify changes persisted in database
    const dbRecord = await db.select()
      .from(businessCardsTable)
      .where(eq(businessCardsTable.id, cardId))
      .execute();

    expect(dbRecord).toHaveLength(1);
    expect(dbRecord[0].name).toEqual('Database Test');
    expect(dbRecord[0].email).toEqual('database@test.com');
    expect(dbRecord[0].user_id).toEqual(userId);
  });

  it('should throw error for non-existent business card', async () => {
    const updateInput: UpdateBusinessCardInput = {
      id: 99999,
      name: 'Non Existent'
    };

    await expect(updateBusinessCard(updateInput, userId)).rejects.toThrow(/not found.*permission/i);
  });
});
