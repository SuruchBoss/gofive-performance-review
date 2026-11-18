import { CONFIG } from './config';
import { addMonths } from './dates';
import type { DemoState, Person } from './types';

/** People who joined after this date get a "may not be eligible" hint. */
export function eligibilityCutoff(state: DemoState): string {
  return addMonths(state.cycle.periodEnd, -CONFIG.ELIGIBILITY_MIN_MONTHS);
}

export function eligibilityHint(state: DemoState, p: Person): string | undefined {
  if (p.startDate > eligibilityCutoff(state)) return 'Joined under 3 months before the period end';
  return undefined;
}
