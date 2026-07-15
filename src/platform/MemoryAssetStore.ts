import type { AssetStore, Texture } from '../core/contracts/AssetStore';
import type { SpriteAtlasData, TileMapData, TilesetData } from '../core/contracts/asset-data';
import type { TextureId } from '../core/contracts/Renderer';

/** In-memory asset registry for bootstrapping without complex loaders. */
export class MemoryAssetStore implements AssetStore {
  private readonly textures = new Map<TextureId, Texture>();
  private readonly atlases = new Map<string, SpriteAtlasData>();
  private readonly tilesets = new Map<string, TilesetData>();
  private readonly maps = new Map<string, TileMapData>();

  setTexture(id: TextureId, texture: Texture): void {
    this.textures.set(id, texture);
  }

  setAtlas(id: string, atlas: SpriteAtlasData): void {
    this.atlases.set(id, atlas);
  }

  setTileset(id: string, tileset: TilesetData): void {
    this.tilesets.set(id, tileset);
  }

  setMap(id: string, map: TileMapData): void {
    this.maps.set(id, map);
  }

  texture(id: TextureId): Texture {
    const t = this.textures.get(id);
    if (!t) throw new Error(`Missing texture: ${id}`);
    return t;
  }

  hasTexture(id: TextureId): boolean {
    return this.textures.has(id);
  }

  atlas(id: string): SpriteAtlasData {
    const a = this.atlases.get(id);
    if (!a) throw new Error(`Missing atlas: ${id}`);
    return a;
  }

  hasAtlas(id: string): boolean {
    return this.atlases.has(id);
  }

  tileset(id: string): TilesetData {
    const t = this.tilesets.get(id);
    if (!t) throw new Error(`Missing tileset: ${id}`);
    return t;
  }

  map(id: string): TileMapData {
    const m = this.maps.get(id);
    if (!m) throw new Error(`Missing map: ${id}`);
    return m;
  }
}
