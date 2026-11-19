import { createSeed } from '../data/seed';
import { addDays } from './dates';
import type { DemoState, LogEntry, ManagerReview } from './types';
import { person } from './selectors';
import { reviewProblems, suggestionFor } from './rating';
import { daysLate, selfReviewWindow } from './selfReview';
import type { IsoDate, Rating } from './types';
import { answerAwaitingHr, applyEscalations, effectiveDeadline, openReturn } from './deadlines';
import { farFlags } from './flags';
import { formatDate } from './dates';
import { canRelease } from './release';

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
  | { type: 'submit_review'; personId: string; actorId: string; answer?: string }
  | { type: 'return_to_manager'; personId: string; flagKey: string; question: string; actorId: string }
  | { type: 'accept_answer'; personId: string; actorId: string }
  | { type: 'demo_note'; detail: string }
  | { type: 'save_self_review'; personId: string; text?: string; selfRating?: Rating }
  | { type: 'submit_self_review'; personId: string }
  | { type: 'remind'; personId: string; actorId: string }
  | { type: 'extend'; personId: string; until: IsoDate; reason: string; actorId: string }
  | { type: 'remove'; personId: string; reason: string; actorId: string }
  | { type: 'release'; actorId: string }
  | { type: 'change_deadline'; field: 'selfReviewDeadline' | 'managerDeadline'; date: IsoDate; actorId: string }
  | { type: 'review_flag'; flagKey: string; note: string; actorId: string; label: string };

export function nextLogId(state: DemoState): string {
  const max = state.log.reduce((m, l) => Math.max(m, Number(l.id.slice(1)) || 0), 0);
  return `l${max + 1}`;
}

export function withLog(state: DemoState, entry: Omit<LogEntry, 'id' | 'on'> & { on?: string }): DemoState {
  return { ...state, log: [...state.log, { id: nextLogId(state), on: entry.on ?? state.today, ...entry }] };
}

