import { eq } from 'drizzle-orm';
import { subjects } from '../../../db/schema';
import { getAuthUser } from '../../../utils/auth';
import { useD1 } from '../../../utils/db';
import { ok } from '../../../utils/response';
import { parseId, subjectUpdateSchema } from '../../../utils/validation';

export default defineEventHandler(async (event) => {
  const user = getAuthUser(event);
  const db = useD1(event);
  const id = parseId(getRouterParam(event, 'id'));

  const body = await readBody(event);
  const parsed = subjectUpdateSchema.safeParse(body);
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues.map((i) => i.message).join(', '),
    });
  }

  const existing = await db
    .select()
    .from(subjects)
    .where(eq(subjects.id, id))
    .get();

  if (!existing || existing.userEmail !== user.email) {
    throw createError({ statusCode: 404, statusMessage: 'Subject not found' });
  }

  const [row] = await db
    .update(subjects)
    .set({
      ...(parsed.data.name !== undefined && { name: parsed.data.name }),
      ...(parsed.data.code !== undefined && { code: parsed.data.code }),
      ...(parsed.data.color !== undefined && { color: parsed.data.color }),
    })
    .where(eq(subjects.id, id))
    .returning();

  return ok(row);
});
