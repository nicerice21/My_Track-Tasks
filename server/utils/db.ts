import type { H3Event } from 'h3';
import { drizzle, type DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from '../db/schema';

export { schema };

export type DB = DrizzleD1Database<typeof schema>;

export function useD1(event: H3Event): DB {
  const cloudflare = event.context.cloudflare as
    | { env: { MY_TODO_DB?: D1Database } }
    | undefined;
  const db = cloudflare?.env?.MY_TODO_DB;

  if (!db) {
    throw createError({
      statusCode: 500,
      statusMessage: 'D1 database binding is missing',
    });
  }

  return drizzle(db, { schema });
}
