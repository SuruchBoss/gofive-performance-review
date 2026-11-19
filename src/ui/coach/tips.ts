import { IS_Q2_BUILD } from '../../build';

/** Coachmark tips are on or off per guide. */
export type Guide = 'hr' | 'manager' | 'employee';

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

/**
 * Remembers which guides have tips turned off ("Skip"), and which single tips were
 * closed in this session. Storage is optional: if it is missing or throws, the choice
 * lives in memory, so tips simply show once per session.
 */
export function createTipsStore(getStorage: () => StorageLike | undefined, key: string) {
  let off: Partial<Record<Guide, boolean>> = {};
  let closed = new Set<string>();
  let version = 0;
  const listeners = new Set<() => void>();
  try {
    const raw = getStorage()?.getItem(key);
    const parsed: unknown = raw ? JSON.parse(raw) : undefined;
    if (parsed && typeof parsed === 'object') off = parsed as Partial<Record<Guide, boolean>>;
  } catch {
    off = {};
  }
  const save = () => {
    try {
      getStorage()?.setItem(key, JSON.stringify(off));
    } catch {
      /* no storage: keep the choice in memory */
    }
    version += 1;
    listeners.forEach((l) => l());
  };
  return {
    isOff: (g: Guide) => off[g] === true,
    /** "Skip": no more tips for this guide. */
    skip(g: Guide) { off = { ...off, [g]: true }; save(); },
    /** "Show tips again": tips back on for every guide, including ones closed earlier. */
    showAgain() { off = {}; closed = new Set(); save(); },
    isClosed: (tipKey: string) => closed.has(tipKey),
    /** Esc or "Done": close this one tip until its step changes. */
    close(tipKey: string) { closed.add(tipKey); version += 1; listeners.forEach((l) => l()); },
    subscribe(l: () => void) { listeners.add(l); return () => { listeners.delete(l); }; },
    version: () => version,
  };
}

export const TIPS_KEY = IS_Q2_BUILD ? 'pr-cal:tips' : 'pr-demo:tips';

export const tips = createTipsStore(() => {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
}, TIPS_KEY);
