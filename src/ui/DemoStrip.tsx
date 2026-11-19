import { reduce } from '../domain/actions';
import { useEffect, useRef, useState } from 'react';
import { addDays, formatDate, weekday } from '../domain/dates';
import { employeesForPicker, reviewersForPicker, teamName } from '../domain/selectors';
import { useStore, type Role } from '../state/store';
import { go } from '../state/router';
import { Dialog } from './components';
import { AboutDialog } from './shared/About';

export const HOME: Record<Role, string> = { hr: '/hr', manager: '/manager', employee: '/me' };

/** +1 day, with a message that says what the day change did (escalations). */
export function useAdvanceDay() {
  const { state, dispatch, notify } = useStore();
  return () => {
    // Work out what the day change does, so the message can say it (the reducer is pure).
    const next = reduce(state, { type: 'advance_day' });
    const moved = next.log.filter((l) => l.type === 'escalation').length - state.log.filter((l) => l.type === 'escalation').length;
    dispatch({ type: 'advance_day' });
    notify(
      moved > 0
        ? `${formatDate(addDays(state.today, 1))}: ${moved} overdue review${moved === 1 ? '' : 's'} moved to the next manager up. See Progress or Activity.`
        : `Demo date moved to ${formatDate(addDays(state.today, 1))}`,
    );
  };
}

/**
 * Everything that exists only for the demo lives in this one bar: who you are,
 * the demo date, and shortcuts. Nothing here is part of the product below it.
 */
export function DemoStrip() {
  const { state, dispatch, view, setView, notify } = useStore();
  const advanceDay = useAdvanceDay();
  const [confirmReset, setConfirmReset] = useState(false);
  const [about, setAbout] = useState(false);
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const released = state.cycle.status === 'released';

  // The menu closes on Escape or a tap outside it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onDown = (e: MouseEvent | TouchEvent) => { if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown, { passive: true });
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
    };
  }, [open]);

  // One list of people: choosing a name switches to that person's own home.
  const current = view.role === 'hr' ? 'hr' : view.role === 'manager' ? `m:${view.managerId}` : `e:${view.employeeId}`;
  const become = (value: string) => {
    if (value === 'hr') { setView({ role: 'hr' }); go(HOME.hr); return; }
    const id = value.slice(2);
    if (value.startsWith('m:')) { setView({ role: 'manager', managerId: id }); go(HOME.manager); return; }
    setView({ role: 'employee', employeeId: id });
    go(HOME.employee);
  };
  const hr = state.people.find((p) => p.id === 'hr');

  return (
    <div className="demo-bar" ref={wrap}>
      <span className="demo-label">Demo</span>
      <label className="demo-you">
        <span>You are</span>
        <select aria-label="You are" value={current} onChange={(e) => become(e.target.value)}>
          <optgroup label="HR">
            <option value="hr">{hr?.name ?? 'HR'} · HR</option>
          </optgroup>
          <optgroup label="Managers">
            {reviewersForPicker(state).map((p) => (
              <option key={p.id} value={`m:${p.id}`}>{p.name} · {p.teamId ? `${teamName(state, p.teamId)} manager` : p.title}</option>
            ))}
          </optgroup>
          <optgroup label="Employees">
            {employeesForPicker(state).map((p) => (
              <option key={p.id} value={`e:${p.id}`}>{p.name} · {p.teamId ? teamName(state, p.teamId) : p.title}</option>
            ))}
          </optgroup>
        </select>
      </label>
      <span className="demo-tip">Switch person to see the same review from the other side.</span>
      <span className="demo-clock">
        <span className="demo-date num">{weekday(state.today)} {formatDate(state.today)}</span>
        <button type="button" className="demo-btn" onClick={advanceDay}>+1 day</button>
      </span>
      <button type="button" className="demo-btn demo-menu-btn" aria-expanded={open} aria-controls="demo-menu" onClick={() => setOpen((o) => !o)}>
        More <span aria-hidden="true">{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <div className="demo-menu" id="demo-menu" role="group" aria-label="More demo controls">
          {!released && (
            <div className="demo-menu-sec">
              <div className="demo-menu-label">Demo shortcuts</div>
              <p className="small muted">Each shortcut uses the normal actions, as the people who would do them, and logs every step.</p>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => { dispatch({ type: 'demo_finish_reviews' }); setOpen(false); notify('Demo: the managers finished their open reviews'); }}
              >
                Let the managers finish their reviews
              </button>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => { dispatch({ type: 'demo_skip_to_release' }); setOpen(false); notify('Demo: results released. Every step is in HR → Activity.'); }}
              >
                Skip to released results
              </button>
            </div>
          )}
          <div className="demo-menu-sec demo-menu-actions">
            <button type="button" className="btn btn-sm" onClick={() => { setAbout(true); setOpen(false); }}>About this prototype</button>
            <button type="button" className="btn btn-sm" onClick={() => { setConfirmReset(true); setOpen(false); }}>Reset demo</button>
            <button type="button" className="btn btn-sm" onClick={() => go('/')} title="Back to the start page">Exit demo</button>
          </div>
        </div>
      )}
      {about && <AboutDialog onClose={() => setAbout(false)} />}
      {confirmReset && (
        <Dialog
          title="Reset the demo?"
          sub="All changes are discarded and the demo date goes back to 12 Dec 2026."
          onClose={() => setConfirmReset(false)}
          footer={
            <>
              <button type="button" className="btn" onClick={() => setConfirmReset(false)}>Cancel</button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  dispatch({ type: 'reset' });
                  setConfirmReset(false);
                  go(HOME[view.role]);
                  notify('Demo reset to the starting data');
                }}
              >
                Reset demo
              </button>
            </>
          }
        >
          <p className="small muted">Use this to start again from the beginning.</p>
        </Dialog>
      )}
    </div>
  );
}
