import type { System } from '../../core/contracts/System';
import type { World } from '../../core/ecs/World';
import { PlayerTagKey, TransformKey } from '../components';
import type { Camera } from '../world/Camera';

/** order 60 — center camera on player. */
export class CameraSystem implements System {
  readonly order = 60;

  constructor(private readonly camera: Camera) {}

  update(world: World, _dt: number): void {
    for (const entity of world.query(PlayerTagKey, TransformKey)) {
      const t = world.require(entity, TransformKey);
      this.camera.centerOn(t.x, t.y);
      break;
    }
  }
}
