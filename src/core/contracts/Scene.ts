/** A screen of the game (spec §8.4). Lifecycle: load → enter → (update/render)* → exit. */
export interface Scene {
  /** Async asset loading; a newer transition aborts the previous signal. */
  load(signal: AbortSignal): Promise<void>;
  enter(): void;
  update(dt: number): void;
  /** alpha ∈ [0,1): interpolation factor between the previous and current fixed update. */
  render(alpha: number): void;
  exit(): void;
}
