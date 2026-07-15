import type { System } from '../../core/contracts/System';
import type { World } from '../../core/ecs/World';
import { ColliderKey, TransformKey, VelocityKey } from '../components';
import type { TileMap } from '../world/TileMap';

/** order 30 — integrate velocity with axis-separated tile collision. */
export class CollisionSystem implements System {
  readonly order = 30;

  constructor(private readonly map: TileMap) {}

  update(world: World, dt: number): void {
    for (const entity of world.query(TransformKey, ColliderKey, VelocityKey)) {
      const t = world.require(entity, TransformKey);
      const c = world.require(entity, ColliderKey);
      const vel = world.require(entity, VelocityKey);

      const solid = (nx: number, ny: number): boolean =>
        this.map.anySolidInRect(nx + c.ox, ny + c.oy, c.w, c.h);

      // X axis
      const nx = t.x + vel.x * dt;
      if (!solid(nx, t.y)) t.x = nx;
      else vel.x = 0;

      // Y axis
      const ny = t.y + vel.y * dt;
      if (!solid(t.x, ny)) t.y = ny;
      else vel.y = 0;
    }
  }
}
