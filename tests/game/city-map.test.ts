import { describe, expect, it } from 'vitest';
import { buildCityMap, TileId } from '../../src/game/world/buildCityMap';
import { TileMap } from '../../src/game/world/TileMap';

describe('buildCityMap', () => {
  it('builds a walkable cross with solid border', () => {
    const data = buildCityMap({ blockInnerW: 8, blockInnerH: 6, road: 3 });
    const map = new TileMap(data);

    expect(map.width).toBeGreaterThan(20);
    expect(map.height).toBeGreaterThan(16);
    expect(map.isSolid(-1, 0)).toBe(true);
    expect(map.isSolid(0, 0)).toBe(true);

    const sx = data.spawn.x;
    const sy = data.spawn.y;
    expect(map.isSolid(sx, sy)).toBe(false);

    // Spawn should be on road stone, not grass interior of a block
    const g = map.groundAt(sx, sy);
    expect([TileId.StoneA, TileId.StoneB, TileId.Sidewalk]).toContain(g);
  });
});
