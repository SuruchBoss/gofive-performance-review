import type { DemoState, Person } from './types';

export function person(state: DemoState, id: string): Person {
  const p = state.people.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown person ${id}`);
  return p;
}

export function teamName(state: DemoState, teamId?: string): string {
  return state.teams.find((t) => t.id === teamId)?.name ?? '';
}

export const firstName = (p: Person) => p.name.split(' ')[0];

export function reviewersForPicker(state: DemoState): Person[] {
  return state.people.filter((p) => p.kind === 'manager' || p.kind === 'head');
}

export function employeesForPicker(state: DemoState): Person[] {
  return state.people.filter((p) => p.kind === 'employee');
}

export function selfReviewOf(state: DemoState, personId: string) {
  return state.selfReviews.find((r) => r.personId === personId)!;
}

export function managerReviewOf(state: DemoState, personId: string) {
  return state.managerReviews.find((r) => r.personId === personId)!;
}

export function participantOf(state: DemoState, personId: string) {
  return state.participants.find((r) => r.personId === personId);
}

export function goalsOf(state: DemoState, personId: string) {
  return state.goals.filter((g) => g.personId === personId);
}
