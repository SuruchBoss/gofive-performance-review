import { describe, expect, it } from 'vitest';
import { createSeed } from '../data/seed';
import { reduce } from './actions';
import { allFlags } from './flags';
import { canRelease, releaseBlockers } from './release';
import { selfReviewWindow } from './selfReview';
import type { DemoState, Rating } from './types';

const behaviour = (r: Rating) => ['quality', 'ownership', 'collaboration', 'customer'].map((competencyId) => ({ competencyId, rating: r }));

function finishOps(s: DemoState): DemoState {
  for (const id of ['e11', 'e12']) {
    s = reduce(s, { type: 'save_review', personId: id, patch: { behaviour: behaviour(3), overall: 3 } });
    s = reduce(s, { type: 'submit_review', personId: id, actorId: 'm-ops' });
  }
  return s;
}
function reviewAllFlags(s: DemoState): DemoState {
  for (const f of allFlags(s).filter((x) => !x.reviewed)) s = reduce(s, { type: 'review_flag', flagKey: f.key, note: 'Checked', actorId: 'hr', label: f.key });
  return s;
}

describe('release gate', () => {
  it('is blocked at the start by open reviews and unreviewed flags', () => {
    const b = releaseBlockers(createSeed());
    expect(b.filter((x) => x.kind === 'open_review')).toHaveLength(3);
    expect(b.filter((x) => x.kind === 'flag')).toHaveLength(4);
    const s = createSeed();
    expect(reduce(s, { type: 'release', actorId: 'hr' })).toBe(s);
  });

  it('stays blocked while the new joiner is neither reviewed nor removed', () => {
    const s = reviewAllFlags(finishOps(createSeed()));
    expect(releaseBlockers(s).map((b) => b.key)).toEqual(['open:e08']);
    expect(canRelease(s)).toBe(false);
  });

  it('stays blocked by a single unreviewed flag', () => {
    let s = reduce(finishOps(createSeed()), { type: 'remove', personId: 'e08', reason: 'New joiner', actorId: 'hr' });
    const flags = allFlags(s);
    for (const f of flags.slice(1)) s = reduce(s, { type: 'review_flag', flagKey: f.key, note: 'ok', actorId: 'hr', label: '' });
    expect(releaseBlockers(s)).toHaveLength(1);
    expect(canRelease(s)).toBe(false);
  });

  it('releases once everything is resolved, and locks the cycle', () => {
    let s = reduce(finishOps(createSeed()), { type: 'remove', personId: 'e08', reason: 'New joiner', actorId: 'hr' });
    s = reviewAllFlags(s);
    expect(canRelease(s)).toBe(true);
    s = reduce(s, { type: 'release', actorId: 'hr' });
    expect(s.cycle).toMatchObject({ status: 'released', releasedOn: '2026-12-12' });
    expect(s.log.at(-1)).toMatchObject({ type: 'release', detail: 'Released results to 11 employees.' });
    // After release nothing can be removed and self-reviews are closed.
    expect(reduce(s, { type: 'remove', personId: 'e01', reason: 'x', actorId: 'hr' })).toBe(s);
    expect(selfReviewWindow(s, 'e01')).toBe('submitted');
  });

  it('a new flag raised by a late review blocks release again', () => {
    let s = reduce(createSeed(), { type: 'remove', personId: 'e08', reason: 'New joiner', actorId: 'hr' });
    s = reviewAllFlags(s);
    // Tom rates Ying 5 against a suggestion of about 2.6: far from results.
    s = reduce(s, { type: 'save_review', personId: 'e11', patch: { behaviour: behaviour(3), overall: 3 } });
    s = reduce(s, { type: 'submit_review', personId: 'e11', actorId: 'm-ops' });
    s = reduce(s, { type: 'save_review', personId: 'e12', patch: { behaviour: behaviour(5), overall: 5, deviationReason: 'Covered two roles', overallEvidence: 'Ran the night shift alone for six weeks in March and April.' } });
    s = reduce(s, { type: 'submit_review', personId: 'e12', actorId: 'm-ops' });
    expect(releaseBlockers(s).map((b) => b.kind)).toContain('flag');
  });
});

describe('deadline change', () => {
  it('is logged and moves overdue and escalation dates', () => {
    let s = reduce(createSeed(), { type: 'change_deadline', field: 'managerDeadline', date: '2026-12-15', actorId: 'hr' });
    expect(s.cycle.managerDeadline).toBe('2026-12-15');
    expect(s.log.at(-1)?.type).toBe('deadline_change');
    s = reduce(reduce(s, { type: 'advance_day' }), { type: 'advance_day' });
    expect(s.log.filter((l) => l.type === 'escalation')).toHaveLength(0);
  });
  it('ignores dates before the cycle opened', () => {
    const s = createSeed();
    expect(reduce(s, { type: 'change_deadline', field: 'managerDeadline', date: '2026-10-01', actorId: 'hr' })).toBe(s);
  });
});
