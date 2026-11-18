import { describe, expect, it } from 'vitest';
import { createSeed } from '../data/seed';
import { reduce } from './actions';
import { selfReviewWindow } from './selfReview';
import type { DemoState } from './types';

const write = (s: DemoState, id: string) => reduce(s, { type: 'save_self_review', personId: id, text: 'My year', selfRating: 3 });
const self = (s: DemoState, id: string) => s.selfReviews.find((r) => r.personId === id)!;

describe('self-review window', () => {
  it('is open on time up to and including the deadline', () => {
    const s = { ...createSeed(), today: '2026-11-27' };
    expect(selfReviewWindow(s, 'e12')).toBe('open');
  });

  it('is open late after the deadline while the manager has not submitted', () => {
    expect(selfReviewWindow(createSeed(), 'e12')).toBe('open_late');
  });

  it('closes once the manager submits', () => {
    expect(selfReviewWindow(createSeed(), 'e03')).toBe('closed');
  });

  it('reports submitted ones as submitted', () => {
    expect(selfReviewWindow(createSeed(), 'e01')).toBe('submitted');
  });
});

describe('submitting a self-review', () => {
  it('on time: not late, no log entry', () => {
    const s0 = { ...createSeed(), today: '2026-11-25' };
    const s = reduce(write(s0, 'e12'), { type: 'submit_self_review', personId: 'e12' });
    expect(self(s, 'e12')).toMatchObject({ status: 'submitted', late: false, submittedOn: '2026-11-25' });
    expect(s.log.length).toBe(s0.log.length);
  });

  it('late: marked late and logged with the days', () => {
    const s0 = createSeed();
    const s = reduce(write(s0, 'e12'), { type: 'submit_self_review', personId: 'e12' });
    expect(self(s, 'e12').late).toBe(true);
    expect(s.log.at(-1)).toMatchObject({ type: 'self_review_late', detail: 'Self-review submitted 15 days after the deadline.' });
  });

  it('needs text and an own rating', () => {
    const s0 = reduce(createSeed(), { type: 'save_self_review', personId: 'e12', text: 'x' });
    expect(self(reduce(s0, { type: 'submit_self_review', personId: 'e12' }), 'e12').status).toBe('draft');
  });

  it('cannot be written after the manager submitted (recorded as missing)', () => {
    const s = createSeed();
    expect(write(s, 'e03')).toBe(s);
    expect(s.managerReviews.find((r) => r.personId === 'e03')!.selfReviewMissing).toBe(true);
  });

  it('a late self-review is no longer missing when the manager then submits', () => {
    let s = reduce(write(createSeed(), 'e12'), { type: 'submit_self_review', personId: 'e12' });
    const behaviour = ['quality', 'ownership', 'collaboration', 'customer'].map((competencyId) => ({ competencyId, rating: 3 as const }));
    s = reduce(s, { type: 'save_review', personId: 'e12', patch: { behaviour, overall: 3 } });
    s = reduce(s, { type: 'submit_review', personId: 'e12', actorId: 'm-ops' });
    expect(s.managerReviews.find((r) => r.personId === 'e12')!.selfReviewMissing).toBe(false);
  });
});
