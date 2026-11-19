import { useState } from 'react';
import { caseInfo } from '../../../domain/deadlines';
import { hrAttention } from '../../../domain/home';
import { person, teamName } from '../../../domain/selectors';
import { RemindDialog, RemoveDialog } from '../../shared/CaseDialogs';
import { formatDate, weekday } from '../../../domain/dates';
import { canRelease, releaseBlockers, unreviewedFlags } from '../../../domain/release';
import { useStore } from '../../../state/store';
import { Badge, DateField, Dialog, Notice, PageHead, Panel, PersonCell } from '../../components';
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
  const [dialog, setDialog] = useState<{ kind: 'remind' | 'remove'; personIds: string[] }>();
  const released = state.cycle.status === 'released';
  const active = state.participants.filter((p) => !p.removed);
  const review = (id: string) => state.managerReviews.find((r) => r.personId === id)!;
  const name = (id: string) => person(state, id).name;
  const first = (id: string) => name(id).split(' ')[0];
  const submitted = active.filter((p) => review(p.personId).status === 'submitted').length;
  const blockers = releaseBlockers(state);
  const ready = canRelease(state);

  // What needs HR now, in the order HR would handle it.
  const { tooNew, toWrite, late, waitingForAnswer, answers, toCheck, finalRatings, groups } = hrAttention(state);
  const agenda = unreviewedFlags(state).length;

  return (
    <>
      <PageHead
        title={<span className="row" style={{ gap: 12 }}>{state.cycle.name} {released ? <Badge tone="success">Released</Badge> : <Badge tone="brand">Open</Badge>}</span>}
        sub={`${submitted} of ${active.length} reviews are in · ${released ? `results released ${formatDate(state.cycle.releasedOn!)}` : 'results not released yet'}`}
      />

      {released ? (
        <Notice tone="success" title={`Results released ${formatDate(state.cycle.releasedOn!)}`}>
          Everyone can now see their result. Nothing can be changed any more.
        </Notice>
      ) : (
        <div className="stack">
          <Panel title="Needs your attention" bodyClass="">
            {groups === 0 && <div className="attention-empty"><IconCheck size={16} /> Nothing needs your attention. You can release results.</div>}

            {tooNew.length > 0 && (
              <section className="attention">
                <h3>{tooNew.length} {tooNew.length === 1 ? 'person' : 'people'} joined less than 3 months ago</h3>
                <p className="small muted">Too new to review. Suggested: leave out.</p>
                {tooNew.map((p) => (
                  <div className="attention-row" key={p.personId}>
                    <PersonCell name={name(p.personId)} sub={`Joined ${formatDate(person(state, p.personId).startDate)} · ${teamName(state, person(state, p.personId).teamId)}`} size="sm" />
                    <button type="button" className="btn btn-sm btn-primary" onClick={() => setDialog({ kind: 'remove', personIds: [p.personId] })}>Leave {first(p.personId)} out</button>
                  </div>
                ))}
              </section>
            )}

            {toWrite.length > 0 && (
              <section className="attention">
                <h3>{late.length === toWrite.length ? `${toWrite.length} review${toWrite.length === 1 ? ' is' : 's are'} late` : `${toWrite.length} review${toWrite.length === 1 ? ' is' : 's are'} not in yet`}</h3>
                {[...new Set(toWrite.map((p) => p.reviewerId))].map((reviewerId) => {
                  const theirs = toWrite.filter((p) => p.reviewerId === reviewerId);
                  const c = caseInfo(state, theirs[0].personId);
                  const reminded = theirs.map((p) => p.lastRemindedOn).filter(Boolean).sort().at(-1);
                  const boss = person(state, reviewerId).managerId;
                  const when = c.status === 'escalated'
                    ? `moved to ${first(reviewerId)} on ${formatDate(theirs[0].escalatedOn!, true)}`
                    : c.status === 'overdue'
                    ? `${c.daysOverdue} day${c.daysOverdue === 1 ? '' : 's'} late${boss ? ` · ${theirs.length === 1 ? 'goes' : 'go'} to ${first(boss)} on ${formatDate(c.escalatesOn!, true)}` : ''}`
                    : `due ${formatDate(c.deadline, true)}`;
                  return (
                    <div className="attention-row" key={reviewerId}>
                      <PersonCell name={theirs.map((p) => name(p.personId)).join(', ')} sub={`${name(reviewerId)} · ${when}${reminded ? ` · reminded ${formatDate(reminded, true)}` : ''}`} size="sm" />
                      <button type="button" className="btn btn-sm" onClick={() => setDialog({ kind: 'remind', personIds: theirs.map((p) => p.personId) })}>
                        Remind {first(reviewerId)}{theirs.length > 1 ? ` (${theirs.length} reviews)` : ''}{reminded === state.today ? ' again' : ''}
                      </button>
                    </div>
                  );
                })}
              </section>
            )}

            {answers.length > 0 && (
              <section className="attention">
                <h3>{answers.length} answer{answers.length === 1 ? '' : 's'} from {answers.length === 1 ? 'a manager' : 'managers'} to read</h3>
                {answers.map((p) => (
                  <div className="attention-row" key={p.personId}>
                    <PersonCell name={name(p.personId)} sub={`${name(p.reviewerId)} answered your question`} size="sm" />
                    <a className="btn btn-sm btn-primary" href="#/hr/consistency">Read the answer</a>
                  </div>
                ))}
              </section>
            )}

            {toCheck.length > 0 && (
              <section className="attention">
                <h3>{toCheck.length} rating{toCheck.length === 1 ? ' does' : 's do'} not match results</h3>
                <ul className="attention-list">
                  {toCheck.map((b) => <li key={b.key}>{b.text}</li>)}
                </ul>
                <a className="btn btn-sm btn-primary" href="#/hr/consistency">Check fairness</a>
              </section>
            )}

            {finalRatings && (
              <section className="attention">
                <h3>Final ratings are not agreed yet</h3>
                <p className="small muted">
                  Calibration: managers meet and agree final ratings across teams.
                  {state.calibration.status === 'not_started' && agenda > 0 ? ` ${agenda} rating${agenda === 1 ? ' does' : 's do'} not match results; they are the list to discuss.` : ''}
                </p>
                {toWrite.length + tooNew.length + waitingForAnswer.length > 0 && state.calibration.status === 'not_started'
                  ? <span className="small muted">The meeting can start when every review is in.</span>
                  : <a className="btn btn-sm btn-primary" href="#/hr/calibration">{state.calibration.status === 'in_session' ? 'Continue the meeting' : 'Agree final ratings'}</a>}
              </section>
            )}

            {waitingForAnswer.length > 0 && (
              <section className="attention">
                <h3>Waiting for {waitingForAnswer.length === 1 ? `${first(waitingForAnswer[0].reviewerId)}'s answer` : `${waitingForAnswer.length} answers`}</h3>
                {waitingForAnswer.map((p) => (
                  <div className="attention-row" key={p.personId}>
                    <PersonCell name={name(p.personId)} sub={`You sent this review back to ${name(p.reviewerId)} with a question`} size="sm" />
                    <a className="btn btn-sm" href="#/hr/consistency">See the question</a>
                  </div>
                ))}
              </section>
            )}
          </Panel>

          <Panel title="Release results">
            <div className="submit-bar">
              <span className="small muted">
                {ready ? 'Ready. Everyone sees their result at the same time.' : `${blockers.length} thing${blockers.length === 1 ? '' : 's'} left in the list above.`}
              </span>
              <button type="button" className="btn btn-primary" disabled={!ready} onClick={() => setConfirm(true)}>
                {!ready && <IconLock size={15} />} Release results
              </button>
            </div>
          </Panel>
        </div>
      )}

      <details className="fold" style={{ marginTop: 16 }}>
        <summary>Dates and deadlines</summary>
        <div className="stack" style={{ marginTop: 12 }}>
          <Panel bodyClass="panel-body timeline-wrap"><Timeline /></Panel>
          <Panel title="Deadlines">
            <div className="stack">
              <DeadlineField field="selfReviewDeadline" label="Self-review deadline" />
              <DeadlineField field="managerDeadline" label="Manager review deadline" />
              <p className="small muted">
                {released
                  ? 'Deadlines are locked because results have been released.'
                  : <>Changes apply to everyone and are logged. To give one person more time, use Extend in <a href="#/hr/progress">People</a>.</>}
              </p>
            </div>
          </Panel>
        </div>
      </details>

      {dialog?.kind === 'remind' && <RemindDialog personIds={dialog.personIds} onClose={() => setDialog(undefined)} />}
      {dialog?.kind === 'remove' && <RemoveDialog personId={dialog.personIds[0]} onClose={() => setDialog(undefined)} />}
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
          <p className="small">Your notes on ratings stay visible to HR only.</p>
        </Dialog>
      )}
    </>
  );
}
