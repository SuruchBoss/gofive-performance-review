import { openReturn } from '../../../domain/deadlines';
import { formatDate } from '../../../domain/dates';
import { managerReviewOf, person, selfReviewOf, teamName } from '../../../domain/selectors';
import { useStore } from '../../../state/store';
import { Empty, PageHead, Panel, PersonCell } from '../../components';
import { IconPeople } from '../../icons';
import { CaseBadge, SelfReviewBadge } from '../../status';
import { caseInfo } from '../../../domain/deadlines';
import { Notice } from '../../components';

export function ManagerTeam({ userId }: { userId: string }) {
  const { state } = useStore();
  const me = person(state, userId);
  const returnedToMe = state.participants.filter((p) => p.reviewerId === userId && openReturn(managerReviewOf(state, p.personId)));
  const movedAway = state.participants.filter((p) => p.escalatedFrom === userId && !p.removed);
  const rank = (id: string) => ({ draft: 0, not_started: 1, submitted: 2 })[managerReviewOf(state, id).status];
  // Open reviews first (drafts before new ones), finished ones last.
  const mine = state.participants.filter((p) => p.reviewerId === userId && !p.removed).sort((a, b) => rank(a.personId) - rank(b.personId));
  const done = mine.filter((p) => managerReviewOf(state, p.personId).status === 'submitted').length;
  const overdue = mine.filter((p) => caseInfo(state, p.personId).status === 'overdue');
  const escalatedToMe = mine.filter((p) => p.escalatedFrom && managerReviewOf(state, p.personId).status !== 'submitted');
  const firstEscalation = overdue.map((p) => caseInfo(state, p.personId).escalatesOn!).sort()[0];
  const boss = me.managerId ? person(state, me.managerId) : undefined;
  // The one main action: the most urgent open review (drafts first, then by name order in the list).
  const openOnes = mine.filter((p) => managerReviewOf(state, p.personId).status !== 'submitted');
  const nextId = (openOnes.find((p) => managerReviewOf(state, p.personId).status === 'draft') ?? openOnes[0])?.personId;

  return (
    <>
      <PageHead
        title={me.teamId ? `My team · ${teamName(state, me.teamId)}` : 'Reviews assigned to me'}
        sub={mine.length ? `${done} of ${mine.length} reviews submitted. Reviews were due ${formatDate(state.cycle.managerDeadline)}.` : 'Reviews appear here when they are assigned or escalated to you.'}
      />
      {overdue.length > 0 && boss && (
        <div style={{ marginBottom: 16 }}>
          <Notice tone="warning" title={`${overdue.length} review${overdue.length === 1 ? ' is' : 's are'} overdue`}>
            Open reviews move to {boss.name} 3 days after their deadline. The next one escalates on {formatDate(firstEscalation)}.
          </Notice>
        </div>
      )}
      {returnedToMe.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Notice tone="warning" title={`HR returned ${returnedToMe.length} review${returnedToMe.length === 1 ? '' : 's'} with a question`}>
            Open {returnedToMe.length === 1 ? 'it' : 'each one'}, change the rating or keep it, and answer HR. Results cannot be released until you do.
          </Notice>
        </div>
      )}
      {escalatedToMe.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Notice tone="danger" title={`${escalatedToMe.length} review${escalatedToMe.length === 1 ? ' was' : 's were'} escalated to you`}>
            The original reviewer missed the deadline by 3 days. Any draft ratings moved with the review.
          </Notice>
        </div>
      )}
      <Panel bodyClass="table-wrap">
        {mine.length === 0 ? (
          <Empty icon={<IconPeople size={32} />} title="No reviews assigned to you">
            {movedAway.length ? 'Your open reviews moved to your manager after the deadline. Nothing to do now.' : 'Reviews appear here when they are assigned or escalated to you. Nothing to do now.'}
          </Empty>
        ) : (
          <table className="data stack-on-phone">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Self-review</th>
                <th>Your review</th>
                <th>Deadline</th>
                <th><span className="sr-only">Action</span></th>
              </tr>
            </thead>
            <tbody>
              {mine.map((p) => {
                const who = person(state, p.personId);
                const r = managerReviewOf(state, p.personId);
                const c = caseInfo(state, p.personId);
                return (
                  <tr key={p.personId}>
                    <td className="cell-primary">
                      <PersonCell name={who.name} sub={p.escalatedFrom ? `${who.title} · escalated from ${person(state, p.escalatedFrom).name}` : who.title} size="sm" />
                    </td>
                    <td data-label="Self-review"><SelfReviewBadge r={selfReviewOf(state, p.personId)} /></td>
                    <td data-label="Your review">
                      <div>
                        <CaseBadge c={c} />
                        {r.status === 'draft' && <div className="xs muted">Draft saved</div>}
                      </div>
                    </td>
                    <td data-label="Deadline" className="num nowrap">{formatDate(c.deadline, true)}</td>
                    <td className="actions">
                      <a className={`btn btn-sm${p.personId === nextId ? ' btn-primary' : ''}`} href={`#/manager/review/${p.personId}`}>
                        {openReturn(r) ? 'Answer HR' : r.status === 'submitted' ? 'View' : r.status === 'draft' ? 'Continue review' : 'Start review'}
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Panel>
      {movedAway.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <Panel title="Moved to your manager" actions={<span className="small muted">Nothing to do</span>} bodyClass="">
            {movedAway.map((p) => (
              <div className="flag-row" key={p.personId}>
                <PersonCell name={person(state, p.personId).name} sub={`Moved to ${person(state, p.reviewerId).name} on ${formatDate(p.escalatedOn!)}, 3 days past the deadline. Any draft went with it.`} size="sm" />
              </div>
            ))}
          </Panel>
        </div>
      )}
    </>
  );
}
