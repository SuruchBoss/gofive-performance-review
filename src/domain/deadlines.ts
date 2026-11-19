import { CONFIG } from './config';
import { addDays, daysBetween } from './dates';
import type { DemoState, IsoDate, ManagerReview, Participant } from './types';

/** The question HR sent back that the manager has not answered yet, if any. */
export function openReturn(review: Pick<ManagerReview, 'returns'>) {
  const last = review.returns?.at(-1);
  return last && !last.answeredOn ? last : undefined;
}

export function effectiveDeadline(state: DemoState, p: Participant): IsoDate {
  return p.extension?.until ?? state.cycle.managerDeadline;
}

/** The date the review escalates if still open. Fixed once the case has escalated. */
export function escalationDate(state: DemoState, p: Participant): IsoDate {
  return p.escalatedOn ?? addDays(effectiveDeadline(state, p), CONFIG.ESCALATION_DAYS);
}

export type CaseStatus = 'removed' | 'submitted' | 'returned' | 'due' | 'overdue' | 'escalated';

export interface CaseInfo {
  status: CaseStatus;
  deadline: IsoDate;
  daysOverdue: number;
  escalatesOn?: IsoDate;
}

export function caseInfo(state: DemoState, personId: string): CaseInfo {
  const p = state.participants.find((x) => x.personId === personId)!;
  const review = state.managerReviews.find((r) => r.personId === personId)!;
  const deadline = effectiveDeadline(state, p);
  const daysOverdue = Math.max(0, daysBetween(deadline, state.today));
  if (p.removed) return { status: 'removed', deadline, daysOverdue: 0 };
  if (review.status === 'submitted') return { status: 'submitted', deadline, daysOverdue: 0 };
  // A review HR sent back is waiting for the manager's answer; the original deadline no longer applies.
  if (openReturn(review)) return { status: 'returned', deadline, daysOverdue: 0 };
  if (p.escalatedOn) return { status: 'escalated', deadline, daysOverdue };
  if (state.today > deadline) return { status: 'overdue', deadline, daysOverdue, escalatesOn: escalationDate(state, p) };
  return { status: 'due', deadline, daysOverdue: 0, escalatesOn: escalationDate(state, p) };
}

/**
 * Escalate every open review that is ESCALATION_DAYS past its effective deadline
 * to the current reviewer's own manager. Runs after every action; idempotent
 * because a case escalates only once.
 */
export function applyEscalations(state: DemoState): DemoState {
  let next = state;
  for (const p of state.participants) {
    if (p.removed || p.escalatedOn) continue;
    const review = state.managerReviews.find((r) => r.personId === p.personId);
    if (!review || review.status === 'submitted' || openReturn(review)) continue;
    const due = escalationDate(state, p);
    if (state.today < due) continue;
    const from = state.people.find((x) => x.id === p.reviewerId);
    const to = from?.managerId ? state.people.find((x) => x.id === from.managerId) : undefined;
    if (!from || !to) continue;
    const employee = state.people.find((x) => x.id === p.personId)!;
    next = {
      ...next,
      participants: next.participants.map((x) => (x.personId === p.personId ? { ...x, reviewerId: to.id, escalatedFrom: from.id, escalatedOn: due } : x)),
      managerReviews: next.managerReviews.map((r) => (r.personId === p.personId ? { ...r, reviewerId: to.id } : r)),
    };
    const maxId = next.log.reduce((m, l) => Math.max(m, Number(l.id.slice(1)) || 0), 0);
    next = {
      ...next,
      log: [
        ...next.log,
        {
          id: `l${maxId + 1}`,
          on: due,
          actorId: 'system',
          type: 'escalation',
          targetId: p.personId,
          detail: `Review of ${employee.name} escalated from ${from.name} to ${to.name}: ${CONFIG.ESCALATION_DAYS} days past the deadline.`,
        },
      ],
    };
  }
  return next;
}
