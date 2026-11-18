import { describe, expect, it } from 'vitest';
import { addDays, addMonths, daysBetween, formatDate } from './dates';

describe('dates', () => {
  it('adds days across month and year ends', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-12-12', -1)).toBe('2026-12-11');
  });
  it('counts calendar days', () => {
    expect(daysBetween('2026-12-11', '2026-12-14')).toBe(3);
    expect(daysBetween('2026-12-14', '2026-12-11')).toBe(-3);
  });
  it('adds months and clamps the day', () => {
    expect(addMonths('2026-12-31', -3)).toBe('2026-09-30');
    expect(addMonths('2026-03-31', -1)).toBe('2026-02-28');
  });
  it('formats dates', () => {
    expect(formatDate('2026-12-12')).toBe('12 Dec 2026');
    expect(formatDate('2026-12-12', true)).toBe('12 Dec');
  });
});
