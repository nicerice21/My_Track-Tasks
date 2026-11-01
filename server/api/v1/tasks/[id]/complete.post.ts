import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { taskCompletions, tasks } from '../../../../db/schema';
import { getAuthUser } from '../../../../utils/auth';
import { useD1 } from '../../../../utils/db';
import { ok } from '../../../../utils/response';
import { parseId } from '../../../../utils/validation';

const completeBodySchema = z
  .object({
    completedDate: z.number().int().optional(),
  })
  .optional();

export default defineEventHandler(async (event) => {
  const user = getAuthUser(event);
  const db = useD1(event);
  const id = parseId(getRouterParam(event, 'id'));

  const task = await db.select().from(tasks).where(eq(tasks.id, id)).get();

  if (!task || task.userEmail !== user.email) {
    throw createError({ statusCode: 404, statusMessage: 'Task not found' });
  }

  const body = await readBody(event);
  const parsed = completeBodySchema.safeParse(body);
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid body' });
  }

  const now = new Date().toISOString();
  const completedDate = parsed.data?.completedDate ?? Date.now();

  if (task.recurrenceRule) {
    // 繰り返しタスク: 完了履歴を残し、マスターは次の週に備えて未着手に戻す
    await db.insert(taskCompletions).values({
      taskId: id,
      completedDate,
      createdAt: now,
    });
    await db
      .update(tasks)
      .set({ status: 'not_started', updatedAt: now })
      .where(eq(tasks.id, id));
    return ok({ id, status: 'not_started', completedDate, recurring: true });
  }

  await db
    .update(tasks)
    .set({ status: 'completed', updatedAt: now })
    .where(eq(tasks.id, id));

  return ok({ id, status: 'completed', completedDate, recurring: false });
});
