import { and, desc, eq, gte, lt, ne } from 'drizzle-orm';
import { projects, tasks } from '../../db/schema';
import { getAuthUser } from '../../utils/auth';
import { annotateCompletedThisWeek } from '../../utils/completion';
import { useD1 } from '../../utils/db';
import { ok } from '../../utils/response';

const DAY_MS = 86_400_000;

export default defineEventHandler(async (event) => {
  const user = getAuthUser(event);
  const db = useD1(event);

  const now = Date.now();
  const startOfToday = new Date().setHours(0, 0, 0, 0);
  const startOfTomorrow = startOfToday + DAY_MS;
  const endOfWeek = startOfToday + 7 * DAY_MS;

  // 完了・アーカイブを除く進行中タスクの共通条件
  const activeTaskConditions = [
    eq(tasks.userEmail, user.email),
    ne(tasks.status, 'completed'),
    ne(tasks.status, 'archived'),
  ];

  const [todayTasks, overdueTasks, upcomingReports, weeklyHomework, activeProjects] =
    await Promise.all([
      db
        .select()
        .from(tasks)
        .where(
          and(
            ...activeTaskConditions,
            gte(tasks.dueDate, startOfToday),
            lt(tasks.dueDate, startOfTomorrow),
          ),
        )
        .orderBy(desc(tasks.dueDate))
        .all(),

      db
        .select()
        .from(tasks)
        .where(and(...activeTaskConditions, lt(tasks.dueDate, startOfToday)))
        .orderBy(desc(tasks.dueDate))
        .all(),

      db
        .select()
        .from(tasks)
        .where(
          and(...activeTaskConditions, eq(tasks.type, 'report'), gte(tasks.dueDate, now)),
        )
        .orderBy(desc(tasks.dueDate))
        .all(),

      db
        .select()
        .from(tasks)
        .where(
          and(...activeTaskConditions, eq(tasks.type, 'homework'), gte(tasks.dueDate, startOfToday), lt(tasks.dueDate, endOfWeek)),
        )
        .orderBy(desc(tasks.dueDate))
        .all(),

      db
        .select()
        .from(projects)
        .where(and(eq(projects.userEmail, user.email), eq(projects.status, 'active')))
        .orderBy(desc(projects.createdAt))
        .all(),
    ]);

  // 繰り返しタスクの「今週完了済み」を付与する
  const [today, overdue, reports, homework] = await Promise.all([
    annotateCompletedThisWeek(db, todayTasks),
    annotateCompletedThisWeek(db, overdueTasks),
    annotateCompletedThisWeek(db, upcomingReports),
    annotateCompletedThisWeek(db, weeklyHomework),
  ]);

  return ok({
    todayTasks: today,
    overdueTasks: overdue,
    upcomingReports: reports,
    weeklyHomework: homework,
    activeProjects,
  });
});
