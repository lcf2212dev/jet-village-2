import type { Direction } from '../directions';
import type { AnimState } from '../components';

export function clipKey(state: AnimState, direction: Direction): string {
  return `${state}-${direction}`;
}

/** Resolve clip with fallbacks for incomplete atlases. */
export function resolveClip(
  has: (key: string) => boolean,
  state: AnimState,
  direction: Direction,
): string {
  const primary = clipKey(state, direction);
  if (has(primary)) return primary;

  // Cardinal fallback for diagonals
  if (direction.includes('-')) {
    const [a, b] = direction.split('-') as [string, string];
    // Prefer horizontal for attack readability
    const h = state === 'attack' ? (b === 'left' || b === 'right' ? b : a) : a;
    const tryH = `${state}-${h}`;
    if (has(tryH)) return tryH;
    const tryV = `${state}-${a}`;
    if (has(tryV)) return tryV;
  }

  // State-level fallbacks
  if (state === 'run' && has(clipKey('walk', direction))) return clipKey('walk', direction);
  if (state === 'sit' && has(clipKey('idle', direction))) return clipKey('idle', direction);
  if (state === 'death' && has('death-down')) return 'death-down';
  if (has(`${state}-down`)) return `${state}-down`;
  return primary;
}
