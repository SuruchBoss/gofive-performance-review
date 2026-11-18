import { formatDate } from '../../../domain/dates';
import { managerReviewOf, person, selfReviewOf, teamName } from '../../../domain/selectors';
import { useStore } from '../../../state/store';
import { PageHead, Panel, PersonCell } from '../../components';
import { ReviewBadge, SelfReviewBadge } from '../../status';

export function HrProgress() {
  const { state } = useStore();
  const rows = state.participants;
  return (
    <>
      <PageHead
        title="Progress"
        sub={`Everyone in ${state.cycle.name}. Manager reviews were due ${formatDate(state.cycle.managerDeadline)}.`}
      />
      <Panel bodyClass="table-wrap">
        <table className="data stack-on-phone">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Team</th>
              <th>Reviewer</th>
              <th>Self-review</th>
              <th>Manager review</th>
              <th>Due</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const who = person(state, p.personId);
              return (
                <tr key={p.personId}>
                  <td className="cell-primary"><PersonCell name={who.name} sub={who.title} size="sm" /></td>
                  <td data-label="Team">{teamName(state, who.teamId)}</td>
                  <td data-label="Reviewer">{person(state, p.reviewerId).name}</td>
                  <td data-label="Self-review"><SelfReviewBadge r={selfReviewOf(state, p.personId)} /></td>
                  <td data-label="Manager review"><ReviewBadge r={managerReviewOf(state, p.personId)} /></td>
                  <td data-label="Due" className="num nowrap">{formatDate(state.cycle.managerDeadline, true)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Panel>
    </>
  );
}
