import { z } from 'zod';

export const TASK_TYPES = ['homework', 'report', 'research_progress'] as const;
export const TASK_STATUSES = ['not_started', 'in_progress', 'completed', 'archived'] as const;
export const TASK_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;
export const PROJECT_STATUSES = ['active', 'paused', 'completed'] as const;

const hexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, 'color must be a 6-digit hex like #3B82F6');

const nullableString = z.string().optional().nullable();
const nullablePositiveInt = z.number().int().positive().optional().nullable();
const nullableNonNegativeInt = z.number().int().min(0).optional().nullable();

export const subjectCreateSchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().max(50).optional().nullable(),
  color: hexColor.optional().nullable(),
});

export const subjectUpdateSchema = subjectCreateSchema.partial();

export const projectCreateSchema = z.object({
  name: z.string().min(1).max(200),
  description: nullableString,
  status: z.enum(PROJECT_STATUSES).optional().default('active'),
  targetCompletionDate: z.number().int().optional().nullable(),
});

export const projectUpdateSchema = projectCreateSchema.partial();

export const taskCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: nullableString,
  type: z.enum(TASK_TYPES),
  subjectId: nullablePositiveInt,
  projectId: nullablePositiveInt,
  status: z.enum(TASK_STATUSES).optional().default('not_started'),
  priority: z.enum(TASK_PRIORITIES).optional().default('medium'),
  dueDate: z.number().int().optional().nullable(),
  recurrenceRule: z.string().max(200).optional().nullable(),
  estimatedMinutes: nullableNonNegativeInt,
  actualMinutes: nullableNonNegativeInt,
});

export const taskUpdateSchema = taskCreateSchema.partial();

/** 文字列を正の整数に変換する。不正なら null。 */
export function toPositiveInt(value: string | undefined): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/** ルートパラメータから正の整数 ID を厳密に取り出す。 */
export function parseId(value: string | undefined): number {
  const id = toPositiveInt(value);
  if (id === null) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid id' });
  }
  return id;
}
