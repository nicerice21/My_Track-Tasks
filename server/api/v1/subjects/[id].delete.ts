import { eq } from 'drizzle-orm';
import { subjects, tasks } from '../../../db/schema';
import { getAuthUser } from '../../../utils/auth';
import { useD1 } from '../../../utils/db';
import { ok } from '../../../utils/response';
import { parseId } from '../../../utils/validation';

export default defineEventHandler(async (event) => {
  const user = getAuthUser(event);
  const db = useD1(event);
  const id = parseId(getRouterParam(event, 'id'));

  const existing = await db
    .select()
    .from(subjects)
    .where(eq(subjects.id, id))
    .get();

  if (!existing || existing.userEmail !== user.email) {
    throw createError({ statusCode: 404, statusMessage: 'Subject not found' });
  }

  // 紐づくタスクの subject_id を切り離してから削除する
  await db
    .update(tasks)
    .set({ subjectId: null })
    .where(eq(tasks.subjectId, id));

  await db.delete(subjects).where(eq(subjects.id, id));

  return ok({ id });
});
