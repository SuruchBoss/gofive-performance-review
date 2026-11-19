/** ISO calendar date on the demo clock, `YYYY-MM-DD`. */
export type IsoDate = string;

export type Rating = 1 | 2 | 3 | 4 | 5;

export type PersonKind = 'employee' | 'manager' | 'head' | 'hr';

export interface Person {
  id: string;
  name: string;
  title: string;
  kind: PersonKind;
  teamId?: string;
  managerId?: string;
  startDate: IsoDate;
}

export interface Team {
  id: string;
  name: string;
  managerId: string;
}

export interface Cycle {
  id: string;
  name: string;
  periodStart: IsoDate;
  periodEnd: IsoDate;
  openedOn: IsoDate;
  selfReviewDeadline: IsoDate;
  managerDeadline: IsoDate;
  status: 'open' | 'released';
  releasedOn?: IsoDate;
}

export interface Competency {
  id: string;
  name: string;
  description: string;
  anchors: Record<Rating, string>;
}

export interface Goal {
  id: string;
  personId: string;
  title: string;
  weight: number;
  target: number;
  actual: number;
  unit: string;
  direction: 'higher' | 'lower';
  source: string;
}

export interface Participant {
  personId: string;
  /** Current reviewer. Changes when the case escalates. */
  reviewerId: string;
  removed?: { on: IsoDate; reason: string; by: string };
  extension?: { until: IsoDate; reason: string; by: string };
  escalatedOn?: IsoDate;
  /** Reviewer before escalation. */
  escalatedFrom?: string;
  lastRemindedOn?: IsoDate;
}

export interface SelfReview {
  personId: string;
  status: 'not_started' | 'draft' | 'submitted';
  text: string;
  selfRating?: Rating;
  submittedOn?: IsoDate;
  late: boolean;
}

export interface BehaviourRating {
  competencyId: string;
  rating?: Rating;
}

export interface ManagerReview {
  personId: string;
  reviewerId: string;
  status: 'not_started' | 'draft' | 'submitted';
  behaviour: BehaviourRating[];
  overall?: Rating;
  overallEvidence?: string;
  deviationReason?: string;
  comment?: string;
  suggestedAtSubmit?: number;
  /** Overall rating after cross-team calibration, if it was changed there. */
  calibratedOverall?: Rating;
  calibrationReason?: string;
  selfReviewMissing: boolean;
  submittedOn?: IsoDate;
  /** HR sent the review back with a question (from a flag). The last one may still be open. */
  returns?: ReturnRequest[];
}

export interface ReturnRequest {
  question: string;
  flagKey: string;
  on: IsoDate;
  by: string;
  /** Overall rating when HR sent it back, to tell "changed" from "confirmed". */
  ratingBefore: Rating;
  answer?: string;
  answeredOn?: IsoDate;
  outcome?: 'changed' | 'confirmed';
  /** HR's decision on the answer. Release waits until HR accepts it. */
  hrDecision?: 'accepted' | 'asked_again';
  decidedOn?: IsoDate;
  decidedBy?: string;
}

/** HR's review of a derived flag. Flags themselves are never stored. */
export interface FlagReview {
  flagKey: string;
  note: string;
  by: string;
  on: IsoDate;
}

export type LogType =
  | 'cycle_opened'
  | 'reminder'
  | 'extension'
  | 'escalation'
  | 'removal'
  | 'self_review_late'
  | 'review_submitted'
  | 'flag_reviewed'
  | 'returned_to_manager'
  | 'return_answered'
  | 'return_accepted'
  | 'demo_shortcut'
  | 'deadline_change'
  | 'calibration_started'
  | 'calibration_change'
  | 'calibration_item'
  | 'calibration_locked'
  | 'release';

export interface LogEntry {
  id: string;
  on: IsoDate;
  actorId: string;
  type: LogType;
  targetId?: string;
  detail: string;
}

/** A case discussed in the calibration session. Frozen when the session starts. */
export interface AgendaItem {
  key: string;
  kind: 'far' | 'gap';
  label: string;
  personId?: string;
  reviewerId?: string;
  resolution?: { note: string; on: IsoDate; by: string };
}

export interface CalibrationChange {
  personId: string;
  from: Rating;
  to: Rating;
  reason: string;
  on: IsoDate;
  by: string;
}

export interface Calibration {
  status: 'not_started' | 'in_session' | 'locked';
  startedOn?: IsoDate;
  lockedOn?: IsoDate;
  attendees: string[];
  agenda: AgendaItem[];
  changes: CalibrationChange[];
}

export interface DemoState {
  version: number;
  today: IsoDate;
  company: string;
  cycle: Cycle;
  people: Person[];
  teams: Team[];
  competencies: Competency[];
  goals: Goal[];
  participants: Participant[];
  selfReviews: SelfReview[];
  managerReviews: ManagerReview[];
  flagReviews: FlagReview[];
  calibration: Calibration;
  log: LogEntry[];
}
