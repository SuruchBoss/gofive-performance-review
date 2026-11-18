import { useState } from 'react';
import type { ReviewPatch } from '../../../domain/actions';
import { CONFIG } from '../../../domain/config';
import { formatDate } from '../../../domain/dates';
import { achievement, distanceFromSuggestion, isFarFromSuggestion, needsEvidence, reviewProblems, suggestionFor } from '../../../domain/rating';
import { firstName, goalsOf, managerReviewOf, person, selfReviewOf, teamName } from '../../../domain/selectors';
import type { Goal, Rating } from '../../../domain/types';
import { useStore } from '../../../state/store';
import { go } from '../../../state/router';
import { Dialog, Explain, Notice, PageHead, Panel, RatingScale } from '../../components';
import { TERMS } from '../../glossary';
import { ReviewBadge } from '../../status';
import { caseInfo } from '../../../domain/deadlines';

export const pct = (v: number) => `${Math.round(v * 100)}%`;

export function GoalRow({ g }: { g: Goal }) {
  const a = achievement(g);
  const tone = a >= 1 ? 'met' : a >= 0.8 ? 'near' : 'below';
  return (
    <div className="goal" id={`goal-${g.id}`}>
      <div>
        <div className="goal-title">{g.title}</div>
        <div className="goal-meta">Weight {g.weight}% · {g.source}</div>
      </div>
      <div className="goal-figures num">
        <div className="big">{g.actual} {g.unit}</div>
        <div className="muted">Target {g.direction === 'lower' ? '≤ ' : ''}{g.target}</div>
      </div>
      <div className="goal-bar" aria-label={`${pct(a)} of target`}>
        <div className="goal-track">
          <span className={`goal-fill ${tone}`} style={{ width: `${(Math.min(a, 1.5) / 1.5) * 100}%` }} />
          <span className="goal-target" style={{ left: `${(1 / 1.5) * 100}%` }} />
        </div>
        <span className="goal-pct num">{pct(a)}</span>
      </div>
    </div>
  );
}

export function SuggestionExplainer() {
  return (
    <details className="explain">
      <summary>How is this calculated?</summary>
      <p>
        Each goal's result is divided by its target (capped at 150%), then weighted. Meeting 100% of target suggests a 3, and every 20
        points above or below moves the suggestion one level (80% → 2, 120% → 4). Behaviours are not part of the suggestion: they are
        the manager's judgement.
      </p>
    </details>
  );
}

