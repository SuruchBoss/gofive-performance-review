import { createSeed } from '../data/seed';
import { addDays } from './dates';
import type { DemoState, LogEntry, ManagerReview } from './types';
import { person } from './selectors';
import { reviewProblems, suggestionFor } from './rating';
import { daysLate, selfReviewWindow } from './selfReview';
import type { Rating } from './types';

/**
 * Every change to the demo state goes through `reduce`. It is pure, so the
 * rules can be tested without the UI. Automatic rules (escalation) run after
 * every action in `applyAutomaticRules`.
 */
export type ReviewPatch = Partial<Pick<ManagerReview, 'behaviour' | 'overall' | 'overallEvidence' | 'deviationReason' | 'comment'>>;

export type Action =
  | { type: 'reset' }
  | { type: 'advance_day' }
  | { type: 'save_review'; personId: string; patch: ReviewPatch }
  | { type: 'submit_review'; personId: string; actorId: string }
  | { type: 'save_self_review'; personId: string; text?: string; selfRating?: Rating }
  | { type: 'submit_self_review'; personId: string }
  | { type: 'review_flag'; flagKey: string; note: string; actorId: string; label: string };

export function nextLogId(state: DemoState): string {
  const max = state.log.reduce((m, l) => Math.max(m, Number(l.id.slice(1)) || 0), 0);
  return `l${max + 1}`;
}

export function withLog(state: DemoState, entry: Omit<LogEntry, 'id' | 'on'> & { on?: string }): DemoState {
  return { ...state, log: [...state.log, { id: nextLogId(state), on: entry.on ?? state.today, ...entry }] };
}

export function applyAutomaticRules(state: DemoState): DemoState {
  return state;
}

function updateReview(state: DemoState, personId: string, fn: (r: ManagerReview) => ManagerReview): DemoState {
  return { ...state, managerReviews: state.managerReviews.map((r) => (r.personId === personId ? fn(r) : r)) };
}

function reduceRaw(state: DemoState, action: Action): DemoState {
  switch (action.type) {
    case 'save_self_review': {
      const w = selfReviewWindow(state, action.personId);
      if (w !== 'open' && w !== 'open_late') return state;
      return {
        ...state,
        selfReviews: state.selfReviews.map((r) =>
          r.personId === action.personId
            ? { ...r, status: 'draft', text: action.text ?? r.text, selfRating: action.selfRating ?? r.selfRating }
            : r,
        ),
      };
    }
    case 'submit_self_review': {
      const w = selfReviewWindow(state, action.personId);
      const self = state.selfReviews.find((r) => r.personId === action.personId);
      if ((w !== 'open' && w !== 'open_late') || !self || !self.text.trim() || !self.selfRating) return state;
      const late = w === 'open_late';
      const next = {
        ...state,
        selfReviews: state.selfReviews.map((r) =>
          r.personId === action.personId ? { ...r, status: 'submitted' as const, submittedOn: state.today, late } : r,
        ),
      };
      if (!late) return next;
      const d = daysLate(state);
      return withLog(next, {
        actorId: action.personId,
        type: 'self_review_late',
        targetId: action.personId,
        detail: `Self-review submitted ${d} day${d === 1 ? '' : 's'} after the deadline.`,
      });
    }
    case 'review_flag': {
      const note = action.note.trim();
      if (!note || state.flagReviews.some((f) => f.flagKey === action.flagKey)) return state;
      const next = { ...state, flagReviews: [...state.flagReviews, { flagKey: action.flagKey, note, by: action.actorId, on: state.today }] };
      return withLog(next, { actorId: action.actorId, type: 'flag_reviewed', detail: `Reviewed flag: ${action.label}. Note: ${note}` });
    }
    case 'reset':
      return createSeed();
    case 'advance_day':
      return { ...state, today: addDays(state.today, 1) };
    case 'save_review':
      return updateReview(state, action.personId, (r) =>
        r.status === 'submitted' ? r : { ...r, ...action.patch, status: 'draft' },
      );
    case 'submit_review': {
      const review = state.managerReviews.find((r) => r.personId === action.personId);
      if (!review || review.status === 'submitted') return state;
      const suggested = suggestionFor(state, action.personId).value;
      if (reviewProblems(review, suggested).length > 0) return state;
      const self = state.selfReviews.find((r) => r.personId === action.personId);
      const next = updateReview(state, action.personId, (r) => ({
        ...r,
        status: 'submitted',
        submittedOn: state.today,
        suggestedAtSubmit: Math.round(suggested * 100) / 100,
        selfReviewMissing: self?.status !== 'submitted',
      }));
      return withLog(next, {
        actorId: action.actorId,
        type: 'review_submitted',
        targetId: action.personId,
        detail: `Submitted the review for ${person(state, action.personId).name}.`,
      });
    }
  }
}

export function reduce(state: DemoState, action: Action): DemoState {
  return applyAutomaticRules(reduceRaw(state, action));
}
