import { reduce } from './actions';
import type { DemoState, Rating } from './types';

/** Shared steps for the rule tests. Not used by the app. */
const behaviour = (r: Rating) => ['quality', 'ownership', 'collaboration', 'customer'].map((competencyId) => ({ competencyId, rating: r }));

export function finishAllReviews(s: DemoState): DemoState {
  s = reduce(s, { type: 'remove', personId: 'e08', reason: 'New joiner', actorId: 'hr' });
  for (const id of ['e11', 'e12']) {
    s = reduce(s, { type: 'save_review', personId: id, patch: { behaviour: behaviour(3), overall: 3 } });
    s = reduce(s, { type: 'submit_review', personId: id, actorId: 'm-ops' });
  }
  return s;
}

export function runCalibration(s: DemoState): DemoState {
  s = reduce(s, { type: 'start_calibration', attendees: ['m-sales', 'm-support', 'm-ops', 'head'], actorId: 'hr' });
  for (const a of s.calibration.agenda) s = reduce(s, { type: 'resolve_item', key: a.key, note: 'Agreed', actorId: 'hr' });
  return reduce(s, { type: 'lock_calibration', actorId: 'hr' });
}

