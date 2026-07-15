import type { TextureId } from './Renderer';
import type { SpriteAtlasData, TileMapData, TilesetData } from './asset-data';

export interface Texture {
  readonly width: number;
  readonly height: number;
}

export interface AssetStore {
  texture(id: TextureId): Texture;
  hasTexture(id: TextureId): boolean;
  atlas(id: string): SpriteAtlasData;
  hasAtlas(id: string): boolean;
  tileset(id: string): TilesetData;
  map(id: string): TileMapData;
}
