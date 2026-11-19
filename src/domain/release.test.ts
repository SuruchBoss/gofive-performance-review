import { describe, expect, it } from 'vitest';
import { createSeed } from '../data/seed';
import { reduce } from './actions';
import { allFlags } from './flags';
import { canRelease, releaseBlockers } from './release';
import { selfReviewWindow } from './selfReview';
import { finishAllReviews, runCalibration } from './testing';

/*
 * Calibration build: release needs every review submitted AND a locked
 * calibration. HR flag notes alone are no longer enough (requirement change, Q2).
 */
describe('release gate (calibration build)', () => {
  it('is blocked at the start by open reviews and by calibration', () => {
    const b = releaseBlockers(createSeed());
    expect(b.filter((x) => x.kind === 'open_review')).toHaveLength(3);
    expect(b.map((x) => x.kind)).toContain('calibration');
    const s = createSeed();
    expect(reduce(s, { type: 'release', actorId: 'hr' })).toBe(s);
  });

  it('stays blocked when every review is in and every flag has an HR note, but calibration is not locked', () => {
    let s = finishAllReviews(createSeed());
    for (const f of allFlags(s)) s = reduce(s, { type: 'review_flag', flagKey: f.key, note: 'ok', actorId: 'hr', label: f.key });
    expect(releaseBlockers(s).map((b) => b.key)).toEqual(['calibration']);
    expect(canRelease(s)).toBe(false);
  });

  it('stays blocked while calibration is in session', () => {
    let s = finishAllReviews(createSeed());
    s = reduce(s, { type: 'start_calibration', attendees: ['m-sales', 'm-ops'], actorId: 'hr' });
    expect(canRelease(s)).toBe(false);
    expect(releaseBlockers(s)[0].text).toMatch(/being agreed/);
  });

  it('releases once calibration is locked, and then locks the cycle', () => {
    let s = runCalibration(finishAllReviews(createSeed()));
    expect(canRelease(s)).toBe(true);
    s = reduce(s, { type: 'release', actorId: 'hr' });
    expect(s.cycle.status).toBe('released');
    expect(s.log.at(-1)).toMatchObject({ type: 'release', detail: 'Released results to 11 employees.' });
    expect(selfReviewWindow(s, 'e01')).toBe('submitted');
  });
});

describe('deadline change', () => {
  it('is logged and moves escalation dates', () => {
    let s = reduce(createSeed(), { type: 'change_deadline', field: 'managerDeadline', date: '2026-12-15', actorId: 'hr' });
    expect(s.log.at(-1)?.type).toBe('deadline_change');
    s = reduce(reduce(s, { type: 'advance_day' }), { type: 'advance_day' });
    expect(s.log.filter((l) => l.type === 'escalation')).toHaveLength(0);
  });
  it('ignores dates before the cycle opened', () => {
    const s = createSeed();
    expect(reduce(s, { type: 'change_deadline', field: 'managerDeadline', date: '2026-10-01', actorId: 'hr' })).toBe(s);
  });
});
