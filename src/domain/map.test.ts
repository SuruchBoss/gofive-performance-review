import { describe, expect, it } from 'vitest';
import { createSeed } from '../data/seed';
import { band, cellLabel, mapPoints } from './map';

describe('map grid', () => {
  it('cuts at 2.5 and 3.5, with the cut values in the middle band', () => {
    expect([2.49, 2.5, 3.5, 3.51].map(band)).toEqual(['low', 'mid', 'mid', 'high']);
  });
  it('names the corners', () => {
    expect(cellLabel(4, 4)).toBe('Strong on both');
    expect(cellLabel(1.4, 2)).toBe('Below on both');
    expect(cellLabel(4.2, 2.25)).toBe('Results high, behaviour low');
    expect(cellLabel(2.2, 3.75)).toBe('Behaviour high, results low');
    expect(cellLabel(3, 4)).toBe('Around expectations');
  });
});

describe('map points from the demo data', () => {
  const s = createSeed();
  it('plots submitted reviews only and has someone in every corner', () => {
    const pts = mapPoints(s);
    expect(pts).toHaveLength(9);
    const cells = new Set(pts.map((p) => p.cell));
    for (const c of ['Strong on both', 'Below on both', 'Results high, behaviour low', 'Behaviour high, results low']) expect(cells).toContain(c);
  });
  it('marks open far-from-results flags', () => {
    expect(mapPoints(s).filter((p) => p.flagged).map((p) => p.personId)).toEqual(['e01', 'e05']);
  });
  it('limits a manager to their own team', () => {
    expect(mapPoints(s, 'm-ops').map((p) => p.personId)).toEqual(['e09', 'e10']);
  });
});
