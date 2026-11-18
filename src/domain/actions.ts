import { createSeed } from '../data/seed';
import { addDays } from './dates';
import type { DemoState, LogEntry } from './types';

/**
 * Every change to the demo state goes through `reduce`. It is pure, so the
 * rules can be tested without the UI. Automatic rules (escalation) run after
 * every action in `applyAutomaticRules`.
 */
export type Action =
  | { type: 'reset' }
  | { type: 'advance_day' };

export function nextLogId(state: DemoState): string {
  const max = state.log.reduce((m, l) => Math.max(m, Number(l.id.slice(1)) || 0), 0);
  return `l${max + 1}`;
}

export function withLog(state: DemoState, entry: Omit<LogEntry, 'id' | 'on'> & { on?: string }): DemoState {
  return { ...state, log: [...state.log, { id: nextLogId(state), on: entry.on ?? state.today, ...entry }] };
}

export function applyAutomaticRules(state: DemoState): DemoState {
  return state;
}

function reduceRaw(state: DemoState, action: Action): DemoState {
  switch (action.type) {
    case 'reset':
      return createSeed();
    case 'advance_day':
      return { ...state, today: addDays(state.today, 1) };
  }
}

export function reduce(state: DemoState, action: Action): DemoState {
  return applyAutomaticRules(reduceRaw(state, action));
}
