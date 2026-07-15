/**
 * Semantic game actions — systems never see keycodes.
 * Attack / KillDebug for 0.1.0; expand later for multiplayer intents.
 */
export enum GameAction {
  MoveUp = 'MoveUp',
  MoveDown = 'MoveDown',
  MoveLeft = 'MoveLeft',
  MoveRight = 'MoveRight',
  Attack = 'Attack',
  /** Debug: force death animation (K). */
  KillDebug = 'KillDebug',
}

export interface InputSource {
  isDown(action: GameAction): boolean;
  wasPressed(action: GameAction): boolean;
  moveAxis(): { x: number; y: number };
}

export interface FrameInputSource extends InputSource {
  endFrame(): void;
  releaseAll(): void;
}

export function moveAxisFromActions(isDown: (a: GameAction) => boolean): { x: number; y: number } {
  const x = (isDown(GameAction.MoveRight) ? 1 : 0) - (isDown(GameAction.MoveLeft) ? 1 : 0);
  const y = (isDown(GameAction.MoveDown) ? 1 : 0) - (isDown(GameAction.MoveUp) ? 1 : 0);
  return { x, y };
}
