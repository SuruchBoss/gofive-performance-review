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
