import { answerAwaitingHr, caseInfo, openReturn } from './deadlines';
import { eligibilityHint } from './eligibility';
import { releaseBlockers, type Blocker } from './release';
import type { DemoState, Participant } from './types';

/**
 * What each person's home lists as "to do now". Pure, so the lists can be tested.
 * Nothing here is a new rule: it only groups what the existing rules already say.
 */
export interface HrAttention {
  /** Joined less than 3 months before the period end: suggested to leave out. */
  tooNew: Participant[];
  /** Reviews a manager still has to write (late, moved up, or simply not in yet). */
  toWrite: Participant[];
  late: Participant[];
  /** Sent back by HR, waiting for the manager's answer. */
  waitingForAnswer: Participant[];
  /** Answered by the manager, waiting for HR to accept or ask again. */
  answers: Participant[];
  /** Ratings that do not match results and have not been checked. */
  toCheck: Blocker[];
  /** Calibration build: final ratings are not agreed and locked yet. */
  finalRatings?: Blocker;
  groups: number;
}

export function hrAttention(state: DemoState): HrAttention {
  const review = (id: string) => state.managerReviews.find((r) => r.personId === id)!;
  const active = state.participants.filter((p) => !p.removed);
  const open = active.filter((p) => review(p.personId).status !== 'submitted');
  const tooNew = open.filter((p) => eligibilityHint(state, state.people.find((x) => x.id === p.personId)!));
  const waitingForAnswer = open.filter((p) => openReturn(review(p.personId)));
  const toWrite = open.filter((p) => !tooNew.includes(p) && !waitingForAnswer.includes(p));
  const late = toWrite.filter((p) => ['overdue', 'escalated'].includes(caseInfo(state, p.personId).status));
  const answers = active.filter((p) => review(p.personId).status === 'submitted' && answerAwaitingHr(review(p.personId)));
  const toCheck = releaseBlockers(state).filter((b) => b.kind === 'flag' && !b.key.startsWith('answer:'));
  const finalRatings = releaseBlockers(state).find((b) => b.kind === 'calibration');
  const groups = [tooNew, toWrite, waitingForAnswer, answers, toCheck].filter((g) => g.length > 0).length + (finalRatings ? 1 : 0);
  return { tooNew, toWrite, late, waitingForAnswer, answers, toCheck, finalRatings, groups };
}

export interface ManagerTodo {
  /** HR sent these back with a question: answer first. */
  returned: Participant[];
  /** Reviews to write, drafts first. */
  toWrite: Participant[];
  done: Participant[];
  /** Reviews that were this manager's and moved to their own manager. */
  movedAway: Participant[];
}

export function managerTodo(state: DemoState, userId: string): ManagerTodo {
  const review = (id: string) => state.managerReviews.find((r) => r.personId === id)!;
  const mine = state.participants.filter((p) => p.reviewerId === userId && !p.removed);
  const returned = mine.filter((p) => openReturn(review(p.personId)));
  const toWrite = mine
    .filter((p) => review(p.personId).status !== 'submitted' && !returned.includes(p))
    .sort((a, b) => (review(a.personId).status === 'draft' ? 0 : 1) - (review(b.personId).status === 'draft' ? 0 : 1));
  const done = mine.filter((p) => review(p.personId).status === 'submitted');
  const movedAway = state.participants.filter((p) => p.escalatedFrom === userId && !p.removed);
  return { returned, toWrite, done, movedAway };
}
