import type { AssetStore } from '../../core/contracts/AssetStore';
import type { System } from '../../core/contracts/System';
import type { World } from '../../core/ecs/World';
import { resolveClip } from '../animation/clipKey';
import type { AnimState } from '../components';
import { SpriteAnimationKey } from '../components';

const DEFAULT_FPS: Record<AnimState, number> = {
  idle: 4,
  walk: 10,
  run: 12,
  attack: 12,
  sit: 4,
  death: 8,
};

const DEFAULT_FRAMES: Record<AnimState, number> = {
  idle: 4,
  walk: 6,
  run: 6,
  attack: 6,
  sit: 4,
  death: 6,
};

/** order 50 — advance frames from atlas metadata (or procedural fallback). */
export class AnimationPlaybackSystem implements System {
  readonly order = 50;

  constructor(private readonly assets: AssetStore) {}

  update(world: World, dt: number): void {
    for (const entity of world.query(SpriteAnimationKey)) {
      const anim = world.require(entity, SpriteAnimationKey);
      const state = anim.state;

      const fps = DEFAULT_FPS[state];
      let maxFrames = DEFAULT_FRAMES[state];
      let loop = state === 'idle' || state === 'walk' || state === 'run' || state === 'sit';

      if (this.assets.hasAtlas(anim.atlasId)) {
        const atlas = this.assets.atlas(anim.atlasId);
        const key = resolveClip((k) => k in atlas.animations, anim.state, anim.direction);
        const clip = atlas.animations[key];
        if (clip) {
          maxFrames = clip.frames;
          loop = clip.loop;
          anim.elapsed += dt;
          const frameDur = 1 / (clip.fps || fps);
          this.advance(anim, maxFrames, loop, frameDur);
          continue;
        }
      }

      // Procedural placeholder timing
      anim.elapsed += dt;
      this.advance(anim, maxFrames, loop, 1 / fps);
    }
  }

  private advance(
    anim: { frame: number; elapsed: number; clipFinished: boolean },
    maxFrames: number,
    loop: boolean,
    frameDur: number,
  ): void {
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
