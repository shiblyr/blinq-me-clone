import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type SignupInput } from '../schema';
import { signup } from '../handlers/auth/signup';
import { eq } from 'drizzle-orm';

const testInput: SignupInput = {
  email: 'test@example.com',
  password: 'testpassword123'
};

describe('signup', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a new user', async () => {
    const result = await signup(testInput);

    expect(result.success).toBe(true);

    // Verify user was created in database
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.email, testInput.email))
      .execute();

    expect(users).toHaveLength(1);
    expect(users[0].email).toEqual(testInput.email);
    expect(users[0].password_hash).toBeDefined();
    expect(users[0].password_hash).not.toEqual(testInput.password); // Should be hashed
    expect(users[0].created_at).toBeInstanceOf(Date);
  });

  it('should not create user with duplicate email', async () => {
    // Create first user
    await signup(testInput);

    // Try to create second user with same email
    await expect(signup(testInput)).rejects.toThrow(/already exists/i);

    // Verify only one user exists
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.email, testInput.email))
      .execute();

    expect(users).toHaveLength(1);
  });

  it('should hash the password', async () => {
    await signup(testInput);

    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.email, testInput.email))
      .execute();

    const user = users[0];
    expect(user.password_hash).toBeDefined();
    expect(user.password_hash).not.toEqual(testInput.password);
    expect(user.password_hash.length).toBeGreaterThan(0);
  });
});