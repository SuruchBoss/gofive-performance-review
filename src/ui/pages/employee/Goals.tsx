import { formatDate } from '../../../domain/dates';
import { resultsScore } from '../../../domain/rating';
import { selfReviewWindow } from '../../../domain/selfReview';
import { goalsOf, managerReviewOf, person, selfReviewOf } from '../../../domain/selectors';
import { useStore } from '../../../state/store';
import { PageHead, Panel } from '../../components';
import { GoalRow, pct } from '../manager/Review';

/**
 * The employee's home: one card that says what to do now (or that there is nothing
 * to do), with their goal results below.
 */
export function EmployeeGoals({ userId }: { userId: string }) {
  const { state } = useStore();
  const goals = goalsOf(state, userId);
  const me = person(state, userId);
  const first = me.name.split(' ')[0];
  const removed = state.participants.find((p) => p.personId === userId)?.removed;
  const window = selfReviewWindow(state, userId);
  const self = selfReviewOf(state, userId);
  const manager = me.managerId ? person(state, me.managerId) : undefined;
  const released = state.cycle.status === 'released' && managerReviewOf(state, userId).status === 'submitted';

  let card: { title: string; text: string; action?: { label: string; href: string } };
  if (removed) {
    card = { title: 'You are not in this review', text: `HR left you out of ${state.cycle.name}. Reason: ${removed.reason}` };
  } else if (released) {
    card = { title: 'Your result is ready', text: 'See your overall rating, what it is based on, and your manager’s comments.', action: { label: 'See my result', href: '#/me/result' } };
  } else if (window === 'open' || window === 'open_late') {
    card = {
      title: 'Write your self-review',
      text: window === 'open_late'
        ? `It was due ${formatDate(state.cycle.selfReviewDeadline)}. You can still send it until ${manager ? manager.name.split(' ')[0] : 'your manager'} finishes your review. It will be marked late.`
        : `Due ${formatDate(state.cycle.selfReviewDeadline)}. Your manager reads it next to your goal results.`,
      action: { label: self.status === 'draft' ? 'Continue my self-review' : 'Write my self-review', href: '#/me/self-review' },
    };
  } else {
    card = {
      title: 'Nothing to do now',
      text: `${self.status === 'submitted' ? `Your self-review was sent on ${formatDate(self.submittedOn!)}.` : 'Your manager finished your review, so the self-review is closed.'} You will see your result when HR releases results for everyone.`,
      action: { label: 'See what happens next', href: '#/me/result' },
    };
  }

  return (
    <>
      <PageHead title={`Hello ${first}`} sub={`${state.cycle.name} · ${me.title}`} />
      <div className="stack">
        <section className={`todo-card${card.action && !card.title.startsWith('Nothing') ? ' has-task' : ''}`} aria-label="To do">
          <div className="todo-card-label">{card.title.startsWith('Nothing') || removed ? 'To do' : 'To do now'}</div>
          <h2>{card.title}</h2>
          <p>{card.text}</p>
          {card.action && (
            <a className={`btn${card.title.startsWith('Nothing') ? '' : ' btn-primary'}`} href={card.action.href}>{card.action.label}</a>
          )}
        </section>
        <Panel title="My goal results" actions={<span className="small muted num">{pct(resultsScore(goals))} of targets</span>} bodyClass="goals">
          {goals.map((g) => <GoalRow key={g.id} g={g} />)}
        </Panel>
        <p className="small muted">
          Results come from company systems on the date shown with each goal.{!removed && ' Your manager sees the same figures when they review you.'}
        </p>
      </div>
    </>
  );
}
