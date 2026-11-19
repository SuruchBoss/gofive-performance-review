import { reduce } from './actions';
import { openReturn, answerAwaitingHr } from './deadlines';
import { eligibilityHint } from './eligibility';
import { reviewProblems, suggestionFor } from './rating';
import type { DemoState, Rating } from './types';

/**
 * Demo shortcut, not a product feature: it lets someone trying the employee path
 * see a released result without playing HR and every manager first.
 *
 * It changes nothing directly. It only dispatches the same actions people would,
 * as the people who would do them, so every rule (reasons, examples, removal,
 * flag reviews, the release gate) still applies, and each step is logged with a
 * "Demo shortcut" note.
 */
export const DEMO_TEXT = 'Demo shortcut: filled in automatically so the demo can reach release.';

export function skipToRelease(start: DemoState): DemoState {
  if (start.cycle.status !== 'open') return start;
  let s = reduce(start, {
    type: 'demo_note',
    detail: 'Demo shortcut used. The demo did the remaining steps below, each under the normal rules and logged as usual.',
  });
  const active = () => s.participants.filter((p) => !p.removed);

  // 1. People who joined too late are removed with a reason, as HR would.
  for (const p of active()) {
    const r = s.managerReviews.find((x) => x.personId === p.personId);
    const who = s.people.find((x) => x.id === p.personId)!;
    if (r?.status !== 'submitted' && eligibilityHint(s, who)) {
      s = reduce(s, { type: 'remove', personId: p.personId, reason: `${eligibilityHint(s, who)} (${DEMO_TEXT})`, actorId: 'hr' });
    }
  }

  // 2. Open reviews are finished by their current reviewer. Ratings already chosen are kept;
  //    a missing overall rating takes the rounded suggestion, so no reason is needed.
  for (const p of active()) {
    const r = s.managerReviews.find((x) => x.personId === p.personId)!;
    if (r.status === 'submitted') continue;
    const suggested = suggestionFor(s, p.personId);
    const fill = (v?: string) => (v?.trim() ? v : DEMO_TEXT);
    s = reduce(s, {
      type: 'save_review',
      personId: p.personId,
      patch: {
        behaviour: r.behaviour.map((b) => ({ ...b, rating: b.rating ?? (3 as Rating) })),
        overall: r.overall ?? suggested.rounded,
        comment: r.comment?.trim() ? r.comment : 'Demo shortcut: the demo finished this review, so no real comment was written.',
      },
    });
    const draft = s.managerReviews.find((x) => x.personId === p.personId)!;
    const problems = reviewProblems(draft, suggested.value).map((x) => x.field);
    if (problems.includes('deviationReason') || problems.includes('overallEvidence')) {
      s = reduce(s, {
        type: 'save_review',
        personId: p.personId,
        patch: {
          deviationReason: problems.includes('deviationReason') ? DEMO_TEXT : draft.deviationReason,
          overallEvidence: problems.includes('overallEvidence') ? fill(draft.overallEvidence) : draft.overallEvidence,
        },
      });
    }
    s = reduce(s, {
      type: 'submit_review',
      personId: p.personId,
      actorId: p.reviewerId,
      answer: openReturn(draft) ? `Rating kept. ${DEMO_TEXT}` : undefined,
    });
  }

  // 3. HR accepts any answers from managers.
  for (const r of s.managerReviews) {
    if (answerAwaitingHr(r)) s = reduce(s, { type: 'accept_answer', personId: r.personId, actorId: 'hr' });
  }

  // 4. Calibration build: the flags are the calibration agenda. HR runs the session with
  //    every manager, agrees each case without changing ratings, and locks it.
  if (s.calibration.status === 'not_started') {
    const attendees = s.people.filter((p) => p.kind === 'manager' || p.kind === 'head').map((p) => p.id);
    s = reduce(s, { type: 'start_calibration', attendees, actorId: 'hr' });
  }
  for (const a of s.calibration.agenda.filter((x) => !x.resolution)) {
    s = reduce(s, { type: 'resolve_item', key: a.key, note: 'Demo shortcut: agreed without a real discussion.', actorId: 'hr' });
  }
  if (s.calibration.status === 'in_session') s = reduce(s, { type: 'lock_calibration', actorId: 'hr' });

  // 5. Release, through the normal gate.
  return reduce(s, { type: 'release', actorId: 'hr' });
}
