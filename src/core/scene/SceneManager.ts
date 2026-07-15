import type { Scene } from '../contracts/Scene';

/** Owns the active scene and its lifecycle (spec §8.4). */
export class SceneManager {
  private current: Scene | undefined;
  private transition = 0;
  private loading: AbortController | undefined;

  /** Returns true only when this request became the active scene. */
  async switchTo(scene: Scene): Promise<boolean> {
    const transition = ++this.transition;
    this.loading?.abort();
    const controller = new AbortController();
    this.loading = controller;

    try {
      await scene.load(controller.signal);
    } catch (error) {
      if (transition !== this.transition || controller.signal.aborted) return false;
      throw error;
    }
    if (transition !== this.transition || controller.signal.aborted) return false;

    const previous = this.current;
    previous?.exit();
    this.current = scene;
    try {
      // Assign before enter() so a transition started by enter() sees this scene
      // as current and exits it exactly once after the next load succeeds.
      scene.enter();
    } catch (error) {
      if (this.current === scene) this.current = undefined;
      throw error;
    }
    return true;
  }

  update(dt: number): void {
    this.current?.update(dt);
  }

  render(alpha: number): void {
    this.current?.render(alpha);
  }
}
