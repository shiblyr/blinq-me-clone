import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type SignupInput } from '../schema';
import { signup } from '../handlers/auth/signup';
import { me } from '../handlers/auth/me';
import { eq } from 'drizzle-orm';

const testUser: SignupInput = {
  email: 'test@example.com',
  password: 'testpassword123'
};

describe('me', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return user info for valid user ID', async () => {
    // Create user first
    await signup(testUser);

    // Get user ID from database
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.email, testUser.email))
      .execute();

    const userId = users[0].id;

    // Get user info
    const result = await me(userId);

    expect(result.id).toBe(userId);
    expect(result.email).toBe(testUser.email);
    expect(result).not.toHaveProperty('password_hash'); // Should not include password
  });

  it('should throw error for invalid user ID', async () => {
    const invalidUserId = 99999;

    await expect(me(invalidUserId)).rejects.toThrow(/user not found/i);
  });

  it('should not return password hash', async () => {
    // Create user first
    await signup(testUser);

    // Get user ID from database
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.email, testUser.email))
      .execute();

    const userId = users[0].id;

    // Get user info
    const result = await me(userId);

    // Ensure password_hash is not included
    expect(result).not.toHaveProperty('password_hash');
    expect(Object.keys(result)).toEqual(['id', 'email']);
  });
});