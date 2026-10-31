import { eq } from 'drizzle-orm';
import { progressLogs, projects, tasks } from '../../../db/schema';
import { getAuthUser } from '../../../utils/auth';
import { useD1 } from '../../../utils/db';
import { ok } from '../../../utils/response';
import { parseId } from '../../../utils/validation';

export default defineEventHandler(async (event) => {
  const user = getAuthUser(event);
  const db = useD1(event);
  const id = parseId(getRouterParam(event, 'id'));

  const existing = await db
    .select()
    .from(projects)
    .where(eq(projects.id, id))
    .get();

  if (!existing || existing.userEmail !== user.email) {
    throw createError({ statusCode: 404, statusMessage: 'Project not found' });
  }

  // 紐づくタスクと進捗ログを切り離してから削除する
  await db.update(tasks).set({ projectId: null }).where(eq(tasks.projectId, id));
  await db.delete(progressLogs).where(eq(progressLogs.projectId, id));
  await db.delete(projects).where(eq(projects.id, id));

  return ok({ id });
});
