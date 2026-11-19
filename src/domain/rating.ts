import { CONFIG } from './config';
import type { DemoState, Goal, ManagerReview, Rating } from './types';

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Goal achievement as a ratio of target (1 = met), clamped to 0–1.5. */
export function achievement(g: Pick<Goal, 'target' | 'actual' | 'direction'>): number {
  const raw = g.direction === 'lower' ? (g.actual === 0 ? CONFIG.ACHIEVEMENT_MAX : g.target / g.actual) : g.target === 0 ? 0 : g.actual / g.target;
  return clamp(raw, CONFIG.ACHIEVEMENT_MIN, CONFIG.ACHIEVEMENT_MAX);
}

/** Weighted goal achievement, R. */
export function resultsScore(goals: Goal[]): number {
  const total = goals.reduce((s, g) => s + g.weight, 0);
  if (total === 0) return 0;
  return goals.reduce((s, g) => s + g.weight * achievement(g), 0) / total;
}

/** Continuous suggested rating: 100 % of target = 3, each 20 points = one level, clamped to 1–5. */
export function suggestedFromResults(r: number): number {
  return clamp(3 + (r - 1) / 0.2, 1, 5);
}

export interface Suggestion {
  results: number;
  value: number;
  rounded: Rating;
}

export function suggestionFor(state: DemoState, personId: string): Suggestion {
  const results = resultsScore(state.goals.filter((g) => g.personId === personId));
  // Rounded to one decimal, the way every screen shows it, so the reason rule and the
  // flags use exactly the number people see (3.05 is shown and checked as 3.1).
  const value = Math.round((suggestedFromResults(results) + 1e-9) * 10) / 10;
  return { results, value, rounded: Math.round(value) as Rating };
}

export function distanceFromSuggestion(overall: number, suggested: number): number {
  return Math.abs(overall - suggested);
}

/** Small tolerance so 1.0 computed with floating point still counts as 1.0. */
const EPS = 1e-9;

export function isFarFromSuggestion(overall: number, suggested: number): boolean {
  return distanceFromSuggestion(overall, suggested) >= CONFIG.FAR_FROM_SUGGESTION - EPS;
}

/** Whole ratings that are close enough to the suggestion to need no reason. */
export function ratingsWithoutReason(suggested: number): Rating[] {
  return ([1, 2, 3, 4, 5] as Rating[]).filter((r) => !isFarFromSuggestion(r, suggested));
}

/** Plain words for each level, used next to every overall rating. */
export const LEVEL_WORDS: Record<Rating, string> = {
  1: 'Well below expectations',
  2: 'Below expectations',
  3: 'Met expectations',
  4: 'Above expectations',
  5: 'Well above expectations',
};

/** The suggestion is always shown with one decimal, so the reason rule can be checked by eye. */
export const showSuggestion = (s: number) => s.toFixed(1);

export function needsEvidence(overall: number | undefined): boolean {
  return overall !== undefined && (CONFIG.EVIDENCE_RATINGS as readonly number[]).includes(overall);
}

/** Mean of the behaviour ratings, or undefined if any is missing. */
export function behaviourScore(review: Pick<ManagerReview, 'behaviour'>): number | undefined {
  const rs = review.behaviour.map((b) => b.rating);
  if (rs.length === 0 || rs.some((r) => r === undefined)) return undefined;
  return (rs as number[]).reduce((a, b) => a + b, 0) / rs.length;
}

export type ReviewProblem =
  | { field: 'behaviour'; message: string }
  | { field: 'overall'; message: string }
  | { field: 'deviationReason'; message: string }
  | { field: 'overallEvidence'; message: string };

export function reviewProblems(review: ManagerReview, suggested: number): ReviewProblem[] {
  const out: ReviewProblem[] = [];
  const missing = review.behaviour.filter((b) => !b.rating).length;
  if (missing) out.push({ field: 'behaviour', message: `Rate ${missing === 1 ? 'the last behaviour' : `the ${missing} remaining behaviours`}.` });
  if (review.overall === undefined) {
    out.push({ field: 'overall', message: 'Choose an overall rating.' });
    return out;
  }
  if (isFarFromSuggestion(review.overall, suggested) && (review.deviationReason?.trim().length ?? 0) < CONFIG.REASON_MIN_CHARS) {
    out.push({ field: 'deviationReason', message: `Explain why the rating differs from the goal results (at least ${CONFIG.REASON_MIN_CHARS} characters).` });
  }
  if (needsEvidence(review.overall) && (review.overallEvidence?.trim().length ?? 0) < CONFIG.EVIDENCE_MIN_CHARS) {
    out.push({ field: 'overallEvidence', message: `Give a specific example (at least ${CONFIG.EVIDENCE_MIN_CHARS} characters).` });
  }
  return out;
}
