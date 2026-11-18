import { describe, expect, it } from 'vitest';
import { createSeed } from '../data/seed';
import { reduce } from './actions';
import { caseInfo } from './deadlines';
import { eligibilityCutoff, eligibilityHint } from './eligibility';
import { managerConsistency, openFlagCount } from './flags';
import { person } from './selectors';

describe('eligibility hint', () => {
  const s = createSeed();
  it('uses the period end minus 3 months', () => {
    expect(eligibilityCutoff(s)).toBe('2026-09-30');
  });
  it('is shown only for people who joined after the cut-off', () => {
    const hinted = s.people.filter((p) => p.kind === 'employee' && eligibilityHint(s, p)).map((p) => p.id);
    expect(hinted).toEqual(['e08']);
    expect(eligibilityHint(s, { ...person(s, 'e01'), startDate: '2026-09-30' })).toBeUndefined();
    expect(eligibilityHint(s, { ...person(s, 'e01'), startDate: '2026-10-01' })).toBeDefined();
  });
});

describe('removing a person from the cycle', () => {
  it('needs a reason and is logged', () => {
    const s = createSeed();
    expect(reduce(s, { type: 'remove', personId: 'e08', reason: '', actorId: 'hr' })).toBe(s);
    const t = reduce(s, { type: 'remove', personId: 'e08', reason: 'Joined 3 Oct', actorId: 'hr' });
    expect(caseInfo(t, 'e08').status).toBe('removed');
    expect(t.log.at(-1)).toMatchObject({ type: 'removal', detail: 'Removed Fah Inthira from the cycle. Reason: Joined 3 Oct' });
  });

  it('drops the person out of the manager gap and the flags', () => {
    let s = createSeed();
    s = reduce(s, { type: 'remove', personId: 'e05', reason: 'Long leave', actorId: 'hr' });
    const support = managerConsistency(s).find((m) => m.reviewerId === 'm-support')!;
    expect(support.n).toBe(2);
    expect(support.status).toBe('insufficient');
    // Mai's individual flag and the Support gap flag are both gone.
    expect(openFlagCount(s)).toBe(2);
  });

  it('cannot remove someone twice', () => {
    const s = reduce(createSeed(), { type: 'remove', personId: 'e08', reason: 'x', actorId: 'hr' });
    expect(reduce(s, { type: 'remove', personId: 'e08', reason: 'y', actorId: 'hr' })).toBe(s);
  });
});
