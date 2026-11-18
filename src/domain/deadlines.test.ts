import { describe, expect, it } from 'vitest';
import { createSeed } from '../data/seed';
import { reduce } from './actions';
import { caseInfo } from './deadlines';
import type { DemoState } from './types';

const days = (s: DemoState, n: number) => Array.from({ length: n }).reduce<DemoState>((acc) => reduce(acc, { type: 'advance_day' }), s);
const reviewer = (s: DemoState, id: string) => s.participants.find((p) => p.personId === id)!.reviewerId;
const escalations = (s: DemoState) => s.log.filter((l) => l.type === 'escalation');

describe('overdue', () => {
  it('is due on the deadline day and overdue the day after', () => {
    const onDeadline = { ...createSeed(), today: '2026-12-11' };
    expect(caseInfo(onDeadline, 'e12').status).toBe('due');
    const s = createSeed(); // 12 Dec
    expect(caseInfo(s, 'e12')).toMatchObject({ status: 'overdue', daysOverdue: 1, escalatesOn: '2026-12-14' });
  });
  it('ignores submitted reviews', () => {
    expect(caseInfo(createSeed(), 'e01').status).toBe('submitted');
  });
});

describe('automatic escalation (deadline + 3 days)', () => {
  it('does not escalate at deadline + 2', () => {
    const s = days(createSeed(), 1); // 13 Dec
    expect(reviewer(s, 'e12')).toBe('m-ops');
    expect(escalations(s)).toHaveLength(0);
  });

  it('escalates at deadline + 3 to the manager’s own manager, and logs it', () => {
    const s = days(createSeed(), 2); // 14 Dec
    expect(reviewer(s, 'e12')).toBe('head');
    expect(s.managerReviews.find((r) => r.personId === 'e12')!.reviewerId).toBe('head');
    expect(caseInfo(s, 'e12').status).toBe('escalated');
    const e = escalations(s).find((l) => l.targetId === 'e12')!;
    expect(e).toMatchObject({ on: '2026-12-14', actorId: 'system' });
    // e08 (new joiner, still in the cycle) and e11 escalate too.
    expect(escalations(s).map((l) => l.targetId).sort()).toEqual(['e08', 'e11', 'e12']);
  });

  it('escalates once only, however many days pass', () => {
    const s = days(createSeed(), 6);
    expect(escalations(s)).toHaveLength(3);
    expect(reviewer(s, 'e12')).toBe('head');
  });

  it('a draft keeps its ratings when it moves to the new reviewer', () => {
    const s = days(createSeed(), 2);
    expect(s.managerReviews.find((r) => r.personId === 'e11')!.behaviour[0].rating).toBe(3);
  });

  it('does not escalate submitted or removed cases', () => {
    let s = createSeed();
    s = { ...s, participants: s.participants.map((p) => (p.personId === 'e08' ? { ...p, removed: { on: s.today, reason: 'x', by: 'hr' } } : p)) };
    s = days(s, 2);
    expect(reviewer(s, 'e08')).toBe('m-support');
    expect(reviewer(s, 'e01')).toBe('m-sales');
  });
});

describe('extension', () => {
  it('needs a reason and a date after today and after the current deadline', () => {
    const s = createSeed();
    expect(reduce(s, { type: 'extend', personId: 'e12', until: '2026-12-18', reason: ' ', actorId: 'hr' })).toBe(s);
    expect(reduce(s, { type: 'extend', personId: 'e12', until: '2026-12-12', reason: 'r', actorId: 'hr' })).toBe(s);
  });

  it('moves the escalation date when granted before escalation', () => {
    let s = reduce(createSeed(), { type: 'extend', personId: 'e12', until: '2026-12-18', reason: 'Manager on leave', actorId: 'hr' });
    expect(caseInfo(s, 'e12')).toMatchObject({ status: 'due', escalatesOn: '2026-12-21' });
    expect(s.log.at(-1)?.type).toBe('extension');
    s = days(s, 2);
    expect(reviewer(s, 'e12')).toBe('m-ops');
    s = days(s, 7); // 21 Dec
    expect(reviewer(s, 'e12')).toBe('head');
  });

  it('does not move the review back once it has escalated', () => {
    let s = days(createSeed(), 2);
    s = reduce(s, { type: 'extend', personId: 'e12', until: '2026-12-20', reason: 'More time', actorId: 'hr' });
    expect(reviewer(s, 'e12')).toBe('head');
    expect(caseInfo(s, 'e12').status).toBe('escalated');
  });
});

describe('reminder', () => {
  it('records the date and logs it; not for submitted reviews', () => {
    const s = reduce(createSeed(), { type: 'remind', personId: 'e12', actorId: 'hr' });
    expect(s.participants.find((p) => p.personId === 'e12')!.lastRemindedOn).toBe('2026-12-12');
    expect(s.log.at(-1)).toMatchObject({ type: 'reminder', detail: 'Reminded Tom Wattana to review Ying Chen.' });
    const t = createSeed();
    expect(reduce(t, { type: 'remind', personId: 'e01', actorId: 'hr' })).toBe(t);
  });
});
