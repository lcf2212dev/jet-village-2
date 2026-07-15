import { GameAction } from '../core/contracts/InputSource';

export const TILE_SIZE = 32;
export const WALK_SPEED = 96; // px/s

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
  KeyK: GameAction.KillDebug,
};

export const ASSET_IDS = {
  cityMap: 'map/city',
  cityTileset: 'tileset/city',
  warriorAtlas: 'atlas/warrior',
  warriorTexture: 'tex/warrior',
} as const;
