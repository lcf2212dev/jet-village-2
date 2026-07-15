import type { Clock } from '../contracts/Clock';

export interface GameLoopCallbacks {
  update(dt: number): void;
  render(alpha: number): void;
}

/**
 * Fixed-timestep loop at 60 Hz with an accumulator and spiral-of-death protection
 * (max 5 updates per frame — spec §7). Rendering interpolates with alpha ∈ [0,1).
 * The host (platform) drives it by calling tick() once per animation frame.
 */
export class GameLoop {
  static readonly FIXED_DT = 1 / 60;
  static readonly MAX_UPDATES_PER_FRAME = 5;
  /** Absorbs float error in frame times (e.g. 16.666…64 ms), which would otherwise skip a step. */
  private static readonly EPSILON = 1e-9;

  private accumulator = 0;
  private lastTime: number | undefined;

  constructor(
    private readonly clock: Clock,
    private readonly callbacks: GameLoopCallbacks,
  ) {}

  /** Drops elapsed-time debt and makes the next tick establish a fresh time origin. */
  reset(): void {
    this.accumulator = 0;
    this.lastTime = undefined;
  }

  /** Advances the simulation to the clock's current time. Returns updates executed. */
  tick(): number {
    const now = this.clock.now();
    if (this.lastTime === undefined) this.lastTime = now;
    const frameSeconds = (now - this.lastTime) / 1000;
    this.lastTime = now;
    this.accumulator += frameSeconds;

    let updates = 0;
    while (
      this.accumulator >= GameLoop.FIXED_DT - GameLoop.EPSILON &&
      updates < GameLoop.MAX_UPDATES_PER_FRAME
    ) {
      this.callbacks.update(GameLoop.FIXED_DT);
      this.accumulator = Math.max(0, this.accumulator - GameLoop.FIXED_DT);
      updates++;
    }
    // Anti-spiral: if debt remains after the cap we can't catch up — resync from now.
    if (this.accumulator >= GameLoop.FIXED_DT) {
      this.accumulator = 0;
    }

    this.callbacks.render(Math.min(this.accumulator / GameLoop.FIXED_DT, 0.999999));
    return updates;
  }
}
