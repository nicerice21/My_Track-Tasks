import { describe, expect, it } from 'vitest';
import {
  progressLogCreateSchema,
  projectCreateSchema,
  subjectCreateSchema,
  taskCreateSchema,
  taskUpdateSchema,
  toPositiveInt,
} from '../server/utils/validation';

describe('subjectCreateSchema', () => {
  it('accepts a valid subject', () => {
    const result = subjectCreateSchema.safeParse({
      name: '制御工学',
      code: 'MEC-301',
      color: '#3B82F6',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an empty name', () => {
    expect(subjectCreateSchema.safeParse({ name: '' }).success).toBe(false);
  });

  it('rejects an invalid color format', () => {
    expect(
      subjectCreateSchema.safeParse({ name: '制御工学', color: 'red' }).success,
    ).toBe(false);
  });
});

describe('projectCreateSchema', () => {
  it('accepts a valid project', () => {
    const result = projectCreateSchema.safeParse({
      name: '歩行ロボットの制御系設計',
      status: 'active',
      targetCompletionDate: 1751328000,
    });
    expect(result.success).toBe(true);
    expect(result.data?.status).toBe('active');
  });

  it('defaults status to active', () => {
    const result = projectCreateSchema.safeParse({ name: '研究プロジェクト' });
    expect(result.data?.status).toBe('active');
  });

  it('rejects an invalid status', () => {
    expect(
      projectCreateSchema.safeParse({ name: 'x', status: 'done' }).success,
    ).toBe(false);
  });
});

describe('taskCreateSchema', () => {
  const valid = {
    title: '中間レポート',
    type: 'report',
    priority: 'high',
    dueDate: 1746057600,
  };

  it('accepts a valid task', () => {
    const result = taskCreateSchema.safeParse(valid);
    expect(result.success).toBe(true);
    expect(result.data?.status).toBe('not_started');
    expect(result.data?.priority).toBe('high');
  });

  it('requires a type', () => {
    const { type: _type, ...rest } = valid;
    expect(taskCreateSchema.safeParse(rest).success).toBe(false);
  });

  it('rejects an invalid type', () => {
    expect(
      taskCreateSchema.safeParse({ ...valid, type: 'exam' }).success,
    ).toBe(false);
  });

  it('rejects a negative estimatedMinutes', () => {
    expect(
      taskCreateSchema.safeParse({ ...valid, estimatedMinutes: -1 }).success,
    ).toBe(false);
  });
});

describe('taskUpdateSchema', () => {
  it('allows partial updates', () => {
    const result = taskUpdateSchema.safeParse({ title: '更新後タイトル' });
    expect(result.success).toBe(true);
    expect(result.data?.title).toBe('更新後タイトル');
  });

  it('accepts an empty object', () => {
    expect(taskUpdateSchema.safeParse({}).success).toBe(true);
  });
});

describe('toPositiveInt', () => {
  it('parses a positive integer string', () => {
    expect(toPositiveInt('42')).toBe(42);
  });

  it('returns null for non-numeric input', () => {
    expect(toPositiveInt('abc')).toBeNull();
  });

  it('returns null for zero or negative values', () => {
    expect(toPositiveInt('0')).toBeNull();
    expect(toPositiveInt('-5')).toBeNull();
  });

  it('returns null for floats', () => {
    expect(toPositiveInt('3.14')).toBeNull();
  });
});

describe('progressLogCreateSchema', () => {
  it('accepts content with optional progress percent', () => {
    const result = progressLogCreateSchema.safeParse({
      content: '理論モデル作成完了',
      progressPercent: 30,
    });
    expect(result.success).toBe(true);
    expect(result.data?.progressPercent).toBe(30);
  });

  it('allows omitting progress percent', () => {
    expect(
      progressLogCreateSchema.safeParse({ content: 'メモ' }).success,
    ).toBe(true);
  });

  it('rejects empty content', () => {
    expect(progressLogCreateSchema.safeParse({ content: '' }).success).toBe(false);
  });

  it('rejects progress percent over 100', () => {
    expect(
      progressLogCreateSchema.safeParse({ content: 'x', progressPercent: 101 })
        .success,
    ).toBe(false);
  });
});
