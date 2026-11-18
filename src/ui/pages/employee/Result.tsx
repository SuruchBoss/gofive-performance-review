import { useStore } from '../../../state/store';
import { PageHead, Panel } from '../../components';
import { IconLock } from '../../icons';

export function EmployeeResult({ userId: _userId }: { userId: string }) {
  const { state } = useStore();
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
          </div>
        </div>
      </Panel>
    </>
  );
}
