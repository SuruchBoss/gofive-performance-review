import { answerAwaitingHr, openReturn } from '../../domain/deadlines';
import { eligibilityHint } from '../../domain/eligibility';
import { allFlags } from '../../domain/flags';
import { releaseBlockers } from '../../domain/release';
import { selfReviewWindow } from '../../domain/selfReview';
import type { DemoState } from '../../domain/types';
import type { Guide } from './tips';

/** One coachmark: the control it points at (by its `data-tour` name) and a short note. */
export interface Mark {
  target: string;
  text: string;
  /** Used when the target is not on screen: the instruction in words. */
  fallback?: string;
  prefer?: 'above' | 'below';
}

/** The marks for the current guide step on the current screen. */
export interface Scene { id: string; marks: Mark[] }

export interface Loc { role: Guide; userId: string; path: string }

const firstName = (state: DemoState, id: string) => (state.people.find((p) => p.id === id)?.name ?? id).split(' ')[0];

/** A manager's review form: an open review, or one HR sent back with a question. */
function reviewScene(state: DemoState, loc: Loc): Scene | undefined {
  const id = loc.role === 'manager' ? loc.path.match(/^\/manager\/review\/(\w+)/)?.[1] : undefined;
  const review = id ? state.managerReviews.find((r) => r.personId === id) : undefined;
  if (!id || !review || review.status === 'submitted') return undefined;
  if (openReturn(review)) {
    return {
      id: `answer:${id}`,
      marks: [
        { target: 'review-answer', prefer: 'above', text: 'HR sent this review back with a question. Write your answer here; you can also change the rating above.' },
        { target: 'review-submit', text: 'Send your answer. HR then accepts it or asks again.' },
      ],
    };
  }
  return {
    id: `review:${id}`,
    marks: [
      { target: 'review-behaviour', prefer: 'above', text: 'Rate each of the four behaviours. Every level shows its written description when you pick it.' },
      { target: 'review-overall', prefer: 'above', text: 'Pick the overall rating. A rating far from what goal results suggest asks for a reason; a 1, 2 or 5 also asks for an example.' },
      { target: 'review-submit', text: 'Submit when nothing is left. The review then locks, and HR checks it before release.' },
    ],
  };
}

function removeScene(state: DemoState, loc: Loc): Scene | undefined {
  if (loc.role !== 'hr' || !loc.path.startsWith('/hr/progress')) return undefined;
  const p = state.participants.find((x) => {
    const who = state.people.find((y) => y.id === x.personId);
    return !x.removed && !!who && !!eligibilityHint(state, who) && state.managerReviews.find((r) => r.personId === x.personId)?.status !== 'submitted';
  });
  if (!p) return undefined;
  const name = firstName(state, p.personId);
  return {
    id: `remove:${p.personId}`,
    marks: [{
      target: 'remove-ineligible',
      text: `${name} joined too late for this cycle. Press “Remove from cycle” and give a reason.`,
      fallback: `${name} joined too late for this cycle. Find ${name} in the list and use “Remove from cycle”.`,
    }],
  };
}

/** HR's work on the Consistency screen, in the order it blocks release. */
function consistencyScene(state: DemoState, loc: Loc, withReturnTip: boolean): Scene | undefined {
  if (loc.role !== 'hr' || !loc.path.startsWith('/hr/consistency')) return undefined;
  if (state.managerReviews.some((r) => r.status === 'submitted' && answerAwaitingHr(r))) {
    return { id: 'accept', marks: [{ target: 'accept-answer', text: 'The manager has answered: accept the answer or ask again. Release waits until you accept.' }] };
  }
  if (allFlags(state).some((f) => !f.reviewed)) {
    const marks: Mark[] = [{ target: 'flag-mark', text: 'Each card compares a manager with their own team’s results. When you have checked a flag, press “Mark reviewed” and note what you checked.' }];
    if (withReturnTip) marks.push({ target: 'return-e01', text: 'Or send one rating back: “Return to manager” reopens the review with your question.' });
    return { id: 'flags', marks };
  }
  if (state.managerReviews.some((r) => openReturn(r))) {
    return { id: 'waiting', marks: [{ target: 'open-returned', text: 'This review is waiting for its manager. Open it as the manager to answer HR’s question.' }] };
  }
  return undefined;
}

