import type { System } from '../../core/contracts/System';
import type { World } from '../../core/ecs/World';
import {
  HealthKey,
  PlayerIntentKey,
  PlayerTagKey,
  SpriteAnimationKey,
  VelocityKey,
} from '../components';
import { directionFromVelocity } from '../directions';

/** order 40 — choose anim state + facing from intent/velocity. */
export class AnimationStateSystem implements System {
  readonly order = 40;

  update(world: World, _dt: number): void {
    for (const entity of world.query(PlayerTagKey, SpriteAnimationKey, PlayerIntentKey, VelocityKey)) {
      const anim = world.require(entity, SpriteAnimationKey);
      const intent = world.require(entity, PlayerIntentKey);
      const vel = world.require(entity, VelocityKey);
      const health = world.get(entity, HealthKey);

      if (anim.state === 'death') continue;

      if (intent.killPressed || (health && health.hp <= 0)) {
        if (health) health.hp = 0;
        anim.state = 'death';
        anim.frame = 0;
        anim.elapsed = 0;
        anim.clipFinished = false;
        continue;
      }

      if (anim.state === 'attack') {
        if (anim.clipFinished) {
          anim.state = 'idle';
          anim.frame = 0;
          anim.elapsed = 0;
          anim.clipFinished = false;
        } else {
          continue;
        }
      }

      if (intent.attackPressed) {
        anim.state = 'attack';
        anim.frame = 0;
        anim.elapsed = 0;
        anim.clipFinished = false;
        continue;
      }

      const moving = Math.hypot(vel.x, vel.y) > 1 || Math.hypot(intent.moveX, intent.moveY) > 0.01;
      const next = moving ? 'walk' : 'idle';
      if (anim.state !== next) {
        anim.state = next;
        anim.frame = 0;
        anim.elapsed = 0;
        anim.clipFinished = false;
      }

      anim.direction = directionFromVelocity(
        intent.moveX || vel.x,
        intent.moveY || vel.y,
        anim.direction,
      );
    }
  }
}
