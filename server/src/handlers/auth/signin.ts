import { db } from '../../db';
import { usersTable } from '../../db/schema';
import { type SigninInput } from '../../schema';
import { eq } from 'drizzle-orm';

// Simple hash function (should match signup)
function simpleHash(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16) + password.length.toString();
}

// Simple JWT-like token generation
function generateToken(userId: number, email: string): string {
  const payload = { userId, email, exp: Date.now() + (7 * 24 * 60 * 60 * 1000) }; // 7 days
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

export const signin = async (input: SigninInput): Promise<{ token: string }> => {
  try {
    // Find user by email
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.email, input.email))
      .limit(1)
      .execute();

    if (users.length === 0) {
      throw new Error('Invalid email or password');
    }

    const user = users[0];

    // Verify password
    const hashedPassword = simpleHash(input.password);
    if (hashedPassword !== user.password_hash) {
      throw new Error('Invalid email or password');
    }

    // Generate token
    const token = generateToken(user.id, user.email);

    return { token };
  } catch (error) {
    console.error('User signin failed:', error);
    throw error;
  }
};