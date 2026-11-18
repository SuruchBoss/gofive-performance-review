import './ui/styles.css';
import { Shell } from './ui/Shell';
import { Badge, PageHead, Panel, Stat } from './ui/components';
import { IconCycle, IconPeople } from './ui/icons';

/** Static shell. Wired to the store in the next commit. */
export function App() {
  return (
    <Shell
      demoStrip={<span className="demo-label">Prototype controls</span>}
      user={{ name: 'Pim Chaiyaporn', role: 'HR Business Partner' }}
      navTitle="HR"
      nav={[
        { href: '#/hr/cycle', label: 'Cycle', icon: <IconCycle /> },
        { href: '#/hr/progress', label: 'Progress', icon: <IconPeople /> },
      ]}
      current="#/hr/cycle"
    >
      <PageHead title="Annual Review 2026" sub="Riverside Supply Co. Demo data only." />
      <div className="grid-4">
        <Stat label="Participants" value={12} />
        <Stat label="Reviews submitted" value="9 / 12" meter={0.75} />
        <Stat label="Overdue" value={3} />
        <Stat label="Open flags" value={4} />
      </div>
      <div style={{ height: 16 }} />
      <Panel title="Status colours">
        <div className="row">
          <Badge tone="success">Submitted</Badge>
          <Badge tone="warning">Overdue</Badge>
          <Badge tone="danger">Escalated</Badge>
          <Badge tone="brand">In progress</Badge>
          <Badge>Not started</Badge>
        </div>
      </Panel>
    </Shell>
  );
}
