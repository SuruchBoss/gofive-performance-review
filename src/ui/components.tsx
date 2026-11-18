import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Rating } from '../domain/types';
import { IconAlert, IconCalendar, IconCheck, IconClose, IconInfo } from './icons';
import { formatDate } from '../domain/dates';

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

/** One short line that explains a term where it appears. */
export function Explain({ children }: { children: ReactNode }) {
  return <span className="explain-line">{children}</span>;
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

/**
 * Date field that shows the app's own format ("27 Nov 2026") on every device.
 * A native date input sits invisibly on top, so clicking or tapping anywhere
 * opens the browser's date picker, and keyboard users still get the native input.
 */
export function DateField({ id, value, min, disabled, onChange, describedBy }: {
  id: string;
  value: string;
  min?: string;
  disabled?: boolean;
  onChange: (v: string) => void;
  describedBy?: string;
}) {
  return (
    <div className={`date-field${disabled ? ' is-disabled' : ''}`}>
      <span className="date-text num" aria-hidden="true">{value ? formatDate(value) : 'Choose a date'}</span>
      <IconCalendar size={16} />
      <input
        id={id}
        type="date"
        value={value}
        min={min}
        disabled={disabled}
        aria-describedby={describedBy}
        onChange={(e) => e.target.value && onChange(e.target.value)}
        onClick={(e) => {
          try {
            e.currentTarget.showPicker?.();
          } catch {
            // showPicker can throw if the input is not focusable; the native control still works.
          }
        }}
      />
    </div>
  );
}

/** "Show more" toggle: details stay hidden until asked for. */
export function Disclosure({ label, openLabel, children, defaultOpen = false }: { label: string; openLabel?: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="disclosure">
      <button type="button" className="link-btn disclosure-btn" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span className="chev" aria-hidden="true">{open ? '▾' : '▸'}</span> {open ? openLabel ?? label : label}
      </button>
      {open && <div className="disclosure-body">{children}</div>}
    </div>
  );
}

/** A panel whose body opens on click. Used to keep detail screens short. */
export function Section({ id, title, summary, open, onToggle, children, bodyClass = 'panel-body', foot }: {
  id: string;
  title: string;
  summary?: ReactNode;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
  bodyClass?: string;
  foot?: ReactNode;
}) {
  return (
    <section className={`panel section${open ? ' is-open' : ''}`} id={id}>
      <button type="button" className="section-head" aria-expanded={open} aria-controls={`${id}-body`} onClick={onToggle}>
        <span className="chev" aria-hidden="true">{open ? '▾' : '▸'}</span>
        <span className="section-title">{title}</span>
        {summary && <span className="section-summary">{summary}</span>}
      </button>
      {open && (
        <>
          <div id={`${id}-body`} className={bodyClass}>{children}</div>
          {foot && <div className="panel-foot">{foot}</div>}
        </>
      )}
    </section>
  );
}

/** Small "More" menu for secondary row actions. */
export function MoreMenu({ label, items }: { label: string; items: { label: string; onSelect: () => void; danger?: boolean }[] }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number }>();
  const ref = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  // The menu is positioned against the viewport so a scrolling table cannot clip it.
  const place = () => {
    const r = btn.current?.getBoundingClientRect();
    if (!r) return;
    const width = 200;
    const height = items.length * 37 + 10;
    // Open upwards when there is no room below (rows near the bottom of a phone screen).
    const top = r.bottom + 4 + height > window.innerHeight - 8 ? r.top - 4 - height : r.bottom + 4;
    setPos({ top, left: Math.max(8, Math.min(r.right - width, window.innerWidth - width - 8)) });
  };
  useEffect(() => {
    if (!open) return;
    const shut = () => setOpen(false);
    window.addEventListener('scroll', shut, true);
    window.addEventListener('resize', shut);
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    ref.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus({ preventScroll: true });
    return () => {
      window.removeEventListener('scroll', shut, true);
      window.removeEventListener('resize', shut);
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);
  return (
    <div className="more" ref={ref}>
      <button ref={btn} type="button" className="btn btn-sm" aria-haspopup="menu" aria-expanded={open} aria-label={label} onClick={() => { place(); setOpen((v) => !v); }}>
        More <span aria-hidden="true">▾</span>
      </button>
      {open && (
        <div className="more-menu" role="menu" style={pos ? { position: 'fixed', top: pos.top, left: pos.left } : undefined}>
          {items.map((it) => (
            <button key={it.label} type="button" role="menuitem" className={it.danger ? 'danger' : undefined} onClick={() => { setOpen(false); it.onSelect(); }}>
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
