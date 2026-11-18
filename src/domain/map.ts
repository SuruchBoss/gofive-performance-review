import { activeParticipants, farFlags, submittedReviews, suggestedFor } from './flags';
import { behaviourScore } from './rating';
import type { DemoState } from './types';

export type Band = 'low' | 'mid' | 'high';

/** Cuts at 2.5 and 3.5 on both axes (docs/DESIGN.md 4.5). */
export function band(v: number): Band {
  if (v < 2.5) return 'low';
  if (v > 3.5) return 'high';
  return 'mid';
}

export function cellLabel(results: number, behaviour: number): string {
  const r = band(results);
  const b = band(behaviour);
  if (r === 'high' && b === 'high') return 'Strong on both';
  if (r === 'low' && b === 'low') return 'Below on both';
  if (r === 'high' && b === 'low') return 'Results high, behaviour low';
  if (r === 'low' && b === 'high') return 'Behaviour high, results low';
  return 'Around expectations';
}

export interface MapPoint {
  personId: string;
  teamId?: string;
  results: number;
  behaviour: number;
  overall: number;
  flagged: boolean;
  cell: string;
}

export function mapPoints(state: DemoState, reviewerId?: string): MapPoint[] {
  const active = new Set(activeParticipants(state).map((p) => p.personId));
  const openFlags = new Set(farFlags(state).filter((f) => !f.review).map((f) => f.personId));
  return submittedReviews(state)
    .filter((r) => active.has(r.personId) && (!reviewerId || state.people.find((p) => p.id === r.personId)?.managerId === reviewerId))
    .flatMap((r) => {
      const b = behaviourScore(r);
      if (b === undefined || r.overall === undefined) return [];
      const results = suggestedFor(state, r);
      return [{
        personId: r.personId,
        teamId: state.people.find((p) => p.id === r.personId)?.teamId,
        results,
        behaviour: b,
        overall: r.overall,
        flagged: openFlags.has(r.personId),
        cell: cellLabel(results, b),
      }];
    });
}
