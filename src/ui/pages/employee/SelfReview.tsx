import { formatDate } from '../../../domain/dates';
import { daysLate, selfReviewWindow } from '../../../domain/selfReview';
import { managerReviewOf, person, selfReviewOf } from '../../../domain/selectors';
import { useStore } from '../../../state/store';
import { useState } from 'react';
import { LEVEL_WORDS } from '../../../domain/rating';
import { Badge, Dialog, Notice, PageHead, Panel, RatingScale } from '../../components';



export function EmployeeSelfReview({ userId }: { userId: string }) {
  const { state, dispatch, notify } = useStore();
  const self = selfReviewOf(state, userId);
  const window = selfReviewWindow(state, userId);
  const me = person(state, userId);
  const manager = person(state, me.managerId!);
  const mgrReview = managerReviewOf(state, userId);
  const editable = window === 'open' || window === 'open_late';
  const ready = self.text.trim().length > 0 && !!self.selfRating;
  const [confirm, setConfirm] = useState(false);

  return (
    <div className="narrow">
      <PageHead
        title="Self-review"
        sub={`Due ${formatDate(state.cycle.selfReviewDeadline)}. ${manager.name} reads this alongside your goal results.`}
        actions={
          window === 'submitted' ? <Badge tone="success">{self.late ? 'Submitted late' : 'Submitted'}</Badge>
          : window === 'open_late' ? <Badge tone="warning">Past the deadline</Badge>
          : window === 'closed' ? <Badge>Closed</Badge>
          : <Badge tone="brand">Open</Badge>
        }
      />
      <div className="stack">
        {window === 'open_late' && (
          <Notice tone="warning" title={`The deadline was ${formatDate(state.cycle.selfReviewDeadline)}`}>
            You can still submit until {manager.name.split(' ')[0]} finishes your review. It will be marked as {daysLate(state)} days late.
          </Notice>
        )}
        {window === 'closed' && self.status !== 'submitted' && (
          <Notice tone="brand" title="The self-review is closed">
            {mgrReview.status === 'submitted'
              ? <>{manager.name} completed your review on {formatDate(mgrReview.submittedOn!)} without a self-review. This is recorded on the review. <a href="#/me/result">{state.cycle.status === 'released' ? 'See your result →' : 'See when your result is released →'}</a></>
              : 'You are not part of this review cycle.'}
          </Notice>
        )}
        {window === 'submitted' && (
          <Notice tone="success" title={`Submitted ${formatDate(self.submittedOn!)}`}>
            {manager.name} can now read it. It cannot be changed.
          </Notice>
        )}

        {(editable || window === 'submitted') && (
          <Panel title="Your year">
            <div className="stack">
              <div className="field">
                <label htmlFor="self-text">What did you achieve, and what would you do differently?</label>
                <span className="hint">Specific examples help your manager most.</span>
                <textarea
                  id="self-text"
                  className="textarea tall"
                  disabled={!editable}
                  value={self.text}
                  onChange={(e) => dispatch({ type: 'save_self_review', personId: userId, text: e.target.value })}
                  placeholder="For example: in Q2 I ... which meant ..."
                />
              </div>
              <div className="field">
                <span className="label" id="own-label">Your own rating</span>
                <span className="hint">Your manager sees it next to your goal results. It does not change the suggested rating, which comes from goal results only.</span>
                <div className="row" style={{ gap: 12 }}>
                  <RatingScale label="Your own rating" value={self.selfRating} disabled={!editable} hints={LEVEL_WORDS} onChange={(r) => dispatch({ type: 'save_self_review', personId: userId, selfRating: r })} />
                  <span className="small muted">{self.selfRating ? LEVEL_WORDS[self.selfRating] : '1 well below · 2 below · 3 met · 4 above · 5 well above expectations'}</span>
                </div>
              </div>
            </div>
          </Panel>
        )}

        {editable && (
          <div className={`submit-bar${ready ? ' action-bar' : ''}`}>
            <span className="small muted">{ready ? 'Drafts are saved automatically.' : 'Write a few lines and choose a rating to submit.'}</span>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!ready}
              onClick={() => setConfirm(true)}
            >
              Submit self-review
            </button>
          </div>
        )}
      </div>
      {confirm && (
        <Dialog
          title="Submit your self-review?"
          sub={`You cannot change it after submitting. ${manager.name} can read it straight away.`}
          onClose={() => setConfirm(false)}
          footer={
            <>
              <button type="button" className="btn" onClick={() => setConfirm(false)}>Keep editing</button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  dispatch({ type: 'submit_self_review', personId: userId });
                  setConfirm(false);
                  notify(window === 'open_late' ? 'Self-review submitted (late)' : 'Self-review submitted');
                }}
              >
                Submit self-review
              </button>
            </>
          }
        >
          <p className="small">Your own rating: <strong>{self.selfRating} · {self.selfRating ? LEVEL_WORDS[self.selfRating] : ''}</strong></p>
        </Dialog>
      )}
    </div>
  );
}
