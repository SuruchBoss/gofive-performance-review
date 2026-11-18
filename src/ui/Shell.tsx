import { useState, type ReactNode } from 'react';
import { AboutDialog } from './shared/About';
import { IconMark } from './icons';
import { Avatar } from './components';

export interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  count?: number;
  alert?: boolean;
}

export function Shell({ demoStrip, user, navTitle, nav, current, aside, children }: {
  demoStrip: ReactNode;
  user: { name: string; role: string };
  navTitle: string;
  nav: NavItem[];
  current: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  const [about, setAbout] = useState(false);
  return (
    <>
      <div className="demo-strip" role="region" aria-label="Prototype controls">
        <div className="demo-strip-inner">{demoStrip}</div>
      </div>
      <header className="app-header">
        <div className="app-header-inner">
          <div className="brand">
            <span className="brand-mark"><IconMark size={18} /></span>
            <span className="brand-name">Performance Review</span>
            <span className="concept-tag">Concept for empeo</span>
          </div>
          <div className="spacer" />
          <button type="button" className="link-btn about-link" onClick={() => setAbout(true)}>About this prototype</button>
          <div className="who">
            <div className="who-text" style={{ textAlign: 'right' }}>
              <span className="who-name">{user.name}</span>
              <span className="who-role">{user.role}</span>
            </div>
            <Avatar name={user.name} />
          </div>
        </div>
      </header>
      <div className="shell">
        <nav className="sidebar" aria-label="Main">
          <div className="nav-section">{navTitle}</div>
          <div className="nav">
            {nav.map((n) => (
              <a key={n.href} href={n.href} aria-current={current === n.href ? 'page' : undefined}>
                {n.icon}
                <span>{n.label}</span>
                {n.count !== undefined && n.count > 0 && <span className={`nav-count${n.alert ? ' alert' : ''}`}>{n.count}</span>}
              </a>
            ))}
          </div>
          {aside}
        </nav>
        <main className="main" id="main">
          <div className="main-inner">{children}</div>
        </main>
      </div>
      {about && <AboutDialog onClose={() => setAbout(false)} />}
    </>
  );
}