export function ManagerReviewPage({ personId, userId }: { personId: string; userId: string }) {
  const { state, dispatch, notify } = useStore();
  const [confirm, setConfirm] = useState(false);
  const participant = state.participants.find((p) => p.personId === personId);
  if (!participant || participant.reviewerId !== userId) {
    if (participant?.escalatedFrom === userId) {
      return (
        <Notice tone="brand" title={`This review moved to ${person(state, participant.reviewerId).name}`}>
          It escalated on {formatDate(participant.escalatedOn!)} because it was 3 days past the deadline. Nothing to do now. <a href="#/manager">Back to My team</a>
        </Notice>
      );
    }
    return <Notice tone="warning" title="This review is not assigned to you">Only the current reviewer can open it. <a href="#/manager">Back to My team</a></Notice>;
  }

  const who = person(state, personId);
  const first = firstName(who);
  const review = managerReviewOf(state, personId);
  const self = selfReviewOf(state, personId);
  const goals = goalsOf(state, personId);
  const locked = review.status === 'submitted';
  const sug = suggestionFor(state, personId);
  const suggested = locked && review.suggestedAtSubmit !== undefined ? review.suggestedAtSubmit : sug.value;
  const save = (patch: ReviewPatch) => dispatch({ type: 'save_review', personId, patch });
  const setBehaviour = (competencyId: string, rating: Rating) =>
    save({ behaviour: review.behaviour.map((b) => (b.competencyId === competencyId ? { ...b, rating } : b)) });

  const far = review.overall !== undefined && isFarFromSuggestion(review.overall, suggested);
  const evidence = needsEvidence(review.overall);
  const problems = locked ? [] : reviewProblems(review, suggested);
  const evidenceLen = review.overallEvidence?.trim().length ?? 0;
  const c = caseInfo(state, personId);
  const boss = person(state, userId).managerId;

  return (
    <>
      <PageHead
        crumbs={<a href="#/manager">My team</a>}
        title={<span className="row" style={{ gap: 12 }}>{who.name} <ReviewBadge r={review} /></span>}
        sub={`${who.title} · ${teamName(state, who.teamId)} · ${state.cycle.name}`}
      />
      {c.status === 'overdue' && (
        <div className="banner">
          <Notice tone="warning" title={`Due ${formatDate(c.deadline)} · ${c.daysOverdue} day${c.daysOverdue === 1 ? '' : 's'} overdue`}>
            {boss ? `If not submitted, it moves to ${person(state, boss).name} on ${formatDate(c.escalatesOn!)}.` : 'Please submit as soon as you can.'}
          </Notice>
        </div>
      )}
      {c.status === 'escalated' && participant.escalatedFrom && (
        <div className="banner">
          <Notice tone="danger" title={`Escalated to you on ${formatDate(participant.escalatedOn!)}`}>
            {person(state, participant.escalatedFrom).name} did not submit this review within 3 days of the deadline. Draft ratings, if any, came with it.
          </Notice>
        </div>
      )}
      <div className="review-layout">
        <div className="stack">
          <Panel
            title="Goal results"
            actions={<span className="small muted">Measured, not rated</span>}
            bodyClass="goals"
            foot={
              <div className="stack-sm">
                <div className="suggestion">
                  <div className="suggestion-num num">{Math.round(suggested)}</div>
                  <div>
                    <div className="strong">Suggested overall rating</div>
                    <Explain>{TERMS.suggested}</Explain>
                    <div className="xs muted num">
                      {pct(sug.results)} of targets, weighted · exact value {suggested.toFixed(2)}
                    </div>
                  </div>
                </div>
                <SuggestionExplainer />
              </div>
            }
          >
            {goals.map((g) => <GoalRow key={g.id} g={g} />)}
          </Panel>

          <Panel
            title="Self-review"
            actions={self.status === 'submitted' && self.selfRating ? <span className="small">Own rating <strong>{self.selfRating}</strong> <span className="muted">· context only</span></span> : undefined}
          >
            {self.status === 'submitted' ? (
              <div className="stack-sm">
                <p className="quote">{self.text}</p>
                {self.late && <span className="small muted">Submitted late, {formatDate(self.submittedOn!)}.</span>}
              </div>
            ) : locked ? (
              <Notice tone="warning" title="Reviewed without a self-review">This is recorded on the review.</Notice>
            ) : (
              <Notice tone="warning" title="Self-review missing">
                {first} has not submitted a self-review. You can still review; it will be recorded as missing. {first} can submit late until you submit.
              </Notice>
            )}
          </Panel>
        </div>

        <div className="stack">
          <Panel title="Behaviours">
            <div style={{ marginTop: -4, marginBottom: 16 }}><Explain>{TERMS.anchors}</Explain></div>
            <div className="stack-lg">
              {state.competencies.map((c) => {
                const b = review.behaviour.find((x) => x.competencyId === c.id)!;
                return (
                  <div key={c.id} className="behaviour">
                    <div>
                      <div className="strong">{c.name}</div>
                      <div className="small muted">{c.description}</div>
                    </div>
                    <RatingScale label={c.name} value={b.rating} disabled={locked} onChange={(r) => setBehaviour(c.id, r)} />
                    <div className={`anchor${b.rating ? '' : ' empty'}`}>
                      {b.rating ? <><strong>{b.rating} ·</strong> {c.anchors[b.rating]}</> : 'Pick a level to see what it means.'}
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel title="Overall rating" actions={<span className="small muted">The tick marks the suggestion</span>}>
            <div className="stack">
              <div className="row" style={{ gap: 16 }}>
                <RatingScale size="lg" label="Overall rating" value={review.overall} disabled={locked} marker={Math.round(suggested)} onChange={(r) => save({ overall: r })} />
                {review.overall !== undefined && (
                  <span className={`small ${far ? 'strong' : 'muted'} num`}>
                    {distanceFromSuggestion(review.overall, suggested).toFixed(1)} from the suggestion
                  </span>
                )}
              </div>

              {far && (
                <div className="field">
                  <label htmlFor="reason">Why does your rating differ from the goal results?</label>
                  <span className="hint" id="reason-hint">
                    Required when the rating is {CONFIG.FAR_FROM_SUGGESTION.toFixed(1)} or more from the suggestion. HR sees this when checking consistency.
                  </span>
                  <textarea
                    id="reason"
                    className="textarea"
                    aria-describedby="reason-hint"
                    disabled={locked}
                    value={review.deviationReason ?? ''}
                    onChange={(e) => save({ deviationReason: e.target.value })}
                    placeholder="For example: results were helped or held back by something outside their control."
                  />
                </div>
              )}

              {evidence && (
                <div className="field">
                  <label htmlFor="evidence">Specific example</label>
                  <span className="hint" id="evidence-hint">
                    An overall {review.overall} needs a real example: what happened, when, and the effect.
                  </span>
                  <textarea
                    id="evidence"
                    className="textarea"
                    aria-describedby="evidence-hint"
                    disabled={locked}
                    value={review.overallEvidence ?? ''}
                    onChange={(e) => save({ overallEvidence: e.target.value })}
                    placeholder="In May, ... which led to ..."
                  />
                  {!locked && <span className="counter num">{evidenceLen} / {CONFIG.EVIDENCE_MIN_CHARS} characters minimum</span>}
                </div>
              )}

              <div className="field">
                <label htmlFor="comment">Comment for {first}</label>
                <textarea id="comment" className="textarea" disabled={locked} value={review.comment ?? ''} onChange={(e) => save({ comment: e.target.value })} placeholder="What went well, and what to focus on next year." />
              </div>
            </div>
          </Panel>

          {locked ? (
            <>
              <Notice tone="success" title={`Submitted ${review.submittedOn ? formatDate(review.submittedOn) : ''}`}>
                The review is locked. Managers calibrate ratings across teams before results are released.
              </Notice>
              {review.calibratedOverall && (
                <Notice tone="brand" title={`Calibrated from ${review.overall} to ${review.calibratedOverall}`}>
                  Agreed when managers aligned ratings across teams. Reason: {review.calibrationReason}
                </Notice>
              )}
            </>
          ) : (
            <>
            {problems.length > 0 && (
              <ul className="todo" aria-label="Before you can submit">
                {problems.map((p) => <li key={p.field}>{p.message}</li>)}
              </ul>
            )}
            <div className="submit-bar action-bar">
              <span className="small muted">
                {problems.length > 0 ? `${problems.length} thing${problems.length === 1 ? '' : 's'} left before you can submit (listed above).` : 'Ready to submit. Drafts save automatically.'}
              </span>
              <button type="button" className="btn btn-primary" disabled={problems.length > 0} onClick={() => setConfirm(true)}>Submit review</button>
            </div>
            </>
          )}
        </div>
      </div>

      {confirm && (
        <Dialog
          title={`Submit the review for ${who.name}?`}
          sub="You cannot change it after submitting. HR checks every review before results are released."
          onClose={() => setConfirm(false)}
          footer={
            <>
              <button type="button" className="btn" onClick={() => setConfirm(false)}>Keep editing</button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  dispatch({ type: 'submit_review', personId, actorId: userId });
                  setConfirm(false);
                  notify(`Review for ${who.name} submitted`);
                  go('/manager');
                }}
              >
                Submit review
              </button>
            </>
          }
        >
          <dl className="kv">
            <dt>Overall rating</dt>
            <dd className="strong">{review.overall}</dd>
            <dt>Suggested</dt>
            <dd className="num">{suggested.toFixed(2)}</dd>
            {self.status !== 'submitted' && (<><dt>Self-review</dt><dd>Missing; this will be recorded</dd></>)}
            {far && (<><dt>Flag</dt><dd>HR will check this rating against the results</dd></>)}
          </dl>
        </Dialog>
      )}
    </>
  );
}
