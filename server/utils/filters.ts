import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  TASK_TYPES,
} from './validation';

export type TaskStatus = (typeof TASK_STATUSES)[number];
export type TaskType = (typeof TASK_TYPES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export interface TaskFilters {
  status?: TaskStatus;
  type?: TaskType;
  subjectId?: number;
  projectId?: number;
  priority?: TaskPriority;
  dueBefore?: number;
  dueAfter?: number;
  limit: number;
  offset: number;
}

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

function toInt(v: unknown): number | undefined {
  const n = Number(v);
  return Number.isInteger(n) ? n : undefined;
}

function oneOf<T extends string>(
  v: unknown,
  allowed: readonly T[],
): T | undefined {
  return typeof v === 'string' && (allowed as readonly string[]).includes(v)
    ? (v as T)
    : undefined;
}

/**
 * タスク一覧 GET のクエリパラメータを解釈する。
 * 不正な値は無視して undefined にする（エラーにはしない）。
 */
export function parseTaskFilters(query: Record<string, unknown>): TaskFilters {
  const limitRaw = toInt(query.limit);
  const offsetRaw = toInt(query.offset);

  return {
    status: oneOf(query.status, TASK_STATUSES),
    type: oneOf(query.type, TASK_TYPES),
    subjectId: toInt(query.subject_id),
    projectId: toInt(query.project_id),
    priority: oneOf(query.priority, TASK_PRIORITIES),
    dueBefore: toInt(query.due_before),
    dueAfter: toInt(query.due_after),
    limit:
      limitRaw === undefined
        ? DEFAULT_LIMIT
        : Math.min(Math.max(limitRaw, 1), MAX_LIMIT),
    offset: offsetRaw === undefined || offsetRaw < 0 ? 0 : offsetRaw,
  };
}
