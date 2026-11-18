import { farFlags, managerConsistency } from './flags';
import type { DemoState } from './types';

export interface Blocker {
  kind: 'open_review' | 'flag';
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
  const gaps: Blocker[] = managerConsistency(state)
    .filter((m) => m.flagged && !m.review)
    .map((m) => ({ kind: 'flag', key: m.key, text: `${name(m.reviewerId)} rates ${m.status} results`, href: '#/hr/consistency' }));
  const far: Blocker[] = farFlags(state)
    .filter((f) => !f.review)
    .map((f) => ({ kind: 'flag', key: f.key, text: `${name(f.personId)}: rated ${f.direction} results`, href: '#/hr/consistency' }));
  return [...open, ...gaps, ...far];
}

export function canRelease(state: DemoState): boolean {
  return state.cycle.status === 'open' && releaseBlockers(state).length === 0;
}

export function isReleased(state: DemoState): boolean {
  return state.cycle.status === 'released';
}
