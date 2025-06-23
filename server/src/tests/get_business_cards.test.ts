
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { businessCardsTable, usersTable } from '../db/schema';
import { type SignupInput } from '../schema';
import { getBusinessCards } from '../handlers/get_business_cards';
import { signup } from '../handlers/auth/signup';
import { eq } from 'drizzle-orm';

// Test user for authentication
const testUser: SignupInput = {
  email: 'test@example.com',
  password: 'testpassword123'
};

describe('getBusinessCards', () => {
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

  it('should return empty array when user has no business cards', async () => {
    const result = await getBusinessCards(userId);
    expect(result).toEqual([]);
  });

  it('should return only business cards belonging to the user', async () => {
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

    // Create test business cards for both users
    await db.insert(businessCardsTable)
      .values([
        {
          user_id: userId,
          name: 'John Doe',
          title: 'Software Engineer',
          company: 'Tech Corp',
          email: 'john@techcorp.com',
          unique_url: 'john-doe-123'
        },
        {
          user_id: userId,
          name: 'John Smith',
          title: 'Designer',
          company: 'Design Studio',
          email: 'johnsmith@designstudio.com',
          unique_url: 'john-smith-456'
        },
        {
          user_id: otherUserId,
          name: 'Other User',
          title: 'Manager',
          company: 'Other Corp',
          email: 'other@othercorp.com',
          unique_url: 'other-user-789'
        }
      ])
      .execute();

    const result = await getBusinessCards(userId);

    // Should only return cards for the specific user
    expect(result).toHaveLength(2);
    
    // Check first card
    expect(result[0].name).toEqual('John Doe');
    expect(result[0].title).toEqual('Software Engineer');
    expect(result[0].company).toEqual('Tech Corp');
    expect(result[0].email).toEqual('john@techcorp.com');
    expect(result[0].unique_url).toEqual('john-doe-123');
    expect(result[0].user_id).toEqual(userId);
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);

    // Check second card
    expect(result[1].name).toEqual('John Smith');
    expect(result[1].title).toEqual('Designer');
    expect(result[1].company).toEqual('Design Studio');
    expect(result[1].email).toEqual('johnsmith@designstudio.com');
    expect(result[1].unique_url).toEqual('john-smith-456');
    expect(result[1].user_id).toEqual(userId);
    expect(result[1].id).toBeDefined();
    expect(result[1].created_at).toBeInstanceOf(Date);
    expect(result[1].updated_at).toBeInstanceOf(Date);

    // Verify no other user's cards are returned
    result.forEach(card => {
      expect(card.name).not.toEqual('Other User');
    });
  });

  it('should return business cards with nullable fields as null', async () => {
    // Create minimal business card with only required fields
    await db.insert(businessCardsTable)
      .values({
        user_id: userId,
        name: 'Minimal User',
        unique_url: 'minimal-user-789'
      })
      .execute();

    const result = await getBusinessCards(userId);

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Minimal User');
    expect(result[0].user_id).toEqual(userId);
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
