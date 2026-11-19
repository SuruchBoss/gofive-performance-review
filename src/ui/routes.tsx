import type { ReactNode } from 'react';
import type { Role } from '../state/store';
import type { NavItem } from './Shell';
import { IconCycle, IconLog, IconMap, IconPeople, IconResult, IconScale, IconTarget } from './icons';
import { PageHead } from './components';
import { HrProgress } from './pages/hr/Progress';
import { HrConsistency } from './pages/hr/Consistency';
import { HrPersonDetail } from './pages/hr/PersonDetail';
import { HrActivity } from './pages/hr/Activity';
import { HrCycle } from './pages/hr/Cycle';
import { MapPage } from './pages/hr/MapPage';
import { releaseBlockers } from '../domain/release';
import type { DemoState } from '../domain/types';
import { ManagerTeam } from './pages/manager/Team';
import { ManagerReviewPage } from './pages/manager/Review';
import { EmployeeResult } from './pages/employee/Result';
import { EmployeeGoals } from './pages/employee/Goals';
import { EmployeeSelfReview } from './pages/employee/SelfReview';
import { selfReviewWindow } from '../domain/selfReview';

type StoreLike = { state: DemoState };

export function navFor(role: Role, store: StoreLike, userId: string): NavItem[] {
  // Everything HR still has to do on Consistency: open flags, answers to accept, and reviews waiting for a manager's answer.
  const flags = releaseBlockers(store.state).filter((b) => b.kind === 'flag').length + store.state.managerReviews.filter((r) => r.returns?.some((x) => !x.answeredOn)).length;
  if (role === 'hr') {
    return [
      { href: '#/hr', label: 'Home', icon: <IconCycle /> },
      { href: '#/hr/progress', label: 'People', icon: <IconPeople /> },
      { href: '#/hr/consistency', label: 'Fairness', icon: <IconScale />, count: flags, alert: true },
      { href: '#/hr/map', label: 'Map', icon: <IconMap /> },
      { href: '#/hr/activity', label: 'Activity', icon: <IconLog /> },
    ];
  }
  if (role === 'manager') {
    const isHead = store.state.people.find((p) => p.id === userId)?.kind === 'head';
    const open = store.state.participants.filter(
      (p) => p.reviewerId === userId && !p.removed && store.state.managerReviews.find((r) => r.personId === p.personId)?.status !== 'submitted',
    ).length;
    const items: NavItem[] = [{ href: '#/manager', label: isHead ? 'Assigned to me' : 'My team', icon: <IconPeople />, count: open, alert: true }];
    if (!isHead) items.push({ href: '#/manager/map', label: 'Team map', icon: <IconMap /> });
    return items;
  }
  return [
    { href: '#/me', label: 'Home', icon: <IconTarget />, count: ['open', 'open_late'].includes(selfReviewWindow(store.state, userId)) && !store.state.participants.find((p) => p.personId === userId)?.removed ? 1 : 0, alert: true },
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
    if (key === '/hr/activity') return { navKey: key, element: <HrActivity /> };
    if (key === '/hr') return { navKey: key, element: <HrCycle /> };
    if (key === '/hr/map') return { navKey: key, element: <MapPage /> };
    return { navKey: key, element: placeholder(key) };
  }
  if (role === 'manager') {
    const m = path.match(/^\/manager\/review\/(\w+)/);
    if (m) return { navKey: '/manager', element: <ManagerReviewPage key={m[1]} personId={m[1]} userId={userId} /> };
    if (path.startsWith('/manager/map')) return { navKey: '/manager/map', element: <MapPage reviewerId={userId} /> };
    return { navKey: '/manager', element: <ManagerTeam userId={userId} /> };
  }
  const key = ['/me/self-review', '/me/result'].find((k) => path.startsWith(k)) ?? '/me';
  if (key === '/me/result') return { navKey: key, element: <EmployeeResult userId={userId} /> };
  if (key === '/me/self-review') return { navKey: '/me', element: <EmployeeSelfReview userId={userId} /> };
  return { navKey: key, element: <EmployeeGoals userId={userId} /> };
}
