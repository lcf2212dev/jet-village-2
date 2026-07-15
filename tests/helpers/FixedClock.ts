import type { Clock } from '../../src/core/contracts/Clock';

export class FixedClock implements Clock {
  constructor(private t = 0) {}
  now(): number {
    return this.t;
  }
  advance(ms: number): void {
    this.t += ms;
  }
}
