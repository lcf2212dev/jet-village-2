import type { Rect } from '../math/Rect';
import type { ViewportMode } from '../math/viewport';

export type TextureId = string;

export interface CameraView {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface Renderer {
  begin(camera: CameraView): void;
  drawSprite(tex: TextureId, src: Rect, dest: Rect, alpha?: number): void;
  drawRect(dest: Rect, color: string, filled: boolean): void;
  drawText(text: string, x: number, y: number, color: string): void;
  end(): void;
}

export interface PresentationMetrics {
  readonly scale: number;
  readonly mode: ViewportMode;
  readonly virtualW: number;
  readonly virtualH: number;
  readonly cssWidth: number;
  readonly cssHeight: number;
  readonly dpr: number;
  readonly offsetX: number;
  readonly offsetY: number;
}

export interface ResizableRenderer extends Renderer {
  virtualSize(): { width: number; height: number };
  presentationMetrics(): PresentationMetrics;
}
