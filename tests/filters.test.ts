import { describe, expect, it } from 'vitest';
import { parseTaskFilters } from '../server/utils/filters';

describe('parseTaskFilters', () => {
  it('applies defaults when no query is given', () => {
    const f = parseTaskFilters({});
    expect(f.limit).toBe(50);
    expect(f.offset).toBe(0);
    expect(f.status).toBeUndefined();
    expect(f.type).toBeUndefined();
  });

  it('parses enum and id values', () => {
    const f = parseTaskFilters({
      status: 'in_progress',
      type: 'report',
      priority: 'high',
      subject_id: '3',
      project_id: '7',
    });
    expect(f.status).toBe('in_progress');
    expect(f.type).toBe('report');
    expect(f.priority).toBe('high');
    expect(f.subjectId).toBe(3);
    expect(f.projectId).toBe(7);
  });

  it('drops invalid enum values instead of throwing', () => {
    const f = parseTaskFilters({ status: 'bogus', type: 'nope' });
    expect(f.status).toBeUndefined();
    expect(f.type).toBeUndefined();
  });

  it('clamps limit to the allowed range', () => {
    expect(parseTaskFilters({ limit: '0' }).limit).toBe(1);
    expect(parseTaskFilters({ limit: '1000' }).limit).toBe(200);
    expect(parseTaskFilters({ limit: 'abc' }).limit).toBe(50);
  });

  it('parses due date filters as integers', () => {
    const f = parseTaskFilters({ due_before: '100', due_after: '50' });
    expect(f.dueBefore).toBe(100);
    expect(f.dueAfter).toBe(50);
  });

  it('ignores non-integer ids', () => {
    const f = parseTaskFilters({ subject_id: 'abc' });
    expect(f.subjectId).toBeUndefined();
  });
});
