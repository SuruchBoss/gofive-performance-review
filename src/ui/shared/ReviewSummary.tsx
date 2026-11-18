import { formatDate } from '../../domain/dates';
import { farFlags } from '../../domain/flags';
import { behaviourScore, suggestionFor } from '../../domain/rating';
import { goalsOf, managerReviewOf, person, selfReviewOf } from '../../domain/selectors';
import { useStore } from '../../state/store';
import { useState } from 'react';
import { finalRating } from '../../domain/calibration';
import { Badge, Notice, Panel, Section } from '../components';
import { TERMS } from '../glossary';
import { GoalRow, pct, SuggestionExplainer } from '../pages/manager/Review';


/**
 * Read-only breakdown of one person's review. Every score shows where it came from:
 * results from goals and their sources, behaviours from the anchors, the overall
 * rating from the manager with their reason and evidence.
 */
export function ReviewSummary({ personId, audience }: { personId: string; audience: 'hr' | 'employee' }) {
  const { state } = useStore();
  const review = managerReviewOf(state, personId);
  const self = selfReviewOf(state, personId);
  const sug = suggestionFor(state, personId);
  const suggested = review.suggestedAtSubmit ?? sug.value;
  const b = behaviourScore(review);
  const flag = farFlags(state).find((f) => f.personId === personId);
  const submitted = review.status === 'submitted';
  const goals = goalsOf(state, personId);
  const [open, setOpen] = useState({ goals: false, behaviours: false, self: false });
  const toggle = (k: keyof typeof open) => setOpen((o) => ({ ...o, [k]: !o[k] }));
  // A score tile opens its section and scrolls to it (the URL hash belongs to the router).
  const jump = (k: 'goals' | 'behaviours') => {
    setOpen((o) => ({ ...o, [k]: true }));
    requestAnimationFrame(() => document.getElementById(k)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  return (
    <div className="stack">
      <div className="grid-3">
        <Panel>
          <div className="score-tile">
            <span className="l">Overall rating</span>
            <span className="v num">{submitted ? finalRating(review) : '–'}</span>
            <span className="s">
              {submitted ? <>By {person(state, review.reviewerId).name}, {formatDate(review.submittedOn!)}</> : 'Not submitted yet'}
              {review.calibratedOverall && <><br /><strong className="cal-new">Calibrated from {review.overall} to {review.calibratedOverall}</strong> across teams</>}
            </span>
          </div>
        </Panel>
        <Panel>
          <button type="button" className="score-tile link" onClick={() => jump('goals')}>
            <span className="l">Goal results</span>
            <span className="v num">{suggested.toFixed(1)}</span>
            <span className="s">{pct(sug.results)} of targets, weighted. 100% of target is a 3.</span>
          </button>
        </Panel>
        <Panel>
          <button type="button" className="score-tile link" onClick={() => jump('behaviours')}>
            <span className="l">Behaviours</span>
            <span className="v num">{b !== undefined ? b.toFixed(1) : '–'}</span>
            <span className="s">{TERMS.behaviour}</span>
          </button>
        </Panel>
      </div>

      {audience === 'hr' && flag && (
        <Notice tone={flag.review ? 'brand' : 'warning'} title={`Rated ${flag.direction} results${flag.review ? ' · reviewed by HR' : ''}`}>
          The overall rating is {Math.abs(flag.overall - flag.suggested).toFixed(1)} away from what the goal results suggest (the limit is 1.0). Check the manager’s reason below.
        </Notice>
      )}

      {submitted && (
        <Panel title="Manager's assessment">
          <dl className="kv">
            {review.deviationReason && (<><dt>Why it differs from results</dt><dd>{review.deviationReason}</dd></>)}
            {review.overallEvidence && (<><dt>Example</dt><dd>{review.overallEvidence}</dd></>)}
            {review.comment && (<><dt>Comment</dt><dd>{review.comment}</dd></>)}
            {review.calibratedOverall && (<><dt>Calibration</dt><dd>Changed from {review.overall} to {review.calibratedOverall} when managers aligned ratings across teams. Reason: {review.calibrationReason}</dd></>)}
            {review.selfReviewMissing && (<><dt>Self-review</dt><dd><Badge tone="warning">Missing when reviewed</Badge></dd></>)}
          </dl>
        </Panel>
      )}

      <Section
        id="goals"
        title="Goal results"
        summary={`${goals.length} goals · ${pct(sug.results)} of targets`}
        open={open.goals}
        onToggle={() => toggle('goals')}
        bodyClass="goals"
        foot={<SuggestionExplainer />}
      >
        {goals.map((g) => <GoalRow key={g.id} g={g} />)}
      </Section>
      <Section
        id="behaviours"
        title="Behaviours"
        summary={b !== undefined ? `Average ${b.toFixed(1)} of 5` : 'Not rated yet'}
        open={open.behaviours}
        onToggle={() => toggle('behaviours')}
      >
        <div className="stack">
          {state.competencies.map((c) => {
            const r = review.behaviour.find((x) => x.competencyId === c.id)?.rating;
            return (
              <div key={c.id} className="stack-sm">
                <div className="row-between">
                  <span className="strong">{c.name}</span>
                  <span className="rating-chip num">{r ?? '–'}</span>
                </div>
                {r && <div className="anchor">{c.anchors[r]}</div>}
              </div>
            );
          })}
        </div>
      </Section>
      {audience === 'hr' && (
        <Section
          id="self"
          title="Self-review"
          summary={self.status === 'submitted' ? `Own rating ${self.selfRating}${self.late ? ' · late' : ''}` : 'Not submitted'}
          open={open.self}
          onToggle={() => toggle('self')}
        >
          {self.status === 'submitted' ? <p className="quote">{self.text}</p> : <span className="muted">Not submitted.</span>}
        </Section>
      )}
    </div>
  );
}
