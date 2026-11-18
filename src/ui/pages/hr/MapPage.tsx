import { useState } from 'react';
import { mapPoints } from '../../../domain/map';
import { person, teamName } from '../../../domain/selectors';
import { useStore } from '../../../state/store';
import { Badge, Empty, PageHead, Panel, PersonCell } from '../../components';
import { IconMap } from '../../icons';
import { ResultsMap } from '../../shared/ResultsMap';

/** Results map for HR (everyone, with a team filter) or for a manager (own team). */
export function MapPage({ reviewerId }: { reviewerId?: string }) {
  const { state } = useStore();
  const [team, setTeam] = useState('all');
  const all = mapPoints(state, reviewerId);
  const points = team === 'all' ? all : all.filter((p) => p.teamId === team);
  const hrefFor = (id: string) => (reviewerId ? `#/manager/review/${id}` : `#/hr/person/${id}`);
  const sorted = [...points].sort((a, b) => b.results + b.behaviour - (a.results + a.behaviour));
  const pending = state.participants.filter((p) => !p.removed).length - mapPoints(state).length;

  return (
    <>
      <PageHead
        title={reviewerId ? 'Team map' : 'Results map'}
        sub="Each dot is one person: goal results across, the manager's behaviour rating up. Strong and weak performers stand out in the shaded corners. Click a dot to see where the scores came from."
      />
      {!reviewerId && (
        <div className="tabs filter-row" role="tablist" aria-label="Team">
          {[{ id: 'all', name: 'All teams' }, ...state.teams].map((t) => (
            <button key={t.id} type="button" role="tab" aria-selected={team === t.id} onClick={() => setTeam(t.id)}>{t.name}</button>
          ))}
        </div>
      )}
      <div className="map-layout">
        <Panel
          title="Results and behaviour"
          actions={<span className="small muted">{points.length} reviewed{!reviewerId && pending > 0 ? ` · ${pending} not submitted yet` : ''}</span>}
        >
          {points.length === 0 ? (
            <Empty icon={<IconMap size={32} />} title="No submitted reviews yet">People appear on the map once their review is submitted.</Empty>
          ) : (
            <ResultsMap points={points} hrefFor={hrefFor} />
          )}
        </Panel>
        <Panel title="As a list" bodyClass="table-wrap">
          <table className="data compact">
            <thead>
              <tr><th>Person</th><th>Results</th><th>Behav.</th><th>Overall</th></tr>
            </thead>
            <tbody>
              {sorted.map((p) => {
                const who = person(state, p.personId);
                return (
                  <tr key={p.personId}>
                    <td>
                      <a href={hrefFor(p.personId)} className="plain-link">
                        <PersonCell name={who.name} sub={teamName(state, p.teamId)} size="sm" />
                      </a>
                      {p.flagged && <div style={{ marginTop: 4 }}><Badge tone="warning">Far from results</Badge></div>}
                    </td>
                    <td className="num">{p.results.toFixed(1)}</td>
                    <td className="num">{p.behaviour.toFixed(1)}</td>
                    <td className="num strong">{p.overall}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>
      </div>
    </>
  );
}
