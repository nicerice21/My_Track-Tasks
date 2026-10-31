import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../db/schema';

export { schema };

export function useD1(event: H3Event) {
  const cloudflare = event.context.cloudflare as { env: { DB?: D1Database } } | undefined;
  const db = cloudflare?.env?.DB;

  if (!db) {
    throw createError({
      statusCode: 500,
      statusMessage: 'D1 database binding is missing',
    });
  }

  return drizzle(db, { schema });
}