export function applyAutomaticRules(state: DemoState): DemoState {
  return applyEscalations(state);
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
    case 'remind': {
      if (state.cycle.status !== 'open') return state;
      const p = state.participants.find((x) => x.personId === action.personId);
      const r = state.managerReviews.find((x) => x.personId === action.personId);
      if (!p || p.removed || r?.status === 'submitted') return state;
      const next = { ...state, participants: state.participants.map((x) => (x === p ? { ...x, lastRemindedOn: state.today } : x)) };
      return withLog(next, {
        actorId: action.actorId,
        type: 'reminder',
        targetId: action.personId,
        detail: `Reminded ${person(state, p.reviewerId).name} to review ${person(state, p.personId).name}.`,
      });
    }
    case 'extend': {
      if (state.cycle.status !== 'open') return state;
      const p = state.participants.find((x) => x.personId === action.personId);
      const r = state.managerReviews.find((x) => x.personId === action.personId);
      const reason = action.reason.trim();
      if (!p || p.removed || r?.status === 'submitted' || !reason) return state;
      if (action.until <= state.today || action.until <= effectiveDeadline(state, p)) return state;
      const next = {
        ...state,
        participants: state.participants.map((x) => (x === p ? { ...x, extension: { until: action.until, reason, by: action.actorId } } : x)),
      };
      return withLog(next, {
        actorId: action.actorId,
        type: 'extension',
        targetId: action.personId,
        detail: `Extended the review of ${person(state, p.personId).name} to ${formatDate(action.until)}. Reason: ${reason}`,
      });
    }
    case 'remove': {
      const p = state.participants.find((x) => x.personId === action.personId);
      const reason = action.reason.trim();
      if (!p || p.removed || !reason || state.cycle.status === 'released') return state;
      const next = {
        ...state,
        participants: state.participants.map((x) => (x === p ? { ...x, removed: { on: state.today, reason, by: action.actorId } } : x)),
      };
      return withLog(next, {
        actorId: action.actorId,
        type: 'removal',
        targetId: action.personId,
        detail: `Removed ${person(state, p.personId).name} from the cycle. Reason: ${reason}`,
      });
    }
    case 'release': {
      if (!canRelease(state)) return state;
      const count = state.participants.filter((p) => !p.removed).length;
      const next = { ...state, cycle: { ...state.cycle, status: 'released' as const, releasedOn: state.today } };
      return withLog(next, { actorId: action.actorId, type: 'release', detail: `Released results to ${count} employees.` });
    }
    case 'change_deadline': {
      const old = state.cycle[action.field];
      if (state.cycle.status !== 'open' || !action.date || action.date === old || action.date < state.cycle.openedOn) return state;
      const next = { ...state, cycle: { ...state.cycle, [action.field]: action.date } };
      const label = action.field === 'managerDeadline' ? 'Manager review deadline' : 'Self-review deadline';
      return withLog(next, { actorId: action.actorId, type: 'deadline_change', detail: `${label} changed from ${formatDate(old)} to ${formatDate(action.date)}.` });
    }
    case 'return_to_manager': {
      const review = state.managerReviews.find((r) => r.personId === action.personId);
      const question = action.question.trim();
      if (state.cycle.status !== 'open' || !review || review.status !== 'submitted' || review.overall === undefined || !question) return state;
      // Asking again closes HR's decision on the previous answer.
      const again = answerAwaitingHr(review);
      const next = updateReview(state, action.personId, (r) => ({
        ...r,
        status: 'draft',
        returns: [
          ...(r.returns ?? []).map((x) => (x === again ? { ...x, hrDecision: 'asked_again' as const, decidedOn: state.today, decidedBy: action.actorId } : x)),
          { question, flagKey: action.flagKey, on: state.today, by: action.actorId, ratingBefore: r.overall! },
        ],
      }));
      return withLog(next, {
        actorId: action.actorId,
        type: 'returned_to_manager',
        targetId: action.personId,
        detail: `${again ? 'Asked again about' : 'Returned'} ${person(state, action.personId).name}'s review ${again ? 'with' : 'to'} ${person(state, review.reviewerId).name}. Question: ${question}`,
      });
    }
    case 'accept_answer': {
      const review = state.managerReviews.find((r) => r.personId === action.personId);
      const pending = review && answerAwaitingHr(review);
      if (state.cycle.status !== 'open' || !review || !pending) return state;
      let next = updateReview(state, action.personId, (r) => ({
        ...r,
        returns: r.returns!.map((x) => (x === pending ? { ...x, hrDecision: 'accepted' as const, decidedOn: state.today, decidedBy: action.actorId } : x)),
      }));
      // Accepting closes the flag that started the return, and the person's current
      // far-from-results flag if the manager's new rating is still far (HR has just read why).
      const keys = [pending.flagKey, ...farFlags(next).filter((f) => f.personId === action.personId).map((f) => f.key)];
      const note = `Returned to manager. Answer accepted: ${pending.answer}`;
      for (const flagKey of new Set(keys)) {
        if (!next.flagReviews.some((f) => f.flagKey === flagKey)) {
          next = { ...next, flagReviews: [...next.flagReviews, { flagKey, note, by: action.actorId, on: state.today }] };
        }
      }
      return withLog(next, {
        actorId: action.actorId,
        type: 'return_accepted',
        targetId: action.personId,
        detail: `Accepted ${person(state, review.reviewerId).name}'s answer on ${person(state, action.personId).name}'s review. Answer: ${pending.answer}`,
      });
    }
    case 'demo_note':
      return withLog(state, { actorId: 'demo', type: 'demo_shortcut', detail: action.detail });
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
      const pending = openReturn(review);
      const answer = action.answer?.trim();
      // A review HR sent back needs an answer to HR's question before it goes back.
      if (pending && !answer) return state;
      const self = state.selfReviews.find((r) => r.personId === action.personId);
      let next = updateReview(state, action.personId, (r) => ({
        ...r,
        status: 'submitted',
        submittedOn: state.today,
        suggestedAtSubmit: Math.round(suggested * 100) / 100,
        selfReviewMissing: r.returns?.length ? r.selfReviewMissing : self?.status !== 'submitted',
        returns: pending
          ? r.returns!.map((x) => (x === pending ? { ...x, answer, answeredOn: state.today, outcome: r.overall === x.ratingBefore ? ('confirmed' as const) : ('changed' as const) } : x))
          : r.returns,
      }));
      if (pending) {
        const outcome = review.overall === pending.ratingBefore ? `confirmed ${review.overall}` : `changed ${pending.ratingBefore} → ${review.overall}`;
        next = withLog(next, {
          actorId: action.actorId,
          type: 'return_answered',
          targetId: action.personId,
          detail: `${person(state, action.actorId).name} answered HR on ${person(state, action.personId).name}'s review and ${outcome}. Answer: ${answer}`,
        });
        // HR now accepts the answer or asks again; release waits for that.
        return next;
      }
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
