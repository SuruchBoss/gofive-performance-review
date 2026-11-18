import { CONFIG } from './config';
import { isFarFromSuggestion, suggestionFor } from './rating';
import type { DemoState, FlagReview, ManagerReview, Rating } from './types';

/**
 * Flags are derived from the state every time and never stored. Only HR's
 * review of a flag is stored, keyed by `key`. The key contains the data the
 * flag is about, so if that data changes the flag reopens.
 */

export function activeParticipants(state: DemoState) {
  return state.participants.filter((p) => !p.removed);
}

export function submittedReviews(state: DemoState): ManagerReview[] {
  const active = new Set(activeParticipants(state).map((p) => p.personId));
  return state.managerReviews.filter((r) => r.status === 'submitted' && active.has(r.personId));
}

export function suggestedFor(state: DemoState, r: ManagerReview): number {
  return r.suggestedAtSubmit ?? suggestionFor(state, r.personId).value;
}

export interface FarFlag {
  kind: 'far';
  key: string;
  personId: string;
  reviewerId: string;
  overall: Rating;
  suggested: number;
  direction: 'above' | 'below';
  reason?: string;
  review?: FlagReview;
}

export function farFlags(state: DemoState): FarFlag[] {
  return submittedReviews(state).flatMap((r) => {
    const suggested = suggestedFor(state, r);
    if (r.overall === undefined || !isFarFromSuggestion(r.overall, suggested)) return [];
    const key = `far:${r.personId}:${r.overall}`;
    return [{
      kind: 'far' as const,
      key,
      personId: r.personId,
      reviewerId: r.reviewerId,
      overall: r.overall,
      suggested,
      direction: r.overall > suggested ? ('above' as const) : ('below' as const),
      reason: r.deviationReason,
      review: state.flagReviews.find((f) => f.flagKey === key),
    }];
  });
}

export type GapStatus = 'insufficient' | 'in_line' | 'above' | 'below';

export interface GapResult {
  n: number;
  meanRating: number;
  meanSuggested: number;
  gap: number;
  status: GapStatus;
}

const EPS = 1e-9;

/** The consistency rule on its own, so it can be tested with plain numbers. */
export function computeGap(pairs: { overall: number; suggested: number }[]): GapResult {
  const n = pairs.length;
  const meanRating = n ? pairs.reduce((s, p) => s + p.overall, 0) / n : 0;
  const meanSuggested = n ? pairs.reduce((s, p) => s + p.suggested, 0) / n : 0;
  const gap = meanRating - meanSuggested;
  let status: GapStatus;
  if (n < CONFIG.MIN_REVIEWS_FOR_GAP) status = 'insufficient';
  else if (Math.abs(gap) >= CONFIG.MANAGER_GAP_FLAG - EPS) status = gap > 0 ? 'above' : 'below';
  else status = 'in_line';
  return { n, meanRating, meanSuggested, gap, status };
}

export interface ManagerConsistency extends GapResult {
  reviewerId: string;
  key: string;
  flagged: boolean;
  reviews: { personId: string; overall: Rating; suggested: number }[];
  review?: FlagReview;
}

export function managerConsistency(state: DemoState): ManagerConsistency[] {
  const reviewers = state.people.filter((p) => p.kind === 'manager' || p.kind === 'head').map((p) => p.id);
  const subs = submittedReviews(state);
  return reviewers
    .map((reviewerId) => {
      const reviews = subs
        .filter((r) => r.reviewerId === reviewerId && r.overall !== undefined)
        .map((r) => ({ personId: r.personId, overall: r.overall!, suggested: suggestedFor(state, r) }));
      const g = computeGap(reviews);
      const key = `gap:${reviewerId}:${reviews.map((r) => `${r.personId}=${r.overall}`).join(',')}`;
      return {
        ...g,
        reviewerId,
        key,
        reviews,
        flagged: g.status === 'above' || g.status === 'below',
        review: state.flagReviews.find((f) => f.flagKey === key),
      };
    })
    .filter((m) => m.n > 0 || state.teams.some((t) => t.managerId === m.reviewerId));
}

export interface FlagSummary {
  key: string;
  kind: 'far' | 'gap';
  reviewed: boolean;
}

export function allFlags(state: DemoState): FlagSummary[] {
  return [
    ...managerConsistency(state).filter((m) => m.flagged).map((m) => ({ key: m.key, kind: 'gap' as const, reviewed: !!m.review })),
    ...farFlags(state).map((f) => ({ key: f.key, kind: 'far' as const, reviewed: !!f.review })),
  ];
}

export function openFlagCount(state: DemoState): number {
  return allFlags(state).filter((f) => !f.reviewed).length;
}
