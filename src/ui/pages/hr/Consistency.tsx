import { useState } from 'react';
import { CONFIG } from '../../../domain/config';
import { formatDate } from '../../../domain/dates';
import { farFlags, managerConsistency, type ManagerConsistency } from '../../../domain/flags';
import { isFarFromSuggestion } from '../../../domain/rating';
import { firstName, person, teamName } from '../../../domain/selectors';
import type { DemoState, FlagReview } from '../../../domain/types';
import { useStore } from '../../../state/store';
import { Badge, Disclosure, Empty, Notice, PageHead, Panel, PersonCell } from '../../components';
import { IconCheck } from '../../icons';
import { Dumbbell } from '../../shared/Dumbbell';
import { TERMS } from '../../glossary';
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

function gapSentence(m: ManagerConsistency): string {
  if (m.status === 'insufficient') return `${m.n} of ${CONFIG.MIN_REVIEWS_FOR_GAP} reviews in. Too few to compare yet.`;
  const d = Math.abs(m.gap).toFixed(2);
  if (m.status === 'in_line') return `Ratings are within ${d} of what the team's results suggest.`;
  return `Ratings are on average ${d} ${m.status === 'above' ? 'higher' : 'lower'} than the team's results suggest.`;
}

export function HrConsistency() {
  const { state } = useStore();
  const [dialog, setDialog] = useState<{ key: string; label: string; context: string }>();
  const managers = managerConsistency(state);
  const far = farFlags(state);
  const open = managers.filter((m) => m.flagged && !m.review).length + far.filter((f) => !f.review).length;

  return (
    <>
      <PageHead
        title="Consistency check"
        sub={open ? `${open} flag${open === 1 ? '' : 's'} to check before release. Each manager is compared only with their own team's results. Nothing changes automatically.` : 'Every flag has been checked. Each manager is compared only with their own team\'s results.'}
      />

      <h2 className="section-label">Managers</h2>
      <p className="explain-line" style={{ marginBottom: 12 }}>Manager gap: {TERMS.gap}</p>
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
                      className="btn btn-primary btn-sm"
                      onClick={() => setDialog({ key: m.key, label, context: `${mgr.name}'s average rating is ${signed(m.gap)} from what the team's results suggest.` })}
                    >
                      Mark reviewed
                    </button>
                  )
                ) : (
                  <span className="small muted">{m.status === 'insufficient' ? 'Nothing to check yet.' : 'No action needed.'}</span>
                )
              }
            >
              <div className="stack-sm">
                <div className="row-between">
                  <GapBadge m={m} />
                  {m.status !== 'insufficient' && <span className={`mgr-gap num${m.flagged ? ' gap-pos' : ''}`}>{signed(m.gap)}</span>}
                </div>
                <p className="mgr-line">{gapSentence(m)}</p>
                {m.n > 0 && (
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
                )}
              </div>
            </Panel>
          );
        })}
      </div>

      <h2 className="section-label" style={{ marginTop: 28 }}>Single ratings far from results</h2>
      <p className="explain-line" style={{ marginBottom: 12 }}>{TERMS.far}</p>
      <Panel bodyClass="">
        {far.length === 0 ? (
          <Empty title="No ratings are far from the results">Nothing to check here.</Empty>
        ) : (
          far.map((f) => {
            const who = person(state, f.personId);
            const mgr = person(state, f.reviewerId);
            return (
              <div className="flag-row" key={f.key}>
                <div className="stack-sm">
                  <div className="row">
                    <PersonCell name={who.name} sub={`Reviewed by ${mgr.name}`} size="sm" />
                    {f.review ? <Badge>Checked</Badge> : <Badge tone="warning">Rated {f.direction} results</Badge>}
                  </div>
                  <div className="small num">
                    Rated <strong>{f.overall}</strong> · results suggest <strong>{f.suggested.toFixed(1)}</strong>
                  </div>
                  {f.reason && (
                    <Disclosure label="Manager's reason" openLabel="Hide reason">
                      <p className="quote small">“{f.reason}”</p>
                    </Disclosure>
                  )}
                  {f.review && <Reviewed state={state} r={f.review} />}
                </div>
                <div className="row" style={{ alignItems: 'flex-start' }}>
                  {!f.review && (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => setDialog({ key: f.key, label: `${who.name}'s rating: ${f.direction} results`, context: `${who.name} was rated ${f.overall}; results suggest ${f.suggested.toFixed(1)}.` })}
                    >
                      Mark reviewed
                    </button>
                  )}
                  <a className="btn btn-sm" href={`#/hr/person/${f.personId}`}>Open review</a>
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
