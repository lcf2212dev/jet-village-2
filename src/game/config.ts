import { GameAction } from '../core/contracts/InputSource';

export const TILE_SIZE = 32;
export const WALK_SPEED = 96; // px/s
/** ~1.6× walk (0.1.2 run). */
export const RUN_SPEED = 154;

/** Key code → semantic action (composition root data). */
export const KEYMAP: Readonly<Record<string, GameAction>> = {
  KeyW: GameAction.MoveUp,
  ArrowUp: GameAction.MoveUp,
  KeyS: GameAction.MoveDown,
  ArrowDown: GameAction.MoveDown,
  KeyA: GameAction.MoveLeft,
  ArrowLeft: GameAction.MoveLeft,
  KeyD: GameAction.MoveRight,
  ArrowRight: GameAction.MoveRight,
  Space: GameAction.Attack,
  ShiftLeft: GameAction.Run,
  ShiftRight: GameAction.Run,
  KeyC: GameAction.Sit,
  KeyK: GameAction.KillDebug,
};

export const ASSET_IDS = {
  cityMap: 'map/city',
  cityTileset: 'tileset/city',
  cityTilesTexture: 'tex/city-tiles',
  warriorAtlas: 'atlas/warrior',
  warriorTexture: 'tex/warrior',
} as const;

/** Public URL for a path under `public/` (subpath-safe). */
export function publicAssetUrl(relativePath: string): string {
  const base = import.meta.env.BASE_URL;
  const normalized = relativePath.replace(/^\/+/, '');
  return `${base}${normalized}`;
}
