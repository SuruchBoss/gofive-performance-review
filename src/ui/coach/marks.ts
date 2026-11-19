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

/** Filled in by the next commit (targets and marks for every step). */
export function sceneFor(_guide: Guide, _step: number, _state: DemoState, _loc: Loc): Scene | undefined {
  return undefined;
}
