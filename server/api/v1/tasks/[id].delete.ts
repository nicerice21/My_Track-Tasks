import { eq } from 'drizzle-orm';
import { taskCompletions, taskTags, tasks } from '../../../db/schema';
import { getAuthUser } from '../../../utils/auth';
import { useD1 } from '../../../utils/db';
import { ok } from '../../../utils/response';
import { parseId } from '../../../utils/validation';

export default defineEventHandler(async (event) => {
  const user = getAuthUser(event);
  const db = useD1(event);
  const id = parseId(getRouterParam(event, 'id'));

  const existing = await db.select().from(tasks).where(eq(tasks.id, id)).get();

  if (!existing || existing.userEmail !== user.email) {
    throw createError({ statusCode: 404, statusMessage: 'Task not found' });
  }

  // 関連レコードを先に削除する
  await db.delete(taskCompletions).where(eq(taskCompletions.taskId, id));
  await db.delete(taskTags).where(eq(taskTags.taskId, id));
  await db.delete(tasks).where(eq(tasks.id, id));

  return ok({ id });
});
