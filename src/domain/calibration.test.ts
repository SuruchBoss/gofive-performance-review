import { describe, expect, it } from 'vitest';
import { createSeed } from '../data/seed';
import { reduce } from './actions';
import { canLockCalibration, canStartCalibration, finalRating, teamCalibration, unresolvedItems } from './calibration';
import { finishAllReviews } from './testing';
import type { DemoState } from './types';

const start = (s: DemoState) => reduce(s, { type: 'start_calibration', attendees: ['m-sales', 'm-support', 'm-ops', 'head'], actorId: 'hr' });
const review = (s: DemoState, id: string) => s.managerReviews.find((r) => r.personId === id)!;

describe('starting calibration', () => {
  it('needs every review submitted', () => {
    const s = createSeed();
    expect(canStartCalibration(s)).toBe(false);
    expect(start(s)).toBe(s);
    expect(canStartCalibration(finishAllReviews(s))).toBe(true);
  });

  it('needs at least two people in the room', () => {
    const s = finishAllReviews(createSeed());
    expect(reduce(s, { type: 'start_calibration', attendees: ['m-ops'], actorId: 'hr' })).toBe(s);
  });

  it('turns every flag into an agenda item and logs the start', () => {
    const s = start(finishAllReviews(createSeed()));
    expect(s.calibration.status).toBe('in_session');
    expect(s.calibration.agenda.map((a) => a.kind)).toEqual(['gap', 'gap', 'far', 'far']);
    expect(s.log.at(-1)).toMatchObject({ type: 'calibration_started' });
    expect(s.log.at(-1)!.detail).toContain('4 cases on the agenda');
  });

  it('blocks removing people once calibration has started', () => {
    const s = start(finishAllReviews(createSeed()));
    expect(reduce(s, { type: 'remove', personId: 'e01', reason: 'x', actorId: 'hr' })).toBe(s);
  });
});

describe('changing a rating in calibration', () => {
  const s0 = start(finishAllReviews(createSeed()));

  it('needs a reason and records before, after and the log', () => {
    expect(reduce(s0, { type: 'calibrate_rating', personId: 'e01', to: 4, reason: ' ', actorId: 'hr' })).toBe(s0);
    const s = reduce(s0, { type: 'calibrate_rating', personId: 'e01', to: 4, reason: 'Aligned with peers at 118%', actorId: 'hr' });
    expect(finalRating(review(s, 'e01'))).toBe(4);
    expect(review(s, 'e01').overall).toBe(5); // the manager's own rating is kept
    expect(s.calibration.changes).toEqual([{ personId: 'e01', from: 5, to: 4, reason: 'Aligned with peers at 118%', on: '2026-12-12', by: 'hr' }]);
    expect(s.log.at(-1)).toMatchObject({ type: 'calibration_change', detail: 'Calibrated Nida Phrom from 5 to 4. Reason: Aligned with peers at 118%' });
  });

  it('changing back to the manager’s rating clears the calibrated value but keeps the history', () => {
    let s = reduce(s0, { type: 'calibrate_rating', personId: 'e01', to: 4, reason: 'a', actorId: 'hr' });
    s = reduce(s, { type: 'calibrate_rating', personId: 'e01', to: 5, reason: 'b', actorId: 'hr' });
    expect(review(s, 'e01').calibratedOverall).toBeUndefined();
    expect(s.calibration.changes).toHaveLength(2);
  });

  it('ignores a “change” to the same rating', () => {
    expect(reduce(s0, { type: 'calibrate_rating', personId: 'e01', to: 5, reason: 'x', actorId: 'hr' })).toBe(s0);
  });

  it('moves the team average after calibration, not the comparison with results', () => {
    let s = reduce(s0, { type: 'calibrate_rating', personId: 'e01', to: 4, reason: 'a', actorId: 'hr' });
    s = reduce(s, { type: 'calibrate_rating', personId: 'e02', to: 3, reason: 'b', actorId: 'hr' });
    const sales = teamCalibration(s).find((t) => t.reviewerId === 'm-sales')!;
    expect(sales.before).toBeCloseTo(4.0);
    expect(sales.after).toBeCloseTo(3.5);
    expect(sales.suggested).toBeCloseTo(3.1, 1);
  });
});

describe('locking calibration', () => {
  it('needs every agenda item resolved with a note', () => {
    let s = start(finishAllReviews(createSeed()));
    expect(canLockCalibration(s)).toBe(false);
    const [first, ...rest] = s.calibration.agenda;
    expect(reduce(s, { type: 'resolve_item', key: first.key, note: '', actorId: 'hr' })).toBe(s);
    s = reduce(s, { type: 'resolve_item', key: first.key, note: 'Kept: Q1 renewals', actorId: 'hr' });
    expect(unresolvedItems(s)).toHaveLength(rest.length);
    for (const a of rest) s = reduce(s, { type: 'resolve_item', key: a.key, note: 'Agreed', actorId: 'hr' });
    expect(canLockCalibration(s)).toBe(true);
    s = reduce(s, { type: 'lock_calibration', actorId: 'hr' });
    expect(s.calibration).toMatchObject({ status: 'locked', lockedOn: '2026-12-12' });
    expect(s.log.at(-1)?.type).toBe('calibration_locked');
  });

  it('allows no more changes once locked', () => {
    let s = start(finishAllReviews(createSeed()));
    for (const a of s.calibration.agenda) s = reduce(s, { type: 'resolve_item', key: a.key, note: 'ok', actorId: 'hr' });
    s = reduce(s, { type: 'lock_calibration', actorId: 'hr' });
    expect(reduce(s, { type: 'calibrate_rating', personId: 'e01', to: 4, reason: 'late', actorId: 'hr' })).toBe(s);
  });
});

describe('return to manager during calibration', () => {
  it('is not possible once calibration has started', () => {
    const s = start(finishAllReviews(createSeed()));
    expect(reduce(s, { type: 'return_to_manager', personId: 'e01', flagKey: 'k', question: 'Why 5?', actorId: 'hr' })).toBe(s);
  });
});
