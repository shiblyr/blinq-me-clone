import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { businessCardsTable, usersTable } from '../db/schema';
import { type GenerateQrCodeInput, type SignupInput } from '../schema';
import { generateQrCode } from '../handlers/generate_qr_code';
import { signup } from '../handlers/auth/signup';
import { eq } from 'drizzle-orm';

// Test user for authentication
const testUser: SignupInput = {
  email: 'test@example.com',
  password: 'testpassword123'
};

describe('generateQrCode', () => {
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

  it('should generate QR code for existing business card owned by user', async () => {
    // Create a test business card first
    const card = await db.insert(businessCardsTable)
      .values({
        user_id: userId,
        name: 'John Doe',
        unique_url: 'john-doe-123'
      })
      .returning()
      .execute();

    const input: GenerateQrCodeInput = {
      id: card[0].id
    };

    const result = await generateQrCode(input, userId);

    // Verify QR code was generated
    expect(result.id).toEqual(card[0].id);
    expect(result.user_id).toEqual(userId);
    expect(result.name).toEqual('John Doe');
    expect(result.unique_url).toEqual('john-doe-123');
    expect(result.qr_code_url).toBeDefined();
    expect(result.qr_code_url).toContain('qrserver.com');
    expect(result.qr_code_url).toContain('john-doe-123');
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should throw error for non-existent business card', async () => {
    const input: GenerateQrCodeInput = {
      id: 999999 // Non-existent ID
    };

    await expect(generateQrCode(input, userId)).rejects.toThrow(/not found.*permission/i);
  });

  it('should save QR code URL to database', async () => {
    // Create a test business card first
    const card = await db.insert(businessCardsTable)
      .values({
        user_id: userId,
        name: 'Jane Smith',
        unique_url: 'jane-smith-456'
      })
      .returning()
      .execute();

    const input: GenerateQrCodeInput = {
      id: card[0].id
    };

    const result = await generateQrCode(input, userId);

    // Verify QR code URL was saved to database
    const dbRecord = await db.select()
      .from(businessCardsTable)
      .where(eq(businessCardsTable.id, card[0].id))
      .execute();

    expect(dbRecord).toHaveLength(1);
    expect(dbRecord[0].qr_code_url).toEqual(result.qr_code_url);
    expect(dbRecord[0].qr_code_url).toContain('qrserver.com');
    expect(dbRecord[0].qr_code_url).toContain('jane-smith-456');
  });
});