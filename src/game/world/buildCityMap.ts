import type { TileMapData } from '../../core/contracts/asset-data';
import { TILE_SIZE } from '../config';

/**
 * Tile ids for the city ground tileset (`public/assets/tiles/city.json`).
 * Index must match sheet order: stone_a, stone_b, sidewalk, grass_a, grass_b.
 */
export const TileId = {
  StoneA: 0,
  StoneB: 1,
  Sidewalk: 2,
  GrassA: 3,
  GrassB: 4,
} as const;

/**
 * Build a 2×2 block city:
 * - Outer road ring width ROAD
 * - Central cross roads ROAD wide
 * - Each block: sidewalk ring 1 + grass interior
 */
export function buildCityMap(options?: {
  blockInnerW?: number;
  blockInnerH?: number;
  road?: number;
}): TileMapData {
  const blockInnerW = options?.blockInnerW ?? 12;
  const blockInnerH = options?.blockInnerH ?? 8;
  const road = options?.road ?? 3;
  const sidewalk = 1;
  // One block footprint including sidewalk
  const blockW = blockInnerW + sidewalk * 2;
  const blockH = blockInnerH + sidewalk * 2;
  const width = road + blockW + road + blockW + road;
  const height = road + blockH + road + blockH + road;

  const ground = new Array<number>(width * height).fill(TileId.StoneA);
  const detail = new Array<number>(width * height).fill(-1);
  const collision = new Array<number>(width * height).fill(0);

  const set = (tx: number, ty: number, id: number): void => {
    if (tx < 0 || ty < 0 || tx >= width || ty >= height) return;
    ground[ty * width + tx] = id;
  };

  // Stone variation on roads
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      set(x, y, (x + y) % 2 === 0 ? TileId.StoneA : TileId.StoneB);
    }
  }

  const paintBlock = (originX: number, originY: number): void => {
    for (let ly = 0; ly < blockH; ly++) {
      for (let lx = 0; lx < blockW; lx++) {
        const tx = originX + lx;
        const ty = originY + ly;
        const edge =
          lx < sidewalk || ly < sidewalk || lx >= blockW - sidewalk || ly >= blockH - sidewalk;
        if (edge) {
          set(tx, ty, TileId.Sidewalk);
        } else {
          const gx = lx - sidewalk;
          const gy = ly - sidewalk;
          set(tx, ty, (gx + gy) % 3 === 0 ? TileId.GrassB : TileId.GrassA);
        }
      }
    }
  };

  const b0x = road;
  const b0y = road;
  const b1x = road + blockW + road;
  const b1y = road;
  const b2x = road;
  const b2y = road + blockH + road;
  const b3x = road + blockW + road;
  const b3y = road + blockH + road;

  paintBlock(b0x, b0y);
  paintBlock(b1x, b1y);
  paintBlock(b2x, b2y);
  paintBlock(b3x, b3y);

  // World edge collision ring (outermost tiles solid)
  for (let x = 0; x < width; x++) {
    collision[x] = 1;
    collision[(height - 1) * width + x] = 1;
  }
  for (let y = 0; y < height; y++) {
    collision[y * width] = 1;
    collision[y * width + (width - 1)] = 1;
  }

  const spawnX = Math.floor(width / 2);
  const spawnY = Math.floor(height / 2);

  return {
    width,
    height,
    tileSize: TILE_SIZE,
    tileset: 'city.json',
    layers: { ground, detail, collision },
    spawn: { x: spawnX, y: spawnY },
  };
}
