import type { CaseInfo } from '../domain/deadlines';
import { formatDate as fmt } from '../domain/dates';
import type { ManagerReview, SelfReview } from '../domain/types';
import { Badge } from './components';

export function SelfReviewBadge({ r }: { r: SelfReview }) {
  if (r.status === 'submitted') return <Badge tone="success">{r.late ? 'Submitted late' : 'Submitted'}</Badge>;
  if (r.status === 'draft') return <Badge tone="brand">Draft</Badge>;
  return <Badge>Not submitted</Badge>;
}

export function ReviewBadge({ r }: { r: ManagerReview }) {
  if (r.status === 'submitted') return <Badge tone="success">Submitted</Badge>;
  if (r.status === 'draft') return <Badge tone="brand">In progress</Badge>;
  return <Badge>Not started</Badge>;
}

export function CaseBadge({ c }: { c: CaseInfo }) {
  switch (c.status) {
    case 'submitted':
      return <Badge tone="success">Submitted</Badge>;
    case 'removed':
      return <Badge>Removed</Badge>;
    case 'escalated':
      return <Badge tone="danger">Escalated</Badge>;
    case 'overdue':
      return <Badge tone="warning">{c.daysOverdue} day{c.daysOverdue === 1 ? '' : 's'} overdue</Badge>;
    default:
      return <Badge tone="brand" plain>Due {fmt(c.deadline, true)}</Badge>;
  }
}
