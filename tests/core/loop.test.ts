import { describe, expect, it } from 'vitest';
import { GameLoop } from '../../src/core/loop/GameLoop';
import type { Clock } from '../../src/core/contracts/Clock';

class ScriptedClock implements Clock {
  private index = 0;
  constructor(private readonly times: number[]) {}
  now(): number {
    const t = this.times[Math.min(this.index, this.times.length - 1)];
    this.index++;
    return t ?? 0;
  }
}

function run(times: number[]): { updates: number[]; alphas: number[] } {
  const updates: number[] = [];
  const alphas: number[] = [];
  let count = 0;
  const loop = new GameLoop(new ScriptedClock(times), {
    update: () => count++,
    render: (alpha) => alphas.push(alpha),
  });
  for (let i = 0; i < times.length; i++) {
    count = 0;
    loop.tick();
    updates.push(count);
  }
  return { updates, alphas };
}

describe('GameLoop (fixed 60 Hz timestep — spec §7)', () => {
  it('runs exactly one update per 16.67 ms frame', () => {
    const dt = 1000 / 60;
    const { updates } = run([0, dt, dt * 2, dt * 3]);
    expect(updates).toEqual([0, 1, 1, 1]);
  });

  it('accumulates short frames until a full step fits', () => {
    const { updates } = run([0, 8, 16.7, 25]);
    expect(updates).toEqual([0, 0, 1, 0]);
  });

  it('caps a giant frame at 5 updates and drops the rest (anti-spiral)', () => {
    const { updates } = run([0, 1000]);
    expect(updates).toEqual([0, 5]);
  });

  it('recovers normally after the spiral cap', () => {
    const dt = 1000 / 60;
    const { updates } = run([0, 1000, 1000 + dt]);
    expect(updates).toEqual([0, 5, 1]);
  });

  it('always reports alpha in [0, 1)', () => {
    const { alphas } = run([0, 5, 20, 33.4, 1000, 1016.7]);
    for (const alpha of alphas) {
      expect(alpha).toBeGreaterThanOrEqual(0);
      expect(alpha).toBeLessThan(1);
    }
  });

  it('reset drops partial debt and establishes a fresh time origin', () => {
    const dt = 1000 / 60;
    const updates: number[] = [];
    const alphas: number[] = [];
    let updateCount = 0;
    const loop = new GameLoop(new ScriptedClock([0, 8, 5008, 5008 + dt]), {
      update: () => updateCount++,
      render: (alpha) => alphas.push(alpha),
    });

    for (let i = 0; i < 2; i++) {
      updateCount = 0;
      loop.tick();
      updates.push(updateCount);
    }
    loop.reset();
    for (let i = 0; i < 2; i++) {
      updateCount = 0;
      loop.tick();
      updates.push(updateCount);
    }

    expect(updates).toEqual([0, 0, 0, 1]);
    expect(alphas[2]).toBe(0);
  });
});
