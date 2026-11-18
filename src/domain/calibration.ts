import { activeParticipants, farFlags, managerConsistency } from './flags';
import type { AgendaItem, DemoState, ManagerReview, Rating } from './types';

/**
 * Cross-team calibration (exam question 2). After every review is submitted,
 * managers meet and align ratings across teams. Flags from the consistency
 * check become the agenda. Results stay locked until calibration is locked.
 * HR records the session on behalf of the group (no real login in the prototype).
 */

/** The rating employees see: the calibrated one if it changed, else the manager's. */
export function finalRating(r: Pick<ManagerReview, 'overall' | 'calibratedOverall'>): Rating | undefined {
  return r.calibratedOverall ?? r.overall;
}

export function openReviewCount(state: DemoState): number {
  const active = new Set(activeParticipants(state).map((p) => p.personId));
  return state.managerReviews.filter((r) => active.has(r.personId) && r.status !== 'submitted').length;
}

export function canStartCalibration(state: DemoState): boolean {
  return state.cycle.status === 'open' && state.calibration.status === 'not_started' && openReviewCount(state) === 0;
}

/** The agenda is every flag at the moment the session starts, reviewed by HR or not. */
export function buildAgenda(state: DemoState): AgendaItem[] {
  const name = (id: string) => state.people.find((p) => p.id === id)?.name ?? id;
  const gaps: AgendaItem[] = managerConsistency(state)
    .filter((m) => m.flagged)
    .map((m) => ({ key: m.key, kind: 'gap', reviewerId: m.reviewerId, label: `${name(m.reviewerId)} rates ${m.status} results (${m.gap > 0 ? '+' : '−'}${Math.abs(m.gap).toFixed(2)})` }));
  const far: AgendaItem[] = farFlags(state).map((f) => ({
    key: f.key,
    kind: 'far',
    personId: f.personId,
    reviewerId: f.reviewerId,
    label: `${name(f.personId)}: rated ${f.overall}, results suggest ${f.suggested.toFixed(1)}`,
  }));
  return [...gaps, ...far];
}

export function unresolvedItems(state: DemoState): AgendaItem[] {
  return state.calibration.agenda.filter((a) => !a.resolution);
}

export function canLockCalibration(state: DemoState): boolean {
  return state.calibration.status === 'in_session' && unresolvedItems(state).length === 0;
}

export interface TeamCalibration {
  reviewerId: string;
  n: number;
  before: number;
  after: number;
  suggested: number;
}

/** Per manager: average rating before and after calibration against what results suggest. */
export function teamCalibration(state: DemoState): TeamCalibration[] {
  return managerConsistency(state)
    .filter((m) => m.n > 0)
    .map((m) => {
      const after = m.reviews.map((r) => {
        const review = state.managerReviews.find((x) => x.personId === r.personId)!;
        return finalRating(review) ?? r.overall;
      });
      return {
        reviewerId: m.reviewerId,
        n: m.n,
        before: m.meanRating,
        after: after.reduce((a, b) => a + b, 0) / after.length,
        suggested: m.meanSuggested,
      };
    });
}
