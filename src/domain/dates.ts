import type { IsoDate } from './types';

const DAY = 86_400_000;

function toUtc(d: IsoDate): number {
  const [y, m, day] = d.split('-').map(Number);
  return Date.UTC(y, m - 1, day);
}

export function addDays(d: IsoDate, n: number): IsoDate {
  return new Date(toUtc(d) + n * DAY).toISOString().slice(0, 10);
}

/** Whole calendar days from `a` to `b` (positive when b is later). */
export function daysBetween(a: IsoDate, b: IsoDate): number {
  return Math.round((toUtc(b) - toUtc(a)) / DAY);
}

export function addMonths(d: IsoDate, n: number): IsoDate {
  const [y, m, day] = d.split('-').map(Number);
  const target = new Date(Date.UTC(y, m - 1 + n, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(day, lastDay));
  return target.toISOString().slice(0, 10);
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** "12 Dec 2026", or "12 Dec" with short=true. */
export function formatDate(d: IsoDate, short = false): string {
  const [y, m, day] = d.split('-').map(Number);
  return short ? `${day} ${MONTHS[m - 1]}` : `${day} ${MONTHS[m - 1]} ${y}`;
}

export function weekday(d: IsoDate): string {
  return WEEKDAYS[new Date(toUtc(d)).getUTCDay()];
}
