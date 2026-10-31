import { eq } from 'drizzle-orm';
import { projects, subjects, tasks } from '../../../db/schema';
import { getAuthUser } from '../../../utils/auth';
import { useD1 } from '../../../utils/db';
import { ok } from '../../../utils/response';
import { parseId } from '../../../utils/validation';

export default defineEventHandler(async (event) => {
  const user = getAuthUser(event);
  const db = useD1(event);
  const id = parseId(getRouterParam(event, 'id'));

  const task = await db.select().from(tasks).where(eq(tasks.id, id)).get();

  if (!task || task.userEmail !== user.email) {
    throw createError({ statusCode: 404, statusMessage: 'Task not found' });
  }

  const [subject, project] = await Promise.all([
    task.subjectId
      ? db
          .select()
          .from(subjects)
          .where(eq(subjects.id, task.subjectId))
          .get()
      : Promise.resolve(null),
    task.projectId
      ? db
          .select()
          .from(projects)
          .where(eq(projects.id, task.projectId))
          .get()
      : Promise.resolve(null),
  ]);

  return ok({ task, subject, project });
});
