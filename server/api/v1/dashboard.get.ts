export default defineEventHandler(async (event) => {
  const user = event.context.user as { email: string } | undefined;

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  // TODO: D1 から実際のデータを取得する
  return {
    success: true,
    data: {
      todayTasks: [],
      overdueTasks: [],
      upcomingReports: [],
      activeProjects: [],
      weeklyHomework: [],
    },
  };
});
