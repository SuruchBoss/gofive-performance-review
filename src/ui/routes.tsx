import type { ReactNode } from 'react';
import type { Role } from '../state/store';
import type { NavItem } from './Shell';
import { IconCycle, IconLog, IconMap, IconPeople, IconPen, IconResult, IconScale, IconTarget } from './icons';
import { PageHead } from './components';
import { HrProgress } from './pages/hr/Progress';
import { HrConsistency } from './pages/hr/Consistency';
import { HrPersonDetail } from './pages/hr/PersonDetail';
import { openFlagCount } from '../domain/flags';
import type { DemoState } from '../domain/types';
import { ManagerTeam } from './pages/manager/Team';
import { ManagerReviewPage } from './pages/manager/Review';
import { EmployeeResult } from './pages/employee/Result';

type StoreLike = { state: DemoState };

export function navFor(role: Role, store: StoreLike, _userId: string): NavItem[] {
  const flags = openFlagCount(store.state);
  if (role === 'hr') {
    return [
      { href: '#/hr', label: 'Cycle overview', icon: <IconCycle /> },
      { href: '#/hr/progress', label: 'Progress', icon: <IconPeople /> },
      { href: '#/hr/consistency', label: 'Consistency', icon: <IconScale />, count: flags, alert: true },
      { href: '#/hr/map', label: 'Results map', icon: <IconMap /> },
      { href: '#/hr/activity', label: 'Activity log', icon: <IconLog /> },
    ];
  }
  if (role === 'manager') {
    return [{ href: '#/manager', label: 'My team', icon: <IconPeople /> }];
  }
  return [
    { href: '#/me', label: 'My goals', icon: <IconTarget /> },
    { href: '#/me/self-review', label: 'Self-review', icon: <IconPen /> },
    { href: '#/me/result', label: 'My result', icon: <IconResult /> },
  ];
}

export function routeFor(path: string, role: Role, userId: string): { navKey: string; element: ReactNode } {
  const placeholder = (title: string) => <PageHead title={title} sub="This screen is built in a later commit." />;
  if (role === 'hr') {
    const key = ['/hr/progress', '/hr/consistency', '/hr/map', '/hr/activity'].find((k) => path.startsWith(k)) ?? '/hr';
    const pm = path.match(/^\/hr\/person\/(\w+)/);
    if (pm) return { navKey: '/hr/consistency', element: <HrPersonDetail personId={pm[1]} /> };
    if (key === '/hr/progress') return { navKey: key, element: <HrProgress /> };
    if (key === '/hr/consistency') return { navKey: key, element: <HrConsistency /> };
    return { navKey: key, element: placeholder(key) };
  }
  if (role === 'manager') {
    const m = path.match(/^\/manager\/review\/(\w+)/);
    if (m) return { navKey: '/manager', element: <ManagerReviewPage key={m[1]} personId={m[1]} userId={userId} /> };
    return { navKey: '/manager', element: <ManagerTeam userId={userId} /> };
  }
  const key = ['/me/self-review', '/me/result'].find((k) => path.startsWith(k)) ?? '/me';
  if (key === '/me/result') return { navKey: key, element: <EmployeeResult userId={userId} /> };
  return { navKey: key, element: placeholder(key) };
}
