import { describe, expect, it } from 'vitest';
import { createSeed } from '../data/seed';
import { reduce } from './actions';
import { allFlags, computeGap, farFlags, managerConsistency, openFlagCount } from './flags';
import type { DemoState } from './types';

const byReviewer = (s: DemoState) => Object.fromEntries(managerConsistency(s).map((m) => [m.reviewerId, m]));

describe('manager gap rule', () => {
  const pairs = (gap: number, n = 3) => Array.from({ length: n }, () => ({ overall: 3 + gap, suggested: 3 }));

  it('flags a gap of exactly 0.75, above or below', () => {
    expect(computeGap(pairs(0.75)).status).toBe('above');
    expect(computeGap(pairs(-0.75)).status).toBe('below');
  });
  it('does not flag just under 0.75', () => {
    expect(computeGap(pairs(0.74)).status).toBe('in_line');
    expect(computeGap(pairs(-0.74)).status).toBe('in_line');
  });
  it('needs at least 3 submitted reviews', () => {
    expect(computeGap(pairs(2, 2)).status).toBe('insufficient');
    expect(computeGap(pairs(2, 3)).status).toBe('above');
  });
  it('compares against the team’s own results, not other teams', () => {
    // A team rated 4s that also achieved 4-level results is in line.
    expect(computeGap([{ overall: 4, suggested: 4 }, { overall: 4, suggested: 3.9 }, { overall: 4, suggested: 4.2 }]).status).toBe('in_line');
  });
});

describe('flags on the demo data', () => {
  const s = createSeed();

  it('flags Sales as above and Support as below; Operations has too few reviews', () => {
    const m = byReviewer(s);
    expect(m['m-sales'].status).toBe('above');
    expect(m['m-sales'].gap).toBeCloseTo(0.9, 1);
    expect(m['m-support'].status).toBe('below');
    expect(m['m-support'].gap).toBeCloseTo(-0.89, 1);
    expect(m['m-ops'].status).toBe('insufficient');
  });

  it('shows Operations as in line once Tom submits a third review in line with results', () => {
    const behaviour = ['quality', 'ownership', 'collaboration', 'customer'].map((competencyId) => ({ competencyId, rating: 3 as const }));
    let t = reduce(s, { type: 'save_review', personId: 'e11', patch: { behaviour, overall: 3 } });
    t = reduce(t, { type: 'submit_review', personId: 'e11', actorId: 'm-ops' });
    expect(byReviewer(t)['m-ops'].status).toBe('in_line');
    expect(Math.abs(byReviewer(t)['m-ops'].gap)).toBeLessThan(0.2);
  });

  it('raises far-from-results flags for Nida (above) and Mai (below)', () => {
    expect(farFlags(s).map((f) => [f.personId, f.direction])).toEqual([
      ['e01', 'above'],
      ['e05', 'below'],
    ]);
  });

  it('starts with 4 open flags', () => {
    expect(openFlagCount(s)).toBe(4);
  });
});

describe('reviewing a flag', () => {
  it('needs a note, logs it, and closes the flag', () => {
    const s = createSeed();
    const key = allFlags(s)[0].key;
    expect(reduce(s, { type: 'review_flag', flagKey: key, note: '  ', actorId: 'hr', label: 'x' })).toBe(s);
    const t = reduce(s, { type: 'review_flag', flagKey: key, note: 'Discussed with Daniel', actorId: 'hr', label: 'Sales' });
    expect(openFlagCount(t)).toBe(3);
    expect(t.log.at(-1)?.type).toBe('flag_reviewed');
  });

  it('reopens a manager flag when that manager’s set of reviews changes', () => {
    let s = createSeed();
    const support = byReviewer(s)['m-support'];
    s = reduce(s, { type: 'review_flag', flagKey: support.key, note: 'Checked', actorId: 'hr', label: 'Support' });
    expect(byReviewer(s)['m-support'].review).toBeDefined();
    // Removing a person changes the reviews the gap is based on.
    s = { ...s, participants: s.participants.map((p) => (p.personId === 'e07' ? { ...p, removed: { on: s.today, reason: 'x', by: 'hr' } } : p)) };
    expect(byReviewer(s)['m-support'].review).toBeUndefined();
  });
});
