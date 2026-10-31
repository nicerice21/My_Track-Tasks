import { and, count, desc, eq, gte, lte } from 'drizzle-orm';
import { tasks } from '../../../db/schema';
import { getAuthUser } from '../../../utils/auth';
import { useD1 } from '../../../utils/db';
import { parseTaskFilters } from '../../../utils/filters';
import { ok } from '../../../utils/response';

export default defineEventHandler(async (event) => {
  const user = getAuthUser(event);
  const db = useD1(event);
  const filters = parseTaskFilters(getQuery(event));

  const conditions = [eq(tasks.userEmail, user.email)];
  if (filters.status) {
    conditions.push(eq(tasks.status, filters.status));
  }
  if (filters.type) {
    conditions.push(eq(tasks.type, filters.type));
  }
  if (filters.subjectId !== undefined) {
    conditions.push(eq(tasks.subjectId, filters.subjectId));
  }
  if (filters.projectId !== undefined) {
    conditions.push(eq(tasks.projectId, filters.projectId));
  }
  if (filters.priority) {
    conditions.push(eq(tasks.priority, filters.priority));
  }
  if (filters.dueBefore !== undefined) {
    conditions.push(lte(tasks.dueDate, filters.dueBefore));
  }
  if (filters.dueAfter !== undefined) {
    conditions.push(gte(tasks.dueDate, filters.dueAfter));
  }

  const where = and(...conditions);

  const [rows, totalRows] = await Promise.all([
    db
      .select()
      .from(tasks)
      .where(where)
      .orderBy(desc(tasks.dueDate))
      .limit(filters.limit)
      .offset(filters.offset)
      .all(),
    db.select({ value: count() }).from(tasks).where(where).all(),
  ]);

  return ok({
    items: rows,
    total: totalRows[0]?.value ?? 0,
    limit: filters.limit,
    offset: filters.offset,
  });
});
