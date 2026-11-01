import { desc, eq } from 'drizzle-orm';
import { taskCompletions, tasks } from '../../../../db/schema';
import { getAuthUser } from '../../../../utils/auth';
import { useD1 } from '../../../../utils/db';
import { ok } from '../../../../utils/response';
import { parseId } from '../../../../utils/validation';

export default defineEventHandler(async (event) => {
  const user = getAuthUser(event);
  const db = useD1(event);
  const id = parseId(getRouterParam(event, 'id'));

  const task = await db.select().from(tasks).where(eq(tasks.id, id)).get();

  if (!task || task.userEmail !== user.email) {
    throw createError({ statusCode: 404, statusMessage: 'Task not found' });
  }

  if (task.recurrenceRule) {
    // 直近の完了履歴を削除する
    const latest = await db
      .select()
      .from(taskCompletions)
      .where(eq(taskCompletions.taskId, id))
      .orderBy(desc(taskCompletions.completedDate))
      .limit(1)
      .all();
    if (latest[0]) {
      await db.delete(taskCompletions).where(eq(taskCompletions.id, latest[0].id));
    }
  }

  await db
    .update(tasks)
    .set({ status: 'not_started', updatedAt: new Date().toISOString() })
    .where(eq(tasks.id, id));

  return ok({ id, status: 'not_started' });
});
