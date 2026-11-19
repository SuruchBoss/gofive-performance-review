import { describe, expect, it } from 'vitest';
import { placeCard } from './placement';

const card = { width: 300, height: 140 };

describe('coachmark card placement', () => {
  it.each([320, 375, 412, 1366])('stays fully on screen at %d px, wherever the target is', (width) => {
    const viewport = { width, height: 700 };
    for (const left of [0, width / 2 - 20, width - 40]) {
      for (const top of [-50, 60, 300, 650, 900]) {
        const p = placeCard({ target: { top, left, width: 40, height: 36 }, card: { ...card, width: Math.min(300, width - 32) }, viewport, minTop: 48 });
        expect(p.left).toBeGreaterThanOrEqual(16);
        expect(p.left + Math.min(300, width - 32)).toBeLessThanOrEqual(width - 16);
        expect(p.top).toBeGreaterThanOrEqual(48);
        expect(p.top + card.height).toBeLessThanOrEqual(700);
      }
    }
  });

  it('goes below the target when there is room, centred on it', () => {
    const p = placeCard({ target: { top: 100, left: 600, width: 100, height: 40 }, card, viewport: { width: 1366, height: 900 }, minTop: 0 });
    expect(p).toEqual({ side: 'below', top: 152, left: 500 });
  });

  it('goes above when there is no room below', () => {
    const p = placeCard({ target: { top: 800, left: 600, width: 100, height: 40 }, card, viewport: { width: 1366, height: 900 }, minTop: 0 });
    expect(p.side).toBe('above');
    expect(p.top + card.height).toBe(788);
  });

  it('respects a preference for above, and never covers the top bar', () => {
    const above = placeCard({ target: { top: 400, left: 100, width: 200, height: 40 }, card, viewport: { width: 412, height: 900 }, minTop: 60, prefer: 'above' });
    expect(above.side).toBe('above');
    const noRoom = placeCard({ target: { top: 100, left: 100, width: 200, height: 40 }, card, viewport: { width: 412, height: 900 }, minTop: 60, prefer: 'above' });
    expect(noRoom.side).toBe('below');
    expect(noRoom.top).toBeGreaterThanOrEqual(60);
  });

  it('centres the card when there is no target', () => {
    const p = placeCard({ card, viewport: { width: 400, height: 800 }, minTop: 0 });
    expect(p).toEqual({ side: 'center', top: 330, left: 50 });
  });
});
