/**
 * Jet Village 2 — composition root (0.1.0 city + warrior).
 * Wires platform + game; no business logic here beyond setup.
 */

import { GameLoop } from './core/loop/GameLoop';
import type { Clock } from './core/contracts/Clock';
import { SceneManager } from './core/scene/SceneManager';
import { DEFAULT_VIEWPORT_REFS } from './core/math/viewport';
import { KEYMAP } from './game/config';
import { CityScene } from './game/scenes/CityScene';
import { Canvas2DRenderer } from './platform/Canvas2DRenderer';
import { KeyboardInput } from './platform/KeyboardInput';
import { MemoryAssetStore } from './platform/MemoryAssetStore';

const canvasEl = document.getElementById('game');
if (!(canvasEl instanceof HTMLCanvasElement)) {
  throw new Error('#game canvas not found');
}

const hud = document.getElementById('hud');
if (hud) hud.textContent = 'Jet Village 2 · 0.1.0 · carregando…';

const clock: Clock = { now: () => performance.now() };
const renderer = new Canvas2DRenderer(canvasEl, DEFAULT_VIEWPORT_REFS, '#1a1721');
const input = new KeyboardInput(window, KEYMAP);
const assets = new MemoryAssetStore();
const scenes = new SceneManager();

const loop = new GameLoop(clock, {
  update: (dt) => {
    scenes.update(dt);
    input.endFrame();
  },
  render: (alpha) => {
    scenes.render(alpha);
  },
});

async function boot(): Promise<void> {
  const city = new CityScene(renderer, input, assets);
  const ok = await scenes.switchTo(city);
  if (!ok) return;
  if (hud) hud.textContent = 'Jet Village 2 · WASD · Space ataque · K morte';

  const frame = (): void => {
    loop.tick();
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

void boot().catch((err) => {
  console.error(err);
  if (hud) hud.textContent = `Erro: ${err instanceof Error ? err.message : String(err)}`;
});
