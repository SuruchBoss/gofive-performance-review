import { useState, type ReactNode } from 'react';
import { formatDate, weekday } from '../../../domain/dates';
import type { LogEntry, LogType } from '../../../domain/types';
import { useStore } from '../../../state/store';
import { Empty, PageHead, Panel } from '../../components';
import { IconArrowUp, IconBell, IconCheck, IconClock, IconCycle, IconFlag, IconLog, IconPen, IconUserX } from '../../icons';

const META: Record<LogType, { label: string; icon: ReactNode; tone: string }> = {
  cycle_opened: { label: 'Cycle opened', icon: <IconCycle size={15} />, tone: 'brand' },
  reminder: { label: 'Reminder', icon: <IconBell size={15} />, tone: 'neutral' },
  extension: { label: 'Extension', icon: <IconClock size={15} />, tone: 'neutral' },
  escalation: { label: 'Moved to their manager', icon: <IconArrowUp size={15} />, tone: 'danger' },
  removal: { label: 'Left out of the review', icon: <IconUserX size={15} />, tone: 'neutral' },
  self_review_late: { label: 'Late self-review', icon: <IconPen size={15} />, tone: 'warning' },
  review_submitted: { label: 'Review submitted', icon: <IconCheck size={15} />, tone: 'success' },
  flag_reviewed: { label: 'Rating checked', icon: <IconFlag size={15} />, tone: 'neutral' },
  returned_to_manager: { label: 'Sent back to manager', icon: <IconFlag size={15} />, tone: 'warning' },
  return_answered: { label: 'Manager answered HR', icon: <IconCheck size={15} />, tone: 'neutral' },
  return_accepted: { label: 'HR accepted the answer', icon: <IconCheck size={15} />, tone: 'neutral' },
  demo_shortcut: { label: 'Demo shortcut', icon: <IconLog size={15} />, tone: 'neutral' },
  deadline_change: { label: 'Deadline change', icon: <IconClock size={15} />, tone: 'neutral' },
  release: { label: 'Results released', icon: <IconCheck size={15} />, tone: 'brand' },
};

const FILTERS: { key: string; label: string; types?: LogType[] }[] = [
  { key: 'all', label: 'All' },
  { key: 'deadlines', label: 'Reminders', types: ['reminder', 'extension', 'deadline_change'] },
  { key: 'escalation', label: 'Moved up', types: ['escalation'] },
  { key: 'removal', label: 'Left out', types: ['removal'] },
  { key: 'flags', label: 'Checks', types: ['flag_reviewed', 'returned_to_manager', 'return_answered', 'return_accepted', 'release'] },
];

export function HrActivity() {
  const { state } = useStore();
  const [filter, setFilter] = useState('all');
  const types = FILTERS.find((f) => f.key === filter)?.types;
  const entries = [...state.log]
    .filter((l) => !types || types.includes(l.type))
    .sort((a, b) => (a.on === b.on ? Number(b.id.slice(1)) - Number(a.id.slice(1)) : b.on.localeCompare(a.on)));
  const groups = entries.reduce<Record<string, LogEntry[]>>((acc, l) => ((acc[l.on] ??= []).push(l), acc), {});
  const actor = (id: string) => (id === 'system' ? 'System' : id === 'demo' ? 'Demo, not a product action' : state.people.find((p) => p.id === id)?.name ?? id);

  return (
    <>
      <PageHead title="Activity" sub="Everything that happened in this review: reminders, extra time, reviews moved up, people left out and checks. Entries cannot be changed." />
      <Panel
        title={
          <div className="tabs" role="tablist" aria-label="Filter">
            {FILTERS.map((f) => (
              <button key={f.key} type="button" role="tab" aria-selected={filter === f.key} onClick={() => setFilter(f.key)}>{f.label}</button>
            ))}
          </div>
        }
        bodyClass=""
      >
        {entries.length === 0 ? (
          <Empty icon={<IconLog size={32} />} title="Nothing here yet">Actions of this type will appear here.</Empty>
        ) : (
          Object.entries(groups).map(([day, items]) => (
            <div key={day} className="log-day">
              <div className="log-date">{weekday(day)} {formatDate(day)}</div>
              <ol className="log-list">
                {items.map((l) => (
                  <li key={l.id} className="log-item">
                    <span className={`log-icon tone-${META[l.type].tone}`}>{META[l.type].icon}</span>
                    <div>
                      <div className="small"><span className="strong">{META[l.type].label}</span> <span className="muted">· {actor(l.actorId)}</span></div>
                      <div>{l.detail}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ))
        )}
      </Panel>
    </>
  );
}
