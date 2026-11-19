import type {
  Competency,
  DemoState,
  Goal,
  ManagerReview,
  Participant,
  Person,
  Rating,
  SelfReview,
  Team,
} from '../domain/types';

/**
 * Demo data for a fictional company. All names are invented.
 * The numbers are chosen so that (see docs/DESIGN.md section 5):
 *  - Sales rates above its results (gap about +0.9),
 *  - Support rates below its results (gap about -0.9),
 *  - Operations rates in line with results but has 2 reviews open past the deadline,
 *  - one Support member joined in October (under 3 months),
 *  - some self-reviews are missing.
 */

export const SEED_VERSION = 1;

const people: Person[] = [
  { id: 'head', name: 'Anong Rattanakul', title: 'Managing Director', kind: 'head', startDate: '2016-03-01' },
  { id: 'hr', name: 'Pim Chaiyaporn', title: 'HR Business Partner', kind: 'hr', managerId: 'head', startDate: '2019-06-17' },

  { id: 'm-sales', name: 'Daniel Reyes', title: 'Sales Manager', kind: 'manager', teamId: 'sales', managerId: 'head', startDate: '2018-01-08' },
  { id: 'm-support', name: 'Kanya Srisuk', title: 'Customer Support Lead', kind: 'manager', teamId: 'support', managerId: 'head', startDate: '2017-09-04' },
  { id: 'm-ops', name: 'Tom Wattana', title: 'Operations Manager', kind: 'manager', teamId: 'ops', managerId: 'head', startDate: '2020-02-03' },

  { id: 'e01', name: 'Nida Phrom', title: 'Senior Account Executive', kind: 'employee', teamId: 'sales', managerId: 'm-sales', startDate: '2019-04-01' },
  { id: 'e02', name: 'James Okafor', title: 'Account Executive', kind: 'employee', teamId: 'sales', managerId: 'm-sales', startDate: '2021-08-16' },
  { id: 'e03', name: 'Ploy Sirikul', title: 'Account Executive', kind: 'employee', teamId: 'sales', managerId: 'm-sales', startDate: '2023-02-06' },
  { id: 'e04', name: 'Arthit Kaewmanee', title: 'Sales Development Rep', kind: 'employee', teamId: 'sales', managerId: 'm-sales', startDate: '2024-05-13' },

  { id: 'e05', name: 'Mai Tran', title: 'Senior Support Specialist', kind: 'employee', teamId: 'support', managerId: 'm-support', startDate: '2020-11-02' },
  { id: 'e06', name: 'Chanon Boonmee', title: 'Support Specialist', kind: 'employee', teamId: 'support', managerId: 'm-support', startDate: '2022-03-21' },
  { id: 'e07', name: 'Lisa Park', title: 'Support Specialist', kind: 'employee', teamId: 'support', managerId: 'm-support', startDate: '2023-07-10' },
  { id: 'e08', name: 'Fah Inthira', title: 'Support Specialist', kind: 'employee', teamId: 'support', managerId: 'm-support', startDate: '2026-10-03' },

  { id: 'e09', name: 'Krit Somsak', title: 'Warehouse Supervisor', kind: 'employee', teamId: 'ops', managerId: 'm-ops', startDate: '2018-10-01' },
  { id: 'e10', name: 'Ben Hall', title: 'Logistics Coordinator', kind: 'employee', teamId: 'ops', managerId: 'm-ops', startDate: '2022-01-10' },
  { id: 'e11', name: 'Orn Lertsak', title: 'Inventory Analyst', kind: 'employee', teamId: 'ops', managerId: 'm-ops', startDate: '2021-06-01' },
  { id: 'e12', name: 'Ying Chen', title: 'Logistics Coordinator', kind: 'employee', teamId: 'ops', managerId: 'm-ops', startDate: '2024-09-02' },
];

const teams: Team[] = [
  { id: 'sales', name: 'Sales', managerId: 'm-sales' },
  { id: 'support', name: 'Customer Support', managerId: 'm-support' },
  { id: 'ops', name: 'Operations', managerId: 'm-ops' },
];

