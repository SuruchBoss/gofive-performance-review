import { describe, expect, it } from 'vitest';
import { createSeed } from '../data/seed';
import { reduce } from './actions';
import { finishManagerReviews } from './demoShortcut';
import { farFlags } from './flags';
import { hrAttention, managerTodo } from './home';
import { canRelease, releaseBlockers } from './release';
import { runCalibration } from './testing';

const ids = (ps: { personId: string }[]) => ps.map((p) => p.personId);

describe('HR home: needs your attention', () => {
  it('starts with the new joiner, two late reviews and final ratings to agree', () => {
    const a = hrAttention(createSeed());
    expect(ids(a.tooNew)).toEqual(['e08']);
    expect(ids(a.toWrite).sort()).toEqual(['e11', 'e12']);
    expect(ids(a.late).sort()).toEqual(['e11', 'e12']);
    // Calibration build: ratings that do not match results are the list for the meeting,
    // so they are not a separate group; agreeing final ratings is.
    expect(a.toCheck).toEqual([]);
    expect(a.finalRatings?.key).toBe('calibration');
    expect(a.answers).toEqual([]);
    expect(a.groups).toBe(3);
  });

  it('lists exactly what blocks release: the list is empty when release is possible, and not before', () => {
    let s = createSeed();
    const count = () => { const a = hrAttention(s); return a.tooNew.length + a.toWrite.length + a.waitingForAnswer.length + a.answers.length + a.toCheck.length + (a.finalRatings ? 1 : 0); };
    expect(count()).toBe(releaseBlockers(s).length);
    s = reduce(s, { type: 'remove', personId: 'e08', reason: 'Joined less than 3 months ago', actorId: 'hr' });
    expect(hrAttention(s).tooNew).toEqual([]);
    s = finishManagerReviews(s);
    expect(hrAttention(s).toWrite).toEqual([]);
    expect(count()).toBe(releaseBlockers(s).length);
    expect(hrAttention(s).groups).toBe(1);
    s = runCalibration(s);
    expect(hrAttention(s).groups).toBe(0);
    expect(canRelease(s)).toBe(true);
  });

  it('follows a review that HR sends back: waiting, then an answer to read', () => {
    let s = createSeed();
    s = reduce(s, { type: 'return_to_manager', personId: 'e01', flagKey: farFlags(s).find((f) => f.personId === 'e01')!.key, question: 'Is 5 right?', actorId: 'hr' });
    expect(ids(hrAttention(s).waitingForAnswer)).toEqual(['e01']);
    expect(ids(hrAttention(s).toWrite)).not.toContain('e01');
    s = reduce(s, { type: 'submit_review', personId: 'e01', actorId: 'm-sales', answer: 'Kept 5: the largest contract of the year.' });
    expect(ids(hrAttention(s).answers)).toEqual(['e01']);
    s = reduce(s, { type: 'accept_answer', personId: 'e01', actorId: 'hr' });
    expect(hrAttention(s).answers).toEqual([]);
  });
});

describe('manager home: to do', () => {
  it('Tom has two reviews to write, the draft first, and two done', () => {
    const t = managerTodo(createSeed(), 'm-ops');
    expect(ids(t.toWrite)).toEqual(['e11', 'e12']);
    expect(t.done).toHaveLength(2);
    expect(t.returned).toEqual([]);
  });

  it('a review HR sent back is a question to answer, not a review to write', () => {
    const s0 = createSeed();
    const s = reduce(s0, { type: 'return_to_manager', personId: 'e01', flagKey: farFlags(s0).find((f) => f.personId === 'e01')!.key, question: 'Is 5 right?', actorId: 'hr' });
    const t = managerTodo(s, 'm-sales');
    expect(ids(t.returned)).toEqual(['e01']);
    expect(ids(t.toWrite)).not.toContain('e01');
  });

  it('after the deadline plus 3 days, open reviews move to the manager\'s own manager', () => {
    let s = createSeed();
    for (let i = 0; i < 2; i++) s = reduce(s, { type: 'advance_day' });
    expect(managerTodo(s, 'm-ops').toWrite).toEqual([]);
    expect(ids(managerTodo(s, 'm-ops').movedAway).sort()).toEqual(['e11', 'e12']);
    const head = s.participants.find((p) => p.personId === 'e12')!.reviewerId;
    expect(ids(managerTodo(s, head).toWrite)).toEqual(expect.arrayContaining(['e11', 'e12']));
  });
});
