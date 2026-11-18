import { formatDate } from '../../../domain/dates';
import { managerReviewOf, person, selfReviewOf, teamName } from '../../../domain/selectors';
import { useStore } from '../../../state/store';
import { Empty, PageHead, Panel, PersonCell } from '../../components';
import { IconPeople } from '../../icons';
import { ReviewBadge, SelfReviewBadge } from '../../status';

export function ManagerTeam({ userId }: { userId: string }) {
  const { state } = useStore();
  const me = person(state, userId);
  const mine = state.participants.filter((p) => p.reviewerId === userId && !p.removed);
  const done = mine.filter((p) => managerReviewOf(state, p.personId).status === 'submitted').length;

  return (
    <>
      <PageHead
        title={me.teamId ? `My team · ${teamName(state, me.teamId)}` : 'Reviews assigned to me'}
        sub={mine.length ? `${done} of ${mine.length} reviews submitted. Due ${formatDate(state.cycle.managerDeadline)}.` : undefined}
      />
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
                <th><span className="sr-only">Action</span></th>
              </tr>
            </thead>
            <tbody>
              {mine.map((p) => {
                const who = person(state, p.personId);
                const r = managerReviewOf(state, p.personId);
                return (
                  <tr key={p.personId}>
                    <td className="cell-primary"><PersonCell name={who.name} sub={who.title} size="sm" /></td>
                    <td data-label="Self-review"><SelfReviewBadge r={selfReviewOf(state, p.personId)} /></td>
                    <td data-label="Your review"><ReviewBadge r={r} /></td>
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
