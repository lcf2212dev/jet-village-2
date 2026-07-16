import type { System } from '../../core/contracts/System';
import type { World } from '../../core/ecs/World';
import {
  HealthKey,
  PlayerIntentKey,
  PlayerTagKey,
  SpriteAnimationKey,
  VelocityKey,
  type AnimState,
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
        this.setState(anim, 'death');
        continue;
      }

      if (anim.state === 'attack') {
        if (anim.clipFinished) {
          this.setState(anim, 'idle');
        } else {
          continue;
        }
      }

      if (intent.attackPressed) {
        this.setState(anim, 'attack');
        continue;
      }

      // Facing from intent/velocity before sit (keep last facing when sitting still)
      const fx = intent.moveX || vel.x;
      const fy = intent.moveY || vel.y;
      if (Math.hypot(fx, fy) > 0.01) {
        anim.direction = directionFromVelocity(fx, fy, anim.direction);
      }

      if (intent.sitHeld) {
        if (anim.state !== 'sit') this.setState(anim, 'sit');
        continue;
      }

      const moving = Math.hypot(vel.x, vel.y) > 1 || Math.hypot(intent.moveX, intent.moveY) > 0.01;
      let next: AnimState = 'idle';
      if (moving) next = intent.runHeld ? 'run' : 'walk';

      if (anim.state !== next) this.setState(anim, next);
    }
  }

  private setState(
    anim: {
      state: AnimState;
      frame: number;
      elapsed: number;
      clipFinished: boolean;
    },
    next: AnimState,
  ): void {
    anim.state = next;
    anim.frame = 0;
    anim.elapsed = 0;
    anim.clipFinished = false;
  }
}
