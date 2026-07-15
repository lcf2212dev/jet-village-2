import type { TileMapData } from '../../core/contracts/asset-data';

/**
 * Gameplay view over TileMapData: tile lookups and collision queries.
 * Out-of-bounds cells are solid, so the world edge always holds (spec §6.5).
 */
export class TileMap {
  readonly width: number;
  readonly height: number;
  readonly tileSize: number;

  constructor(private readonly data: TileMapData) {
    this.width = data.width;
    this.height = data.height;
    this.tileSize = data.tileSize;
  }

  get pixelWidth(): number {
    return this.width * this.tileSize;
  }

  get pixelHeight(): number {
    return this.height * this.tileSize;
  }

  get spawn(): { x: number; y: number } {
    return this.data.spawn;
  }

  groundAt(tileX: number, tileY: number): number {
    return this.data.layers.ground[tileY * this.width + tileX] ?? -1;
  }

  detailAt(tileX: number, tileY: number): number {
    return this.data.layers.detail[tileY * this.width + tileX] ?? -1;
  }

  isSolid(tileX: number, tileY: number): boolean {
    if (tileX < 0 || tileY < 0 || tileX >= this.width || tileY >= this.height) return true;
    return this.data.layers.collision[tileY * this.width + tileX] === 1;
  }

  /** True if any solid tile overlaps the AABB (edges exclusive, matching Rect.intersects). */
  anySolidInRect(x: number, y: number, w: number, h: number): boolean {
    const x0 = Math.floor(x / this.tileSize);
    const y0 = Math.floor(y / this.tileSize);
    const x1 = Math.ceil((x + w) / this.tileSize) - 1;
    const y1 = Math.ceil((y + h) / this.tileSize) - 1;
    for (let ty = y0; ty <= y1; ty++) {
      for (let tx = x0; tx <= x1; tx++) {
        if (this.isSolid(tx, ty)) return true;
      }
    }
    return false;
  }
}
