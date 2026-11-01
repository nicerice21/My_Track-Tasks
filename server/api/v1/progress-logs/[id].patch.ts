import { eq } from 'drizzle-orm';
import { progressLogs, projects } from '../../../db/schema';
import { getAuthUser } from '../../../utils/auth';
import { useD1 } from '../../../utils/db';
import { ok } from '../../../utils/response';
import { parseId, progressLogUpdateSchema } from '../../../utils/validation';

export default defineEventHandler(async (event) => {
  const user = getAuthUser(event);
  const db = useD1(event);
  const id = parseId(getRouterParam(event, 'id'));

  const log = await db
    .select()
    .from(progressLogs)
    .where(eq(progressLogs.id, id))
    .get();

  if (!log) {
    throw createError({ statusCode: 404, statusMessage: 'Progress log not found' });
  }

  // 所有者確認（ログが属するプロジェクトの所有者）
  const project = await db
    .select()
    .from(projects)
    .where(eq(projects.id, log.projectId))
    .get();

  if (!project || project.userEmail !== user.email) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' });
  }

  const body = await readBody(event);
  const parsed = progressLogUpdateSchema.safeParse(body);
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues.map((i) => i.message).join(', '),
    });
  }

  const [row] = await db
    .update(progressLogs)
    .set({
      ...(parsed.data.content !== undefined && { content: parsed.data.content }),
      ...(parsed.data.progressPercent !== undefined && {
        progressPercent: parsed.data.progressPercent,
      }),
    })
    .where(eq(progressLogs.id, id))
    .returning();

  return ok(row);
});
