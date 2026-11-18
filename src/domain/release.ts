import { farFlags, managerConsistency } from './flags';
import type { DemoState } from './types';

export interface Blocker {
  kind: 'open_review' | 'flag' | 'calibration';
  key: string;
  text: string;
  href: string;
}

/** Everything that must be resolved before results can be released. */
export function releaseBlockers(state: DemoState): Blocker[] {
  const name = (id: string) => state.people.find((p) => p.id === id)?.name ?? id;
  const open: Blocker[] = state.participants
    .filter((p) => !p.removed && state.managerReviews.find((r) => r.personId === p.personId)?.status !== 'submitted')
    .map((p) => ({ kind: 'open_review', key: `open:${p.personId}`, text: `${name(p.personId)}: review not submitted (${name(p.reviewerId)})`, href: '#/hr/progress' }));
  // With calibration, the flags are dealt with in the calibration session (they are its
  // agenda), so the release gate asks for a locked calibration instead of HR flag notes.
  const cal: Blocker[] =
    state.calibration.status === 'locked'
      ? []
      : [{
          kind: 'calibration',
          key: 'calibration',
          text: state.calibration.status === 'in_session' ? 'Calibration is in session: resolve the agenda and lock it' : 'Calibration has not started',
          href: '#/hr/calibration',
        }];
  return [...open, ...cal];
}

/** Flags still waiting for an HR note (informational in the calibration build). */
export function unreviewedFlags(state: DemoState): Blocker[] {
  const name = (id: string) => state.people.find((p) => p.id === id)?.name ?? id;
  const gaps: Blocker[] = managerConsistency(state)
    .filter((m) => m.flagged && !m.review)
    .map((m) => ({ kind: 'flag', key: m.key, text: `${name(m.reviewerId)} rates ${m.status} results`, href: '#/hr/consistency' }));
  const far: Blocker[] = farFlags(state)
    .filter((f) => !f.review)
    .map((f) => ({ kind: 'flag', key: f.key, text: `${name(f.personId)}: rated ${f.direction} results`, href: '#/hr/consistency' }));
  return [...gaps, ...far];
}

export function canRelease(state: DemoState): boolean {
  return state.cycle.status === 'open' && releaseBlockers(state).length === 0;
}

export function isReleased(state: DemoState): boolean {
  return state.cycle.status === 'released';
}
