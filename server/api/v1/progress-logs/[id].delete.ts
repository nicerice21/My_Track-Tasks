import { eq } from 'drizzle-orm';
import { progressLogs, projects } from '../../../db/schema';
import { getAuthUser } from '../../../utils/auth';
import { useD1 } from '../../../utils/db';
import { ok } from '../../../utils/response';
import { parseId } from '../../../utils/validation';

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

  const project = await db
    .select()
    .from(projects)
    .where(eq(projects.id, log.projectId))
    .get();

  if (!project || project.userEmail !== user.email) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' });
  }

  await db.delete(progressLogs).where(eq(progressLogs.id, id));

  return ok({ id });
});
