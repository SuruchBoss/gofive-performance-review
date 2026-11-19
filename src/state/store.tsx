import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react';
import { createSeed, SEED_VERSION } from '../data/seed';
import { reduce, type Action } from '../domain/actions';
import { finishManagerReviews, skipToRelease } from '../domain/demoShortcut';

/** Store actions: the product's actions plus the demo shortcut, which only replays product actions. */
export type StoreAction = Action | { type: 'demo_skip_to_release' } | { type: 'demo_finish_reviews' };
const storeReduce = (s: DemoState, a: StoreAction): DemoState => (a.type === 'demo_skip_to_release' ? skipToRelease(s) : a.type === 'demo_finish_reviews' ? finishManagerReviews(s) : reduce(s, a));
import type { DemoState } from '../domain/types';

const STATE_KEY = 'pr-demo:state';
const VIEW_KEY = 'pr-demo:view';

export type Role = 'hr' | 'manager' | 'employee';

export interface ViewState {
  role: Role;
  managerId: string;
  employeeId: string;
}

const DEFAULT_VIEW: ViewState = { role: 'hr', managerId: 'm-ops', employeeId: 'e12' };

function read<T>(key: string): T | undefined {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable (private mode). The demo still works for this visit.
  }
}

function loadState(): DemoState {
  const saved = read<DemoState>(STATE_KEY);
  return saved && saved.version === SEED_VERSION ? saved : createSeed();
}

interface Store {
  state: DemoState;
  dispatch: (a: StoreAction) => void;
  view: ViewState;
  setView: (v: Partial<ViewState>) => void;
  toast: string | undefined;
  notify: (msg: string) => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(storeReduce, undefined, loadState);
  const [view, setViewRaw] = useState<ViewState>(() => ({ ...DEFAULT_VIEW, ...read<ViewState>(VIEW_KEY) }));
  const [toast, setToast] = useState<string>();

  useEffect(() => write(STATE_KEY, state), [state]);
  useEffect(() => write(VIEW_KEY, view), [view]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(undefined), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const setView = useCallback((v: Partial<ViewState>) => setViewRaw((cur) => ({ ...cur, ...v })), []);
  const value = useMemo(() => ({ state, dispatch, view, setView, toast, notify: setToast }), [state, view, setView, toast]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore outside StoreProvider');
  return s;
}

export function resetView(): ViewState {
  return DEFAULT_VIEW;
}
