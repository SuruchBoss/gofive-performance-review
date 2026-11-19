import { useState } from 'react';
import { caseInfo } from '../../../domain/deadlines';
import { formatDate } from '../../../domain/dates';
import { nameWithRole, person, selfReviewOf, teamName } from '../../../domain/selectors';
import { useStore } from '../../../state/store';
import { Empty, MoreMenu, PageHead, Panel, PersonCell, Stat } from '../../components';
import { IconCheck } from '../../icons';
import { ExtendDialog, RemindDialog, RemoveDialog } from '../../shared/CaseDialogs';
import { eligibilityHint } from '../../../domain/eligibility';
import { IconAlert } from '../../icons';
import { TERMS } from '../../glossary';
import { CaseBadge, SelfReviewBadge } from '../../status';

type Filter = 'action' | 'all' | 'submitted';

export function HrProgress() {
  const { state } = useStore();
  const [filter, setFilter] = useState<Filter>('action');
  const [dialog, setDialog] = useState<{ kind: 'remind' | 'extend' | 'remove'; personId: string }>();

  const rows = state.participants.map((p) => ({ p, c: caseInfo(state, p.personId), who: person(state, p.personId) }));
  const active = rows.filter((r) => r.c.status !== 'removed');
  const submitted = active.filter((r) => r.c.status === 'submitted').length;
  const overdue = active.filter((r) => r.c.status === 'overdue').length;
  const escalated = active.filter((r) => r.c.status === 'escalated').length;
  const selfMissing = active.filter((r) => selfReviewOf(state, r.p.personId).status !== 'submitted').length;
  const needsAction = (r: (typeof rows)[number]) =>
    r.c.status === 'overdue' || r.c.status === 'escalated' || r.c.status === 'due' || (r.c.status !== 'removed' && !!eligibilityHint(state, r.who));

  const shown = rows.filter((r) => (filter === 'all' ? true : filter === 'submitted' ? r.c.status === 'submitted' : needsAction(r)));
  const removed = rows.length - active.length;

  return (
    <>
      <PageHead
        title="People"
        sub={`Manager reviews were due ${formatDate(state.cycle.managerDeadline)}. A late review moves to the manager's own manager 3 days after the deadline.${removed ? ` ${removed} left out of the cycle.` : ''}`}
      />
      <div className="grid-4">
        <Stat label="Manager reviews submitted" value={`${submitted} / ${active.length}`} meter={active.length ? submitted / active.length : 0} />
        <Stat label="Overdue" value={overdue} sub="Past the deadline, not moved yet" />
        <Stat label="Moved to their manager" value={escalated} sub={TERMS.escalated} />
        <Stat label="Self-reviews missing" value={selfMissing} sub="Managers can still review" />
      </div>
      <div style={{ height: 20 }} />
      <Panel
        title={
          <div className="tabs" role="tablist" aria-label="Filter">
            {([['action', `Needs action (${rows.filter(needsAction).length})`], ['submitted', `Submitted (${submitted})`], ['all', `Everyone (${active.length}${removed ? ` + ${removed} left out` : ''})`]] as [Filter, string][]).map(([k, label]) => (
              <button key={k} type="button" role="tab" aria-selected={filter === k} onClick={() => setFilter(k)}>{label}</button>
            ))}
          </div>
        }
        bodyClass="table-wrap"
      >
        {shown.length === 0 ? (
          <Empty icon={<IconCheck size={32} />} title="Nothing needs action">Every manager review is in.</Empty>
        ) : (
          <table className="data stack-on-phone">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Reviewer</th>
                <th>Self-review</th>
                <th>Manager review</th>
                <th>Deadline</th>
                <th><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {shown.map(({ p, c, who }) => {
                const open = c.status === 'due' || c.status === 'overdue' || c.status === 'escalated';
                return (
                  <tr key={p.personId} className={c.status === 'removed' ? 'is-removed' : undefined}>
                    <td className="cell-primary">
                      <PersonCell name={who.name} sub={`${who.title} · ${teamName(state, who.teamId)}`} size="sm" />
                      {c.status !== 'removed' && eligibilityHint(state, who) && (
                        <div className="hint-tag"><IconAlert size={13} /> Joined {formatDate(who.startDate)}: under 3 months</div>
                      )}
                      {p.removed && <div className="xs muted">Removed {formatDate(p.removed.on, true)}: {p.removed.reason}</div>}
                    </td>
                    <td data-label="Reviewer">
                      <div>
                        <div>{nameWithRole(state, p.reviewerId)}</div>
                        {p.escalatedFrom && <div className="xs muted">from {person(state, p.escalatedFrom).name}, {formatDate(p.escalatedOn!, true)}</div>}
                      </div>
                    </td>
                    <td data-label="Self-review"><SelfReviewBadge r={selfReviewOf(state, p.personId)} /></td>
                    <td data-label="Manager review"><CaseBadge c={c} /></td>
                    <td data-label="Deadline" className="num">
                      <div>
                      <div className="nowrap">{formatDate(c.deadline, true)}{p.extension && <span className="xs muted"> · extended</span>}</div>
                      {c.status === 'overdue' && c.escalatesOn && <div className="xs muted">Moves to {nameWithRole(state, person(state, p.reviewerId).managerId ?? p.reviewerId)} on {formatDate(c.escalatesOn, true)}</div>}
                      {p.lastRemindedOn && open && <div className="xs muted nowrap">Reminded {formatDate(p.lastRemindedOn, true)}</div>}
                      </div>
                    </td>
                    <td className="actions">
                      {open && (
                        <div className="row" style={{ justifyContent: 'flex-end' }}>
                          {/* A late joiner needs removing, not a reminder: show that action directly. */}
                          {eligibilityHint(state, who) && state.cycle.status === 'open' ? (
                            <>
                              <button type="button" className="btn btn-sm" onClick={() => setDialog({ kind: 'remove', personId: p.personId })}>Leave out of this review</button>
                              <MoreMenu
                                label={`More actions for ${who.name}`}
                                items={[
                                  { label: 'Remind', onSelect: () => setDialog({ kind: 'remind', personId: p.personId }) },
                                  { label: 'Extend deadline', onSelect: () => setDialog({ kind: 'extend', personId: p.personId }) },
                                ]}
                              />
                            </>
                          ) : (
                            <>
                              <button type="button" className="btn btn-sm" onClick={() => setDialog({ kind: 'remind', personId: p.personId })}>Remind</button>
                              <MoreMenu
                                label={`More actions for ${who.name}`}
                                items={[
                                  { label: 'Extend deadline', onSelect: () => setDialog({ kind: 'extend', personId: p.personId }) },
                                  ...(state.cycle.status === 'open' ? [{ label: 'Leave out of this review', danger: true, onSelect: () => setDialog({ kind: 'remove', personId: p.personId }) }] : []),
                                ]}
                              />
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Panel>
      {dialog?.kind === 'remind' && <RemindDialog personIds={[dialog.personId]} onClose={() => setDialog(undefined)} />}
      {dialog?.kind === 'extend' && <ExtendDialog personId={dialog.personId} onClose={() => setDialog(undefined)} />}
      {dialog?.kind === 'remove' && <RemoveDialog personId={dialog.personId} onClose={() => setDialog(undefined)} />}
    </>
  );
}
