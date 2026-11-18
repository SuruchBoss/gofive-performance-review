import { describe, expect, it } from 'vitest';
import { createSeed } from './seed';

describe('demo seed', () => {
  const s = createSeed();

  it('has one company with 3 teams, 3 managers, a head, HR and 12 participants', () => {
    expect(s.teams).toHaveLength(3);
    expect(s.people.filter((p) => p.kind === 'manager')).toHaveLength(3);
    expect(s.people.filter((p) => p.kind === 'head')).toHaveLength(1);
    expect(s.people.filter((p) => p.kind === 'hr')).toHaveLength(1);
    expect(s.participants).toHaveLength(12);
  });

  it('starts the day after the manager deadline', () => {
    expect(s.cycle.managerDeadline).toBe('2026-12-11');
    expect(s.today).toBe('2026-12-12');
  });

  it('gives every participant goals whose weights sum to 100', () => {
    for (const p of s.participants) {
      const goals = s.goals.filter((g) => g.personId === p.personId);
      expect(goals.length).toBeGreaterThanOrEqual(3);
      expect(goals.reduce((sum, g) => sum + g.weight, 0)).toBe(100);
    }
  });

  it('leaves two Operations reviews open and the new joiner unreviewed', () => {
    const open = s.managerReviews.filter((r) => r.status !== 'submitted').map((r) => r.personId).sort();
    expect(open).toEqual(['e08', 'e11', 'e12']);
  });

  it('has one person who joined in the last three months of the period', () => {
    const recent = s.people.filter((p) => p.kind === 'employee' && p.startDate > '2026-09-30');
    expect(recent.map((p) => p.id)).toEqual(['e08']);
  });

  it('has missing self-reviews, including one the manager reviewed without', () => {
    const missing = s.selfReviews.filter((r) => r.status !== 'submitted').map((r) => r.personId);
    expect(missing).toEqual(['e03', 'e08', 'e12']);
    expect(s.managerReviews.find((r) => r.personId === 'e03')?.selfReviewMissing).toBe(true);
  });

  it('returns a fresh copy each time', () => {
    const a = createSeed();
    a.people[0].name = 'changed';
    expect(createSeed().people[0].name).not.toBe('changed');
  });
});
