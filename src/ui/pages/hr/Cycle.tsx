import { useState } from 'react';
import { caseInfo } from '../../../domain/deadlines';
import { formatDate, weekday } from '../../../domain/dates';
import { canRelease, releaseBlockers } from '../../../domain/release';
import { useStore } from '../../../state/store';
import { Badge, DateField, Dialog, Notice, PageHead, Panel, Stat } from '../../components';
import { IconCheck, IconLock } from '../../icons';

function Timeline() {
  const { state } = useStore();
  const c = state.cycle;
  const steps = [
    { label: 'Cycle opened', date: c.openedOn },
    { label: 'Self-reviews due', date: c.selfReviewDeadline },
    { label: 'Manager reviews due', date: c.managerDeadline },
    { label: 'Results released', date: c.releasedOn },
  ];
  // Insert "Today" in date order; steps without a date (not reached yet) come last.
  const items: { label: string; date?: string; today?: boolean }[] = [];
  let placed = false;
  for (const st of steps) {
    if (!placed && (!st.date || st.date > state.today)) {
      items.push({ label: 'Today', date: state.today, today: true });
      placed = true;
    }
    items.push(st);
  }
  if (!placed) items.push({ label: 'Today', date: state.today, today: true });
  return (
    <ol className="timeline" aria-label="Cycle timeline">
      {items.map((s) => {
        const done = !s.today && !!s.date && s.date <= state.today;
        return (
          <li key={s.label} className={s.today ? 'today' : done ? 'done' : ''}>
            <span className="tl-dot" aria-hidden="true">{done && <IconCheck size={12} />}</span>
            <span className="tl-label">{s.label}</span>
            <span className="tl-date num">{s.date ? `${s.today ? `${weekday(s.date)} ` : ''}${formatDate(s.date)}` : 'Not yet'}</span>
          </li>
        );
      })}
    </ol>
  );
}

function DeadlineField({ field, label }: { field: 'selfReviewDeadline' | 'managerDeadline'; label: string }) {
  const { state, dispatch, notify } = useStore();
  const [value, setValue] = useState(state.cycle[field]);
  const changed = value !== state.cycle[field];
  const open = state.cycle.status === 'open';
  return (
    <div className="field">
      <label htmlFor={field}>{label}</label>
      <div className="row" style={{ flexWrap: 'nowrap' }}>
        <DateField id={field} min={state.cycle.openedOn} value={value} disabled={!open} onChange={setValue} />
        {changed && (
          <button
            type="button"
            className="btn"
            onClick={() => { dispatch({ type: 'change_deadline', field, date: value, actorId: 'hr' }); notify(`${label} changed to ${formatDate(value)}`); }}
          >
            Save
          </button>
        )}
      </div>
    </div>
  );
}

