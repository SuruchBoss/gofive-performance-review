import { formatDate } from '../../../domain/dates';
import { isReleased } from '../../../domain/release';
import { selfReviewWindow } from '../../../domain/selfReview';
import { managerReviewOf, selfReviewOf } from '../../../domain/selectors';
import { useStore } from '../../../state/store';
import { Notice, PageHead, Panel } from '../../components';
import { IconLock } from '../../icons';
import { ReviewSummary } from '../../shared/ReviewSummary';
import { DemoShortcut } from '../../shared/DemoShortcut';

export function EmployeeResult({ userId }: { userId: string }) {
  const { state } = useStore();
  const participant = state.participants.find((p) => p.personId === userId);
  const released = isReleased(state);
  const review = managerReviewOf(state, userId);

  if (participant?.removed) {
    return (
      <>
        <PageHead title="My result" sub={state.cycle.name} />
        <Notice tone="brand" title="You are not part of this review cycle">
          HR removed you from {state.cycle.name} on {formatDate(participant.removed.on)}. Reason: {participant.removed.reason}
        </Notice>
      </>
    );
  }

  if (!released || review.status !== 'submitted') {
    return (
      <>
        <PageHead title="My result" sub={state.cycle.name} />
        <Panel>
          <div className="locked" data-tour="result-locked">
            <span className="locked-icon"><IconLock size={22} /></span>
            <div className="stack-sm">
              <h3>Your result is not released yet</h3>
              <p className="muted">
                Results open after every review is in, the managers have calibrated ratings across teams, and HR releases them
                together. You will then see your overall rating, the rating for each behaviour, and your manager's comments here.
              </p>
              <p className="small muted">
                Your manager's review: {review.status === 'submitted' ? 'done' : 'not done yet'}. Your self-review: {selfReviewOf(state, userId).status === 'submitted' ? 'submitted' : 'not submitted'}. Calibration:{' '}
                {state.calibration.status === 'locked' ? 'done' : state.calibration.status === 'in_session' ? 'in progress' : 'not started yet'}.{' '}
                {['open', 'open_late'].includes(selfReviewWindow(state, userId)) ? (
                  <a href="#/me/self-review">Submit your self-review while you still can →</a>
                ) : (
                  'Nothing to do now.'
                )}
              </p>
            </div>
          </div>
        </Panel>
        <DemoShortcut />
      </>
    );
  }

  return (
    <>
      <PageHead title="My result" sub={`${state.cycle.name} · released ${formatDate(state.cycle.releasedOn!)}`} />
      <div className="banner">
        <Notice tone="brand" title="Checked for consistency before release">
          Before release, HR compared each manager's ratings with their own team's goal results and checked every rating 1.0 or more away from what goal results suggest. Managers then calibrated ratings together across teams.
        </Notice>
      </div>
      <ReviewSummary personId={userId} audience="employee" />
    </>
  );
}
