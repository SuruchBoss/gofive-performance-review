import './ui/styles.css';
import { useEffect } from 'react';
import { person } from './domain/selectors';
import { StoreProvider, useStore, type Role } from './state/store';
import { go, useHashPath } from './state/router';
import { Shell, type NavItem } from './ui/Shell';
import { DemoStrip } from './ui/DemoStrip';
import { IconCheck } from './ui/icons';
import { navFor, routeFor } from './ui/routes';
import { Intro } from './ui/shared/Intro';
import { Landing } from './ui/Landing';

function roleOfPath(path: string): Role | undefined {
  if (path.startsWith('/hr')) return 'hr';
  if (path.startsWith('/manager')) return 'manager';
  if (path.startsWith('/me')) return 'employee';
  return undefined;
}

function Frame() {
  const store = useStore();
  const { state, view, setView, toast } = store;
  const path = useHashPath();

  // Keep the role switcher and the URL in step (for example after a shared link).
  const pathRole = roleOfPath(path);
  const asId = path.match(/[?&]as=(\w[\w-]*)/)?.[1];
  const isLanding = path === '/' || path === '';
  useEffect(() => {
    if (isLanding) return;
    if (!pathRole) go('/');
    else if (pathRole !== view.role) setView({ role: pathRole });
  }, [isLanding, pathRole, view.role, setView]);
  // Remember visited screens for guide steps that are about seeing something.
  useEffect(() => {
    const base = path.split('?')[0];
    if (!isLanding && !(view.seen ?? []).includes(base)) setView({ seen: [...(view.seen ?? []), base] });
  }, [path, isLanding, view.seen, setView]);
  // Links such as "Open as Anong" carry ?as=<person> so the right manager is selected.
  useEffect(() => {
    if (pathRole === 'manager' && asId && asId !== view.managerId) setView({ managerId: asId });
  }, [pathRole, asId, view.managerId, setView]);

  if (isLanding) return <Landing />;

  const role = pathRole ?? view.role;
  const userId = role === 'hr' ? 'hr' : role === 'manager' ? view.managerId : view.employeeId;
  const user = person(state, userId);
  const nav: NavItem[] = navFor(role, store, userId);
  const route = routeFor(path, role, userId);

  return (
    <>
      <Shell
        demoStrip={<DemoStrip />}
        user={{ name: user.name, role: user.title }}
        navTitle={role === 'hr' ? 'HR' : role === 'manager' ? 'Manager' : 'My review'}
        nav={nav}
        current={`#${route.navKey}`}
      >
        <Intro />
        {role !== 'hr' && (
          <p className="viewing-as">
            Viewing as <strong>{user.name}</strong>, {user.title}. To be someone else, pick a name in the list at the top.
          </p>
        )}
        {route.element}
      </Shell>
      {toast && (
        <div className="toast" role="status">
          <IconCheck size={16} /> {toast}
        </div>
      )}
    </>
  );
}

export function App() {
  return (
    <StoreProvider>
      <Frame />
    </StoreProvider>
  );
}
