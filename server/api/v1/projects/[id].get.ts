import { desc, eq } from 'drizzle-orm';
import { progressLogs, projects, tasks } from '../../../db/schema';
import { getAuthUser } from '../../../utils/auth';
import { useD1 } from '../../../utils/db';
import { ok } from '../../../utils/response';
import { parseId } from '../../../utils/validation';

export default defineEventHandler(async (event) => {
  const user = getAuthUser(event);
  const db = useD1(event);
  const id = parseId(getRouterParam(event, 'id'));

  const project = await db
    .select()
    .from(projects)
    .where(eq(projects.id, id))
    .get();

  if (!project || project.userEmail !== user.email) {
    throw createError({ statusCode: 404, statusMessage: 'Project not found' });
  }

  const [logs, relatedTasks] = await Promise.all([
    db
      .select()
      .from(progressLogs)
      .where(eq(progressLogs.projectId, id))
      .orderBy(desc(progressLogs.loggedAt))
      .all(),
    db
      .select()
      .from(tasks)
      .where(eq(tasks.projectId, id))
      .orderBy(desc(tasks.dueDate))
      .all(),
  ]);

  return ok({ project, progressLogs: logs, tasks: relatedTasks });
});
