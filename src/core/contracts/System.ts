import type { World } from '../ecs/World';

/** A unit of game logic with a single responsibility, executed in ascending `order` (spec §8.2). */
export interface System {
  readonly order: number;
  update(world: World, dt: number): void;
}
