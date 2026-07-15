import type { CameraView, PresentationMetrics, Renderer, TextureId } from '../core/contracts/Renderer';
import type { Rect } from '../core/math/Rect';
import {
  computeViewport,
  DEFAULT_VIEWPORT_REFS,
  type ViewportLayout,
  type ViewportReferencePair,
} from '../core/math/viewport';

/**
 * Canvas 2D renderer: adaptive virtual backbuffer + integer (or downscaled) present.
 */
export class Canvas2DRenderer implements Renderer {
  private readonly back: HTMLCanvasElement;
  private readonly backCtx: CanvasRenderingContext2D;
  private readonly displayCtx: CanvasRenderingContext2D;
  private readonly textures = new Map<TextureId, CanvasImageSource>();
  private cameraX = 0;
  private cameraY = 0;
  private cssWidth = 0;
  private cssHeight = 0;
  private dpr = 1;
  private viewport!: ViewportLayout;
  private readonly refsOf: () => ViewportReferencePair;
  private readonly clearColor: string;

  constructor(
    private readonly display: HTMLCanvasElement,
    refs: ViewportReferencePair | (() => ViewportReferencePair) = DEFAULT_VIEWPORT_REFS,
    clearColor = '#0b0a10',
  ) {
    this.refsOf = typeof refs === 'function' ? refs : () => refs;
    this.clearColor = clearColor;
    const initial = this.refsOf();
    this.back = document.createElement('canvas');
    this.back.width = initial.landscapeW;
    this.back.height = initial.landscapeH;
    this.backCtx = this.getContext(this.back);
    this.displayCtx = this.getContext(display);
    this.syncDisplaySize();
    window.addEventListener('resize', () => {
      if (this.syncDisplaySize()) this.presentBackbuffer();
    });
  }

  private getContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('2d context unavailable');
    ctx.imageSmoothingEnabled = false;
    return ctx;
  }

  registerTexture(id: TextureId, image: CanvasImageSource): void {
    this.textures.set(id, image);
  }

  virtualSize(): { width: number; height: number } {
    return { width: this.viewport.virtualW, height: this.viewport.virtualH };
  }

  presentationMetrics(): PresentationMetrics {
    return {
      scale: this.viewport.scale,
      mode: this.viewport.mode,
      virtualW: this.viewport.virtualW,
      virtualH: this.viewport.virtualH,
      cssWidth: this.cssWidth,
      cssHeight: this.cssHeight,
      dpr: this.dpr,
      offsetX: this.viewport.x,
      offsetY: this.viewport.y,
    };
  }

  /** Returns true if layout changed. */
  syncDisplaySize(): boolean {
    const cssW = Math.max(1, window.innerWidth);
    const cssH = Math.max(1, window.innerHeight);
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const backingW = Math.floor(cssW * dpr);
    const backingH = Math.floor(cssH * dpr);
    const layout = computeViewport(backingW, backingH, this.refsOf());

    const changed =
      this.cssWidth !== cssW ||
      this.cssHeight !== cssH ||
      this.dpr !== dpr ||
      !this.viewport ||
      this.viewport.virtualW !== layout.virtualW ||
      this.viewport.virtualH !== layout.virtualH ||
      this.viewport.scale !== layout.scale;

    this.cssWidth = cssW;
    this.cssHeight = cssH;
    this.dpr = dpr;
    this.viewport = layout;

    this.display.style.width = `${cssW}px`;
    this.display.style.height = `${cssH}px`;
    this.display.width = backingW;
    this.display.height = backingH;

    if (this.back.width !== layout.virtualW || this.back.height !== layout.virtualH) {
      this.back.width = layout.virtualW;
      this.back.height = layout.virtualH;
      this.backCtx.imageSmoothingEnabled = false;
    }
    return changed;
  }

  begin(camera: CameraView): void {
    this.cameraX = camera.x;
    this.cameraY = camera.y;
    this.backCtx.imageSmoothingEnabled = false;
    this.backCtx.fillStyle = this.clearColor;
    this.backCtx.fillRect(0, 0, this.back.width, this.back.height);
  }

  drawSprite(tex: TextureId, src: Rect, dest: Rect, alpha = 1): void {
    const image = this.textures.get(tex);
    if (!image) return;
    const dx = Math.round(dest.x - this.cameraX);
    const dy = Math.round(dest.y - this.cameraY);
    this.backCtx.save();
    this.backCtx.globalAlpha = alpha;
    this.backCtx.drawImage(image, src.x, src.y, src.w, src.h, dx, dy, dest.w, dest.h);
    this.backCtx.restore();
  }

  drawRect(dest: Rect, color: string, filled: boolean): void {
    const dx = Math.round(dest.x - this.cameraX);
    const dy = Math.round(dest.y - this.cameraY);
    this.backCtx.fillStyle = color;
    this.backCtx.strokeStyle = color;
    if (filled) this.backCtx.fillRect(dx, dy, dest.w, dest.h);
    else this.backCtx.strokeRect(dx + 0.5, dy + 0.5, dest.w - 1, dest.h - 1);
  }

  drawText(text: string, x: number, y: number, color: string): void {
    this.backCtx.fillStyle = color;
    this.backCtx.font = '10px monospace';
    this.backCtx.fillText(text, Math.round(x), Math.round(y));
  }

  end(): void {
    this.presentBackbuffer();
  }

  private presentBackbuffer(): void {
    const { scale, x, y, width, height } = this.viewport;
    this.displayCtx.imageSmoothingEnabled = false;
    this.displayCtx.fillStyle = '#0b0a10';
    this.displayCtx.fillRect(0, 0, this.display.width, this.display.height);
    this.displayCtx.drawImage(this.back, 0, 0, this.back.width, this.back.height, x, y, width, height);
    void scale;
  }
}
