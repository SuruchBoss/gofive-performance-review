/** Where the coachmark card goes. Pure, so it can be tested without a browser. */
export interface Box { top: number; left: number; width: number; height: number }

export interface PlaceInput {
  /** The highlighted control, in viewport coordinates. Missing: the card is centred. */
  target?: Box;
  card: { width: number; height: number };
  viewport: { width: number; height: number };
  /** Nothing may sit above this line (the bottom of the prototype top bar, if visible). */
  minTop: number;
  prefer?: 'above' | 'below';
  /** Side gutter (default 16) and distance from the target (default 12). */
  margin?: number;
  gap?: number;
}

export interface Placement { top: number; left: number; side: 'below' | 'above' | 'center' }

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), Math.max(lo, hi));

export function placeCard({ target, card, viewport, minTop, prefer = 'below', margin = 16, gap = 12 }: PlaceInput): Placement {
  const edge = 8;
  const top0 = minTop + edge;
  const maxTop = viewport.height - edge - card.height;
  const maxLeft = viewport.width - margin - card.width;
  if (!target) {
    return { top: clamp((viewport.height - card.height) / 2, top0, maxTop), left: clamp((viewport.width - card.width) / 2, margin, maxLeft), side: 'center' };
  }
  const left = clamp(target.left + target.width / 2 - card.width / 2, margin, maxLeft);
  const below = target.top + target.height + gap;
  const above = target.top - gap - card.height;
  const fitsBelow = below <= maxTop;
  const fitsAbove = above >= top0;
  const order: ('below' | 'above')[] = prefer === 'above' ? ['above', 'below'] : ['below', 'above'];
  for (const side of order) {
    if (side === 'below' && fitsBelow) return { top: Math.max(below, top0), left, side };
    if (side === 'above' && fitsAbove) return { top: Math.min(above, maxTop), left, side };
  }
  // Neither side has room: take the side with more space and stay on screen.
  const roomBelow = viewport.height - (target.top + target.height);
  const roomAbove = target.top - minTop;
  return roomBelow >= roomAbove ? { top: clamp(below, top0, maxTop), left, side: 'below' } : { top: clamp(above, top0, maxTop), left, side: 'above' };
}
