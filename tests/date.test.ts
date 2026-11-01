import { describe, expect, it } from 'vitest';
import { getStartOfWeek } from '../server/utils/date';

// 2026-11-01 は日曜。2026-11-02 は月曜。
const monday = new Date(2026, 10, 2).getTime();
const wednesday = new Date(2026, 10, 4).getTime();
const sunday = new Date(2026, 10, 8).getTime();

describe('getStartOfWeek', () => {
  it('月曜日はそのまま同じ日を返す', () => {
    expect(getStartOfWeek(monday)).toBe(monday);
  });

  it('週の途中はその週の月曜日を返す', () => {
    expect(getStartOfWeek(wednesday)).toBe(monday);
  });

  it('日曜日は 6 日前の月曜日を返す', () => {
    expect(getStartOfWeek(sunday)).toBe(monday);
  });
});
