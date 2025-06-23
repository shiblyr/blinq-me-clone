
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { businessCardsTable } from '../db/schema';
import { type GetBusinessCardByIdInput } from '../schema';
import { getBusinessCardById } from '../handlers/get_business_card_by_id';

describe('getBusinessCardById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return business card when ID exists', async () => {
    // Create a business card
    const businessCard = await db.insert(businessCardsTable)
      .values({
        name: 'John Doe',
        title: 'Software Engineer',
        company: 'Tech Corp',
        email: 'john@example.com',
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

    const input: GetBusinessCardByIdInput = {
      id: businessCard[0].id
    };

    const result = await getBusinessCardById(input);

    expect(result).not.toBeNull();
    expect(result!.id).toBe(businessCard[0].id);
    expect(result!.name).toBe('John Doe');
    expect(result!.title).toBe('Software Engineer');
    expect(result!.company).toBe('Tech Corp');
    expect(result!.email).toBe('john@example.com');
    expect(result!.phone_number).toBe('+1234567890');
    expect(result!.linkedin_url).toBe('https://linkedin.com/in/johndoe');
    expect(result!.twitter_url).toBe('https://twitter.com/johndoe');
    expect(result!.instagram_url).toBe('https://instagram.com/johndoe');
    expect(result!.profile_picture_url).toBe('https://example.com/profile.jpg');
    expect(result!.company_logo_url).toBe('https://example.com/logo.png');
    expect(result!.unique_url).toBe('john-doe-123');
    expect(result!.qr_code_url).toBe('https://example.com/qr.png');
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when ID does not exist', async () => {
    const input: GetBusinessCardByIdInput = {
      id: 999
    };

    const result = await getBusinessCardById(input);

    expect(result).toBeNull();
  });

  it('should handle business card with minimal data', async () => {
    // Create a business card with only required fields
    const businessCard = await db.insert(businessCardsTable)
      .values({
        name: 'Jane Smith',
        unique_url: 'jane-smith-456'
      })
      .returning()
      .execute();

    const input: GetBusinessCardByIdInput = {
      id: businessCard[0].id
    };

    const result = await getBusinessCardById(input);

    expect(result).not.toBeNull();
    expect(result!.id).toBe(businessCard[0].id);
    expect(result!.name).toBe('Jane Smith');
    expect(result!.unique_url).toBe('jane-smith-456');
    expect(result!.title).toBeNull();
    expect(result!.company).toBeNull();
    expect(result!.email).toBeNull();
    expect(result!.phone_number).toBeNull();
    expect(result!.linkedin_url).toBeNull();
    expect(result!.twitter_url).toBeNull();
    expect(result!.instagram_url).toBeNull();
    expect(result!.profile_picture_url).toBeNull();
    expect(result!.company_logo_url).toBeNull();
    expect(result!.qr_code_url).toBeNull();
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });
});
