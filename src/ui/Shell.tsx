import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AboutDialog } from './shared/About';
import { IconMark } from './icons';
import { Avatar } from './components';

export interface NavItem {
  href: string;
  label: string;
  /** Shorter label used on phones so every tab fits. */
  short?: string;
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
  const navRef = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState({ left: false, right: false });

  // On phones the tabs scroll sideways: keep the current tab in view and show
  // an edge fade only on the side where more tabs are hidden.
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const update = () => setMore({ left: el.scrollLeft > 2, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 2 });
    el.querySelector<HTMLElement>('[aria-current="page"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [current, nav.length]);
  return (
    <>
      <div className="demo-strip" role="region" aria-label="Prototype controls">
        <div className="demo-strip-inner">{demoStrip}</div>
      </div>
      <header className="app-header">
        <div className="app-header-inner">
          <div className="brand">
            <a className="brand-mark" href="#/" title="Back to the start page" aria-label="Back to the start page"><IconMark size={18} /></a>
            <div className="brand-text">
              <span className="brand-name">Performance Review</span>
              <span className="brand-tags">
                <span className="concept-tag">Concept for empeo</span>
                <a className="variant-tag" href="../" title="This build adds cross-team calibration (exam question 2). Click to open the main version.">
                  Requirement change from question 2
                </a>
              </span>
            </div>
          </div>
          <div className="spacer" />
          <button type="button" className="link-btn about-link" onClick={() => setAbout(true)} aria-label="About this prototype">
            <span className="about-long">About this prototype</span>
            <span className="about-short" aria-hidden="true">About</span>
          </button>
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
        <nav className="sidebar" aria-label="Main" data-more-left={more.left} data-more-right={more.right}>
          <div className="nav-section">{navTitle}</div>
          <div className="nav" ref={navRef}>
            {nav.map((n) => (
              <a key={n.href} href={n.href} aria-current={current === n.href ? 'page' : undefined}>
                {n.icon}
                <span className={n.short ? 'nav-long' : undefined}>{n.label}</span>
                {n.short && <span className="nav-short">{n.short}</span>}
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
