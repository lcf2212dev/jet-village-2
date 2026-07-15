import type { AssetStore } from '../../core/contracts/AssetStore';
import type { System } from '../../core/contracts/System';
import type { World } from '../../core/ecs/World';
import { resolveClip } from '../animation/clipKey';
import { SpriteAnimationKey } from '../components';

/** order 50 — advance frames from atlas metadata (or procedural fallback). */
export class AnimationPlaybackSystem implements System {
  readonly order = 50;

  constructor(private readonly assets: AssetStore) {}

  update(world: World, dt: number): void {
    for (const entity of world.query(SpriteAnimationKey)) {
      const anim = world.require(entity, SpriteAnimationKey);

      const fps = anim.state === 'walk' ? 10 : anim.state === 'attack' ? 12 : anim.state === 'death' ? 8 : 4;
      const frames =
        anim.state === 'walk' ? 6 : anim.state === 'attack' ? 6 : anim.state === 'death' ? 6 : 4;

      let maxFrames = frames;
      let loop = anim.state === 'idle' || anim.state === 'walk';

      if (this.assets.hasAtlas(anim.atlasId)) {
        const atlas = this.assets.atlas(anim.atlasId);
        const key = resolveClip((k) => k in atlas.animations, anim.state, anim.direction);
        const clip = atlas.animations[key];
        if (clip) {
          maxFrames = clip.frames;
          loop = clip.loop;
          // use clip.fps if present
          anim.elapsed += dt;
          const frameDur = 1 / (clip.fps || fps);
          while (anim.elapsed >= frameDur) {
            anim.elapsed -= frameDur;
            if (anim.frame + 1 >= maxFrames) {
              if (loop) anim.frame = 0;
              else {
                anim.frame = maxFrames - 1;
                anim.clipFinished = true;
              }
            } else {
              anim.frame += 1;
            }
          }
          continue;
        }
      }

      // Procedural placeholder timing
      anim.elapsed += dt;
      const frameDur = 1 / fps;
      while (anim.elapsed >= frameDur) {
        anim.elapsed -= frameDur;
        if (anim.frame + 1 >= maxFrames) {
          if (loop) anim.frame = 0;
          else {
            anim.frame = maxFrames - 1;
            anim.clipFinished = true;
          }
        } else {
          anim.frame += 1;
        }
      }
    }
  }
}
