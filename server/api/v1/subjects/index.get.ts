import { desc, eq } from 'drizzle-orm';
import { subjects } from '../../../db/schema';
import { getAuthUser } from '../../../utils/auth';
import { useD1 } from '../../../utils/db';
import { ok } from '../../../utils/response';

export default defineEventHandler(async (event) => {
  const user = getAuthUser(event);
  const db = useD1(event);

  const rows = await db
    .select()
    .from(subjects)
    .where(eq(subjects.userEmail, user.email))
    .orderBy(desc(subjects.createdAt))
    .all();

  return ok(rows);
});
