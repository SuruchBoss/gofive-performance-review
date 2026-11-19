import { daysBetween } from './dates';
import type { DemoState } from './types';

export type SelfReviewWindow = 'submitted' | 'open' | 'open_late' | 'closed';

/**
 * A self-review can be submitted on time until the deadline, then late until
 * the manager submits their review. After that it is closed and recorded as missing.
 */
export function selfReviewWindow(state: DemoState, personId: string): SelfReviewWindow {
  const self = state.selfReviews.find((r) => r.personId === personId);
  const mgr = state.managerReviews.find((r) => r.personId === personId);
  const participant = state.participants.find((p) => p.personId === personId);
  if (self?.status === 'submitted') return 'submitted';
  if (!participant || participant.removed || mgr?.status === 'submitted' || !!mgr?.returns?.length || state.cycle.status === 'released') return 'closed';
  return state.today > state.cycle.selfReviewDeadline ? 'open_late' : 'open';
}

export function daysLate(state: DemoState): number {
  return Math.max(0, daysBetween(state.cycle.selfReviewDeadline, state.today));
}
