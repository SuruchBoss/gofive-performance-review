import { reduce } from '../domain/actions';
import { useEffect, useRef, useState } from 'react';
import { addDays, formatDate, weekday } from '../domain/dates';
import { employeesForPicker, reviewersForPicker, teamName } from '../domain/selectors';
import { useStore, type Role } from '../state/store';
import { go } from '../state/router';
import { Dialog } from './components';
import { tips } from './coach/tips';

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

export function DemoStrip({ who }: { who: string }) {
  const { state, dispatch, view, setView, notify } = useStore();
  const advanceDay = useAdvanceDay();
  const [confirmReset, setConfirmReset] = useState(false);
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const roleName = { hr: 'HR', manager: 'Manager', employee: 'Employee' } as const;

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

  const switchRole = (role: Role) => {
    setView({ role });
    // After release, an employee's first question is their result.
    go(role === 'employee' && state.cycle.status === 'released' ? '/me/result' : HOME[role]);
  };

  return (
    <div className="demo-bar" ref={wrap}>
      <span className="demo-label">Prototype</span>
      <span className="demo-summary">
        <span className="demo-who">{roleName[view.role]} · {who}</span>
        <span className="demo-date num">{weekday(state.today)} {formatDate(state.today)}</span>
      </span>
      <button type="button" className="demo-btn demo-menu-btn" aria-expanded={open} aria-controls="demo-menu" onClick={() => setOpen((o) => !o)}>
        Demo <span aria-hidden="true">{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <div className="demo-menu" id="demo-menu" role="group" aria-label="Demo controls">
          <div className="demo-menu-sec">
            <div className="demo-menu-label">View as</div>
            <div className="seg" role="group" aria-label="View as role">
              {(['hr', 'manager', 'employee'] as Role[]).map((r) => (
                <button key={r} type="button" aria-pressed={view.role === r} onClick={() => switchRole(r)}>
                  {roleName[r]}
                </button>
              ))}
            </div>
            {view.role === 'manager' && (
              <select className="select" aria-label="Manager" value={view.managerId} onChange={(e) => { setView({ managerId: e.target.value }); go(HOME.manager); setOpen(false); }}>
                {reviewersForPicker(state).map((p) => (
                  <option key={p.id} value={p.id}>{p.name}{p.teamId ? ` · ${teamName(state, p.teamId)}` : ` · ${p.title}`}</option>
                ))}
              </select>
            )}
            {view.role === 'employee' && (
              <select className="select" aria-label="Employee" value={view.employeeId} onChange={(e) => { setView({ employeeId: e.target.value }); go(HOME.employee); setOpen(false); }}>
                {employeesForPicker(state).map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            )}
          </div>
          <div className="demo-menu-sec">
            <div className="demo-menu-label">Demo date</div>
            <div className="row">
              <span className="strong num">{weekday(state.today)} {formatDate(state.today)}</span>
              <button type="button" className="btn btn-sm" onClick={advanceDay}>+1 day</button>
            </div>
          </div>
          <div className="demo-menu-sec demo-menu-actions">
            {view.introHidden && (
              <button type="button" className="btn btn-sm" onClick={() => { setView({ introHidden: false }); setOpen(false); window.scrollTo(0, 0); }}>Show the guide</button>
            )}
            <button type="button" className="btn btn-sm" onClick={() => { tips.showAgain(); setOpen(false); notify('Tips are on again for every guide'); }}>Show tips again</button>
            <button type="button" className="btn btn-sm" onClick={() => { setConfirmReset(true); setOpen(false); }}>Reset demo</button>
            <button type="button" className="btn btn-sm" onClick={() => go('/')} title="Back to the start page">Exit demo</button>
          </div>
        </div>
      )}
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
                  setView({ introHidden: false });
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
          <p className="small muted">Use this to start the guided path again.</p>
        </Dialog>
      )}
    </div>
  );
}
