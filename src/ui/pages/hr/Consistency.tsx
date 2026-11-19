import { useState } from 'react';
import { CONFIG } from '../../../domain/config';
import { formatDate } from '../../../domain/dates';
import { farFlags, managerConsistency, suggestedFor } from '../../../domain/flags';
import { isFarFromSuggestion } from '../../../domain/rating';
import { firstName, person, teamName } from '../../../domain/selectors';
import type { DemoState, FlagReview } from '../../../domain/types';
import { useStore } from '../../../state/store';
import { Badge, Disclosure, Empty, Notice, PageHead, Panel, PersonCell } from '../../components';
import { IconCheck } from '../../icons';
import { Dumbbell } from '../../shared/Dumbbell';
import { FlagReviewDialog } from '../../shared/FlagReviewDialog';
import { ReturnDialog } from '../../shared/ReturnDialog';
import { answerAwaitingHr, flagsAwaitingAnswerDecision, openReturn } from '../../../domain/deadlines';
import { LEVEL_WORDS, showSuggestion } from '../../../domain/rating';

const signed = (v: number) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toFixed(2)}`;

function Reviewed({ state, r }: { state: DemoState; r: FlagReview }) {
  return (
    <div className="reviewed-note">
      <div className="row xs muted"><IconCheck size={14} /> Reviewed by {person(state, r.by).name}, {formatDate(r.on)}</div>
      <div>{r.note}</div>
    </div>
  );
}

export function HrConsistency() {
  const { state, dispatch, notify } = useStore();
  const [dialog, setDialog] = useState<{ key: string; label: string; context: string }>();
  const [returning, setReturning] = useState<{ key: string; personIds: string[]; again?: boolean }>();
  const waiting = state.managerReviews.filter((r) => openReturn(r));
  const answers = state.managerReviews.filter((r) => r.status === 'submitted' && answerAwaitingHr(r));
  const covered = flagsAwaitingAnswerDecision(state);
  const managers = managerConsistency(state);
  const far = farFlags(state);
  const isCovered = (key: string, personId?: string) => covered.keys.has(key) || (!!personId && covered.personIds.has(personId));
  const open =
    managers.filter((m) => m.flagged && !m.review && !isCovered(m.key)).length +
    far.filter((f) => !f.review && !isCovered(f.key, f.personId)).length;
  const todo = [
    open ? `${open} rating${open === 1 ? '' : 's'} to check` : '',
    answers.length ? `${answers.length} answer${answers.length === 1 ? '' : 's'} to accept or question` : '',
    waiting.length ? `${waiting.length} review${waiting.length === 1 ? '' : 's'} waiting for a manager` : '',
  ].filter(Boolean);
  const answeredNote = <span className="small muted">The manager answered HR: accept or ask again under “Answers from managers” above.</span>;

  return (
    <>
      <PageHead
        title="Check fairness"
        sub={todo.length ? `Before release: ${todo.join(', ')}.` : 'Every rating has been checked.'}
      />

      {answers.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <Panel title="Answers from managers" actions={<span className="small muted">Accept each answer, or ask again</span>} bodyClass="">
            {answers.map((r) => {
              const a = answerAwaitingHr(r)!;
              const who = person(state, r.personId);
              const mgr = person(state, r.reviewerId);
              return (
                <div className="flag-row" key={r.personId}>
                  <div className="stack-sm">
                    <div className="row">
                      <PersonCell name={who.name} sub={`Answered by ${mgr.name}, ${formatDate(a.answeredOn!)}`} size="sm" />
                      <Badge tone="brand">{a.outcome === 'changed' ? `Changed ${a.ratingBefore} → ${r.overall}` : `Kept ${r.overall}`}</Badge>
                    </div>
                    <div className="small num">
                      Rated <strong>{r.overall}</strong> ({LEVEL_WORDS[r.overall!]}) · results suggest <strong>{showSuggestion(suggestedFor(state, r))}</strong>
                    </div>
                    <dl className="kv small">
                      <dt>Your question</dt><dd>“{a.question}”</dd>
                      <dt>{mgr.name.split(' ')[0]}'s answer</dt><dd>“{a.answer}”</dd>
                    </dl>
                  </div>
                  <div className="row" style={{ alignItems: 'flex-start' }}>
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() => { dispatch({ type: 'accept_answer', personId: r.personId, actorId: 'hr' }); notify(`Accepted ${mgr.name}'s answer on ${who.name}`); }}
                    >
                      Accept answer
                    </button>
                    <button type="button" className="btn btn-sm" onClick={() => setReturning({ key: far.find((f) => f.personId === r.personId)?.key ?? a.flagKey, personIds: [r.personId], again: true })}>
                      Ask again
                    </button>
                  </div>
                </div>
              );
            })}
          </Panel>
        </div>
      )}

      {todo.length === 0 && state.cycle.status === 'open' && (
        <div style={{ marginBottom: 20 }}>
          <Notice tone="success" title="Every rating has been checked">
            Nothing is left here. <a href="#/hr">Go to Home to release results →</a>
          </Notice>
        </div>
      )}
      {waiting.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <Panel title="Waiting for managers" actions={<span className="small muted">Release waits for their answers</span>} bodyClass="">
            {waiting.map((r) => {
              const q = openReturn(r)!;
              return (
                <div className="flag-row" key={r.personId}>
                  <div className="stack-sm">
                    <PersonCell name={person(state, r.personId).name} sub={`Sent back to ${person(state, r.reviewerId).name} on ${formatDate(q.on)}`} size="sm" />
                    <p className="quote small">“{q.question}”</p>
                  </div>
                  <div className="row" style={{ alignItems: 'flex-start' }}>
                    <a className="btn btn-sm" href={`#/manager/review/${r.personId}?as=${r.reviewerId}`}>Open as {person(state, r.reviewerId).name.split(' ')[0]}</a>
                  </div>
                </div>
              );
            })}
          </Panel>
        </div>
      )}
      <h2 className="section-label">Managers</h2>
      <p className="explain-line" style={{ marginBottom: 12 }}>Each manager is compared with their own team's goal results. Teams are not compared with each other.</p>
      <div className="grid-3">
        {managers.filter((m) => m.flagged).map((m) => {
          const mgr = person(state, m.reviewerId);
          const label = `${mgr.name} rates ${m.status} results`;
          const openCase = !m.review && !isCovered(m.key);
          return (
            <Panel key={m.reviewerId} title={<PersonCell name={mgr.name} sub={mgr.teamId ? teamName(state, mgr.teamId) : mgr.title} size="sm" />}>
              <div className="stack-sm">
                {/* The finding and the decision first; the detail is one tap away. */}
                <p className={`mgr-finding${openCase ? '' : ' checked'}`}>
                  {firstName(mgr)} rates <strong className="num">{Math.abs(m.gap).toFixed(2)}</strong> points {m.status === 'above' ? 'above' : 'below'} the team's results.
                </p>
                {m.review ? <Reviewed state={state} r={m.review} /> : isCovered(m.key) ? answeredNote : (
                  <div className="row">
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() => setDialog({ key: m.key, label, context: `${mgr.name}'s average rating is ${signed(m.gap)} from what the team's results suggest.` })}
                    >
                      Mark as checked
                    </button>
                    <button type="button" className="btn btn-sm" onClick={() => setReturning({ key: m.key, personIds: m.reviews.map((r) => r.personId) })}>
                      Send back with a question
                    </button>
                  </div>
                )}
                <Disclosure label={`Show the ${m.n} people`} openLabel="Hide people">
                  <div className="mgr-figures">
                    <div><div className="v num">{m.meanRating.toFixed(2)}</div><div className="l">Avg rating</div></div>
                    <div><div className="v num">{m.meanSuggested.toFixed(2)}</div><div className="l">Results suggest</div></div>
                    <div><div className="v num">{m.n}</div><div className="l">Reviews</div></div>
                  </div>
                  <Dumbbell
                    rows={m.reviews.map((r) => ({
                      label: firstName(person(state, r.personId)),
                      href: `#/hr/person/${r.personId}`,
                      overall: r.overall,
                      suggested: r.suggested,
                      far: isFarFromSuggestion(r.overall, r.suggested),
                    }))}
                  />
                </Disclosure>
              </div>
            </Panel>
          );
        })}
      </div>
      {managers.filter((m) => !m.flagged).map((m) => {
        const mgr = person(state, m.reviewerId);
        return (
          <p className="quiet-line small muted" key={m.reviewerId}>
            <strong>{mgr.name}</strong>{mgr.teamId ? ` · ${teamName(state, mgr.teamId)}` : ''}: {m.status === 'insufficient' ? `nothing to check yet (${m.n} of ${CONFIG.MIN_REVIEWS_FOR_GAP} reviews needed to compare)` : `in line with the team's results (${signed(m.gap)})`}.
          </p>
        );
      })}

      <h2 className="section-label" style={{ marginTop: 28 }}>Single ratings 1 or more away from results</h2>
      <p className="explain-line" style={{ marginBottom: 12 }}>Each of these needs a written reason from the manager.</p>
      <Panel bodyClass="">
        {far.length === 0 ? (
          <Empty title="No single rating is far from its results">Nothing to check here.</Empty>
        ) : (
          far.map((f) => {
            const who = person(state, f.personId);
            const mgr = person(state, f.reviewerId);
            return (
              <div className="flag-row" key={f.key}>
                <div className="stack-sm">
                  <div className="row">
                    <PersonCell name={who.name} sub={`Reviewed by ${mgr.name}`} size="sm" />
                    {f.review ? <Badge>Checked · {f.direction} results</Badge> : <Badge tone="warning">{f.direction === 'above' ? 'Above' : 'Below'} results</Badge>}
                  </div>
                  <div className="small num">
                    Rated <strong>{f.overall}</strong> · results suggest <strong>{f.suggested.toFixed(1)}</strong>
                  </div>
                  {f.reason && (
                    <Disclosure label="Manager's reason" openLabel="Hide reason" defaultOpen={!f.review}>
                      <p className="quote small">“{f.reason}”</p>
                    </Disclosure>
                  )}
                  {f.review && <Reviewed state={state} r={f.review} />}
                  {!f.review && isCovered(f.key, f.personId) && answeredNote}
                </div>
                <div className="row" style={{ alignItems: 'flex-start' }}>
                  {!f.review && !isCovered(f.key, f.personId) && (
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() => setDialog({ key: f.key, label: `${who.name}'s rating: ${f.direction} results`, context: `${who.name} was rated ${f.overall}; results suggest ${f.suggested.toFixed(1)}.` })}
                    >
                      Mark as checked
                    </button>
                  )}
                  {!f.review && !isCovered(f.key, f.personId) && (
                    <button type="button" className="btn btn-sm" onClick={() => setReturning({ key: f.key, personIds: [f.personId] })}>Send back with a question</button>
                  )}
                  <a className="btn btn-sm" href={`#/hr/person/${f.personId}`}>Open review</a>
                </div>
              </div>
            );
          })
        )}
      </Panel>

      {returning && <ReturnDialog flagKey={returning.key} personIds={returning.personIds} again={returning.again} onClose={() => setReturning(undefined)} />}
      {dialog && <FlagReviewDialog flagKey={dialog.key} label={dialog.label} context={dialog.context} onClose={() => setDialog(undefined)} />}
    </>
  );
}
