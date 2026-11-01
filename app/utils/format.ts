import type {
  ProjectStatus,
  TaskPriority,
  TaskStatus,
  TaskType,
} from '~/types/models';

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  homework: '宿題',
  report: 'レポート',
  research_progress: '研究',
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  not_started: '未着手',
  in_progress: '進行中',
  completed: '完了',
  archived: 'アーカイブ',
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '緊急',
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  active: '進行中',
  paused: '停止中',
  completed: '完了',
};

export const PRIORITY_BADGE_CLASS: Record<TaskPriority, string> = {
  low: 'badge-success',
  medium: 'badge-warning',
  high: 'badge-error',
  urgent: 'badge-error badge-outline',
};

const DAY_MS = 86_400_000;

/** UNIX ミリ秒を `M/D` 形式に整形する。 */
export function formatDate(ms: number | null): string {
  if (ms === null) return '期限なし';
  const d = new Date(ms);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

/** 締切を「今日」「明日」「M/D」または「期限切れ」で表示する。 */
export function formatDueDate(ms: number | null): string {
  if (ms === null) return '期限なし';
  const startOfToday = new Date().setHours(0, 0, 0, 0);
  const startOfTomorrow = startOfToday + DAY_MS;

  if (ms < startOfToday) return `期限切れ`;
  if (ms < startOfTomorrow) return '今日';
  if (ms < startOfTomorrow + DAY_MS) return '明日';
  return formatDate(ms);
}

/** 残り分数を「1時間30分」形式に整形する。 */
export function formatMinutes(minutes: number | null): string {
  if (minutes === null || minutes <= 0) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}分`;
  if (m === 0) return `${h}時間`;
  return `${h}時間${m}分`;
}

/** UNIX ミリ秒を `<input type="date">` 用の `YYYY-MM-DD` に変換する。 */
export function msToDateInput(ms: number | null): string {
  if (ms === null) return '';
  const d = new Date(ms);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** `YYYY-MM-DD` をローカル日時の UNIX ミリ秒に変換する。 */
export function dateInputToMs(dateStr: string): number | null {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d).getTime();
}
