/**
 * Character facing directions (v0.4.0 — 8-way including diagonals).
 * Clip keys use the string as-is: `idle-down-right`, `attack-up-left-1`.
 */

export type Direction =
  'down' | 'up' | 'left' | 'right' | 'down-left' | 'down-right' | 'up-left' | 'up-right';

/** Stable atlas row order: 4 cardinals then 4 diagonals. */
export const DIRECTIONS_8: readonly Direction[] = [
  'down',
  'up',
  'left',
  'right',
  'down-left',
  'down-right',
  'up-left',
  'up-right',
] as const;

/** Cardinal-only set (unarmed jett atlas / legacy). */
export const DIRECTIONS_4: readonly Direction[] = ['down', 'up', 'left', 'right'] as const;

/** Below this length, stick/axis is treated as neutral (keep last facing). */
export const FACING_DEADZONE = 0.2;

/**
 * 8-way facing from a move intent vector (input axis or velocity).
 * Uses equal 45° sectors so diagonals are first-class (not “horizontal wins”).
 * When the vector is shorter than {@link FACING_DEADZONE}, returns `current`
 * so idle keeps the last facing — including diagonals after stopping.
 */
export function directionFromVelocity(vx: number, vy: number, current: Direction): Direction {
  const len = Math.hypot(vx, vy);
  if (len < FACING_DEADZONE) return current;

  // atan2(y, x): 0 = +x (right), +π/2 = +y (down) in our canvas convention.
  const angle = Math.atan2(vy, vx);
  // Map to 8 sectors centered on 0°, 45°, 90°, … (sector 0 = right).
  const sector = Math.round(angle / (Math.PI / 4));
  // Normalize sector into 0..7 (JS % can be negative).
  const s = ((sector % 8) + 8) % 8;
  switch (s) {
    case 0:
      return 'right';
    case 1:
      return 'down-right';
    case 2:
      return 'down';
    case 3:
      return 'down-left';
    case 4:
      return 'left';
    case 5:
      return 'up-left';
    case 6:
      return 'up';
    case 7:
      return 'up-right';
    default:
      return current;
  }
}

/** Blade / facing angle in degrees (0 = +x / right, 90 = +y / down). */
export function facingAngleDeg(dir: Direction): number {
  switch (dir) {
    case 'right':
      return 0;
    case 'down-right':
      return 45;
    case 'down':
      return 90;
    case 'down-left':
      return 135;
    case 'left':
      return 180;
    case 'up-left':
      return 225;
    case 'up':
      return 270;
    case 'up-right':
      return 315;
  }
}

export function isDiagonal(dir: Direction): boolean {
  return dir.includes('-');
}

export function isLeftish(dir: Direction): boolean {
  return dir === 'left' || dir === 'down-left' || dir === 'up-left';
}

export function isUpish(dir: Direction): boolean {
  return dir === 'up' || dir === 'up-left' || dir === 'up-right';
}

export function isDownish(dir: Direction): boolean {
  return dir === 'down' || dir === 'down-left' || dir === 'down-right';
}
