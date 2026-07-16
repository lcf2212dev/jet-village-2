import type { InputSource } from '../../core/contracts/InputSource';
import { GameAction } from '../../core/contracts/InputSource';
import type { System } from '../../core/contracts/System';
import type { World } from '../../core/ecs/World';
import { length, normalize } from '../../core/math/Vec2';
import { PlayerIntentKey, PlayerTagKey, SpriteAnimationKey } from '../components';

/** order 10 — writes PlayerIntent from input (no world mutation beyond intent). */
export class PlayerInputSystem implements System {
  readonly order = 10;

  constructor(private readonly input: InputSource) {}

  update(world: World, _dt: number): void {
    for (const entity of world.query(PlayerTagKey, PlayerIntentKey)) {
      const anim = world.get(entity, SpriteAnimationKey);
      if (anim?.state === 'death') {
        const intent = world.require(entity, PlayerIntentKey);
        intent.moveX = 0;
        intent.moveY = 0;
        intent.attackPressed = false;
        intent.killPressed = false;
        intent.runHeld = false;
        intent.sitHeld = false;
        continue;
      }

      let axis = this.input.moveAxis();
      const len = length(axis);
      if (len > 1) axis = normalize(axis);

      const intent = world.require(entity, PlayerIntentKey);
      intent.moveX = axis.x;
      intent.moveY = axis.y;
      intent.attackPressed = this.input.wasPressed(GameAction.Attack);
      intent.killPressed = this.input.wasPressed(GameAction.KillDebug);
      intent.runHeld = this.input.isDown(GameAction.Run);
      intent.sitHeld = this.input.isDown(GameAction.Sit);
    }
  }
}
