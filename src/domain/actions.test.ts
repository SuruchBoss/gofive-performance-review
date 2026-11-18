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

describe('manager review flow', () => {
  it('saving a review makes it a draft and keeps other fields', () => {
    const s = reduce(createSeed(), { type: 'save_review', personId: 'e12', patch: { comment: 'Good year' } });
    const r = s.managerReviews.find((x) => x.personId === 'e12')!;
    expect(r.status).toBe('draft');
    expect(r.comment).toBe('Good year');
    expect(r.behaviour).toHaveLength(4);
  });

  const rateAll = (rating: 1 | 2 | 3 | 4 | 5, overall: 1 | 2 | 3 | 4 | 5) =>
    reduce(createSeed(), {
      type: 'save_review',
      personId: 'e12',
      patch: { behaviour: ['quality', 'ownership', 'collaboration', 'customer'].map((competencyId) => ({ competencyId, rating })), overall },
    });

  it('blocks submit while the review breaks a rule', () => {
    // e12's suggestion is about 2.6, so 4 is far from it and needs a reason.
    const s = reduce(rateAll(4, 4), { type: 'submit_review', personId: 'e12', actorId: 'm-ops' });
    expect(s.managerReviews.find((x) => x.personId === 'e12')!.status).toBe('draft');
    const incomplete = reduce(createSeed(), { type: 'submit_review', personId: 'e12', actorId: 'm-ops' });
    expect(incomplete.managerReviews.find((x) => x.personId === 'e12')!.status).toBe('not_started');
  });

  it('submitting records the date, the suggestion, the missing self-review and a log entry', () => {
    const s = reduce(rateAll(3, 3), { type: 'submit_review', personId: 'e12', actorId: 'm-ops' });
    const r = s.managerReviews.find((x) => x.personId === 'e12')!;
    expect(r.status).toBe('submitted');
    expect(r.submittedOn).toBe('2026-12-12');
    expect(r.selfReviewMissing).toBe(true);
    expect(r.suggestedAtSubmit).toBeCloseTo(2.6, 1);
    expect(s.log.at(-1)?.type).toBe('review_submitted');
  });

  it('a submitted review cannot be edited or submitted again', () => {
    let s = reduce(createSeed(), { type: 'save_review', personId: 'e01', patch: { comment: 'changed' } });
    expect(s.managerReviews.find((x) => x.personId === 'e01')!.comment).not.toBe('changed');
    const before = s.log.length;
    s = reduce(s, { type: 'submit_review', personId: 'e01', actorId: 'm-sales' });
    expect(s.log.length).toBe(before);
  });
});
