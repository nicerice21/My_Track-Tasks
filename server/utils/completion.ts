import { and, gte, inArray } from 'drizzle-orm';
import { taskCompletions } from '../db/schema';
import type { DB } from './db';
import { getStartOfWeek } from './date';

interface TaskLike {
  id: number;
  recurrenceRule: string | null;
  status: string;
}

/**
 * タスクのリストに、繰り返しタスクの「今週完了済みか」を表す
 * `completedThisWeek` を付与する。
 * 非繰り返しタスクは `status === 'completed'` をそのまま使う。
 */
export async function annotateCompletedThisWeek<T extends TaskLike>(
  db: DB,
  items: T[],
): Promise<(T & { completedThisWeek: boolean })[]> {
  const recurringIds = items
    .filter((t) => t.recurrenceRule !== null)
    .map((t) => t.id);

  const startOfWeek = getStartOfWeek();
  const completions =
    recurringIds.length > 0
      ? await db
          .select()
          .from(taskCompletions)
          .where(
            and(
              inArray(taskCompletions.taskId, recurringIds),
              gte(taskCompletions.completedDate, startOfWeek),
            ),
          )
          .all()
      : [];

  const completedThisWeek = new Set(completions.map((c) => c.taskId));

  return items.map((t) => ({
    ...t,
    completedThisWeek: t.recurrenceRule
      ? completedThisWeek.has(t.id)
      : t.status === 'completed',
  }));
}
