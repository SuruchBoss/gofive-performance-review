import './ui/styles.css';
import { useEffect } from 'react';
import { person } from './domain/selectors';
import { StoreProvider, useStore, type Role } from './state/store';
import { go, useHashPath } from './state/router';
import { Shell, type NavItem } from './ui/Shell';
import { DemoStrip, HOME } from './ui/DemoStrip';
import { IconCheck } from './ui/icons';
import { navFor, routeFor } from './ui/routes';

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
  useEffect(() => {
    if (!pathRole) go(HOME[view.role]);
    else if (pathRole !== view.role) setView({ role: pathRole });
  }, [pathRole, view.role, setView]);

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
