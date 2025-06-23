import { db } from '../../db';
import { usersTable } from '../../db/schema';
import { eq } from 'drizzle-orm';

export const me = async (userId: number): Promise<{ id: number; email: string }> => {
  try {
    const users = await db.select({
      id: usersTable.id,
      email: usersTable.email
    })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1)
    .execute();

    if (users.length === 0) {
      throw new Error('User not found');
    }

    return users[0];
  } catch (error) {
    console.error('Get user info failed:', error);
    throw error;
  }
};