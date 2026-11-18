import type { ReactNode } from 'react';
import type { Role } from '../state/store';
import type { NavItem } from './Shell';
import { IconCycle, IconLog, IconMap, IconPeople, IconPen, IconResult, IconScale, IconTarget } from './icons';
import { PageHead } from './components';

type StoreLike = { state: unknown };

export function navFor(role: Role, _store: StoreLike, _userId: string): NavItem[] {
  if (role === 'hr') {
    return [
      { href: '#/hr', label: 'Cycle overview', icon: <IconCycle /> },
      { href: '#/hr/progress', label: 'Progress', icon: <IconPeople /> },
      { href: '#/hr/consistency', label: 'Consistency', icon: <IconScale /> },
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

export function routeFor(path: string, role: Role, _userId: string): { navKey: string; element: ReactNode } {
  const placeholder = (title: string) => <PageHead title={title} sub="This screen is built in a later commit." />;
  if (role === 'hr') {
    const key = ['/hr/progress', '/hr/consistency', '/hr/map', '/hr/activity'].find((k) => path.startsWith(k)) ?? '/hr';
    return { navKey: key, element: placeholder(key) };
  }
  if (role === 'manager') return { navKey: '/manager', element: placeholder('My team') };
  const key = ['/me/self-review', '/me/result'].find((k) => path.startsWith(k)) ?? '/me';
  return { navKey: key, element: placeholder(key) };
}
