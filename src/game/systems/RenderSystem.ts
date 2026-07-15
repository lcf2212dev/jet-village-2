import type { AssetStore } from '../../core/contracts/AssetStore';
import type { Renderer } from '../../core/contracts/Renderer';
import type { System } from '../../core/contracts/System';
import type { World } from '../../core/ecs/World';
import { rect } from '../../core/math/Rect';
import { ASSET_IDS } from '../config';
import { SpriteAnimationKey, TransformKey } from '../components';
import type { Camera } from '../world/Camera';
import type { TileMap } from '../world/TileMap';

/** order 100 — draw map tiles + entities (placeholder warrior if no texture). */
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

    // Entities by y for simple y-sort
    const entities = world.query(TransformKey, SpriteAnimationKey);
    entities.sort((a, b) => {
      const ta = world.require(a, TransformKey);
      const tb = world.require(b, TransformKey);
      return ta.y - tb.y;
    });

    for (const entity of entities) {
      const t = world.require(entity, TransformKey);
      const anim = world.require(entity, SpriteAnimationKey);
      this.drawWarriorPlaceholder(t.x, t.y, anim.direction, anim.state, anim.frame);
    }

    this.renderer.drawText('Jet Village 2 · 0.1.1', 8, 14, '#eef0f2');
    this.renderer.drawText('WASD move · Space attack · K death', 8, 26, '#8a92a3');
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

  private drawWarriorPlaceholder(
    x: number,
    y: number,
    direction: string,
    state: string,
    frame: number,
  ): void {
    // Feet at (x,y); body above
    const bob = state === 'walk' ? Math.sin(frame) * 1 : 0;
    const bodyColor =
      state === 'death' ? '#5a5666' : state === 'attack' ? '#3d7ab0' : '#2c5f8a';
    this.renderer.drawRect(rect(x - 6, y - 20 + bob, 12, 16), bodyColor, true);
    this.renderer.drawRect(rect(x - 4, y - 26 + bob, 8, 6), '#e8b58a', true);

    // Facing indicator (sword stub)
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
