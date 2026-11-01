import type { Task } from '~/types/models';

/** タスクが「完了済み」かどうかを判定する（繰り返しタスクは今週の完了状態を参照）。 */
export function isTaskDone(task: Task): boolean {
  return task.completedThisWeek ?? task.status === 'completed';
}
