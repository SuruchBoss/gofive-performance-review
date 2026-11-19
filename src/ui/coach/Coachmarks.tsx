import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useStore, type Role } from '../../state/store';
import { STEPS_FOR } from '../shared/Intro';
import { sceneFor, type Scene } from './marks';
import { placeCard, type Box } from './placement';
import { tips } from './tips';

/** Re-render when tips are skipped, closed or turned back on. */
export function useTipsVersion() {
  return useSyncExternalStore(tips.subscribe, tips.version, tips.version);
}

/** The first match for a `data-tour` name that is actually on screen (not hidden by the layout). */
function findTarget(name: string): HTMLElement | undefined {
  for (const el of document.querySelectorAll<HTMLElement>(`[data-tour="${name}"]`)) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0 && el.getClientRects().length > 0) return el;
  }
  return undefined;
}

interface Geometry { rect?: Box; minTop: number; vw: number; vh: number; cardW: number; cardH: number }

const reducedMotion = () => typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Coachmarks sit on top of the step guide. For the guide's current step they dim the
 * page lightly, cut out the control to use next and show a short note beside it.
 * The dim is visual only: the page stays clickable, and using the control moves on.
 */
export function Coachmarks({ role, userId, path }: { role: Role; userId: string; path: string }) {
  const { state, view } = useStore();
  useTipsVersion();
  const guide: Role = view.track ?? 'hr';
  const steps = STEPS_FOR[guide];
  const step = steps.findIndex((s) => !s.done(state, view));
  const current = step >= 0 ? steps[step] : undefined;

  let scene: Scene | undefined;
  let optional = false;
  if (current) {
    scene = sceneFor(guide, step, state, { role, userId, path: path.split('?')[0] });
    if (!scene && !view.introHidden) {
      // Not on the step's screen: point at the guide's own link to it.
      const link = current.links[0];
      scene = {
        id: 'link',
        marks: [{ target: 'guide-link', text: `Next: ${current.title}. This link opens the right screen${link.view.role !== role ? ' and switches role for you' : ''}.` }],
      };
      optional = true;
    }
  }
  // A tip closed with Esc or Done stays closed for this visit to the screen, and comes
  // back if the reviewer returns later with the step still open.
  const visit = useRef({ path, n: 0 });
  if (visit.current.path !== path) visit.current = { path, n: visit.current.n + 1 };
  const key = scene ? `${guide}:${step}:${scene.id}` : '';
  const closeKey = `${key}@${visit.current.n}`;
  const [index, setIndex] = useState(0);
  const [shownKey, setShownKey] = useState('');
  const [geo, setGeo] = useState<Geometry>();
  const [blocked, setBlocked] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const active = !!scene && !tips.isOff(guide) && !tips.isClosed(closeKey);
  const i = shownKey === key ? Math.min(index, (scene?.marks.length ?? 1) - 1) : 0;
  const mark = active ? scene!.marks[i] : undefined;
  const markId = mark ? `${key}:${i}` : '';

  const measure = useCallback(() => {
    if (!mark) return;
    // Dialogs and the Demo menu come first: the tip steps aside while they are open.
    setBlocked(!!document.querySelector('.overlay, #demo-menu'));
    const el = findTarget(mark.target);
    const r = el?.getBoundingClientRect();
    const strip = document.querySelector('.demo-strip')?.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const next: Geometry = {
      rect: r ? { top: Math.round(r.top), left: Math.round(r.left), width: Math.round(r.width), height: Math.round(r.height) } : undefined,
      minTop: Math.max(0, Math.round(strip?.bottom ?? 0)),
      vw,
      vh: window.innerHeight,
      cardW: Math.min(320, vw - 32),
      cardH: cardRef.current?.offsetHeight ?? 150,
    };
    setGeo((g) => (JSON.stringify(g) === JSON.stringify(next) ? g : next));
  }, [mark]);

  // A new tip: wait for the screen to settle, bring the target into view, then show.
  useEffect(() => {
    setGeo(undefined);
    if (!markId || !mark) return;
    if (shownKey !== key) { setShownKey(key); setIndex(0); }
    const t = window.setTimeout(() => {
      const el = findTarget(mark.target);
      if (el) {
        const r = el.getBoundingClientRect();
        const top = (document.querySelector('.demo-strip')?.getBoundingClientRect().bottom ?? 0) + 8;
        if (r.top < Math.max(top, 8) || r.bottom > window.innerHeight - 8) el.scrollIntoView({ block: 'center', behavior: reducedMotion() ? 'auto' : 'smooth' });
        // A tab in the phone's scrolling tab row can sit off to the side.
        else if (r.left < 0 || r.right > document.documentElement.clientWidth) el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      }
      measure();
    }, 350);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markId]);

  // Follow the target while the page scrolls, resizes or changes.
  useEffect(() => {
    if (!markId) return;
    let frame = 0;
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => { if (geoReady.current) measure(); }); };
    window.addEventListener('scroll', schedule, true);
    window.addEventListener('resize', schedule);
    const mo = new MutationObserver(schedule);
    mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style', 'open', 'aria-expanded', 'hidden'] });
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', schedule, true); window.removeEventListener('resize', schedule); mo.disconnect(); };
  }, [markId, measure]);
  const geoReady = useRef(false);
  geoReady.current = !!geo;

  // The card's real height is known only after it renders.
  useLayoutEffect(() => { if (geo) measure(); });

  const visible = !!mark && !!geo && !blocked && !(optional && !geo.rect);
  const last = !!scene && i === scene.marks.length - 1;

  const finish = useCallback((how: 'close' | 'skip') => {
    const card = cardRef.current;
    const hadFocus = !!card && card.contains(document.activeElement);
    if (how === 'skip') tips.skip(guide); else tips.close(closeKey);
    if (hadFocus) {
      const back = returnFocus.current && document.contains(returnFocus.current) ? returnFocus.current : document.getElementById('main');
      back?.focus({ preventScroll: true });
    }
  }, [guide, closeKey]);
  const advance = useCallback(() => { if (last) finish('close'); else setIndex(i + 1); }, [last, finish, i]);

  // Using the highlighted button or link itself moves on to the next tip. On the last
  // tip nothing closes: the step itself moves on when the action is done.
  useEffect(() => {
    if (!visible || !mark || last) return;
    const el = findTarget(mark.target);
    if (!el || !el.matches('button, a')) return;
    const on = () => setIndex(i + 1);
    el.addEventListener('click', on);
    return () => el.removeEventListener('click', on);
  }, [visible, mark, last, i, geo]);

  // Esc closes the tip.
  useEffect(() => {
    if (!visible) return;
    const on = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); finish('close'); } };
    document.addEventListener('keydown', on);
    return () => document.removeEventListener('keydown', on);
  }, [visible, finish]);

  // When a tip opens, focus moves to it, unless the reviewer is typing in a field.
  useEffect(() => {
    if (!visible) return;
    const a = document.activeElement as HTMLElement | null;
    if (cardRef.current?.contains(a)) return;
    if (a && a.matches('input, textarea, select')) return;
    returnFocus.current = a && a !== document.body ? a : null;
    cardRef.current?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, markId]);

  if (!visible || !mark || !geo || !scene) return null;
  const pad = 6;
  const pos = placeCard({ target: geo.rect, card: { width: geo.cardW, height: geo.cardH }, viewport: { width: geo.vw, height: geo.vh }, minTop: geo.minTop, prefer: mark.prefer });
  return (
    <>
      <div className="coach-dim" style={{ top: geo.minTop }} aria-hidden="true">
        {geo.rect ? (
          <div
            className="coach-hole"
            data-coach-hole=""
            style={{ top: geo.rect.top - geo.minTop - pad, left: geo.rect.left - pad, width: geo.rect.width + pad * 2, height: geo.rect.height + pad * 2 }}
          />
        ) : <div className="coach-shade" />}
      </div>
      <div
        ref={cardRef}
        className={`coach-card coach-${pos.side}`}
        role="dialog"
        aria-label="Guide tip"
        aria-describedby="coach-text"
        tabIndex={-1}
        style={{ top: pos.top, left: pos.left, width: geo.cardW }}
      >
        <div className="coach-step">
          Step {step + 1} of {steps.length}{scene.marks.length > 1 ? ` · tip ${i + 1} of ${scene.marks.length}` : ''}
        </div>
        <p id="coach-text">{geo.rect ? mark.text : mark.fallback ?? mark.text}</p>
        <div className="coach-actions">
          <button type="button" className="link-btn" onClick={() => finish('skip')}>Skip</button>
          <button type="button" className="btn btn-primary btn-sm" onClick={advance}>{last ? 'Done' : 'Next'}</button>
        </div>
      </div>
    </>
  );
}
