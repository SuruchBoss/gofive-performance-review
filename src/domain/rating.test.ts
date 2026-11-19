import { describe, expect, it } from 'vitest';
import { createSeed } from '../data/seed';
import {
  achievement,
  behaviourScore,
  isFarFromSuggestion,
  needsEvidence,
  resultsScore,
  reviewProblems,
  suggestedFromResults,
  suggestionFor,
} from './rating';
import type { Goal, ManagerReview } from './types';

const g = (p: Partial<Goal>): Goal => ({ id: 'x', personId: 'p', title: 't', weight: 100, target: 100, actual: 100, unit: '', direction: 'higher', source: '', ...p });

describe('goal achievement', () => {
  it('is actual / target for higher-is-better goals', () => {
    expect(achievement(g({ actual: 80 }))).toBeCloseTo(0.8);
  });
  it('is target / actual for lower-is-better goals', () => {
    expect(achievement(g({ direction: 'lower', target: 4, actual: 5 }))).toBeCloseTo(0.8);
  });
  it('is clamped to 0–150 %', () => {
    expect(achievement(g({ actual: 400 }))).toBe(1.5);
    expect(achievement(g({ actual: -10 }))).toBe(0);
    expect(achievement(g({ direction: 'lower', actual: 0 }))).toBe(1.5);
  });
  it('weights goals', () => {
    expect(resultsScore([g({ weight: 75, actual: 100 }), g({ weight: 25, actual: 60 })])).toBeCloseTo(0.9);
  });
});

describe('suggested rating', () => {
  it.each([
    [0.4, 1],
    [0.6, 1],
    [0.8, 2],
    [1.0, 3],
    [1.2, 4],
    [1.4, 5],
    [1.5, 5],
  ])('results %d gives %d', (r, s) => {
    expect(suggestedFromResults(r)).toBeCloseTo(s);
  });
  it('is continuous between levels', () => {
    expect(suggestedFromResults(1.07)).toBeCloseTo(3.35);
  });
});

describe('far-from-suggestion rule (≥ 1.0)', () => {
  it('needs a reason at exactly 1.0 away', () => {
    expect(isFarFromSuggestion(4, 3)).toBe(true);
    expect(isFarFromSuggestion(2, 3)).toBe(true);
  });
  it('handles floating-point distances that are 1.0', () => {
    expect(isFarFromSuggestion(4, suggestedFromResults(1.0))).toBe(true);
  });
  it('does not need a reason just under 1.0', () => {
    expect(isFarFromSuggestion(4, 3.01)).toBe(false);
    expect(isFarFromSuggestion(3, 3.4)).toBe(false);
  });
});

describe('evidence rule (overall 1, 2 or 5 only)', () => {
  it('applies to 1, 2 and 5', () => {
    expect([1, 2, 3, 4, 5].map(needsEvidence)).toEqual([true, true, false, false, true]);
  });

  const base: ManagerReview = {
    personId: 'p',
    reviewerId: 'm',
    status: 'draft',
    behaviour: [{ competencyId: 'a', rating: 5 }, { competencyId: 'b', rating: 1 }],
    selfReviewMissing: false,
  };

  it('does not ask for evidence on single behaviour ratings', () => {
    expect(reviewProblems({ ...base, overall: 3 }, 3)).toEqual([]);
  });
  it('asks for evidence of at least 40 characters on an overall 5', () => {
    expect(reviewProblems({ ...base, overall: 5, deviationReason: 'r' }, 4.5).map((p) => p.field)).toEqual(['overallEvidence']);
    expect(reviewProblems({ ...base, overall: 5, overallEvidence: 'x'.repeat(39) }, 4.5)).toHaveLength(1);
    expect(reviewProblems({ ...base, overall: 5, overallEvidence: 'x'.repeat(40) }, 4.5)).toEqual([]);
  });
  it('ignores whitespace when counting', () => {
    expect(reviewProblems({ ...base, overall: 2, overallEvidence: ' '.repeat(50) }, 2.2)).toHaveLength(1);
  });
  it('asks for a reason when far from the suggestion', () => {
    expect(reviewProblems({ ...base, overall: 4 }, 3).map((p) => p.field)).toEqual(['deviationReason']);
    expect(reviewProblems({ ...base, overall: 4, deviationReason: 'Strong client feedback' }, 3)).toEqual([]);
  });
  it('lists missing ratings', () => {
    const r = { ...base, behaviour: [{ competencyId: 'a' }, { competencyId: 'b', rating: 3 as const }] };
    expect(reviewProblems(r, 3).map((p) => p.field)).toEqual(['behaviour', 'overall']);
  });
});

describe('behaviour score', () => {
  it('is the mean, or undefined while incomplete', () => {
    expect(behaviourScore({ behaviour: [{ competencyId: 'a', rating: 4 }, { competencyId: 'b', rating: 3 }] })).toBe(3.5);
    expect(behaviourScore({ behaviour: [{ competencyId: 'a', rating: 4 }, { competencyId: 'b' }] })).toBeUndefined();
  });
});

describe('seed data lands where the design says', () => {
  const s = createSeed();
  const sug = (id: string) => suggestionFor(s, id).value;
  it('matches the suggestion stored on each submitted seed review', () => {
    for (const r of s.managerReviews.filter((x) => x.status === 'submitted')) {
      expect(sug(r.personId)).toBeCloseTo(r.suggestedAtSubmit!, 1);
    }
  });
  it('every seed review would pass the submit rules', () => {
    for (const r of s.managerReviews.filter((x) => x.status === 'submitted')) {
      expect(reviewProblems(r, sug(r.personId))).toEqual([]);
    }
  });
  it('has one far-above rating in Sales and one far-below in Support', () => {
    const far = s.managerReviews
      .filter((r) => r.status === 'submitted' && isFarFromSuggestion(r.overall!, sug(r.personId)))
      .map((r) => r.personId);
    expect(far).toEqual(['e01', 'e05']);
  });
});

describe('ratings that need no reason', () => {
  it('lists the whole ratings less than 1.0 from the suggestion', async () => {
    const { ratingsWithoutReason } = await import('./rating');
    expect(ratingsWithoutReason(2.6)).toEqual([2, 3]);
    expect(ratingsWithoutReason(3.0)).toEqual([3]);
    expect(ratingsWithoutReason(3.05)).toEqual([3, 4]);
    expect(ratingsWithoutReason(4.17)).toEqual([4, 5]);
  });
});
