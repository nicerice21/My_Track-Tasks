import { tasks } from '../../../db/schema';
import { ensureUser, getAuthUser } from '../../../utils/auth';
import { useD1 } from '../../../utils/db';
import { ok } from '../../../utils/response';
import { taskCreateSchema } from '../../../utils/validation';

export default defineEventHandler(async (event) => {
  const user = getAuthUser(event);
  const db = useD1(event);

  const body = await readBody(event);
  const parsed = taskCreateSchema.safeParse(body);
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues.map((i) => i.message).join(', '),
    });
  }

  await ensureUser(db, user.email);

  const now = new Date().toISOString();
  const [row] = await db
    .insert(tasks)
    .values({
      userEmail: user.email,
      subjectId: parsed.data.subjectId ?? null,
      projectId: parsed.data.projectId ?? null,
      type: parsed.data.type,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      status: parsed.data.status ?? 'not_started',
      priority: parsed.data.priority ?? 'medium',
      dueDate: parsed.data.dueDate ?? null,
      recurrenceRule: parsed.data.recurrenceRule ?? null,
      estimatedMinutes: parsed.data.estimatedMinutes ?? null,
      actualMinutes: parsed.data.actualMinutes ?? 0,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return ok(row);
});
