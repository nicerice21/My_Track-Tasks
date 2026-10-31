import { describe, expect, it } from 'vitest';
import { ok } from '../server/utils/response';

describe('ok', () => {
  it('wraps data in a success envelope', () => {
    expect(ok({ id: 1, name: '制御工学' })).toEqual({
      success: true,
      data: { id: 1, name: '制御工学' },
    });
  });

  it('handles array data', () => {
    expect(ok([1, 2, 3])).toEqual({ success: true, data: [1, 2, 3] });
  });
});
