import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { businessCardsTable, usersTable } from '../db/schema';
import { type GetBusinessCardByUrlInput, type SignupInput, type BusinessCard } from '../schema';
import { getBusinessCardByUrl } from '../handlers/get_business_card_by_url';
import { signup } from '../handlers/auth/signup';
import { eq } from 'drizzle-orm';

// Test user for authentication
const testUser: SignupInput = {
  email: 'test@example.com',
  password: 'testpassword123'
};

describe('getBusinessCardByUrl', () => {
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

  it('should return business card by unique URL with all fields', async () => {
    // Create a test business card with all fields
    const testCard = await db.insert(businessCardsTable)
      .values({
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
        company_logo_url: 'https://example.com/logo.png',
        unique_url: 'john-doe-123',
        qr_code_url: 'https://example.com/qr.png'
      })
      .returning()
      .execute();

    const input: GetBusinessCardByUrlInput = {
      unique_url: 'john-doe-123'
    };

    const result = await getBusinessCardByUrl(input) as BusinessCard;

    // Verify all fields
    expect(result.id).toEqual(testCard[0].id);
    expect(result.user_id).toEqual(userId);
    expect(result.name).toEqual('John Doe');
    expect(result.title).toEqual('Software Engineer');
    expect(result.company).toEqual('Tech Corp');
    expect(result.email).toEqual('john@techcorp.com');
    expect(result.phone_number).toEqual('+1234567890');
    expect(result.linkedin_url).toEqual('https://linkedin.com/in/johndoe');
    expect(result.twitter_url).toEqual('https://twitter.com/johndoe');
    expect(result.instagram_url).toEqual('https://instagram.com/johndoe');
    expect(result.profile_picture_url).toEqual('https://example.com/profile.jpg');
    expect(result.company_logo_url).toEqual('https://example.com/logo.png');
    expect(result.unique_url).toEqual('john-doe-123');
    expect(result.qr_code_url).toEqual('https://example.com/qr.png');
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should return business card with nullable fields as null', async () => {
    // Create minimal business card with only required fields
    await db.insert(businessCardsTable)
      .values({
        user_id: userId,
        name: 'Minimal Person',
        unique_url: 'minimal-person-123'
      })
      .execute();

    const input: GetBusinessCardByUrlInput = {
      unique_url: 'minimal-person-123'
    };

    const result = await getBusinessCardByUrl(input) as BusinessCard;

    // Verify required fields
    expect(result.name).toEqual('Minimal Person');
    expect(result.user_id).toEqual(userId);
    expect(result.unique_url).toEqual('minimal-person-123');
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);

    // Verify nullable fields are null
    expect(result.title).toBeNull();
    expect(result.company).toBeNull();
    expect(result.email).toBeNull();
    expect(result.phone_number).toBeNull();
    expect(result.linkedin_url).toBeNull();
    expect(result.twitter_url).toBeNull();
    expect(result.instagram_url).toBeNull();
    expect(result.profile_picture_url).toBeNull();
    expect(result.company_logo_url).toBeNull();
    expect(result.qr_code_url).toBeNull();
  });

  it('should throw error for non-existent unique URL', async () => {
    const input: GetBusinessCardByUrlInput = {
      unique_url: 'non-existent-url'
    };

    await expect(getBusinessCardByUrl(input)).rejects.toThrow(/not found/i);
  });
});