
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { businessCardsTable } from '../db/schema';
import { getBusinessCards } from '../handlers/get_business_cards';

describe('getBusinessCards', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no business cards exist', async () => {
    const result = await getBusinessCards();
    expect(result).toEqual([]);
  });

  it('should return all business cards', async () => {
    // Create test business cards
    await db.insert(businessCardsTable)
      .values([
        {
          name: 'John Doe',
          title: 'Software Engineer',
          company: 'Tech Corp',
          email: 'john@techcorp.com',
          unique_url: 'john-doe-123'
        },
        {
          name: 'Jane Smith',
          title: 'Designer',
          company: 'Design Studio',
          email: 'jane@designstudio.com',
          unique_url: 'jane-smith-456'
        }
      ])
      .execute();

    const result = await getBusinessCards();

    expect(result).toHaveLength(2);
    
    // Check first card
    expect(result[0].name).toEqual('John Doe');
    expect(result[0].title).toEqual('Software Engineer');
    expect(result[0].company).toEqual('Tech Corp');
    expect(result[0].email).toEqual('john@techcorp.com');
    expect(result[0].unique_url).toEqual('john-doe-123');
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);

    // Check second card
    expect(result[1].name).toEqual('Jane Smith');
    expect(result[1].title).toEqual('Designer');
    expect(result[1].company).toEqual('Design Studio');
    expect(result[1].email).toEqual('jane@designstudio.com');
    expect(result[1].unique_url).toEqual('jane-smith-456');
    expect(result[1].id).toBeDefined();
    expect(result[1].created_at).toBeInstanceOf(Date);
    expect(result[1].updated_at).toBeInstanceOf(Date);
  });

  it('should return business cards with nullable fields as null', async () => {
    // Create minimal business card with only required fields
    await db.insert(businessCardsTable)
      .values({
        name: 'Minimal User',
        unique_url: 'minimal-user-789'
      })
      .execute();

    const result = await getBusinessCards();

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Minimal User');
    expect(result[0].unique_url).toEqual('minimal-user-789');
    expect(result[0].title).toBeNull();
    expect(result[0].company).toBeNull();
    expect(result[0].email).toBeNull();
    expect(result[0].phone_number).toBeNull();
    expect(result[0].linkedin_url).toBeNull();
    expect(result[0].twitter_url).toBeNull();
    expect(result[0].instagram_url).toBeNull();
    expect(result[0].profile_picture_url).toBeNull();
    expect(result[0].company_logo_url).toBeNull();
    expect(result[0].qr_code_url).toBeNull();
  });
});