const competencies: Competency[] = [
  {
    id: 'quality',
    name: 'Quality of work',
    description: 'Accuracy and finish of the work others rely on.',
    anchors: {
      1: 'Work often needs to be redone by others; errors reach customers or other teams.',
      2: 'Work is usable but regularly needs checking and correction before it can be relied on.',
      3: 'Work is accurate and complete; it rarely needs correction.',
      4: 'Work is reliable without checks and others reuse it as a reference.',
      5: 'Sets the quality bar for the team; improved how others check or build their work.',
    },
  },
  {
    id: 'ownership',
    name: 'Ownership',
    description: 'Follows work through to the end and raises problems early.',
    anchors: {
      1: 'Commitments are missed without warning; problems surface only when someone else finds them.',
      2: 'Delivers when reminded; raises problems late.',
      3: 'Delivers what was agreed and flags risks before deadlines are missed.',
      4: 'Takes on unowned problems in their area and closes them without being asked.',
      5: 'Owns outcomes beyond their role; fixed a recurring problem at its root.',
    },
  },
  {
    id: 'collaboration',
    name: 'Collaboration',
    description: 'Works with others so the team succeeds, not only the individual.',
    anchors: {
      1: 'Work with others breaks down; information is withheld or handovers fail.',
      2: 'Cooperates when asked but rarely shares information unprompted.',
      3: 'Shares information, helps when asked and keeps handovers clean.',
      4: 'Actively helps teammates succeed; others seek them out.',
      5: 'Makes the whole team or neighbouring teams work better; resolves conflict between groups.',
    },
  },
  {
    id: 'customer',
    name: 'Customer focus',
    description: 'Understands and acts on what customers, internal or external, need.',
    anchors: {
      1: 'Customer needs are ignored or misread; complaints are left open.',
      2: 'Responds to customer requests but only as literally asked.',
      3: 'Understands the need behind requests and resolves them fully.',
      4: 'Anticipates needs and prevents problems before customers notice.',
      5: 'Changed how the team serves customers in a lasting, measurable way.',
    },
  },
];

let goalSeq = 0;
function goal(personId: string, title: string, weight: number, target: number, actual: number, unit: string, direction: 'higher' | 'lower', source: string): Goal {
  goalSeq += 1;
  return { id: `g${String(goalSeq).padStart(2, '0')}`, personId, title, weight, target, actual, unit, direction, source };
}

const CRM = 'CRM export, 30 Nov 2026';
const DESK = 'Helpdesk report, 30 Nov 2026';
const WMS = 'Warehouse system, 30 Nov 2026';
const PROJ = 'Improvement register, 30 Nov 2026';

function salesGoals(id: string, revenue: number, accounts: number, renewal: number): Goal[] {
  return [
    goal(id, 'Net new revenue', 50, 12, revenue, 'THB m', 'higher', CRM),
    goal(id, 'New accounts signed', 30, 20, accounts, 'accounts', 'higher', CRM),
    goal(id, 'Renewal rate of own accounts', 20, 85, renewal, '%', 'higher', CRM),
  ];
}
function supportGoals(id: string, resolved: number, csat: number, frt: number, resolvedTarget = 1800): Goal[] {
  return [
    goal(id, 'Tickets resolved', 40, resolvedTarget, resolved, 'tickets', 'higher', DESK),
    goal(id, 'Customer satisfaction (CSAT)', 30, 88, csat, '%', 'higher', DESK),
    goal(id, 'Median first-response time', 30, 4, frt, 'hours', 'lower', DESK),
  ];
}
function opsGoals(id: string, onTime: number, cost: number, improvements: number): Goal[] {
  return [
    goal(id, 'Orders dispatched on time', 40, 95, onTime, '%', 'higher', WMS),
    goal(id, 'Cost per order', 40, 42, cost, 'THB', 'lower', WMS),
    goal(id, 'Process improvements shipped', 20, 4, improvements, 'improvements', 'higher', PROJ),
  ];
}

