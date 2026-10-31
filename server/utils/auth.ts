import type { H3Event } from 'h3';
import type { DB } from './db';
import { users } from '../db/schema';

export interface AuthUser {
  email: string;
}

export function getAuthUser(event: H3Event): AuthUser {
  const user = event.context.user as AuthUser | undefined;
  if (!user?.email) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }
  return user;
}

/**
 * 現在のログインユーザーを users テーブルに存在させ、メールアドレスを返す。
 */
export async function ensureUser(db: DB, email: string): Promise<void> {
  await db
    .insert(users)
    .values({
      email,
      displayName: email,
      createdAt: new Date().toISOString(),
    })
    .onConflictDoNothing({ target: users.email });
}
