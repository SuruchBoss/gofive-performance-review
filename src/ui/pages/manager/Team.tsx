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
  const mine = state.participants.filter((p) => p.reviewerId === userId && !p.removed);
  const done = mine.filter((p) => managerReviewOf(state, p.personId).status === 'submitted').length;
  const overdue = mine.filter((p) => caseInfo(state, p.personId).status === 'overdue');
  const escalatedToMe = mine.filter((p) => p.escalatedFrom);
  const firstEscalation = overdue.map((p) => caseInfo(state, p.personId).escalatesOn!).sort()[0];
  const boss = me.managerId ? person(state, me.managerId) : undefined;

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
            Reviews appear here when they are assigned or escalated to you.
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
                    <td data-label="Your review"><CaseBadge c={c} />{r.status === 'draft' && <span className="xs muted"> draft</span>}</td>
                    <td data-label="Deadline" className="num nowrap">{formatDate(c.deadline, true)}</td>
                    <td className="actions">
                      <a className={`btn btn-sm${r.status === 'submitted' ? '' : ' btn-primary'}`} href={`#/manager/review/${p.personId}`}>
                        {r.status === 'submitted' ? 'View' : r.status === 'draft' ? 'Continue review' : 'Start review'}
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Panel>
    </>
  );
}