const goals: Goal[] = [
  ...salesGoals('e01', 15.0, 24, 84),
  ...salesGoals('e02', 12.6, 21, 85),
  ...salesGoals('e03', 9.6, 16, 85),
  ...salesGoals('e04', 12.4, 20, 87),
  ...supportGoals('e05', 2340, 92, 3.0),
  ...supportGoals('e06', 2160, 90, 3.2),
  ...supportGoals('e07', 1620, 86, 4.2),
  ...supportGoals('e08', 310, 89, 4.5, 450),
  ...opsGoals('e09', 97, 30, 7),
  ...opsGoals('e10', 81, 58, 1),
  ...opsGoals('e11', 95, 41, 4),
  ...opsGoals('e12', 92, 44, 3),
];

const employees = people.filter((p) => p.kind === 'employee');

const participants: Participant[] = employees.map((p) => ({
  personId: p.id,
  reviewerId: p.managerId!,
  ...(p.id === 'e11' || p.id === 'e12' ? { lastRemindedOn: '2026-12-09' } : {}),
}));

function self(personId: string, selfRating: Rating, text: string, submittedOn: string, late = false): SelfReview {
  return { personId, status: 'submitted', text, selfRating, submittedOn, late };
}
const notStarted = (personId: string): SelfReview => ({ personId, status: 'not_started', text: '', late: false });

const selfReviews: SelfReview[] = [
  self('e01', 4, 'Closed the Chiang Mai distributor deal in Q3, which was the largest new contract this year. I lost two renewals in Q2 because I followed up too late; I now block a renewal review 60 days before expiry.', '2026-11-20'),
  self('e02', 4, 'Hit revenue and accounts targets. I helped onboard Arthit in the first two months. I want to move to larger accounts next year.', '2026-11-24'),
  notStarted('e03'),
  self('e04', 3, 'First full year on the team. I met the accounts target. My calls convert well but my pipeline notes in the CRM are not always up to date.', '2026-11-29', true),
  self('e05', 4, 'Resolved the most tickets on the team and cut my first-response time to three hours. I wrote the new returns macro that the team now uses.', '2026-11-21'),
  self('e06', 3, 'Steady year. Moved to the weekend rota in June. CSAT above target every month except August.', '2026-11-25'),
  self('e07', 3, 'I took longer than planned to learn the billing system, which slowed my response times in the first half. Second half was much better.', '2026-11-26'),
  notStarted('e08'),
  self('e09', 4, 'Led the move to the new pick-path layout, which cut cost per order. Shipped seven small process fixes.', '2026-11-19'),
  self('e10', 3, 'The carrier change in March caused a lot of late dispatches that were outside my control. I think my coordination work was solid.', '2026-11-27'),
  self('e11', 3, 'Kept inventory accuracy on target through the stock-take. I want to learn forecasting next year.', '2026-11-23'),
  notStarted('e12'),
];

const B = (q: Rating, o: Rating, c: Rating, cu: Rating) => [
  { competencyId: 'quality', rating: q },
  { competencyId: 'ownership', rating: o },
  { competencyId: 'collaboration', rating: c },
  { competencyId: 'customer', rating: cu },
];

function submitted(
  personId: string,
  reviewerId: string,
  behaviour: ReturnType<typeof B>,
  overall: Rating,
  suggestedAtSubmit: number,
  submittedOn: string,
  extra: Partial<ManagerReview> = {},
): ManagerReview {
  return {
    personId,
    reviewerId,
    status: 'submitted',
    behaviour,
    overall,
    suggestedAtSubmit,
    submittedOn,
    selfReviewMissing: false,
    ...extra,
  };
}

