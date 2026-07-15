import { moveAxisFromActions } from '../core/contracts/InputSource';
import type { FrameInputSource, GameAction } from '../core/contracts/InputSource';

/**
 * Keyboard adapter for the FrameInputSource contract. The key→action map is
 * injected data (src/game/config.ts) — this class knows nothing about game
 * semantics. The event target is injectable so tests can drive it without a
 * browser.
 */
export class KeyboardInput implements FrameInputSource {
  private readonly downCodes = new Set<string>();
  private readonly downCounts = new Map<GameAction, number>();
  private readonly pressed = new Set<GameAction>();
  private readonly onKeyDown = (event: Event): void => this.onKey(event as KeyboardEvent, true);
  private readonly onKeyUp = (event: Event): void => this.onKey(event as KeyboardEvent, false);
  private readonly onFocusLost = (): void => this.releaseAll();

  constructor(
    private readonly target: EventTarget,
    private readonly keymap: Readonly<Record<string, GameAction>>,
  ) {
    target.addEventListener('keydown', this.onKeyDown);
    target.addEventListener('keyup', this.onKeyUp);
    target.addEventListener('blur', this.onFocusLost);
    target.addEventListener('pagehide', this.onFocusLost);
  }

  private onKey(event: KeyboardEvent, isDown: boolean): void {
    const action = this.keymap[event.code];
    if (!action) return;
    event.preventDefault();

    if (isDown) {
      if (this.downCodes.has(event.code)) return;

      this.downCodes.add(event.code);
      const count = this.downCounts.get(action) ?? 0;
      if (count === 0) this.pressed.add(action);
      this.downCounts.set(action, count + 1);
      return;
    }

    if (!this.downCodes.delete(event.code)) return;
    const count = this.downCounts.get(action) ?? 0;
    if (count <= 1) this.downCounts.delete(action);
    else this.downCounts.set(action, count - 1);
  }

  isDown(action: GameAction): boolean {
    return (this.downCounts.get(action) ?? 0) > 0;
  }

  wasPressed(action: GameAction): boolean {
    return this.pressed.has(action);
  }

  moveAxis(): { x: number; y: number } {
    return moveAxisFromActions((a) => this.isDown(a));
  }

  /** Called by the composition root once per fixed update, after systems ran. */
  endFrame(): void {
    this.pressed.clear();
  }

  /** Releases every physical key, including pending press edges. */
  releaseAll(): void {
    this.downCodes.clear();
    this.downCounts.clear();
    this.pressed.clear();
  }

  /** Detaches platform listeners and clears all input state. Safe to call repeatedly. */
  dispose(): void {
    this.target.removeEventListener('keydown', this.onKeyDown);
    this.target.removeEventListener('keyup', this.onKeyUp);
    this.target.removeEventListener('blur', this.onFocusLost);
    this.target.removeEventListener('pagehide', this.onFocusLost);
    this.releaseAll();
  }
}
