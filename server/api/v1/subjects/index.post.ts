import { subjects } from '../../../db/schema';
import { ensureUser, getAuthUser } from '../../../utils/auth';
import { useD1 } from '../../../utils/db';
import { ok } from '../../../utils/response';
import { subjectCreateSchema } from '../../../utils/validation';

export default defineEventHandler(async (event) => {
  const user = getAuthUser(event);
  const db = useD1(event);

  const body = await readBody(event);
  const parsed = subjectCreateSchema.safeParse(body);
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues.map((i) => i.message).join(', '),
    });
  }

  await ensureUser(db, user.email);

  const [row] = await db
    .insert(subjects)
    .values({
      name: parsed.data.name,
      code: parsed.data.code ?? null,
      color: parsed.data.color ?? null,
      userEmail: user.email,
      createdAt: new Date().toISOString(),
    })
    .returning();

  return ok(row);
});
