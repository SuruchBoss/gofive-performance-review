import { describe, expect, it } from 'vitest';
import { createSeed } from '../data/seed';
import { reduce } from './actions';
import { skipToRelease } from './demoShortcut';
import { allFlags } from './flags';
import { reviewProblems } from './rating';

describe('demo shortcut: skip to released results', () => {
  it('reaches release from the starting data', () => {
    const s = skipToRelease(createSeed());
    expect(s.cycle.status).toBe('released');
  });

  it('only uses normal actions: every submitted review passes the review rules', () => {
    const s = skipToRelease(createSeed());
    for (const r of s.managerReviews.filter((x) => x.status === 'submitted')) {
      expect(reviewProblems(r, r.suggestedAtSubmit!)).toEqual([]);
    }
    expect(allFlags(s).every((f) => f.reviewed)).toBe(true);
  });

  it('removes the new joiner with a reason instead of reviewing her', () => {
    const s = skipToRelease(createSeed());
    expect(s.participants.find((p) => p.personId === 'e08')!.removed?.reason).toMatch(/Demo shortcut/);
  });

  it('logs that the shortcut was used, then each normal step', () => {
    const s = skipToRelease(createSeed());
    const types = s.log.slice(createSeed().log.length).map((l) => l.type);
    expect(types[0]).toBe('demo_shortcut');
    expect(types).toContain('removal');
    expect(types).toContain('review_submitted');
    expect(types).toContain('flag_reviewed');
    expect(types.at(-1)).toBe('release');
  });

  it('keeps ratings a manager already chose, and handles a review HR returned', () => {
    let s = createSeed();
    const nidaKey = allFlags(s).find((f) => f.key.startsWith('far:e01'))!.key;
    s = reduce(s, { type: 'return_to_manager', personId: 'e01', flagKey: nidaKey, question: 'Is 5 right?', actorId: 'hr' });
    s = reduce(s, { type: 'save_review', personId: 'e11', patch: { overall: 4 } });
    const out = skipToRelease(s);
    expect(out.cycle.status).toBe('released');
    expect(out.managerReviews.find((r) => r.personId === 'e11')!.overall).toBe(4);
    expect(out.managerReviews.find((r) => r.personId === 'e01')!.returns![0]).toMatchObject({ outcome: 'confirmed', hrDecision: 'accepted' });
  });

  it('does nothing once results are released', () => {
    const s = skipToRelease(createSeed());
    expect(skipToRelease(s)).toBe(s);
  });
});
