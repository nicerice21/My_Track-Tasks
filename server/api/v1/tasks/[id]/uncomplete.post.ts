import { eq } from 'drizzle-orm';
import { tasks } from '../../../../db/schema';
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

  await db
    .update(tasks)
    .set({ status: 'not_started', updatedAt: new Date().toISOString() })
    .where(eq(tasks.id, id));

  return ok({ id, status: 'not_started' });
});
