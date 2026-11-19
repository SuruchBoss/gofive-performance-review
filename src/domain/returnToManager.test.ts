import { describe, expect, it } from 'vitest';
import { createSeed } from '../data/seed';
import { reduce } from './actions';
import { caseInfo } from './deadlines';
import { allFlags, farFlags } from './flags';
import { canRelease, releaseBlockers } from './release';
import { selfReviewWindow } from './selfReview';
import type { DemoState } from './types';

const review = (s: DemoState, id: string) => s.managerReviews.find((r) => r.personId === id)!;
const nidaFlag = (s: DemoState) => farFlags(s).find((f) => f.personId === 'e01')!.key;
const ret = (s: DemoState, question = 'The renewal is outside the period. Is 5 still right?') =>
  reduce(s, { type: 'return_to_manager', personId: 'e01', flagKey: nidaFlag(s), question, actorId: 'hr' });

describe('return to manager', () => {
  it('needs a question and a submitted review', () => {
    const s = createSeed();
    expect(ret(s, '  ')).toBe(s);
    expect(reduce(s, { type: 'return_to_manager', personId: 'e12', flagKey: 'x', question: 'q', actorId: 'hr' })).toBe(s);
  });

  it('reopens the review for the manager, records the question and logs it', () => {
    const s = ret(createSeed());
    const r = review(s, 'e01');
    expect(r.status).toBe('draft');
    expect(r.returns).toEqual([{ question: 'The renewal is outside the period. Is 5 still right?', flagKey: expect.any(String), on: '2026-12-12', by: 'hr', ratingBefore: 5 }]);
    expect(caseInfo(s, 'e01').status).toBe('returned');
    expect(s.log.at(-1)).toMatchObject({ type: 'returned_to_manager', detail: expect.stringContaining('to Daniel Reyes') });
  });

  it('blocks release while the question is open, and never escalates the returned review', () => {
    let s = ret(createSeed());
    expect(releaseBlockers(s).find((b) => b.key === 'open:e01')?.text).toMatch(/sent back to Daniel Reyes/);
    for (let i = 0; i < 6; i++) s = reduce(s, { type: 'advance_day' });
    expect(s.participants.find((p) => p.personId === 'e01')!.reviewerId).toBe('m-sales');
    expect(caseInfo(s, 'e01').status).toBe('returned');
  });

  it('keeps the self-review closed while the review is reopened', () => {
    expect(selfReviewWindow(ret(createSeed()), 'e03')).toBe('closed');
    // e03 had no self-review and was submitted; returning another person does not reopen it.
    const s = reduce(createSeed(), { type: 'return_to_manager', personId: 'e03', flagKey: 'k', question: 'Why 3?', actorId: 'hr' });
    expect(selfReviewWindow(s, 'e03')).toBe('closed');
  });

  it('the manager must answer before resubmitting', () => {
    const s = ret(createSeed());
    expect(reduce(s, { type: 'submit_review', personId: 'e01', actorId: 'm-sales' })).toEqual(s);
  });

  it('confirming with an answer logs the outcome, and the flag waits for HR', () => {
    let s = ret(createSeed());
    const key = nidaFlag(createSeed());
    s = reduce(s, { type: 'submit_review', personId: 'e01', actorId: 'm-sales', answer: 'The contract was signed in August, inside the period.' });
    const r = review(s, 'e01');
    expect(r.status).toBe('submitted');
    expect(r.returns![0]).toMatchObject({ outcome: 'confirmed', answeredOn: '2026-12-12' });
    expect(r.returns![0].hrDecision).toBeUndefined();
    expect(s.flagReviews.find((f) => f.flagKey === key)).toBeUndefined();
    expect(s.log.at(-1)).toMatchObject({ type: 'return_answered', detail: expect.stringContaining('confirmed 5') });
    // One blocker for the answer, not a second one for the same flag.
    const blockers = releaseBlockers(s).filter((b) => b.key === 'answer:e01' || b.key === key);
    expect(blockers.map((b) => b.key)).toEqual(['answer:e01']);
  });

  it('HR accepting the answer closes the flag and logs it', () => {
    let s = ret(createSeed());
    const key = nidaFlag(createSeed());
    s = reduce(s, { type: 'submit_review', personId: 'e01', actorId: 'm-sales', answer: 'Signed in August.' });
    s = reduce(s, { type: 'accept_answer', personId: 'e01', actorId: 'hr' });
    expect(review(s, 'e01').returns![0]).toMatchObject({ hrDecision: 'accepted', decidedOn: '2026-12-12', decidedBy: 'hr' });
    expect(s.flagReviews.find((f) => f.flagKey === key)?.note).toMatch(/Answer accepted: Signed in August/);
    expect(s.log.at(-1)).toMatchObject({ type: 'return_accepted', targetId: 'e01' });
    expect(releaseBlockers(s).some((b) => b.key === 'answer:e01' || b.key === key)).toBe(false);
    // Nothing left to accept.
    expect(reduce(s, { type: 'accept_answer', personId: 'e01', actorId: 'hr' })).toBe(s);
  });

  it('accepting cannot happen before the manager answers', () => {
    const s = ret(createSeed());
    expect(reduce(s, { type: 'accept_answer', personId: 'e01', actorId: 'hr' })).toBe(s);
  });

  it('HR can ask again: the review reopens with the new question and the old answer is marked', () => {
    let s = ret(createSeed());
    s = reduce(s, { type: 'submit_review', personId: 'e01', actorId: 'm-sales', answer: 'It was a big year.' });
    s = reduce(s, { type: 'return_to_manager', personId: 'e01', flagKey: nidaFlag(s), question: 'Which result inside the period supports a 5?', actorId: 'hr' });
    const r = review(s, 'e01');
    expect(r.status).toBe('draft');
    expect(r.returns!.map((x) => x.hrDecision)).toEqual(['asked_again', undefined]);
    expect(caseInfo(s, 'e01').status).toBe('returned');
    expect(s.log.at(-1)!.detail).toMatch(/^Asked again about Nida/);
  });

  it('if the manager changes the rating and it is still far, accepting also closes the new flag', () => {
    let s = ret(createSeed());
    s = reduce(s, { type: 'save_review', personId: 'e01', patch: { overall: 4 } });
    s = reduce(s, { type: 'submit_review', personId: 'e01', actorId: 'm-sales', answer: 'Lowered to 4.' });
    s = reduce(s, { type: 'accept_answer', personId: 'e01', actorId: 'hr' });
    expect(farFlags(s).filter((f) => f.personId === 'e01' && !f.review)).toEqual([]);
  });

  it('changing the rating is recorded as changed', () => {
    let s = ret(createSeed());
    s = reduce(s, { type: 'save_review', personId: 'e01', patch: { overall: 4 } });
    s = reduce(s, { type: 'submit_review', personId: 'e01', actorId: 'm-sales', answer: 'Agreed, 4 fits the anchors.' });
    expect(review(s, 'e01').returns![0].outcome).toBe('changed');
    expect(s.log.at(-1)!.detail).toContain('changed 5 → 4');
  });

  it('release is possible again once every other blocker is cleared', () => {
    let s = ret(createSeed());
    s = reduce(s, { type: 'submit_review', personId: 'e01', actorId: 'm-sales', answer: 'Confirmed.' });
    s = reduce(s, { type: 'remove', personId: 'e08', reason: 'New joiner', actorId: 'hr' });
    for (const id of ['e11', 'e12']) {
      s = reduce(s, { type: 'save_review', personId: id, patch: { behaviour: ['quality', 'ownership', 'collaboration', 'customer'].map((competencyId) => ({ competencyId, rating: 3 as const })), overall: 3 } });
      s = reduce(s, { type: 'submit_review', personId: id, actorId: 'm-ops' });
    }
    for (const f of allFlags(s).filter((x) => !x.reviewed)) s = reduce(s, { type: 'review_flag', flagKey: f.key, note: 'ok', actorId: 'hr', label: '' });
    // Release waits until HR accepts the manager's answer.
    expect(canRelease(s)).toBe(false);
    expect(releaseBlockers(s).map((b) => b.key)).toEqual(['answer:e01']);
    s = reduce(s, { type: 'accept_answer', personId: 'e01', actorId: 'hr' });
    expect(canRelease(s)).toBe(true);
  });
});
