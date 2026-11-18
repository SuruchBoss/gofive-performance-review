import { formatDate } from '../../domain/dates';
import { farFlags } from '../../domain/flags';
import { behaviourScore, suggestionFor } from '../../domain/rating';
import { goalsOf, managerReviewOf, person, selfReviewOf } from '../../domain/selectors';
import { useStore } from '../../state/store';
import { Badge, Notice, Panel } from '../components';
import { GoalRow, pct, SuggestionExplainer } from '../pages/manager/Review';

// In-page jumps use scrollIntoView: the URL hash is taken by the router.
const jump = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

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

  return (
    <div className="stack">
      <div className="grid-3">
        <Panel>
          <div className="score-tile">
            <span className="l">Overall rating</span>
            <span className="v num">{submitted ? review.overall : '–'}</span>
            <span className="s">
              {submitted ? <>By {person(state, review.reviewerId).name}, {formatDate(review.submittedOn!)}</> : 'Not submitted yet'}
            </span>
          </div>
        </Panel>
        <Panel>
          <button type="button" className="score-tile link" onClick={() => jump('goals')}>
            <span className="l">Goal results</span>
            <span className="v num">{suggested.toFixed(1)}</span>
            <span className="s">{pct(sug.results)} of goal targets, weighted</span>
          </button>
        </Panel>
        <Panel>
          <button type="button" className="score-tile link" onClick={() => jump('behaviours')}>
            <span className="l">Behaviours</span>
            <span className="v num">{b !== undefined ? b.toFixed(1) : '–'}</span>
            <span className="s">Average of 4 behaviour ratings</span>
          </button>
        </Panel>
      </div>

      {audience === 'hr' && flag && (
        <Notice tone={flag.review ? 'brand' : 'warning'} title={`Rated ${flag.direction} results${flag.review ? ' · reviewed by HR' : ''}`}>
          The overall rating is {Math.abs(flag.overall - flag.suggested).toFixed(1)} from the suggestion. Check the reason below.
        </Notice>
      )}

      {submitted && (
        <Panel title="Manager's assessment">
          <dl className="kv">
            {review.deviationReason && (<><dt>Why it differs from results</dt><dd>{review.deviationReason}</dd></>)}
            {review.overallEvidence && (<><dt>Example</dt><dd>{review.overallEvidence}</dd></>)}
            {review.comment && (<><dt>Comment</dt><dd>{review.comment}</dd></>)}
            {review.selfReviewMissing && (<><dt>Self-review</dt><dd><Badge tone="warning">Missing when reviewed</Badge></dd></>)}
          </dl>
        </Panel>
      )}

      <div className="grid-2">
        <Panel title="Goal results" bodyClass="goals" id="goals" foot={<SuggestionExplainer />}>
          {goalsOf(state, personId).map((g) => <GoalRow key={g.id} g={g} />)}
        </Panel>
        <Panel title="Behaviours" id="behaviours">
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
        </Panel>
      </div>

      {audience === 'hr' && (
        <Panel title="Self-review" actions={self.selfRating ? <span className="small">Own rating <strong>{self.selfRating}</strong></span> : undefined}>
          {self.status === 'submitted' ? <p className="quote">{self.text}</p> : <span className="muted">Not submitted.</span>}
        </Panel>
      )}
    </div>
  );
}
