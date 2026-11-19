import { CONFIG } from '../domain/config';

/** One-line explanations, used wherever the term appears so the wording is always the same. */
export const TERMS = {
  suggested: 'What the measured goal results alone point to. The manager makes the final call.',
  far: `An overall rating ${CONFIG.FAR_FROM_SUGGESTION.toFixed(1)} or more away from the suggestion. It needs a written reason.`,
  gap: `How far a manager's average rating sits from what their own team's results suggest. ${CONFIG.MANAGER_GAP_FLAG} or more is flagged.`,
  escalated: `Moved to the reviewer's own manager, ${CONFIG.ESCALATION_DAYS} days after a missed deadline.`,
  behaviour: "The average of the manager's four behaviour ratings, each judged against written anchors.",
  results: 'Goal results as a 1–5 score: 100% of target is a 3.',
  anchors: 'Each level 1–5 has a short written description (hover over a number, or pick it), so the same number means the same thing for every manager.',
} as const;
