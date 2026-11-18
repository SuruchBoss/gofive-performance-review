import { useState } from 'react';
import { CONFIG } from '../../../domain/config';
import { formatDate } from '../../../domain/dates';
import { farFlags, managerConsistency, type ManagerConsistency } from '../../../domain/flags';
import { isFarFromSuggestion } from '../../../domain/rating';
import { firstName, person, teamName } from '../../../domain/selectors';
import type { DemoState, FlagReview } from '../../../domain/types';
import { useStore } from '../../../state/store';
import { Badge, Empty, Notice, PageHead, Panel, PersonCell } from '../../components';
import { IconCheck } from '../../icons';
import { Dumbbell } from '../../shared/Dumbbell';
import { FlagReviewDialog } from '../../shared/FlagReviewDialog';

const signed = (v: number) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toFixed(2)}`;

function GapBadge({ m }: { m: ManagerConsistency }) {
  if (m.status === 'insufficient') return <Badge>Not enough reviews yet</Badge>;
  if (m.status === 'in_line') return <Badge tone="success">In line with results</Badge>;
  if (m.review) return <Badge tone="neutral">Reviewed · rates {m.status} results</Badge>;
  return <Badge tone="warning">Rates {m.status} results</Badge>;
}

function Reviewed({ state, r }: { state: DemoState; r: FlagReview }) {
  return (
    <div className="reviewed-note">
      <div className="row xs muted"><IconCheck size={14} /> Reviewed by {person(state, r.by).name}, {formatDate(r.on)}</div>
      <div>{r.note}</div>
    </div>
  );
}

export function HrConsistency() {
  const { state } = useStore();
  const [dialog, setDialog] = useState<{ key: string; label: string; context: string }>();
  const managers = managerConsistency(state);
  const far = farFlags(state);

  return (
    <>
      <PageHead
        title="Consistency check"
        sub={`Each manager's ratings are compared with the measured goal results of their own team. A gap of ${CONFIG.MANAGER_GAP_FLAG} or more is flagged for you to check before release. Nothing is changed automatically.`}
      />

      <div className="grid-3">
        {managers.map((m) => {
          const mgr = person(state, m.reviewerId);
          const label = `${mgr.name} rates ${m.status} results`;
          return (
            <Panel
              key={m.reviewerId}
              title={<PersonCell name={mgr.name} sub={mgr.teamId ? teamName(state, mgr.teamId) : mgr.title} size="sm" />}
              foot={
                m.flagged ? (
                  m.review ? <Reviewed state={state} r={m.review} /> : (
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() => setDialog({ key: m.key, label, context: `${mgr.name}'s average rating is ${signed(m.gap)} from what the team's results suggest.` })}
                    >
                      Mark reviewed
                    </button>
                  )
                ) : m.status === 'insufficient' ? (
                  <span className="small muted">{m.n} of {CONFIG.MIN_REVIEWS_FOR_GAP} reviews needed to compare.</span>
                ) : (
                  <span className="small muted">No action needed.</span>
                )
              }
            >
              <div className="stack">
                <GapBadge m={m} />
                <div className="mgr-figures">
                  <div><div className="v num">{m.n ? m.meanRating.toFixed(2) : '–'}</div><div className="l">Avg rating</div></div>
                  <div><div className="v num">{m.n ? m.meanSuggested.toFixed(2) : '–'}</div><div className="l">Results suggest</div></div>
                  <div><div className={`v num${m.flagged ? ' gap-pos' : ''}`}>{m.n ? signed(m.gap) : '–'}</div><div className="l">Gap ({m.n} reviews)</div></div>
                </div>
                {m.n > 0 && (
                  <Dumbbell
                    rows={m.reviews.map((r) => ({
                      label: firstName(person(state, r.personId)),
                      href: `#/hr/person/${r.personId}`,
                      overall: r.overall,
                      suggested: r.suggested,
                      far: isFarFromSuggestion(r.overall, r.suggested),
                    }))}
                  />
                )}
              </div>
            </Panel>
          );
        })}
      </div>

      <div style={{ height: 24 }} />
      <Panel
        title="Ratings far from results"
        actions={<span className="small muted">{CONFIG.FAR_FROM_SUGGESTION.toFixed(1)} or more from the suggestion</span>}
        bodyClass=""
      >
        {far.length === 0 ? (
          <Empty title="No ratings are far from the results" />
        ) : (
          far.map((f) => {
            const who = person(state, f.personId);
            const mgr = person(state, f.reviewerId);
            return (
              <div className="flag-row" key={f.key}>
                <div className="stack-sm">
                  <div className="row">
                    <PersonCell name={who.name} sub={`Reviewed by ${mgr.name}`} size="sm" />
                    {f.review ? <Badge>Reviewed</Badge> : <Badge tone="warning">Rated {f.direction} results</Badge>}
                  </div>
                  <div className="small num">
                    Rated <strong>{f.overall}</strong> · results suggest <strong>{f.suggested.toFixed(2)}</strong>
                  </div>
                  {f.reason && <p className="quote small">“{f.reason}”</p>}
                  {f.review && <Reviewed state={state} r={f.review} />}
                </div>
                <div className="row" style={{ alignItems: 'flex-start' }}>
                  <a className="btn btn-sm" href={`#/hr/person/${f.personId}`}>Open review</a>
                  {!f.review && (
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() => setDialog({ key: f.key, label: `${who.name} rated ${f.direction} results`, context: `${who.name} was rated ${f.overall}; results suggest ${f.suggested.toFixed(2)}.` })}
                    >
                      Mark reviewed
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </Panel>
      <div style={{ height: 16 }} />
      <Notice tone="brand">
        Ratings are not compared across teams and there is no forced distribution. Each team is compared only with its own measured results.
      </Notice>

      {dialog && <FlagReviewDialog flagKey={dialog.key} label={dialog.label} context={dialog.context} onClose={() => setDialog(undefined)} />}
    </>
  );
}
