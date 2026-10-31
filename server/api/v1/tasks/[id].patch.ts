import { eq } from 'drizzle-orm';
import { tasks } from '../../../db/schema';
import { getAuthUser } from '../../../utils/auth';
import { useD1 } from '../../../utils/db';
import { ok } from '../../../utils/response';
import { parseId, taskUpdateSchema } from '../../../utils/validation';

export default defineEventHandler(async (event) => {
  const user = getAuthUser(event);
  const db = useD1(event);
  const id = parseId(getRouterParam(event, 'id'));

  const body = await readBody(event);
  const parsed = taskUpdateSchema.safeParse(body);
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues.map((i) => i.message).join(', '),
    });
  }

  const existing = await db.select().from(tasks).where(eq(tasks.id, id)).get();

  if (!existing || existing.userEmail !== user.email) {
    throw createError({ statusCode: 404, statusMessage: 'Task not found' });
  }

  const d = parsed.data;
  const [row] = await db
    .update(tasks)
    .set({
      ...(d.title !== undefined && { title: d.title }),
      ...(d.description !== undefined && { description: d.description }),
      ...(d.type !== undefined && { type: d.type }),
      ...(d.subjectId !== undefined && { subjectId: d.subjectId }),
      ...(d.projectId !== undefined && { projectId: d.projectId }),
      ...(d.status !== undefined && { status: d.status }),
      ...(d.priority !== undefined && { priority: d.priority }),
      ...(d.dueDate !== undefined && { dueDate: d.dueDate }),
      ...(d.recurrenceRule !== undefined && {
        recurrenceRule: d.recurrenceRule,
      }),
      ...(d.estimatedMinutes !== undefined && {
        estimatedMinutes: d.estimatedMinutes,
      }),
      ...(d.actualMinutes !== undefined && { actualMinutes: d.actualMinutes }),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(tasks.id, id))
    .returning();

  return ok(row);
});
