import { useState } from 'react';
import { formatDate } from '../../../domain/dates';
import { goalsOf, managerReviewOf, person, selfReviewOf, teamName } from '../../../domain/selectors';
import type { Rating } from '../../../domain/types';
import type { ReviewPatch } from '../../../domain/actions';
import { useStore } from '../../../state/store';
import { go } from '../../../state/router';
import { Dialog, Notice, PageHead, Panel, PersonCell, RatingScale } from '../../components';
import { ReviewBadge } from '../../status';

export function ManagerReviewPage({ personId, userId }: { personId: string; userId: string }) {
  const { state, dispatch, notify } = useStore();
  const [confirm, setConfirm] = useState(false);
  const participant = state.participants.find((p) => p.personId === personId);
  if (!participant || participant.reviewerId !== userId) {
    return <Notice tone="warning" title="This review is not assigned to you">Go back to <a href="#/manager">My team</a>.</Notice>;
  }

  const who = person(state, personId);
  const review = managerReviewOf(state, personId);
  const self = selfReviewOf(state, personId);
  const goals = goalsOf(state, personId);
  const locked = review.status === 'submitted';
  const save = (patch: ReviewPatch) =>
    dispatch({ type: 'save_review', personId, patch });

  const setBehaviour = (competencyId: string, rating: Rating) =>
    save({ behaviour: review.behaviour.map((b) => (b.competencyId === competencyId ? { ...b, rating } : b)) });

  const complete = review.behaviour.every((b) => b.rating) && review.overall !== undefined;

  return (
    <>
      <PageHead
        crumbs={<a href="#/manager">My team</a>}
        title={<span className="row" style={{ gap: 12 }}>{who.name} <ReviewBadge r={review} /></span>}
        sub={`${who.title} · ${teamName(state, who.teamId)} · ${state.cycle.name}`}
      />
      <div className="review-layout">
        <div className="stack">
          <Panel title="Goal results" actions={<span className="small muted">Measured, not rated</span>} bodyClass="goals">
            {goals.map((g) => (
              <div className="goal" key={g.id}>
                <div>
                  <div className="goal-title">{g.title}</div>
                  <div className="goal-meta">Weight {g.weight}% · {g.source}</div>
                </div>
                <div className="goal-figures num">
                  <div className="big">{g.actual} {g.unit}</div>
                  <div className="muted">Target {g.direction === 'lower' ? '≤ ' : ''}{g.target}</div>
                </div>
              </div>
            ))}
          </Panel>

          <Panel title="Self-review" actions={self.status === 'submitted' && self.selfRating ? <span className="small">Own rating <strong>{self.selfRating}</strong></span> : undefined}>
            {self.status === 'submitted' ? (
              <p style={{ whiteSpace: 'pre-wrap' }}>{self.text}</p>
            ) : (
              <Notice tone="warning" title="Self-review missing">
                {who.name.split(' ')[0]} has not submitted a self-review. You can still review.
              </Notice>
            )}
          </Panel>
        </div>

        <div className="stack">
          <Panel title="Behaviours" actions={<span className="small muted">Rate against the written anchors</span>}>
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

          <Panel title="Overall rating">
            <div className="stack">
              <RatingScale size="lg" label="Overall rating" value={review.overall} disabled={locked} onChange={(r) => save({ overall: r })} />
              <div className="field">
                <label htmlFor="comment">Comment for {who.name.split(' ')[0]}</label>
                <textarea id="comment" className="textarea" disabled={locked} value={review.comment ?? ''} onChange={(e) => save({ comment: e.target.value })} placeholder="What went well, and what to focus on next year." />
              </div>
            </div>
          </Panel>

          {locked ? (
            <Notice tone="success" title={`Submitted ${review.submittedOn ? formatDate(review.submittedOn) : ''}`}>
              The review is locked. HR checks it before results are released.
            </Notice>
          ) : (
            <div className="row-between">
              <span className="small muted">Changes are saved as a draft automatically.</span>
              <button type="button" className="btn btn-primary" disabled={!complete} onClick={() => setConfirm(true)}>Submit review</button>
            </div>
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
          <PersonCell name={who.name} sub={`Overall rating ${review.overall}`} />
        </Dialog>
      )}
    </>
  );
}
