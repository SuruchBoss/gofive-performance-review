import { caseInfo } from '../../../domain/deadlines';
import { managerTodo } from '../../../domain/home';
import { formatDate } from '../../../domain/dates';
import { managerReviewOf, person, selfReviewOf } from '../../../domain/selectors';
import { useStore } from '../../../state/store';
import { Badge, Notice, PageHead, Panel, PersonCell } from '../../components';

/**
 * The manager's home: what you have to do now, and by when. Each person is one row
 * that opens their review; finished reviews sit below.
 */
export function ManagerTeam({ userId }: { userId: string }) {
  const { state } = useStore();
  const me = person(state, userId);
  const first = me.name.split(' ')[0];
  const boss = me.managerId ? person(state, me.managerId) : undefined;
  const mine = state.participants.filter((p) => p.reviewerId === userId && !p.removed);
  const review = (id: string) => managerReviewOf(state, id);
  const { returned, toWrite, done, movedAway } = managerTodo(state, userId);
  const open = [...returned, ...toWrite];
  const lateOnes = toWrite.map((p) => caseInfo(state, p.personId)).filter((c) => c.status === 'overdue');
  const movesOn = lateOnes.map((c) => c.escalatesOn!).sort()[0];
  const maxLate = Math.max(0, ...lateOnes.map((c) => c.daysOverdue));

  const title = open.length === 0
    ? `Nothing to do now, ${first}`
    : [
        toWrite.length ? `${toWrite.length} review${toWrite.length === 1 ? '' : 's'} to write` : '',
        returned.length ? `${returned.length} question${returned.length === 1 ? '' : 's'} from HR` : '',
      ].filter(Boolean).join(' and ');
  const sub = open.length === 0
    ? (mine.length ? (state.cycle.status === 'released' ? `All ${done.length} of your reviews are sent, and results were released on ${formatDate(state.cycle.releasedOn!)}. Everyone can see their result.` : `All ${done.length} of your reviews are sent. HR checks them, then everyone sees their result.`) : movedAway.length ? 'Your open reviews moved to your manager after the deadline.' : 'Reviews appear here when they are yours to write.')
    : toWrite.length === 0
    ? 'HR sent a review back with a question. Results wait for your answer.'
    : lateOnes.length
    ? `Due ${formatDate(state.cycle.managerDeadline)} · ${maxLate} day${maxLate === 1 ? '' : 's'} late.${boss ? ` Reviews not sent by ${formatDate(movesOn)} move to your manager, ${boss.name}.` : ''}`
    : `Due ${formatDate(toWrite.map((p) => caseInfo(state, p.personId).deadline).sort()[0])}.`;

  const row = (personId: string, status: JSX.Element, note?: string) => {
    const who = person(state, personId);
    const p = state.participants.find((x) => x.personId === personId)!;
    const self = selfReviewOf(state, personId);
    const detail = [who.title, p.escalatedFrom ? `moved to you from ${person(state, p.escalatedFrom).name}` : '', note ?? (self.status === 'submitted' ? 'self-review in' : 'no self-review yet')].filter(Boolean).join(' · ');
    return (
      <a key={personId} className="task-row" href={`#/manager/review/${personId}`}>
        <PersonCell name={who.name} sub={detail} size="sm" />
        <span className="task-row-end">{status}<span className="task-chevron" aria-hidden="true">›</span></span>
      </a>
    );
  };

  return (
    <>
      <PageHead title={title} sub={sub} />
      {state.calibration.status !== 'not_started' && state.cycle.status === 'open' && (
        <div style={{ marginBottom: 16 }}>
          <Notice tone="brand" title={state.calibration.status === 'locked' ? 'Final ratings are agreed' : 'Final ratings are being agreed'}>
            {state.calibration.status === 'locked'
              ? 'Managers met and agreed final ratings across teams. Any change to your team is shown below with the reason. Results open when HR releases them.'
              : 'Managers are meeting to agree final ratings across teams. Any change to your team is shown below with the reason. Nothing to do here.'}
          </Notice>
        </div>
      )}
      {open.length > 0 && (
        <Panel title="To do" actions={<span className="small muted">Tap a name to open the review</span>} bodyClass="">
          {returned.map((p) => row(p.personId, <Badge tone="warning">HR asked a question</Badge>, 'answer HR to send it back'))}
          {toWrite.map((p) => row(
            p.personId,
            review(p.personId).status === 'draft' ? <Badge tone="brand">Draft saved</Badge> : <Badge>Not started</Badge>,
          ))}
        </Panel>
      )}
      {done.length > 0 && (
        <div style={{ marginTop: open.length ? 16 : 0 }}>
          <Panel title={`Done (${done.length})`} bodyClass="">
            {done.map((p) => row(p.personId, <Badge tone="success">Submitted</Badge>, review(p.personId).calibratedOverall ? `final rating changed ${review(p.personId).overall} → ${review(p.personId).calibratedOverall}` : `sent ${formatDate(review(p.personId).submittedOn!, true)}`))}
          </Panel>
        </div>
      )}
      {movedAway.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <Panel title="Moved to your manager" actions={<span className="small muted">Nothing to do</span>} bodyClass="">
            {movedAway.map((p) => (
              <div className="flag-row" key={p.personId}>
                <PersonCell name={person(state, p.personId).name} sub={`Moved to ${person(state, p.reviewerId).name} on ${formatDate(p.escalatedOn!)}, 3 days after the deadline. Any draft went with it.`} size="sm" />
              </div>
            ))}
          </Panel>
        </div>
      )}
    </>
  );
}
