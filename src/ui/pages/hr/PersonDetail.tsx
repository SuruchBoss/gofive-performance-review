import { person, teamName } from '../../../domain/selectors';
import { useStore } from '../../../state/store';
import { PageHead } from '../../components';
import { ReviewSummary } from '../../shared/ReviewSummary';

export function HrPersonDetail({ personId }: { personId: string }) {
  const { state } = useStore();
  const who = state.people.find((p) => p.id === personId);
  if (!who) return <PageHead title="Not found" />;
  return (
    <>
      <PageHead
        crumbs={<><a href="#/hr/consistency">Consistency</a> · <a href="#/hr/map">Map</a></>}
        title={who.name}
        sub={`${who.title} · ${teamName(state, who.teamId)} · manager ${person(state, who.managerId!).name}`}
      />
      <ReviewSummary personId={personId} audience="hr" />
    </>
  );
}
