export type ViewportMode = 'integer' | 'downscaled';

export interface ViewportLayout {
  /**
   * Integer while pixel-perfect; fractional only when the backing surface is
   * smaller than the orientation-aware reference (downscaled mode).
   */
  readonly scale: number;
  readonly mode: ViewportMode;
  /**
   * Adaptive virtual buffer size in logical pixels. In integer mode this grows
   * with the backing surface aspect ratio (at least the active reference).
   * In downscaled mode it stays locked to the active reference.
   */
  readonly virtualW: number;
  readonly virtualH: number;
  /** Letterboxed destination rectangle in the same units as the backing size. */
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/**
 * Defaults for unit tests / tools (desktop-classic landscape + mobile portrait).
 * Runtime composition root may pick mobile landscape for coarse pointers.
 */
export const DEFAULT_LANDSCAPE_REF_W = 640;
export const DEFAULT_LANDSCAPE_REF_H = 360;
export const DEFAULT_PORTRAIT_REF_W = 216;
export const DEFAULT_PORTRAIT_REF_H = 384;

export interface ViewportReferencePair {
  readonly landscapeW: number;
  readonly landscapeH: number;
  readonly portraitW: number;
  readonly portraitH: number;
}

export const DEFAULT_VIEWPORT_REFS: ViewportReferencePair = {
  landscapeW: DEFAULT_LANDSCAPE_REF_W,
  landscapeH: DEFAULT_LANDSCAPE_REF_H,
  portraitW: DEFAULT_PORTRAIT_REF_W,
  portraitH: DEFAULT_PORTRAIT_REF_H,
};

/**
 * Picks the active reference for the current backing orientation.
 *
 * - Landscape / square (`backingW >= backingH`): landscape baseline
 * - Portrait (`backingH > backingW`): portrait baseline (independent, not a swap)
 */
export function referenceForBacking(
  backingW: number,
  backingH: number,
  refs: ViewportReferencePair = DEFAULT_VIEWPORT_REFS,
): { refW: number; refH: number } {
  if (backingH > backingW) {
    return { refW: refs.portraitW, refH: refs.portraitH };
  }
  return { refW: refs.landscapeW, refH: refs.landscapeH };
}

/** Optional knobs for {@link computeViewport}. */
export interface ComputeViewportOptions {
  /**
   * Cap integer scale (spec 0.5.1 B1 — fullscreen sticky zoom).
   * When set, scale will not exceed this value in integer mode, so extra
   * backing pixels expand FOV (`virtual*`) instead of zooming in.
   * Ignored in downscaled mode.
   */
  readonly maxScale?: number;
}

/**
 * Computes an adaptive presentation layout for a backing surface of
 * `backingW×backingH` physical pixels.
 *
 * Orientation-aware zoom baselines (defaults):
 * - Landscape: **640×360** (desktop classic; mobile may inject 320×180)
 * - Portrait: **216×384**
 *
 * With the active reference:
 * - `scale = max(1, floor(min(backingW/refW, backingH/refH)))` when fit ≥ 1
 * - optional `maxScale` caps that integer scale (fullscreen parity)
 * - `virtualW = max(refW, floor(backingW / scale))`
 * - `virtualH = max(refH, floor(backingH / scale))`
 *
 * When the backing surface is smaller than the active reference (`fit < 1`),
 * the layout locks virtual size to that reference and applies a uniform
 * fractional downscale (letterboxed if needed).
 *
 * @throws {RangeError} if any dimension is not a positive finite number.
 */
export function computeViewport(
  backingW: number,
  backingH: number,
  refs: ViewportReferencePair = DEFAULT_VIEWPORT_REFS,
  options?: ComputeViewportOptions,
): ViewportLayout {
  const { landscapeW, landscapeH, portraitW, portraitH } = refs;
  if (
    !Number.isFinite(backingW) ||
    !Number.isFinite(backingH) ||
    !Number.isFinite(landscapeW) ||
    !Number.isFinite(landscapeH) ||
    !Number.isFinite(portraitW) ||
    !Number.isFinite(portraitH) ||
    backingW <= 0 ||
    backingH <= 0 ||
    landscapeW <= 0 ||
    landscapeH <= 0 ||
    portraitW <= 0 ||
    portraitH <= 0
  ) {
    throw new RangeError('Viewport dimensions must be positive finite numbers');
  }

  const { refW, refH } = referenceForBacking(backingW, backingH, refs);

  const fit = Math.min(backingW / refW, backingH / refH);

  let scale: number;
  let mode: ViewportMode;
  let virtualW: number;
  let virtualH: number;

  if (fit >= 1) {
    scale = Math.max(1, Math.floor(fit));
    const maxScale = options?.maxScale;
    if (maxScale !== undefined && Number.isFinite(maxScale) && maxScale >= 1 && scale > maxScale) {
      scale = Math.max(1, Math.floor(maxScale));
    }
    virtualW = Math.max(refW, Math.floor(backingW / scale));
    virtualH = Math.max(refH, Math.floor(backingH / scale));
    mode = 'integer';
  } else {
    scale = fit;
    virtualW = refW;
    virtualH = refH;
    mode = 'downscaled';
  }

  const width = virtualW * scale;
  const height = virtualH * scale;

  return {
    scale,
    mode,
    virtualW,
    virtualH,
    x: Math.floor((backingW - width) / 2),
    y: Math.floor((backingH - height) / 2),
    width,
    height,
  };
}
