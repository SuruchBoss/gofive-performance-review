/** One row per person: hollow ring = suggestion from results, filled dot = manager's rating, on a 1–5 axis. */
export function Dumbbell({ rows }: { rows: { label: string; href?: string; overall: number; suggested: number; far?: boolean }[] }) {
  const x = (v: number) => `${((v - 1) / 4) * 100}%`;
  return (
    <div className="dumbbell">
      <div className="db-axis" aria-hidden="true">
        <span />
        <div className="db-ticks">
          {[1, 2, 3, 4, 5].map((t) => <span key={t} style={{ left: x(t) }}>{t}</span>)}
        </div>
      </div>
      {rows.map((r) => {
        const lo = Math.min(r.overall, r.suggested);
        const hi = Math.max(r.overall, r.suggested);
        return (
          <div className="db-row" key={r.label}>
            <span className="db-label">{r.href ? <a href={r.href}>{r.label}</a> : r.label}</span>
            <div className="db-track" role="img" aria-label={`${r.label}: rated ${r.overall}, results suggest ${r.suggested.toFixed(1)}`}>
              {[1, 2, 3, 4, 5].map((t) => <span key={t} className="db-grid" style={{ left: x(t) }} />)}
              <span className={`db-line${r.far ? ' far' : ''}`} style={{ left: x(lo), width: `calc(${x(hi)} - ${x(lo)})` }} />
              <span className="db-sug" style={{ left: x(r.suggested) }} />
              <span className={`db-dot${r.far ? ' far' : ''}`} style={{ left: x(r.overall) }} />
            </div>
          </div>
        );
      })}
      <div className="db-legend small muted">
        <span><span className="db-key-sug" /> Results suggest</span>
        <span><span className="db-key-dot" /> Manager's rating</span>
        <span><span className="db-key-dot far" /> Rating 1.0+ from results</span>
      </div>
    </div>
  );
}
