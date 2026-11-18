import { farFlags, managerConsistency } from './flags';
import { nameWithRole } from './selectors';
import { eligibilityHint } from './eligibility';
import type { DemoState } from './types';

export interface Blocker {
  kind: 'open_review' | 'flag' | 'calibration';
  key: string;
  text: string;
  href: string;
  /** Link text for the place where the blocker can be fixed. */
  action: string;
}

/** Everything that must be resolved before results can be released. */
export function releaseBlockers(state: DemoState): Blocker[] {
  const name = (id: string) => state.people.find((p) => p.id === id)?.name ?? id;
  const first = (id: string) => name(id).split(' ')[0];
  const fmt = (d: string) => { const [, m, day] = d.split('-').map(Number); return `${day} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m - 1]}`; };
  const open: Blocker[] = state.participants
    .filter((p) => !p.removed && state.managerReviews.find((r) => r.personId === p.personId)?.status !== 'submitted')
    .map((p) => {
      const who = state.people.find((x) => x.id === p.personId)!;
      // A new joiner usually needs removing, not reviewing: point HR there.
      if (eligibilityHint(state, who)) {
        return { kind: 'open_review' as const, key: `open:${p.personId}`, text: `${who.name}: joined under 3 months ago and still in the cycle`, href: '#/hr/progress', action: 'Remove in Progress' };
      }
      return {
      kind: 'open_review' as const,
      key: `open:${p.personId}`,
      text: p.escalatedFrom
        ? `${name(p.personId)}: escalated to ${nameWithRole(state, p.reviewerId)} on ${fmt(p.escalatedOn!)}, waiting for their review`
        : `${name(p.personId)}: waiting for ${name(p.reviewerId)}'s review`,
      href: `#/manager/review/${p.personId}?as=${p.reviewerId}`,
      action: `Open as ${first(p.reviewerId)}`,
      };
    });
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
          action: 'Open Calibration',
        }];
  return [...open, ...cal];
}

/** Flags still waiting for an HR note (informational in the calibration build). */
export function unreviewedFlags(state: DemoState): Blocker[] {
  const name = (id: string) => state.people.find((p) => p.id === id)?.name ?? id;
  const gaps: Blocker[] = managerConsistency(state)
    .filter((m) => m.flagged && !m.review)
    .map((m) => ({ kind: 'flag', key: m.key, text: `${name(m.reviewerId)}'s ratings: ${m.status} results`, href: '#/hr/consistency', action: 'Check in Consistency' }));
  const far: Blocker[] = farFlags(state)
    .filter((f) => !f.review)
    .map((f) => ({ kind: 'flag', key: f.key, text: `${name(f.personId)}'s rating: ${f.direction} results`, href: '#/hr/consistency', action: 'Check in Consistency' }));
  return [...gaps, ...far];
}

export function canRelease(state: DemoState): boolean {
  return state.cycle.status === 'open' && releaseBlockers(state).length === 0;
}

export function isReleased(state: DemoState): boolean {
  return state.cycle.status === 'released';
}
