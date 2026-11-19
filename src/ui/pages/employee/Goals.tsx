import { selfReviewWindow } from '../../../domain/selfReview';
import { resultsScore } from '../../../domain/rating';
import { goalsOf, person } from '../../../domain/selectors';
import { useStore } from '../../../state/store';
import { Notice, PageHead, Panel } from '../../components';
import { GoalRow, pct } from '../manager/Review';

export function EmployeeGoals({ userId }: { userId: string }) {
  const { state } = useStore();
  const goals = goalsOf(state, userId);
  const me = person(state, userId);
  const removed = state.participants.find((p) => p.personId === userId)?.removed;
  return (
    <>
      <PageHead title="My goals" sub={`${state.cycle.name} · ${me.title}`} />
      <div className="stack">
        {['open', 'open_late'].includes(selfReviewWindow(state, userId)) && (
          <Notice tone="warning" title={selfReviewWindow(state, userId) === 'open_late' ? 'Your self-review is overdue' : 'Your self-review is open'}>
            You can still write it until your manager finishes your review. <a href="#/me/self-review">Write it now →</a>
          </Notice>
        )}
        {removed && (
          <Notice tone="brand" title="You are not part of this review cycle">
            HR removed you from {state.cycle.name}: {removed.reason}
          </Notice>
        )}
        <Panel title="Goals and results" actions={<span className="small muted num">{pct(resultsScore(goals))} of targets, weighted</span>} bodyClass="goals">
          {goals.map((g) => <GoalRow key={g.id} g={g} />)}
        </Panel>
        <p className="small muted">
          Results come from company systems on the date shown with each goal.{!removed && ' Your manager sees the same figures when they review you.'}
        </p>
      </div>
    </>
  );
}