const managerReviews: ManagerReview[] = [
  // Sales: rates above results.
  submitted('e01', 'm-sales', B(5, 5, 4, 5), 5, 3.91, '2026-12-03', {
    overallEvidence: 'Closed the Chiang Mai distributor contract in August (THB 4.2m), which no one else on the team had been able to open in two years.',
    deviationReason: 'Revenue understates Nida’s year: from June Nida also trained our two new account executives, about a month of selling time, and both reached target by November.',
    comment: 'Outstanding year. Next step is mentoring the newer account executives.',
  }),
  submitted('e02', 'm-sales', B(4, 4, 4, 3), 4, 3.2, '2026-12-04', {
    comment: 'Reliable and a good teammate. Ready for larger accounts.',
  }),
  submitted('e03', 'm-sales', B(4, 4, 4, 3), 3, 2.2, '2026-12-05', {
    selfReviewMissing: true,
    comment: 'Below target on revenue, but works hard and is well liked by customers.',
  }),
  submitted('e04', 'm-sales', B(4, 4, 3, 4), 4, 3.11, '2026-12-05', {
    comment: 'Strong first full year. Needs to keep CRM notes current.',
  }),
  // Customer Support: rates below results.
  submitted('e05', 'm-support', B(3, 2, 2, 2), 3, 4.17, '2026-12-08', {
    deviationReason: 'Mai’s numbers are strong, but Mai often picks the easy tickets and leaves complex ones for others.',
    comment: 'Fast and productive. Needs to share the harder work.',
  }),
  submitted('e06', 'm-support', B(3, 3, 3, 3), 3, 3.81, '2026-12-09', {
    comment: 'Solid and dependable on the weekend rota.',
  }),
  submitted('e07', 'm-support', B(2, 2, 3, 2), 2, 2.69, '2026-12-10', {
    overallEvidence: 'In the first half, 31 billing tickets were escalated to Tier 2 that the playbook covers; three customers complained about repeat contacts in May.',
    comment: 'Clear improvement in the second half. Keep going with the billing training.',
  }),
  // Operations: in line, but two reviews still open.
  submitted('e09', 'm-ops', B(4, 4, 4, 4), 4, 4.34, '2026-12-10', {
    comment: 'Led the pick-path change that cut cost per order by almost a third.',
  }),
  submitted('e10', 'm-ops', B(2, 2, 2, 2), 2, 1.4, '2026-12-11', {
    overallEvidence: 'After the March carrier change, late dispatches stayed above 15% until September; no recovery plan was raised until I asked for one in July.',
    comment: 'The carrier change was hard, but the response was slow. We agreed a weekly dispatch review.',
  }),
  {
    personId: 'e11',
    reviewerId: 'm-ops',
    status: 'draft',
    behaviour: [
      { competencyId: 'quality', rating: 3 },
      { competencyId: 'ownership', rating: 3 },
      { competencyId: 'collaboration' },
      { competencyId: 'customer' },
    ],
    selfReviewMissing: false,
  },
  {
    personId: 'e12',
    reviewerId: 'm-ops',
    status: 'not_started',
    behaviour: competencies.map((c) => ({ competencyId: c.id })),
    selfReviewMissing: false,
  },
  // e08 joined in October and has no review yet.
  {
    personId: 'e08',
    reviewerId: 'm-support',
    status: 'not_started',
    behaviour: competencies.map((c) => ({ competencyId: c.id })),
    selfReviewMissing: false,
  },
];

export function createSeed(): DemoState {
  return structuredClone({
    version: SEED_VERSION,
    today: '2026-12-12',
    company: 'Riverside Supply Co.',
    cycle: {
      id: 'c2026',
      name: 'Annual Review 2026',
      periodStart: '2026-01-01',
      periodEnd: '2026-12-31',
      openedOn: '2026-11-02',
      selfReviewDeadline: '2026-11-27',
      managerDeadline: '2026-12-11',
      status: 'open',
    },
    people,
    teams,
    competencies,
    goals,
    participants,
    selfReviews,
    managerReviews,
    flagReviews: [],
    log: [
      { id: 'l1', on: '2026-11-02', actorId: 'hr', type: 'cycle_opened', detail: 'Opened Annual Review 2026 for 12 people.' },
      { id: 'l2', on: '2026-11-29', actorId: 'e04', type: 'self_review_late', targetId: 'e04', detail: 'Self-review submitted 2 days after the deadline.' },
      { id: 'l3', on: '2026-12-09', actorId: 'hr', type: 'reminder', targetId: 'e11', detail: 'Reminded Tom Wattana to review Orn Lertsak.' },
      { id: 'l4', on: '2026-12-09', actorId: 'hr', type: 'reminder', targetId: 'e12', detail: 'Reminded Tom Wattana to review Ying Chen.' },
    ],
  } satisfies DemoState);
}
