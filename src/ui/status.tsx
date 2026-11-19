import type { CaseInfo } from '../domain/deadlines';
import { formatDate as fmt } from '../domain/dates';
import type { ManagerReview, SelfReview } from '../domain/types';
import { Badge } from './components';

export function SelfReviewBadge({ r }: { r: SelfReview }) {
  if (r.status === 'submitted') return <Badge tone="success">{r.late ? 'Self-review in, late' : 'Self-review in'}</Badge>;
  if (r.status === 'draft') return <Badge tone="brand">Self-review draft</Badge>;
  return <Badge>No self-review yet</Badge>;
}

export function ReviewBadge({ r }: { r: ManagerReview }) {
  if (r.status === 'submitted') return <Badge tone="success">Review submitted</Badge>;
  if (r.status === 'draft') return <Badge tone="brand">Review in progress</Badge>;
  return <Badge>Review not started</Badge>;
}

export function CaseBadge({ c }: { c: CaseInfo }) {
  switch (c.status) {
    case 'submitted':
      return <Badge tone="success">Review submitted</Badge>;
    case 'removed':
      return <Badge>Removed</Badge>;
    case 'escalated':
      return <Badge tone="danger">Review escalated</Badge>;
    case 'overdue':
      return <Badge tone="warning">Review {c.daysOverdue} day{c.daysOverdue === 1 ? '' : 's'} overdue</Badge>;
    default:
      return <Badge tone="brand" plain>Review due {fmt(c.deadline, true)}</Badge>;
  }
}
