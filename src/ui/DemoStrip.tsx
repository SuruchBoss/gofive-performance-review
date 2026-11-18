import { useState } from 'react';
import { addDays, formatDate, weekday } from '../domain/dates';
import { employeesForPicker, reviewersForPicker } from '../domain/selectors';
import { useStore, type Role } from '../state/store';
import { go } from '../state/router';
import { Dialog } from './components';

export const HOME: Record<Role, string> = { hr: '/hr', manager: '/manager', employee: '/me' };

export function DemoStrip() {
  const { state, dispatch, view, setView, notify } = useStore();
  const [confirmReset, setConfirmReset] = useState(false);

  const switchRole = (role: Role) => {
    setView({ role });
    go(HOME[role]);
  };

  return (
    <>
      <span className="demo-label">Prototype</span>
      <div className="demo-group">
        <span>View as</span>
        <div className="seg" role="group" aria-label="View as role">
          {(['hr', 'manager', 'employee'] as Role[]).map((r) => (
            <button key={r} type="button" aria-pressed={view.role === r} onClick={() => switchRole(r)}>
              {r === 'hr' ? 'HR' : r === 'manager' ? 'Manager' : 'Employee'}
            </button>
          ))}
        </div>
        {view.role === 'manager' && (
          <select aria-label="Manager" value={view.managerId} onChange={(e) => { setView({ managerId: e.target.value }); go(HOME.manager); }}>
            {reviewersForPicker(state).map((p) => (
              <option key={p.id} value={p.id}>{p.name} · {p.title}</option>
            ))}
          </select>
        )}
        {view.role === 'employee' && (
          <select aria-label="Employee" value={view.employeeId} onChange={(e) => { setView({ employeeId: e.target.value }); go(HOME.employee); }}>
            {employeesForPicker(state).map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        )}
      </div>
      <div className="spacer" />
      <div className="demo-group">
        <span>Demo date</span>
        <span className="demo-date num">{weekday(state.today)} {formatDate(state.today)}</span>
        <button type="button" className="demo-btn" onClick={() => { dispatch({ type: 'advance_day' }); notify(`Demo date moved to ${formatDate(addDays(state.today, 1))}`); }}>
          +1 day
        </button>
        {view.introHidden && (
          <button type="button" className="demo-btn" onClick={() => { setView({ introHidden: false }); window.scrollTo(0, 0); }}>Guide</button>
        )}
        <button type="button" className="demo-btn" onClick={() => setConfirmReset(true)}>Reset demo</button>
      </div>
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
    </>
  );
}

