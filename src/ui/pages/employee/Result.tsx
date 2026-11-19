import { formatDate } from '../../../domain/dates';
import { isReleased } from '../../../domain/release';
import { selfReviewWindow } from '../../../domain/selfReview';
import { managerReviewOf } from '../../../domain/selectors';
import { useStore } from '../../../state/store';
import { Notice, PageHead, Panel } from '../../components';
import { IconLock } from '../../icons';
import { ReviewSummary } from '../../shared/ReviewSummary';

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
          <div className="locked">
            <span className="locked-icon"><IconLock size={22} /></span>
            <div className="stack-sm">
              <h3>Your result is not released yet</h3>
              <p className="muted">
                HR releases all results together, once every review is complete and has been checked. You will then see your
                overall rating, the rating for each behaviour, and your manager's comments here.
              </p>
              <p className="small muted">
                Your review: {review.status === 'submitted' ? 'completed by your manager' : 'not completed yet'}.{' '}
                {['open', 'open_late'].includes(selfReviewWindow(state, userId)) ? (
                  <a href="#/me/self-review">Submit your self-review while you still can →</a>
                ) : (
                  'Nothing to do now.'
                )}
              </p>
            </div>
          </div>
        </Panel>
      </>
    );
  }

  return (
    <>
      <PageHead title="My result" sub={`${state.cycle.name} · released ${formatDate(state.cycle.releasedOn!)}`} />
      <div className="banner">
        <Notice tone="brand" title="Checked for consistency before release">
          Before results were released, HR compared every manager's ratings with their own team's goal results and followed up where they did not match.
        </Notice>
      </div>
      <ReviewSummary personId={userId} audience="employee" />
    </>
  );
}
