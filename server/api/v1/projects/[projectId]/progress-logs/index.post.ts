import { eq } from 'drizzle-orm';
import { progressLogs, projects } from '../../../../../db/schema';
import { getAuthUser } from '../../../../../utils/auth';
import { useD1 } from '../../../../../utils/db';
import { ok } from '../../../../../utils/response';
import { parseId, progressLogCreateSchema } from '../../../../../utils/validation';

export default defineEventHandler(async (event) => {
  const user = getAuthUser(event);
  const db = useD1(event);
  const projectId = parseId(getRouterParam(event, 'projectId'));

  const project = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .get();

  if (!project || project.userEmail !== user.email) {
    throw createError({ statusCode: 404, statusMessage: 'Project not found' });
  }

  const body = await readBody(event);
  const parsed = progressLogCreateSchema.safeParse(body);
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues.map((i) => i.message).join(', '),
    });
  }

  const [row] = await db
    .insert(progressLogs)
    .values({
      projectId,
      content: parsed.data.content,
      progressPercent: parsed.data.progressPercent ?? 0,
      loggedAt: new Date().toISOString(),
    })
    .returning();

  return ok(row);
});
