
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { businessCardsTable } from '../db/schema';
import { type GenerateQrCodeInput, type CreateBusinessCardInput } from '../schema';
import { generateQrCode } from '../handlers/generate_qr_code';
import { eq } from 'drizzle-orm';

// Helper function to create a test business card
const createTestBusinessCard = async (): Promise<number> => {
  const testCard: CreateBusinessCardInput = {
    name: 'John Doe',
    title: 'Software Engineer',
    company: 'Tech Corp',
    email: 'john@example.com',
    phone_number: '+1234567890'
  };

  const result = await db.insert(businessCardsTable)
    .values({
      ...testCard,
      unique_url: `john-doe-${Date.now()}` // Generate unique URL
    })
    .returning()
    .execute();

  return result[0].id;
};

describe('generateQrCode', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should generate QR code for existing business card', async () => {
    // Create a test business card
    const cardId = await createTestBusinessCard();
    
    const input: GenerateQrCodeInput = {
      id: cardId
    };

    const result = await generateQrCode(input);

    // Verify QR code URL is generated
    expect(result.qr_code_url).toBeDefined();
    expect(result.qr_code_url).toContain('api.qrserver.com');
    expect(result.qr_code_url).toContain('create-qr-code');
    expect(result.qr_code_url).toContain(encodeURIComponent(result.unique_url));
    
    // Verify other fields remain unchanged
    expect(result.id).toEqual(cardId);
    expect(result.name).toEqual('John Doe');
    expect(result.title).toEqual('Software Engineer');
    expect(result.company).toEqual('Tech Corp');
    expect(result.email).toEqual('john@example.com');
    expect(result.phone_number).toEqual('+1234567890');
    
    // Verify updated_at is recent
    expect(result.updated_at).toBeInstanceOf(Date);
    const now = new Date();
    const timeDiff = now.getTime() - result.updated_at.getTime();
    expect(timeDiff).toBeLessThan(5000); // Within 5 seconds
  });

  it('should save QR code to database', async () => {
    // Create a test business card
    const cardId = await createTestBusinessCard();
    
    const input: GenerateQrCodeInput = {
      id: cardId
    };

    const result = await generateQrCode(input);

    // Query database to verify QR code was saved
    const cards = await db.select()
      .from(businessCardsTable)
      .where(eq(businessCardsTable.id, cardId))
      .execute();

    expect(cards).toHaveLength(1);
    expect(cards[0].qr_code_url).toEqual(result.qr_code_url);
    expect(cards[0].qr_code_url).toContain('api.qrserver.com');
    expect(cards[0].updated_at).toBeInstanceOf(Date);
  });

  it('should throw error for non-existent business card', async () => {
    const input: GenerateQrCodeInput = {
      id: 99999 // Non-existent ID
    };

    await expect(generateQrCode(input)).rejects.toThrow(/Business card with id 99999 not found/i);
  });

  it('should update existing QR code', async () => {
    // Create a test business card
    const cardId = await createTestBusinessCard();
    
    const input: GenerateQrCodeInput = {
      id: cardId
    };

    // Generate QR code first time
    const firstResult = await generateQrCode(input);
    expect(firstResult.qr_code_url).toBeDefined();

    // Wait a moment to ensure different timestamp
    await new Promise(resolve => setTimeout(resolve, 100));

    // Generate QR code second time
    const secondResult = await generateQrCode(input);
    
    // Should still have QR code URL (possibly the same)
    expect(secondResult.qr_code_url).toBeDefined();
    expect(secondResult.qr_code_url).toContain('api.qrserver.com');
    
    // Updated timestamp should be more recent
    expect(secondResult.updated_at.getTime()).toBeGreaterThanOrEqual(firstResult.updated_at.getTime());
  });
});
