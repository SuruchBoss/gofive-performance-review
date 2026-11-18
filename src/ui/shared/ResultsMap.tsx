import { useState } from 'react';
import type { MapPoint } from '../../domain/map';
import { person, teamName } from '../../domain/selectors';
import { useStore } from '../../state/store';

const W = 640;
const H = 440;
const PAD = { l: 60, r: 20, t: 20, b: 56 };
const x = (v: number) => PAD.l + ((v - 1) / 4) * (W - PAD.l - PAD.r);
const y = (v: number) => H - PAD.b - ((v - 1) / 4) * (H - PAD.t - PAD.b);

/**
 * Two-axis map: measured results (x) against manager-rated behaviour (y).
 * One mark colour; an amber ring marks an open "far from results" flag, and
 * the legend and tooltip say so in words.
 */
export function ResultsMap({ points, hrefFor }: { points: MapPoint[]; hrefFor: (id: string) => string }) {
  const { state } = useStore();
  const [hover, setHover] = useState<string>();
  const hp = points.find((p) => p.personId === hover);

  const corner = (label: string, cx: number, cy: number, anchor: 'start' | 'end') => (
    <text x={cx} y={cy} textAnchor={anchor} className="map-corner">{label}</text>
  );

  return (
    <div className="map-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} className="map" role="img" aria-label="Results against behaviour for each reviewed person">
        {/* 3x3 bands: cuts at 2.5 and 3.5 */}
        <rect x={x(3.5)} y={y(5)} width={x(5) - x(3.5)} height={y(3.5) - y(5)} className="map-zone good" />
        <rect x={x(1)} y={y(2.5)} width={x(2.5) - x(1)} height={y(1) - y(2.5)} className="map-zone low" />
        {[1, 2, 3, 4, 5].map((t) => (
          <g key={t}>
            <line x1={x(t)} x2={x(t)} y1={y(1)} y2={y(5)} className="map-grid" />
            <line x1={x(1)} x2={x(5)} y1={y(t)} y2={y(t)} className="map-grid" />
            <text x={x(t)} y={H - PAD.b + 24} textAnchor="middle" className="map-tick">{t}</text>
            <text x={PAD.l - 10} y={y(t) + 4} textAnchor="end" className="map-tick">{t}</text>
          </g>
        ))}
        {[2.5, 3.5].map((c) => (
          <g key={c}>
            <line x1={x(c)} x2={x(c)} y1={y(1)} y2={y(5)} className="map-cut" />
            <line x1={x(1)} x2={x(5)} y1={y(c)} y2={y(c)} className="map-cut" />
          </g>
        ))}
        {corner('Strong on both', x(5) - 8, y(5) + 18, 'end')}
        {corner('Behaviour high, results low', x(1) + 8, y(5) + 18, 'start')}
        {corner('Results high, behaviour low', x(5) - 8, y(1) - 10, 'end')}
        {corner('Below on both', x(1) + 8, y(1) - 10, 'start')}
        <text x={(x(1) + x(5)) / 2} y={H - 4} textAnchor="middle" className="map-axis">Goal results (suggested rating) →</text>
        <text transform={`translate(18 ${(y(1) + y(5)) / 2}) rotate(-90)`} textAnchor="middle" className="map-axis">Behaviour rating (manager) →</text>

        {points.map((p) => {
          const name = person(state, p.personId).name;
          return (
            <a
              key={p.personId}
              href={hrefFor(p.personId)}
              aria-label={`${name}: results ${p.results.toFixed(1)}, behaviour ${p.behaviour.toFixed(1)}, overall ${p.overall}${p.flagged ? ', flagged: far from results' : ''}`}
              onMouseEnter={() => setHover(p.personId)}
              onMouseLeave={() => setHover(undefined)}
              onFocus={() => setHover(p.personId)}
              onBlur={() => setHover(undefined)}
            >
              <circle cx={x(p.results)} cy={y(p.behaviour)} r={18} className="map-hit" />
              {p.flagged && <circle cx={x(p.results)} cy={y(p.behaviour)} r={11} className="map-flag" />}
              <circle cx={x(p.results)} cy={y(p.behaviour)} r={hover === p.personId ? 8 : 6.5} className="map-dot" />
            </a>
          );
        })}
      </svg>
      {hp && (
        <div
          className="map-tip"
          style={{ left: `${(x(hp.results) / W) * 100}%`, top: `${(y(hp.behaviour) / H) * 100}%` }}
          role="status"
        >
          <div className="strong">{person(state, hp.personId).name}</div>
          <div className="xs muted">{teamName(state, hp.teamId)} · {hp.cell}</div>
          <div className="tip-grid num">
            <span>Results</span><strong>{hp.results.toFixed(1)}</strong>
            <span>Behaviour</span><strong>{hp.behaviour.toFixed(1)}</strong>
            <span>Overall</span><strong>{hp.overall}</strong>
          </div>
          {hp.flagged && <div className="xs tip-flag">Rating far from results · not reviewed</div>}
        </div>
      )}
      <div className="db-legend small muted">
        <span><span className="db-key-dot" /> One reviewed person</span>
        <span><span className="map-key-flag" /> Open flag: overall rating far from results</span>
        <span>Click a dot to see where each score came from.</span>
      </div>
    </div>
  );
}
