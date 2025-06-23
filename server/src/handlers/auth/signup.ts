import { db } from '../../db';
import { usersTable } from '../../db/schema';
import { type SignupInput } from '../../schema';
import { eq } from 'drizzle-orm';

// Simple hash function (for production, use bcrypt)
function simpleHash(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16) + password.length.toString();
}

export const signup = async (input: SignupInput): Promise<{ success: boolean }> => {
  try {
    // Check if user already exists
    const existingUser = await db.select()
      .from(usersTable)
      .where(eq(usersTable.email, input.email))
      .limit(1)
      .execute();

    if (existingUser.length > 0) {
      throw new Error('User already exists with this email');
    }

    // Hash password (simple implementation - use bcrypt in production)
    const passwordHash = simpleHash(input.password);

    // Insert user
    await db.insert(usersTable)
      .values({
        email: input.email,
        password_hash: passwordHash
      })
      .execute();

    return { success: true };
  } catch (error) {
    console.error('User signup failed:', error);
    throw error;
  }
};