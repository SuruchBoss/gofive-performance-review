import { describe, expect, it } from 'vitest';
import { createSeed } from '../../data/seed';
import { reduce } from '../../domain/actions';
import { farFlags } from '../../domain/flags';
import { sceneFor, type Loc } from './marks';

const hr = (path: string): Loc => ({ role: 'hr', userId: 'hr', path });
const mgr = (userId: string, path: string): Loc => ({ role: 'manager', userId, path });
const ying = (path: string): Loc => ({ role: 'employee', userId: 'e12', path });
const targets = (s: ReturnType<typeof sceneFor>) => s?.marks.map((m) => m.target);
const returnNida = (s = createSeed()) =>
  reduce(s, { type: 'return_to_manager', personId: 'e01', flagKey: farFlags(s).find((f) => f.personId === 'e01')!.key, question: 'Is 5 right?', actorId: 'hr' });

describe('coachmarks per guide step', () => {
  const s = createSeed();

  it('every step has a mark on the screen its guide link opens', () => {
    // HR 1–5
    expect(targets(sceneFor('hr', 0, s, hr('/hr/progress')))).toEqual(['remove-ineligible']);
    expect(targets(sceneFor('hr', 1, s, mgr('m-ops', '/manager/review/e11')))).toEqual(['review-behaviour', 'review-overall', 'review-submit']);
    expect(targets(sceneFor('hr', 2, s, hr('/hr/consistency')))).toEqual(['flag-mark', 'return-e01']);
    expect(targets(sceneFor('hr', 3, s, hr('/hr/activity')))).toEqual(['guide-clock']);
    expect(targets(sceneFor('hr', 4, s, hr('/hr')))).toEqual(['blocker']);
    // Manager 1–3
    expect(targets(sceneFor('manager', 0, s, mgr('m-ops', '/manager/review/e11')))).toEqual(['review-behaviour', 'review-overall', 'review-submit']);
    expect(targets(sceneFor('manager', 1, s, mgr('m-ops', '/manager')))).toEqual(['guide-clock']);
    expect(targets(sceneFor('manager', 2, s, hr('/hr/consistency')))).toEqual(['return-e01']);
    // Employee 1–3
    expect(targets(sceneFor('employee', 0, s, ying('/me/self-review')))).toEqual(['self-text', 'self-rating', 'self-submit']);
    expect(targets(sceneFor('employee', 1, s, ying('/me/result')))).toEqual(['result-locked']);
    expect(targets(sceneFor('employee', 2, s, ying('/me/result')))).toEqual(['result-locked', 'demo-shortcut']);
  });

  it('gives no scene on other screens, so the guide link is pointed at instead', () => {
    expect(sceneFor('hr', 0, s, hr('/hr'))).toBeUndefined();
    expect(sceneFor('hr', 1, s, hr('/hr/progress'))).toBeUndefined();
    expect(sceneFor('manager', 1, s, mgr('m-sales', '/manager'))).toBeUndefined();
    expect(sceneFor('employee', 0, s, { role: 'employee', userId: 'e01', path: '/me/self-review' })).toBeUndefined();
  });

  it('follows a returned review: waiting → answer → HR accepts', () => {
    let r = returnNida();
    expect(targets(sceneFor('manager', 2, r, hr('/hr/consistency')))).toEqual(['open-returned']);
    expect(targets(sceneFor('manager', 2, r, mgr('m-sales', '/manager')))).toEqual(['answer-hr']);
    expect(targets(sceneFor('manager', 2, r, mgr('m-sales', '/manager/review/e01')))).toEqual(['review-answer', 'review-submit']);
    r = reduce(r, { type: 'submit_review', personId: 'e01', actorId: 'm-sales', answer: 'Kept 5.' });
    expect(targets(sceneFor('hr', 4, r, hr('/hr/consistency')))).toEqual(['accept-answer']);
  });

  it('the release step points at each place work is left, then at Release', () => {
    expect(targets(sceneFor('hr', 4, s, hr('/hr/progress')))).toEqual(['remove-ineligible']);
    expect(targets(sceneFor('hr', 4, s, hr('/hr/consistency')))).toEqual(['flag-mark']);
    expect(targets(sceneFor('hr', 4, s, mgr('m-ops', '/manager/review/e12')))).toEqual(['review-behaviour', 'review-overall', 'review-submit']);
    let done = reduce(s, { type: 'remove', personId: 'e08', reason: 'New joiner', actorId: 'hr' });
    for (const id of ['e11', 'e12']) {
      done = reduce(done, { type: 'save_review', personId: id, patch: { behaviour: ['quality', 'ownership', 'collaboration', 'customer'].map((competencyId) => ({ competencyId, rating: 3 as const })), overall: 3 } });
      done = reduce(done, { type: 'submit_review', personId: id, actorId: 'm-ops' });
    }
    expect(sceneFor('hr', 4, done, hr('/hr/progress'))).toBeUndefined();
    expect(targets(sceneFor('hr', 4, done, hr('/hr')))).toEqual(['blocker']);
  });

  it('every note is short: one or two sentences', () => {
    const scenes = [
      sceneFor('hr', 0, s, hr('/hr/progress')), sceneFor('hr', 1, s, mgr('m-ops', '/manager/review/e11')), sceneFor('hr', 2, s, hr('/hr/consistency')),
      sceneFor('hr', 3, s, hr('/hr/activity')), sceneFor('hr', 4, s, hr('/hr')), sceneFor('manager', 1, s, mgr('m-ops', '/manager')),
      sceneFor('employee', 0, s, ying('/me/self-review')), sceneFor('employee', 2, s, ying('/me/result')),
      sceneFor('manager', 2, s, hr('/hr/consistency')), sceneFor('manager', 2, returnNida(), mgr('m-sales', '/manager/review/e01')),
    ];
    for (const m of scenes.flatMap((x) => x!.marks)) {
      expect(m.text.length).toBeLessThanOrEqual(170);
      expect(m.text.split(/[.!?](?:\s|$)/).filter(Boolean).length).toBeLessThanOrEqual(2);
    }
  });
});
