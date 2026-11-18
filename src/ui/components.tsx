import { useEffect, useRef, type ReactNode } from 'react';
import type { Rating } from '../domain/types';
import { IconAlert, IconCheck, IconClose, IconInfo } from './icons';

export type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger';

export function Badge({ tone = 'neutral', children, plain = false }: { tone?: Tone; children: ReactNode; plain?: boolean }) {
  return <span className={`badge badge-${tone}${plain ? ' plain' : ''}`}>{children}</span>;
}

export function Panel({ title, actions, children, foot, tint, bodyClass = 'panel-body', id }: {
  title?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  foot?: ReactNode;
  tint?: boolean;
  bodyClass?: string;
  id?: string;
}) {
  return (
    <section className={`panel${tint ? ' tint' : ''}`} id={id}>
      {title !== undefined && (
        <div className="panel-head">
          {typeof title === 'string' ? <h3>{title}</h3> : title}
          {actions && <div className="row">{actions}</div>}
        </div>
      )}
      <div className={bodyClass}>{children}</div>
      {foot && <div className="panel-foot">{foot}</div>}
    </section>
  );
}

export function PageHead({ title, sub, crumbs, actions }: { title: ReactNode; sub?: ReactNode; crumbs?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="page-head">
      <div>
        {crumbs && <div className="crumbs">{crumbs}</div>}
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
      {actions && <div className="row">{actions}</div>}
    </header>
  );
}

export function Notice({ tone = 'brand', title, children, icon }: { tone?: 'brand' | 'warning' | 'danger' | 'success'; title?: ReactNode; children?: ReactNode; icon?: ReactNode }) {
  const Icon = tone === 'success' ? IconCheck : tone === 'brand' ? IconInfo : IconAlert;
  return (
    <div className={`notice notice-${tone}`} role={tone === 'danger' ? 'alert' : undefined}>
      {icon ?? <Icon size={16} />}
      <div className="stack-sm" style={{ gap: 2 }}>
        {title && <strong>{title}</strong>}
        {children && <div>{children}</div>}
      </div>
    </div>
  );
}

export function initials(name: string) {
  const parts = name.split(' ');
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
}

export function Avatar({ name, size }: { name: string; size?: 'sm' | 'lg' }) {
  return <span className={`avatar${size ? ` ${size}` : ''}`} aria-hidden="true">{initials(name)}</span>;
}

export function PersonCell({ name, sub, size }: { name: string; sub?: ReactNode; size?: 'sm' | 'lg' }) {
  return (
    <span className="person">
      <Avatar name={name} size={size} />
      <span className="person-text">
        <span className="person-name">{name}</span>
        {sub && <span className="person-sub">{sub}</span>}
      </span>
    </span>
  );
}

export function Stat({ label, value, sub, meter }: { label: string; value: ReactNode; sub?: ReactNode; meter?: number }) {
  return (
    <div className="panel stat">
      <div className="stat-label">{label}</div>
      <div className="stat-value num">{value}</div>
      {meter !== undefined && (
        <div className="meter" role="presentation"><span style={{ width: `${Math.round(meter * 100)}%` }} /></div>
      )}
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

export function RatingScale({ value, onChange, disabled, label, size, marker }: {
  value?: Rating;
  onChange?: (r: Rating) => void;
  disabled?: boolean;
  label: string;
  size?: 'lg';
  /** Integer to mark with a small tick (for example the suggested rating). */
  marker?: number;
}) {
  return (
    <div className={`scale${size ? ` ${size}` : ''}`} role="radiogroup" aria-label={label}>
      {([1, 2, 3, 4, 5] as Rating[]).map((r) => (
        <button
          key={r}
          type="button"
          role="radio"
          aria-checked={value === r}
          disabled={disabled}
          onClick={() => onChange?.(r)}
          title={marker === r ? 'Suggested from goal results' : undefined}
        >
          {r}
          {marker === r && <span className="tick" aria-hidden="true" />}
        </button>
      ))}
    </div>
  );
}

export function Dialog({ title, sub, children, onClose, footer }: { title: string; sub?: ReactNode; children: ReactNode; onClose: () => void; footer: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>('textarea, input, select, button')?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [onClose]);
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dialog" role="dialog" aria-modal="true" aria-label={title} ref={ref}>
        <div className="dialog-head row-between" style={{ alignItems: 'flex-start' }}>
          <div>
            <h3>{title}</h3>
            {sub && <p>{sub}</p>}
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close"><IconClose /></button>
        </div>
        <div className="dialog-body">{children}</div>
        <div className="dialog-foot">{footer}</div>
      </div>
    </div>
  );
}

export function Empty({ icon, title, children }: { icon?: ReactNode; title: string; children?: ReactNode }) {
  return (
    <div className="empty">
      {icon}
      <h4>{title}</h4>
      {children && <p className="small">{children}</p>}
    </div>
  );
}
