import { describe, expect, it } from 'vitest';
import { directionFromVelocity } from '../../src/game/directions';

describe('directionFromVelocity', () => {
  it('maps 8 sectors', () => {
    expect(directionFromVelocity(1, 0, 'down')).toBe('right');
    expect(directionFromVelocity(0, 1, 'down')).toBe('down');
    expect(directionFromVelocity(-1, 0, 'down')).toBe('left');
    expect(directionFromVelocity(0, -1, 'down')).toBe('up');
    expect(directionFromVelocity(1, 1, 'down')).toBe('down-right');
  });

  it('keeps facing in deadzone', () => {
    expect(directionFromVelocity(0, 0, 'up-left')).toBe('up-left');
  });
});
