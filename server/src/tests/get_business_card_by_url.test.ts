
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { businessCardsTable } from '../db/schema';
import { type GetBusinessCardByUrlInput } from '../schema';
import { getBusinessCardByUrl } from '../handlers/get_business_card_by_url';

// Test business card data
const testBusinessCard = {
  name: 'John Doe',
  title: 'Software Engineer',
  company: 'Tech Corp',
  email: 'john.doe@techcorp.com',
  phone_number: '+1-555-123-4567',
  linkedin_url: 'https://linkedin.com/in/johndoe',
  twitter_url: 'https://twitter.com/johndoe',
  instagram_url: 'https://instagram.com/johndoe',
  profile_picture_url: 'https://example.com/profile.jpg',
  company_logo_url: 'https://example.com/logo.jpg',
  unique_url: 'john-doe-123',
  qr_code_url: 'https://example.com/qr.png'
};

const testInput: GetBusinessCardByUrlInput = {
  unique_url: 'john-doe-123'
};

describe('getBusinessCardByUrl', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return business card when unique URL exists', async () => {
    // Create test business card
    await db.insert(businessCardsTable)
      .values(testBusinessCard)
      .execute();

    const result = await getBusinessCardByUrl(testInput);

    expect(result).toBeDefined();
    expect(result?.name).toEqual('John Doe');
    expect(result?.title).toEqual('Software Engineer');
    expect(result?.company).toEqual('Tech Corp');
    expect(result?.email).toEqual('john.doe@techcorp.com');
    expect(result?.phone_number).toEqual('+1-555-123-4567');
    expect(result?.linkedin_url).toEqual('https://linkedin.com/in/johndoe');
    expect(result?.twitter_url).toEqual('https://twitter.com/johndoe');
    expect(result?.instagram_url).toEqual('https://instagram.com/johndoe');
    expect(result?.profile_picture_url).toEqual('https://example.com/profile.jpg');
    expect(result?.company_logo_url).toEqual('https://example.com/logo.jpg');
    expect(result?.unique_url).toEqual('john-doe-123');
    expect(result?.qr_code_url).toEqual('https://example.com/qr.png');
    expect(result?.id).toBeDefined();
    expect(result?.created_at).toBeInstanceOf(Date);
    expect(result?.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when unique URL does not exist', async () => {
    const nonExistentInput: GetBusinessCardByUrlInput = {
      unique_url: 'non-existent-url'
    };

    const result = await getBusinessCardByUrl(nonExistentInput);

    expect(result).toBeNull();
  });

  it('should return correct business card when multiple cards exist', async () => {
    // Create multiple business cards
    await db.insert(businessCardsTable)
      .values([
        { ...testBusinessCard, unique_url: 'first-card' },
        { ...testBusinessCard, name: 'Jane Smith', unique_url: 'jane-smith-456' },
        { ...testBusinessCard, name: 'Bob Wilson', unique_url: 'bob-wilson-789' }
      ])
      .execute();

    const searchInput: GetBusinessCardByUrlInput = {
      unique_url: 'jane-smith-456'
    };

    const result = await getBusinessCardByUrl(searchInput);

    expect(result).toBeDefined();
    expect(result?.name).toEqual('Jane Smith');
    expect(result?.unique_url).toEqual('jane-smith-456');
  });

  it('should handle business card with minimal data', async () => {
    const minimalCard = {
      name: 'Minimal User',
      unique_url: 'minimal-123',
      title: null,
      company: null,
      email: null,
      phone_number: null,
      linkedin_url: null,
      twitter_url: null,
      instagram_url: null,
      profile_picture_url: null,
      company_logo_url: null,
      qr_code_url: null
    };

    await db.insert(businessCardsTable)
      .values(minimalCard)
      .execute();

    const searchInput: GetBusinessCardByUrlInput = {
      unique_url: 'minimal-123'
    };

    const result = await getBusinessCardByUrl(searchInput);

    expect(result).toBeDefined();
    expect(result?.name).toEqual('Minimal User');
    expect(result?.unique_url).toEqual('minimal-123');
    expect(result?.title).toBeNull();
    expect(result?.company).toBeNull();
    expect(result?.email).toBeNull();
    expect(result?.phone_number).toBeNull();
    expect(result?.linkedin_url).toBeNull();
    expect(result?.twitter_url).toBeNull();
    expect(result?.instagram_url).toBeNull();
    expect(result?.profile_picture_url).toBeNull();
    expect(result?.company_logo_url).toBeNull();
    expect(result?.qr_code_url).toBeNull();
  });
});
