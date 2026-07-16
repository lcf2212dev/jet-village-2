import type { System } from '../../core/contracts/System';
import type { World } from '../../core/ecs/World';
import { RUN_SPEED, WALK_SPEED } from '../config';
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
      const intent = world.require(entity, PlayerIntentKey);
      const vel = world.require(entity, VelocityKey);

      if (
        anim?.state === 'death' ||
        anim?.state === 'attack' ||
        anim?.state === 'sit' ||
        intent.sitHeld
      ) {
        vel.x = 0;
        vel.y = 0;
        continue;
      }

      const speed = intent.runHeld ? RUN_SPEED : WALK_SPEED;
      vel.x = intent.moveX * speed;
      vel.y = intent.moveY * speed;
    }
  }
}
