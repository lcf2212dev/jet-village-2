import type { System } from '../../core/contracts/System';
import type { World } from '../../core/ecs/World';
import { WALK_SPEED } from '../config';
import {
  PlayerIntentKey,
  PlayerTagKey,
  SpriteAnimationKey,
  VelocityKey,
} from '../components';

/** order 20 — velocity from intent only (integration in CollisionSystem). */
export class MovementSystem implements System {
  readonly order = 20;

  update(world: World, _dt: number): void {
    for (const entity of world.query(PlayerTagKey, PlayerIntentKey, VelocityKey)) {
      const anim = world.get(entity, SpriteAnimationKey);
      if (anim?.state === 'death' || anim?.state === 'attack') {
        const vel = world.require(entity, VelocityKey);
        vel.x = 0;
        vel.y = 0;
        continue;
      }

      const intent = world.require(entity, PlayerIntentKey);
      const vel = world.require(entity, VelocityKey);
      vel.x = intent.moveX * WALK_SPEED;
      vel.y = intent.moveY * WALK_SPEED;
    }
  }
}
