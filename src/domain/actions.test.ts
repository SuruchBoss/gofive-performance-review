import { describe, expect, it } from 'vitest';
import { createSeed } from '../data/seed';
import { reduce, withLog } from './actions';

describe('reducer basics', () => {
  it('moves the demo clock one day', () => {
    const s = reduce(createSeed(), { type: 'advance_day' });
    expect(s.today).toBe('2026-12-13');
  });

  it('reset restores the seed', () => {
    let s = reduce(createSeed(), { type: 'advance_day' });
    s = withLog(s, { actorId: 'hr', type: 'reminder', detail: 'x' });
    expect(reduce(s, { type: 'reset' })).toEqual(createSeed());
  });

  it('gives log entries increasing ids and the demo date', () => {
    const s = withLog(createSeed(), { actorId: 'hr', type: 'reminder', detail: 'x' });
    const last = s.log[s.log.length - 1];
    expect(last.id).toBe('l5');
    expect(last.on).toBe('2026-12-12');
  });
});
