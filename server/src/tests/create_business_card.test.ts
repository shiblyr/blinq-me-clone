
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { businessCardsTable, usersTable } from '../db/schema';
import { type CreateBusinessCardInput, type SignupInput } from '../schema';
import { createBusinessCard } from '../handlers/create_business_card';
import { signup } from '../handlers/auth/signup';
import { eq } from 'drizzle-orm';

// Test user for authentication
const testUser: SignupInput = {
  email: 'test@example.com',
  password: 'testpassword123'
};

// Complete test input with all fields
const testInput: CreateBusinessCardInput = {
  name: 'John Doe',
  title: 'Software Engineer',
  company: 'Tech Corp',
  email: 'john@techcorp.com',
  phone_number: '+1-555-0123',
  linkedin_url: 'https://linkedin.com/in/johndoe',
  twitter_url: 'https://twitter.com/johndoe',
  instagram_url: 'https://instagram.com/johndoe',
  profile_picture_url: 'https://example.com/profile.jpg',
  company_logo_url: 'https://example.com/logo.png'
};

// Minimal test input with only required fields
const minimalInput: CreateBusinessCardInput = {
  name: 'Jane Smith'
};

describe('createBusinessCard', () => {
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

  it('should create a business card with all fields', async () => {
    const result = await createBusinessCard(testInput, userId);

    // Basic field validation
    expect(result.name).toEqual('John Doe');
    expect(result.title).toEqual('Software Engineer');
    expect(result.company).toEqual('Tech Corp');
    expect(result.email).toEqual('john@techcorp.com');
    expect(result.phone_number).toEqual('+1-555-0123');
    expect(result.linkedin_url).toEqual('https://linkedin.com/in/johndoe');
    expect(result.twitter_url).toEqual('https://twitter.com/johndoe');
    expect(result.instagram_url).toEqual('https://instagram.com/johndoe');
    expect(result.profile_picture_url).toEqual('https://example.com/profile.jpg');
    expect(result.company_logo_url).toEqual('https://example.com/logo.png');
    expect(result.id).toBeDefined();
    expect(result.user_id).toEqual(userId);
    expect(result.unique_url).toBeDefined();
    expect(result.unique_url.length).toBeGreaterThan(0);
    expect(result.qr_code_url).toBeNull();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a business card with only required fields', async () => {
    const result = await createBusinessCard(minimalInput, userId);

    // Required field validation
    expect(result.name).toEqual('Jane Smith');
    expect(result.id).toBeDefined();
    expect(result.user_id).toEqual(userId);
    expect(result.unique_url).toBeDefined();
    expect(result.unique_url.length).toBeGreaterThan(0);
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);

    // Optional fields should be null
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

  it('should save business card to database with user association', async () => {
    const result = await createBusinessCard(testInput, userId);

    // Query using proper drizzle syntax
    const businessCards = await db.select()
      .from(businessCardsTable)
      .where(eq(businessCardsTable.id, result.id))
      .execute();

    expect(businessCards).toHaveLength(1);
    expect(businessCards[0].name).toEqual('John Doe');
    expect(businessCards[0].title).toEqual('Software Engineer');
    expect(businessCards[0].company).toEqual('Tech Corp');
    expect(businessCards[0].email).toEqual('john@techcorp.com');
    expect(businessCards[0].user_id).toEqual(userId);
    expect(businessCards[0].unique_url).toEqual(result.unique_url);
    expect(businessCards[0].created_at).toBeInstanceOf(Date);
    expect(businessCards[0].updated_at).toBeInstanceOf(Date);
  });

  it('should generate unique URLs for different business cards', async () => {
    const result1 = await createBusinessCard({ name: 'Person 1' }, userId);
    const result2 = await createBusinessCard({ name: 'Person 2' }, userId);

    expect(result1.unique_url).not.toEqual(result2.unique_url);
    expect(result1.unique_url.length).toBeGreaterThan(0);
    expect(result2.unique_url.length).toBeGreaterThan(0);
    expect(result1.user_id).toEqual(userId);
    expect(result2.user_id).toEqual(userId);
  });

  it('should handle undefined optional fields correctly', async () => {
    const inputWithUndefined: CreateBusinessCardInput = {
      name: 'Test User',
      title: undefined,
      company: undefined,
      email: undefined
    };

    const result = await createBusinessCard(inputWithUndefined, userId);

    expect(result.name).toEqual('Test User');
    expect(result.user_id).toEqual(userId);
    expect(result.title).toBeNull();
    expect(result.company).toBeNull();
    expect(result.email).toBeNull();
  });
});
