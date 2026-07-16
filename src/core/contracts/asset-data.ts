/**
 * Shared JSON data contracts — the single source of truth for asset formats.
 * `tools/` generators import these types (type-only) and `platform/` loaders
 * validate against them, so both sides can never diverge (spec §5.3, §6.4).
 */

export interface FrameSize {
  readonly w: number;
  readonly h: number;
}

export interface PivotPoint {
  readonly x: number;
  readonly y: number;
}

/** One animation strip inside a sprite atlas (spec §5.3 / 0.1.2). */
export interface AtlasAnimation {
  readonly row: number;
  /** Number of frames in this clip (columns used). */
  readonly frames: number;
  readonly fps: number;
  readonly loop: boolean;
  /**
   * First column index for this clip on `row` (default 0).
   * Lets idle/walk/run/attack/sit/death share one sheet row in horizontal strips.
   */
  readonly startFrame?: number;
}

/** Sprite atlas contract — assets/sprites/*.json (spec §5.3). */
export interface SpriteAtlasData {
  readonly image: string;
  readonly frameSize: FrameSize;
  readonly pivot: PivotPoint;
  readonly animations: Readonly<Record<string, AtlasAnimation>>;
}

/** Tileset contract — assets/tiles/village.json. Tile id = cell index (row-major). */
export interface TilesetData {
  readonly image: string;
  readonly tileSize: number;
  readonly columns: number;
  readonly tileCount: number;
  /** Human-readable name per tile id, for debugging and generator/spec cross-checks. */
  readonly names: readonly string[];
}

/** Tile map contract — assets/maps/village.json (spec §6.4). Layers are row-major width×height. */
export interface TileMapData {
  readonly width: number;
  readonly height: number;
  readonly tileSize: number;
  readonly tileset: string;
  readonly layers: {
    /** Tile id per cell (ground is always fully painted). */
    readonly ground: readonly number[];
    /** Tile id per cell or -1 for empty. */
    readonly detail: readonly number[];
    /** 0 = walkable, 1 = blocked. */
    readonly collision: readonly number[];
  };
  /** Player spawn in tile coordinates. */
  readonly spawn: PivotPoint;
}
