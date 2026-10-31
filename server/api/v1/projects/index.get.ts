import { desc, eq } from 'drizzle-orm';
import { projects } from '../../../db/schema';
import { getAuthUser } from '../../../utils/auth';
import { useD1 } from '../../../utils/db';
import { ok } from '../../../utils/response';

export default defineEventHandler(async (event) => {
  const user = getAuthUser(event);
  const db = useD1(event);

  const rows = await db
    .select()
    .from(projects)
    .where(eq(projects.userEmail, user.email))
    .orderBy(desc(projects.createdAt))
    .all();

  return ok(rows);
});
