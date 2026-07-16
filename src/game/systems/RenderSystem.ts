import type { AssetStore } from '../../core/contracts/AssetStore';
import type { Renderer } from '../../core/contracts/Renderer';
import type { System } from '../../core/contracts/System';
import type { World } from '../../core/ecs/World';
import { rect } from '../../core/math/Rect';
import { resolveClip } from '../animation/clipKey';
import { ASSET_IDS } from '../config';
import { SpriteAnimationKey, TransformKey, type SpriteAnimation } from '../components';
import type { Camera } from '../world/Camera';
import type { TileMap } from '../world/TileMap';

/** Display height for warrior sprite in world pixels (width scales with frame aspect). */
const WARRIOR_DRAW_H = 52;

/** order 100 — draw map tiles + entities. */
export class RenderSystem implements System {
  readonly order = 100;

  constructor(
    private readonly renderer: Renderer,
    private readonly map: TileMap,
    private readonly camera: Camera,
    private readonly assets: AssetStore,
  ) {}

  update(_world: World, _dt: number): void {
    // render is driven from scene.render with alpha; systems update may no-op
  }

  draw(world: World, _alpha: number): void {
    this.renderer.begin({
      x: this.camera.x,
      y: this.camera.y,
      width: this.camera.width,
      height: this.camera.height,
    });

    this.drawGround();

    const entities = world.query(TransformKey, SpriteAnimationKey);
    entities.sort((a, b) => {
      const ta = world.require(a, TransformKey);
      const tb = world.require(b, TransformKey);
      return ta.y - tb.y;
    });

    for (const entity of entities) {
      const t = world.require(entity, TransformKey);
      const anim = world.require(entity, SpriteAnimationKey);
      this.drawEntity(t.x, t.y, anim);
    }

    // HUD lives in DOM (#hud) — avoid double text on the canvas.
    this.renderer.end();
  }

  private drawGround(): void {
    const tileset = this.assets.tileset(ASSET_IDS.cityTileset);
    const ts = this.map.tileSize;
    const tileSize = tileset.tileSize;
    const columns = tileset.columns;
    const tex = ASSET_IDS.cityTilesTexture;

    const x0 = Math.floor(this.camera.x / ts);
    const y0 = Math.floor(this.camera.y / ts);
    const x1 = Math.ceil((this.camera.x + this.camera.width) / ts);
    const y1 = Math.ceil((this.camera.y + this.camera.height) / ts);

    for (let ty = y0; ty <= y1; ty++) {
      for (let tx = x0; tx <= x1; tx++) {
        if (tx < 0 || ty < 0 || tx >= this.map.width || ty >= this.map.height) continue;
        const id = this.map.groundAt(tx, ty);
        if (id < 0 || id >= tileset.tileCount) continue;
        const col = id % columns;
        const row = Math.floor(id / columns);
        const src = rect(col * tileSize, row * tileSize, tileSize, tileSize);
        const dest = rect(tx * ts, ty * ts, ts, ts);
        this.renderer.drawSprite(tex, src, dest);
      }
    }
  }

  private drawEntity(x: number, y: number, anim: SpriteAnimation): void {
    if (this.assets.hasAtlas(anim.atlasId) && this.assets.hasTexture(anim.textureId)) {
      this.drawAtlasSprite(x, y, anim);
      return;
    }
    this.drawWarriorPlaceholder(x, y, anim.direction, anim.state, anim.frame);
  }

  private drawAtlasSprite(x: number, y: number, anim: SpriteAnimation): void {
    const atlas = this.assets.atlas(anim.atlasId);
    const key = resolveClip((k) => k in atlas.animations, anim.state, anim.direction);
    const clip = atlas.animations[key];
    if (!clip) {
      this.drawWarriorPlaceholder(x, y, anim.direction, anim.state, anim.frame);
      return;
    }

    const start = clip.startFrame ?? 0;
    const col = start + Math.min(anim.frame, Math.max(0, clip.frames - 1));
    const fw = atlas.frameSize.w;
    const fh = atlas.frameSize.h;
    const src = rect(col * fw, clip.row * fh, fw, fh);

    const drawH = WARRIOR_DRAW_H;
    const drawW = Math.round((fw / fh) * drawH);
    const pivotX = atlas.pivot.x / fw;
    const pivotY = atlas.pivot.y / fh;
    const dest = rect(x - pivotX * drawW, y - pivotY * drawH, drawW, drawH);
    this.renderer.drawSprite(anim.textureId, src, dest);
  }

  private drawWarriorPlaceholder(
    x: number,
    y: number,
    direction: string,
    state: string,
    frame: number,
  ): void {
    const bob = state === 'walk' || state === 'run' ? Math.sin(frame) * (state === 'run' ? 2 : 1) : 0;
    const bodyColor =
      state === 'death'
        ? '#5a5666'
        : state === 'attack'
          ? '#3d7ab0'
          : state === 'sit'
            ? '#3a5a4a'
            : state === 'run'
              ? '#2a6f9a'
              : '#2c5f8a';
    const bodyH = state === 'sit' ? 10 : 16;
    const bodyY = state === 'sit' ? y - 14 + bob : y - 20 + bob;
    this.renderer.drawRect(rect(x - 6, bodyY, 12, bodyH), bodyColor, true);
    this.renderer.drawRect(rect(x - 4, bodyY - 6, 8, 6), '#e8b58a', true);

    let sx = 0;
    let sy = 0;
    if (direction.includes('right')) sx = 1;
    if (direction.includes('left')) sx = -1;
    if (direction.includes('down') || direction === 'down') sy = 1;
    if (direction.includes('up') || direction === 'up') sy = -1;
    if (direction === 'right') {
      sx = 1;
      sy = 0;
    }
    if (direction === 'left') {
      sx = -1;
      sy = 0;
    }
    if (direction === 'up') {
      sx = 0;
      sy = -1;
    }
    if (direction === 'down') {
      sx = 0;
      sy = 1;
    }

    const reach = state === 'attack' ? 14 : 10;
    this.renderer.drawRect(
      rect(x + sx * reach - 2, y - 12 + sy * reach + bob, 4, 4),
      '#c0c4cc',
      true,
    );
  }
}
