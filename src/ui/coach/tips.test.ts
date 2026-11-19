import { describe, expect, it } from 'vitest';
import { createTipsStore } from './tips';

function memoryStorage() {
  const data: Record<string, string> = {};
  return { getItem: (k: string) => data[k] ?? null, setItem: (k: string, v: string) => { data[k] = v; }, data };
}

describe('tips on/off per guide', () => {
  it('starts on for every guide; Skip turns one guide off and is remembered', () => {
    const s = memoryStorage();
    const a = createTipsStore(() => s, 'k');
    expect(a.isOff('hr')).toBe(false);
    a.skip('hr');
    expect(a.isOff('hr')).toBe(true);
    expect(a.isOff('employee')).toBe(false);
    // A new session reads the same storage.
    expect(createTipsStore(() => s, 'k').isOff('hr')).toBe(true);
  });

  it('"Show tips again" turns every guide back on and reopens closed tips', () => {
    const s = memoryStorage();
    const a = createTipsStore(() => s, 'k');
    a.skip('hr');
    a.skip('manager');
    a.close('hr:0:x');
    a.showAgain();
    expect(a.isOff('hr') || a.isOff('manager')).toBe(false);
    expect(a.isClosed('hr:0:x')).toBe(false);
    expect(createTipsStore(() => s, 'k').isOff('hr')).toBe(false);
  });

  it('a closed tip stays closed for the session only', () => {
    const s = memoryStorage();
    const a = createTipsStore(() => s, 'k');
    a.close('hr:0:x');
    expect(a.isClosed('hr:0:x')).toBe(true);
    expect(createTipsStore(() => s, 'k').isClosed('hr:0:x')).toBe(false);
  });

  it('works without storage, with storage that throws, and with bad stored data', () => {
    const none = createTipsStore(() => undefined, 'k');
    none.skip('hr');
    expect(none.isOff('hr')).toBe(true);
    const throwing = createTipsStore(() => ({ getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } }), 'k');
    expect(throwing.isOff('hr')).toBe(false);
    throwing.skip('employee');
    expect(throwing.isOff('employee')).toBe(true);
    const bad = memoryStorage();
    bad.data.k = '{not json';
    expect(createTipsStore(() => bad, 'k').isOff('hr')).toBe(false);
  });

  it('tells subscribers when something changes', () => {
    const a = createTipsStore(() => undefined, 'k');
    let calls = 0;
    const off = a.subscribe(() => { calls += 1; });
    a.skip('hr');
    a.close('x');
    off();
    a.showAgain();
    expect(calls).toBe(2);
  });
});
