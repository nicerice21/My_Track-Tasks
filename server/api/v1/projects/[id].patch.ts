import { eq } from 'drizzle-orm';
import { projects } from '../../../db/schema';
import { getAuthUser } from '../../../utils/auth';
import { useD1 } from '../../../utils/db';
import { ok } from '../../../utils/response';
import { parseId, projectUpdateSchema } from '../../../utils/validation';

export default defineEventHandler(async (event) => {
  const user = getAuthUser(event);
  const db = useD1(event);
  const id = parseId(getRouterParam(event, 'id'));

  const body = await readBody(event);
  const parsed = projectUpdateSchema.safeParse(body);
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues.map((i) => i.message).join(', '),
    });
  }

  const existing = await db
    .select()
    .from(projects)
    .where(eq(projects.id, id))
    .get();

  if (!existing || existing.userEmail !== user.email) {
    throw createError({ statusCode: 404, statusMessage: 'Project not found' });
  }

  const [row] = await db
    .update(projects)
    .set({
      ...(parsed.data.name !== undefined && { name: parsed.data.name }),
      ...(parsed.data.description !== undefined && {
        description: parsed.data.description,
      }),
      ...(parsed.data.status !== undefined && { status: parsed.data.status }),
      ...(parsed.data.targetCompletionDate !== undefined && {
        targetCompletionDate: parsed.data.targetCompletionDate,
      }),
    })
    .where(eq(projects.id, id))
    .returning();

  return ok(row);
});