const CLOCK_FALLBACK = 'Open Demo ▾ at the top and press “+1 day” twice.';

/**
 * The coachmarks for a guide step on the screen the reviewer is looking at.
 * Returns nothing when this screen is not where the step happens; the caller then
 * points at the guide's own link to the right screen.
 */
export function sceneFor(guide: Guide, step: number, state: DemoState, loc: Loc): Scene | undefined {
  const at = (role: Guide, path: string, exact = false) => loc.role === role && (exact ? loc.path === path : loc.path.startsWith(path));

  if (guide === 'hr') {
    if (step === 0) return removeScene(state, loc);
    if (step === 1) return reviewScene(state, loc);
    if (step === 2) return consistencyScene(state, loc, true);
    if (step === 3) {
      return at('hr', '/hr/activity')
        ? { id: 'clock', marks: [{ target: 'guide-clock', text: 'Press “+1 day” twice. An open review moves to the manager’s own manager 3 days after its deadline, and the log below records it.', fallback: CLOCK_FALLBACK }] }
        : undefined;
    }
    if (step === 4) {
      if (at('hr', '/hr', true)) {
        return releaseBlockers(state).length > 0
          ? { id: 'blockers', marks: [{ target: 'blocker', text: 'This list is everything still blocking release. Each line links to where you fix it; start with the first.' }] }
          : { id: 'release', marks: [{ target: 'release', text: 'Everything is resolved. Release results: everyone sees their result at the same time.' }] };
      }
      return removeScene(state, loc) ?? consistencyScene(state, loc, false) ?? reviewScene(state, loc);
    }
  }

  if (guide === 'manager') {
    if (step === 0) return reviewScene(state, loc);
    if (step === 1) {
      return at('manager', '/manager', true) && loc.userId === 'm-ops'
        ? { id: 'clock', marks: [{ target: 'guide-clock', text: 'Press “+1 day” twice. An overdue review then moves from you to your own manager.', fallback: CLOCK_FALLBACK }] }
        : undefined;
    }
    if (step === 2) {
      const returned = state.managerReviews.find((r) => openReturn(r));
      if (!returned) {
        return at('hr', '/hr/consistency')
          ? { id: 'return', marks: [{ target: 'return-e01', text: 'Play HR for a moment: press “Return to manager” on Nida’s rating and write a question for her manager, Daniel.' }] }
          : undefined;
      }
      if (at('hr', '/hr/consistency')) {
        return { id: 'waiting', marks: [{ target: 'open-returned', text: `The review is now waiting for ${firstName(state, returned.reviewerId)}. Open it as the manager to answer.` }] };
      }
      if (at('manager', '/manager', true) && loc.userId === returned.reviewerId) {
        return { id: 'answer-hr', marks: [{ target: 'answer-hr', text: 'HR returned this review with a question. Open it to answer.' }] };
      }
      return reviewScene(state, loc);
    }
  }

  if (guide === 'employee' && loc.role === 'employee' && loc.userId === 'e12') {
    if (step === 0 && at('employee', '/me/self-review') && ['open', 'open_late'].includes(selfReviewWindow(state, 'e12'))) {
      return {
        id: 'self',
        marks: [
          { target: 'self-text', text: 'Write a few lines about your year. Your manager reads this next to your goal results.' },
          { target: 'self-rating', prefer: 'above', text: 'Choose your own rating. It is for information: it does not change the suggested rating.' },
          { target: 'self-submit', text: 'Submit when you are ready. It cannot be changed afterwards.' },
        ],
      };
    }
    if ((step === 1 || step === 2) && at('employee', '/me/result') && state.cycle.status === 'open') {
      const locked: Mark = { target: 'result-locked', text: 'Results stay locked until HR releases them, for everyone at the same time. This says what is still missing.' };
      return step === 1
        ? { id: 'locked', marks: [locked] }
        : { id: 'shortcut', marks: [locked, { target: 'demo-shortcut', prefer: 'above', text: 'To see a released result now, use this demo shortcut. It plays HR and the managers for you, under the normal rules.' }] };
    }
  }
  return undefined;
}