export function HrCycle() {
  const { state, dispatch, notify } = useStore();
  const [confirm, setConfirm] = useState(false);
  const released = state.cycle.status === 'released';
  const active = state.participants.filter((p) => !p.removed);
  const cases = active.map((p) => caseInfo(state, p.personId));
  const submitted = cases.filter((c) => c.status === 'submitted').length;
  const late = cases.filter((c) => c.status === 'overdue' || c.status === 'escalated').length;
  const blockers = releaseBlockers(state);
  const openReviews = blockers.filter((b) => b.kind === 'open_review');
  const calBlock = blockers.filter((b) => b.kind === 'calibration');
  const cal = state.calibration;
  const ready = canRelease(state);

  return (
    <>
      <PageHead
        title={<span className="row" style={{ gap: 12 }}>{state.cycle.name} {released ? <Badge tone="success">Released</Badge> : <Badge tone="brand">Open</Badge>}</span>}
        sub={`${state.company} · review period ${formatDate(state.cycle.periodStart)} – ${formatDate(state.cycle.periodEnd)} · ${active.length} people`}
      />
      <Panel bodyClass="panel-body timeline-wrap"><Timeline /></Panel>
      <div style={{ height: 16 }} />
      <div className="grid-3 stats-row">
        <Stat label="Manager reviews submitted" value={`${submitted} / ${active.length}`} meter={active.length ? submitted / active.length : 0} />
        <Stat label="Late or escalated, still open" value={late} sub={<a href="#/hr/progress">See progress</a>} />
        <Stat label="Calibration" value={cal.status === 'locked' ? 'Locked' : cal.status === 'in_session' ? 'In session' : 'Not started'} sub={<a href="#/hr/calibration">Open calibration</a>} />
      </div>
      <div style={{ height: 16 }} />

      <div className="cycle-grid">
        <Panel title="Release results" actions={released ? undefined : <span className="small muted">Results stay locked until everything is resolved</span>}>
          {released ? (
            <Notice tone="success" title={`Released ${formatDate(state.cycle.releasedOn!)}`}>
              Employees can now see their result. The cycle is closed for changes.
            </Notice>
          ) : (
            <div className="stack">
              <ul className="checklist">
                <li className={openReviews.length ? '' : 'ok'}>
                  <span className="ck" aria-hidden="true">{openReviews.length ? '' : <IconCheck size={13} />}</span>
                  <div>
                    <div className="strong">Every manager review submitted</div>
                    {openReviews.length > 0 ? (
                      <ul className="blockers">
                        {openReviews.map((b) => <li key={b.key}>{b.text} · <a href={b.href}>{b.action} →</a></li>)}
                      </ul>
                    ) : <div className="small muted">{submitted} of {active.length} submitted.</div>}
                  </div>
                </li>
                <li className={calBlock.length ? '' : 'ok'}>
                  <span className="ck" aria-hidden="true">{calBlock.length ? '' : <IconCheck size={13} />}</span>
                  <div>
                    <div className="strong">Calibration across teams locked</div>
                    {calBlock.length > 0 ? (
                      <ul className="blockers">
                        {calBlock.map((b) => <li key={b.key}>{b.text} · <a href={b.href}>{b.action} →</a></li>)}
                      </ul>
                    ) : <div className="small muted">Locked {formatDate(cal.lockedOn!)} with {cal.changes.length} change{cal.changes.length === 1 ? '' : 's'}.</div>}
                  </div>
                </li>
              </ul>
              <div className={`submit-bar${ready ? ' action-bar' : ''}`}>
                <span className="small muted">
                  {ready ? 'Ready. Everyone in the cycle sees their result at the same time.' : `${blockers.length} item${blockers.length === 1 ? '' : 's'} left before release.`}
                </span>
                <button type="button" className="btn btn-primary" disabled={!ready} onClick={() => setConfirm(true)}>
                  {!ready && <IconLock size={15} />} Release results
                </button>
              </div>
            </div>
          )}
        </Panel>

        <Panel title="Deadlines">
          <div className="stack">
            <DeadlineField field="selfReviewDeadline" label="Self-review deadline" />
            <DeadlineField field="managerDeadline" label="Manager review deadline" />
            <p className="small muted">
              {state.cycle.status === 'released'
                ? 'Deadlines are locked because results have been released.'
                : <>Changes apply to everyone and are logged. To give one person more time, use Extend in <a href="#/hr/progress">Progress</a>.</>}
            </p>
          </div>
        </Panel>
      </div>

      {confirm && (
        <Dialog
          title={`Release results to ${active.length} employees?`}
          sub="Each person sees their overall rating, behaviour ratings and their manager's comments. This cannot be undone."
          onClose={() => setConfirm(false)}
          footer={
            <>
              <button type="button" className="btn" onClick={() => setConfirm(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={() => { dispatch({ type: 'release', actorId: 'hr' }); setConfirm(false); notify('Results released'); }}>
                Release results
              </button>
            </>
          }
        >
          <p className="small">Flags and their HR notes stay visible to HR only.</p>
        </Dialog>
      )}
    </>
  );
}
