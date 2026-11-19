import { useState } from 'react';
import { finalRating, openReviewCount, teamCalibration, unresolvedItems } from '../../../domain/calibration';
import { formatDate } from '../../../domain/dates';
import { activeParticipants, submittedReviews, suggestedFor } from '../../../domain/flags';
import { person, teamName } from '../../../domain/selectors';
import type { AgendaItem, DemoState, Rating } from '../../../domain/types';
import { useStore } from '../../../state/store';
import { go } from '../../../state/router';
import { Badge, Dialog, Disclosure, Explain, Notice, PageHead, Panel, PersonCell, RatingScale } from '../../components';
import { IconCheck, IconLock } from '../../icons';

const signed = (v: number) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toFixed(2)}`;

/** Change one person's overall rating in the session, with a reason. */
function ChangeRating({ personId }: { personId: string }) {
  const { state, dispatch, notify } = useStore();
  const review = state.managerReviews.find((r) => r.personId === personId)!;
  const current = finalRating(review)!;
  const [to, setTo] = useState<Rating>(current);
  const [reason, setReason] = useState('');
  const ready = to !== current && reason.trim().length > 0;
  return (
    <div className="cal-change">
      <div className="row" style={{ gap: 12 }}>
        <RatingScale label={`Final rating for ${person(state, personId).name}`} value={to} onChange={setTo} />
        <span className="small muted">Now {current}{review.calibratedOverall ? ` (manager rated ${review.overall})` : ''}</span>
      </div>
      {to !== current && (
        <div className="field">
          <label htmlFor={`cal-reason-${personId}`}>Why the group changed it</label>
          <textarea id={`cal-reason-${personId}`} className="textarea" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="For example: compared with peers at the same results, a 4 fits the anchors better." />
        </div>
      )}
      <div className="row">
        <button
          type="button"
          className="btn btn-sm"
          disabled={!ready}
          onClick={() => {
            dispatch({ type: 'calibrate_rating', personId, to, reason, actorId: 'hr' });
            notify(`${person(state, personId).name}: ${current} → ${to}`);
            setReason('');
          }}
        >
          Save change
        </button>
        {!ready && <span className="foot-hint">{to === current ? 'Pick a different rating to change it.' : 'Add the reason to save.'}</span>}
      </div>
    </div>
  );
}

function PersonLine({ state, personId }: { state: DemoState; personId: string }) {
  const r = state.managerReviews.find((x) => x.personId === personId)!;
  const fin = finalRating(r)!;
  return (
    <div className="cal-person">
      <PersonCell name={person(state, personId).name} sub={teamName(state, person(state, personId).teamId)} size="sm" />
      <span className="small num">
        Results suggest <strong>{suggestedFor(state, r).toFixed(1)}</strong> · rated <strong>{r.overall}</strong>
        {r.calibratedOverall && <> → <strong className="cal-new">{fin}</strong></>}
      </span>
    </div>
  );
}

function AgendaCard({ item, open, onOpen, onDone }: { item: AgendaItem; open: boolean; onOpen: () => void; onDone: () => void }) {
  const { state, dispatch, notify } = useStore();
  const [note, setNote] = useState('');
  const people =
    item.kind === 'far'
      ? [item.personId!]
      : submittedReviews(state).filter((r) => r.reviewerId === item.reviewerId).map((r) => r.personId);
  const review = item.personId ? state.managerReviews.find((r) => r.personId === item.personId) : undefined;

  return (
    <li className={`agenda-item${item.resolution ? ' done' : ''}${open ? ' open' : ''}`}>
      <button type="button" className="agenda-head" aria-expanded={open} onClick={onOpen}>
        <span className="agenda-mark" aria-hidden="true">{item.resolution ? <IconCheck size={13} /> : null}</span>
        <span className="agenda-title">
          <span className="strong">{item.label}</span>
          <span className="xs muted">{item.kind === 'gap' ? 'Whole team, from the manager gap' : 'One rating far from results'}</span>
        </span>
        {item.resolution ? <Badge tone="success">Agreed</Badge> : <Badge tone="warning">To discuss</Badge>}
      </button>
      {open && (
        <div className="agenda-body">
          {review?.deviationReason && (
            <Disclosure label="Manager's reason for the original rating" openLabel="Hide reason">
              <p className="quote small">“{review.deviationReason}”</p>
            </Disclosure>
          )}
          <div className="stack-sm">
            {people.map((id) => (
              <div key={id} className="cal-row">
                <PersonLine state={state} personId={id} />
                {!item.resolution && state.calibration.status === 'in_session' && (
                  <Disclosure label="Change rating" openLabel="Close">
                    <ChangeRating personId={id} />
                  </Disclosure>
                )}
              </div>
            ))}
          </div>
          {item.resolution ? (
            <div className="reviewed-note">
              <div className="row xs muted"><IconCheck size={14} /> Agreed {formatDate(item.resolution.on)}</div>
              <div>{item.resolution.note}</div>
            </div>
          ) : (
            <div className="field">
              <label htmlFor={`note-${item.key}`}>What did the group agree?</label>
              <span className="hint">Keep the rating or change it above, then write the outcome. It goes into the activity log.</span>
              <textarea id={`note-${item.key}`} className="textarea" value={note} onChange={(e) => setNote(e.target.value)} placeholder="For example: kept at 5; the Q1 renewal is already signed." />
              <div className="row">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  disabled={!note.trim()}
                  onClick={() => { dispatch({ type: 'resolve_item', key: item.key, note, actorId: 'hr' }); notify('Marked as agreed'); onDone(); }}
                >
                  Mark as agreed
                </button>
                {!note.trim() && <span className="foot-hint">Write the outcome to continue.</span>}
              </div>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

function NotStarted() {
  const { state, dispatch, notify } = useStore();
  const reviewers = state.people.filter((p) => p.kind === 'manager' || p.kind === 'head');
  const [attendees, setAttendees] = useState(reviewers.map((p) => p.id));
  const open = openReviewCount(state);
  const ready = open === 0 && attendees.length >= 2;
  return (
    <div className="stack">
      {open > 0 ? (
        <Notice tone="warning" title={`${open} review${open === 1 ? ' is' : 's are'} still open`}>
          The meeting can start when every review is in, so the group compares complete teams. <a href="#/hr">See what is open on Home</a>
        </Notice>
      ) : (
        <Notice tone="brand" title="Every review is in. The meeting can start.">
          The ratings that do not match results become the list to discuss.
        </Notice>
      )}
      <Panel title="Who is in the meeting">
        <fieldset className="field choices">
          <legend className="sr-only">Attendees</legend>
          {reviewers.map((p) => (
            <label key={p.id} className="choice">
              <input
                type="checkbox"
                checked={attendees.includes(p.id)}
                onChange={(e) => setAttendees((a) => (e.target.checked ? [...a, p.id] : a.filter((x) => x !== p.id)))}
              />
              <span>{p.name} · {p.teamId ? teamName(state, p.teamId) : p.title}</span>
            </label>
          ))}
        </fieldset>
        <p className="small muted" style={{ marginTop: 8 }}>HR records what the group agrees. In a real product each manager would join in their own account.</p>
      </Panel>
      <div className="submit-bar action-bar">
        <span className="small muted">
          {open > 0 ? `${open} review${open === 1 ? '' : 's'} still open.` : attendees.length < 2 ? 'Choose at least two people.' : `${attendees.length} people in the session.`}
        </span>
        <button
          type="button"
          data-tour="cal-start"
          className="btn btn-primary"
          disabled={!ready}
          onClick={() => { dispatch({ type: 'start_calibration', attendees, actorId: 'hr' }); notify('Calibration session started'); }}
        >
          Start the meeting
        </button>
      </div>
    </div>
  );
}

export function HrCalibration() {
  const { state, dispatch, notify } = useStore();
  const cal = state.calibration;
  const [openKey, setOpenKey] = useState<string>();
  const [confirm, setConfirm] = useState(false);
  const unresolved = unresolvedItems(state);
  const current = openKey ?? unresolved[0]?.key;
  const teams = teamCalibration(state);
  const everyone = activeParticipants(state).map((p) => p.personId);

  return (
    <>
      <PageHead
        title={<span className="row" style={{ gap: 12 }}>Agree final ratings {cal.status === 'locked' ? <Badge tone="success">Locked</Badge> : cal.status === 'in_session' ? <Badge tone="brand">In session</Badge> : <Badge>Not started</Badge>}</span>}
        sub="This step is called calibration: managers meet and agree final ratings across teams. The ratings that do not match results are the list to discuss. No one sees a result before the final ratings are locked."
      />

      {cal.status === 'not_started' && <NotStarted />}

      {cal.status !== 'not_started' && (
        <div className="stack">
          <div className="grid-3 stats-row">
            {teams.filter((t) => state.people.find((p) => p.id === t.reviewerId)?.teamId).map((t) => {
              const mgr = person(state, t.reviewerId);
              return (
                <div className="panel stat" key={t.reviewerId}>
                  <div className="stat-label">{teamName(state, mgr.teamId)}</div>
                  <div className="stat-value num">
                    {t.before.toFixed(2)}{Math.abs(t.after - t.before) > 0.001 && <span className="cal-arrow"> → {t.after.toFixed(2)}</span>}
                  </div>
                  <div className="stat-sub num">Results {t.suggested.toFixed(2)} · gap {signed(t.after - t.suggested)}</div>
                </div>
              );
            })}
          </div>
          <Explain>Each card shows the team's average rating before → after the meeting, and what the team's goal results suggest.</Explain>

          <Panel
            title="To discuss (as it was when the meeting started)"
            actions={<span className="small muted">{cal.agenda.length - unresolved.length} of {cal.agenda.length} agreed</span>}
            bodyClass=""
          >
            <ol className="agenda">
              {cal.agenda.map((a) => (
                <AgendaCard key={a.key} item={a} open={current === a.key} onOpen={() => setOpenKey(current === a.key ? '' : a.key)} onDone={() => setOpenKey(undefined)} />
              ))}
            </ol>
          </Panel>

          {cal.status === 'in_session' && (
            <Panel title="Anyone else">
              <Disclosure label={`Show all ${everyone.length} people across teams`} openLabel="Hide people">
                {[...everyone]
                  .sort((a, b) => suggestedFor(state, state.managerReviews.find((r) => r.personId === b)!) - suggestedFor(state, state.managerReviews.find((r) => r.personId === a)!))
                  .map((id) => (
                    <div key={id} className="cal-row">
                      <PersonLine state={state} personId={id} />
                      <Disclosure label="Change rating" openLabel="Close"><ChangeRating personId={id} /></Disclosure>
                    </div>
                  ))}
              </Disclosure>
            </Panel>
          )}

          {cal.status === 'locked' ? (
            <>
              <Notice tone="success" title={`Locked ${formatDate(cal.lockedOn!)} · ${cal.changes.length} rating change${cal.changes.length === 1 ? '' : 's'}`}>
                Ratings can no longer change. Results can now be released from Home.
              </Notice>
              {cal.changes.length > 0 && (
                <Panel title="Changes agreed" bodyClass="">
                  {cal.changes.map((c, i) => (
                    <div className="flag-row" key={i}>
                      <div className="stack-sm">
                        <span><strong>{person(state, c.personId).name}</strong> <span className="num">{c.from} → {c.to}</span></span>
                        <span className="small muted">{c.reason}</span>
                      </div>
                    </div>
                  ))}
                </Panel>
              )}
              <div className="submit-bar action-bar">
                <span className="small muted">Next: release results.</span>
                <button type="button" className="btn btn-primary" onClick={() => go('/hr')}>Go to release</button>
              </div>
            </>
          ) : (
            <div className="submit-bar action-bar">
              <span className="small muted">
                {unresolved.length ? `${unresolved.length} case${unresolved.length === 1 ? '' : 's'} left to agree before you can lock.` : 'Every case is agreed. Lock to allow release.'}
              </span>
              <button type="button" className="btn btn-primary" disabled={unresolved.length > 0} onClick={() => setConfirm(true)}>
                {unresolved.length > 0 && <IconLock size={15} />} Lock final ratings
              </button>
            </div>
          )}
        </div>
      )}

      {confirm && (
        <Dialog
          title="Lock final ratings?"
          sub="Ratings cannot change after this. Employees still see nothing until HR releases results."
          onClose={() => setConfirm(false)}
          footer={
            <>
              <button type="button" className="btn" onClick={() => setConfirm(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={() => { dispatch({ type: 'lock_calibration', actorId: 'hr' }); setConfirm(false); notify('Calibration locked'); }}>
                Lock final ratings
              </button>
            </>
          }
        >
          <p className="small">{cal.changes.length} rating change{cal.changes.length === 1 ? '' : 's'} agreed in this session.</p>
        </Dialog>
      )}
    </>
  );
}
