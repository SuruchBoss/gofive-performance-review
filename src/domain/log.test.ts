import { describe, expect, it } from 'vitest';
import { createSeed } from '../data/seed';
import { reduce, type Action } from './actions';
import { allFlags } from './flags';

describe('activity log', () => {
  const s0 = createSeed();
  const key = allFlags(s0)[0].key;
  const cases: [string, Action, string][] = [
    ['reminder', { type: 'remind', personId: 'e12', actorId: 'hr' }, 'reminder'],
    ['extension', { type: 'extend', personId: 'e12', until: '2026-12-18', reason: 'Leave', actorId: 'hr' }, 'extension'],
    ['removal', { type: 'remove', personId: 'e08', reason: 'New joiner', actorId: 'hr' }, 'removal'],
    ['flag review', { type: 'review_flag', flagKey: key, note: 'Checked', actorId: 'hr', label: 'x' }, 'flag_reviewed'],
  ];

  it.each(cases)('a %s writes exactly one entry', (_n, action, type) => {
    const s = reduce(s0, action);
    expect(s.log.length).toBe(s0.log.length + 1);
    expect(s.log.at(-1)!.type).toBe(type);
    expect(s.log.at(-1)!.on).toBe(s0.today);
  });

  it('an escalation writes one entry per case, on the escalation date', () => {
    let s = reduce(s0, { type: 'advance_day' });
    s = reduce(s, { type: 'advance_day' });
    const e = s.log.filter((l) => l.type === 'escalation');
    expect(e).toHaveLength(3);
    expect(new Set(e.map((l) => l.on))).toEqual(new Set(['2026-12-14']));
  });

  it('a refused action writes nothing', () => {
    expect(reduce(s0, { type: 'remove', personId: 'e08', reason: '', actorId: 'hr' }).log).toHaveLength(s0.log.length);
  });

  it('ids stay unique', () => {
    let s = s0;
    for (const [, a] of cases) s = reduce(s, a);
    s = reduce(reduce(s, { type: 'advance_day' }), { type: 'advance_day' });
    expect(new Set(s.log.map((l) => l.id)).size).toBe(s.log.length);
  });
});
