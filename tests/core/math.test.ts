import { describe, expect, it } from 'vitest';
import { clamp, lerp, length, normalize } from '../../src/core/math/Vec2';
import { intersects, rect } from '../../src/core/math/Rect';
import {
  computeViewport,
  DEFAULT_VIEWPORT_REFS,
  referenceForBacking,
} from '../../src/core/math/viewport';

describe('Vec2', () => {
  it('normalize returns a unit vector and is safe for the zero vector', () => {
    expect(normalize({ x: 0, y: 0 })).toEqual({ x: 0, y: 0 });
    const unit = normalize({ x: 3, y: 4 });
    expect(length(unit)).toBeCloseTo(1, 10);
  });

  it('lerp and clamp behave at the boundaries', () => {
    expect(lerp(0, 10, 0)).toBe(0);
    expect(lerp(0, 10, 1)).toBe(10);
    expect(clamp(5, 0, 3)).toBe(3);
    expect(clamp(-1, 0, 3)).toBe(0);
  });
});

describe('Rect.intersects', () => {
  it('detects overlap and treats edge-touching as NOT intersecting', () => {
    expect(intersects(rect(0, 0, 10, 10), rect(5, 5, 10, 10))).toBe(true);
    expect(intersects(rect(0, 0, 10, 10), rect(10, 0, 10, 10))).toBe(false);
    expect(intersects(rect(0, 0, 10, 10), rect(0, 10, 10, 10))).toBe(false);
  });
});

describe('referenceForBacking (orientation-aware zoom baseline)', () => {
  it('uses landscape ref when width >= height', () => {
    expect(referenceForBacking(1920, 1080)).toEqual({
      refW: DEFAULT_VIEWPORT_REFS.landscapeW,
      refH: DEFAULT_VIEWPORT_REFS.landscapeH,
    });
    expect(referenceForBacking(800, 800)).toEqual({
      refW: DEFAULT_VIEWPORT_REFS.landscapeW,
      refH: DEFAULT_VIEWPORT_REFS.landscapeH,
    });
  });

  it('uses independent portrait ref when height > width', () => {
    expect(referenceForBacking(1080, 1920)).toEqual({
      refW: DEFAULT_VIEWPORT_REFS.portraitW,
      refH: DEFAULT_VIEWPORT_REFS.portraitH,
    });
  });
});

describe('computeViewport (adaptive + orientation-aware reference)', () => {
  // Defaults: landscape 640×360, portrait 216×384 (DEFAULT_VIEWPORT_REFS)
  const table: Array<[number, number, number, 'integer' | 'downscaled', number, number]> = [
    // backingW, backingH, expectedScale, mode, virtualW, virtualH
    [1920, 1080, 3, 'integer', 640, 360],
    [1920, 1200, 3, 'integer', 640, 400],
    // Portrait: ref 216×384 → scale floor(min(1080/216,1920/384))=5 → virtual 216×384
    [1080, 1920, 5, 'integer', 216, 384],
    [800, 600, 1, 'integer', 800, 600],
    [640, 360, 1, 'integer', 640, 360],
    // Smaller than landscape ref
    [320, 180, 0.5, 'downscaled', 640, 360],
    // Smaller than portrait ref
    [108, 192, 0.5, 'downscaled', 216, 384],
  ];

  it.each(table)(
    'backing %i×%i → scale %f (%s), virtual %i×%i',
    (backingW, backingH, scale, mode, virtualW, virtualH) => {
      const vp = computeViewport(backingW, backingH);
      expect(vp.scale).toBe(scale);
      expect(vp.mode).toBe(mode);
      expect(vp.virtualW).toBe(virtualW);
      expect(vp.virtualH).toBe(virtualH);
      expect(vp.width).toBe(virtualW * scale);
      expect(vp.height).toBe(virtualH * scale);
      expect(vp.x).toBe(Math.floor((backingW - vp.width) / 2));
      expect(vp.y).toBe(Math.floor((backingH - vp.height) / 2));
    },
  );

  it('portrait uses the tight portrait reference (216×384)', () => {
    const vp = computeViewport(1080, 1920);
    expect(vp.mode).toBe('integer');
    expect(vp.scale).toBe(5);
    expect(vp.virtualW).toBe(216);
    expect(vp.virtualH).toBe(384);
    expect(vp.virtualH).toBeGreaterThan(vp.virtualW);
    expect(vp.virtualW * vp.virtualH).toBeLessThan(360 * 640);
  });

  it('portrait short-side FOV is tighter than landscape desktop ref', () => {
    const land = computeViewport(1920, 1080);
    const port = computeViewport(1080, 1920);
    const landShort = Math.min(land.virtualW, land.virtualH);
    const portShort = Math.min(port.virtualW, port.virtualH);
    expect(portShort).toBeLessThan(landShort);
  });

  it('accepts custom orientation refs', () => {
    const vp = computeViewport(1920, 1080, {
      landscapeW: 640,
      landscapeH: 360,
      portraitW: 360,
      portraitH: 640,
    });
    expect(vp.scale).toBe(3);
    expect(vp.virtualW).toBe(640);
    expect(vp.virtualH).toBe(360);
  });

  it('rejects invalid dimensions instead of returning an unusable layout', () => {
    expect(() => computeViewport(0, 360)).toThrow(RangeError);
    expect(() => computeViewport(640, Number.NaN)).toThrow(RangeError);
    expect(() =>
      computeViewport(640, 360, {
        landscapeW: -1,
        landscapeH: 360,
        portraitW: 360,
        portraitH: 640,
      }),
    ).toThrow(RangeError);
    expect(() => computeViewport(Infinity, 360)).toThrow(RangeError);
  });

  it('maxScale caps integer scale and expands FOV (spec 0.5.1 B1)', () => {
    // 2560×1440 → unconstrained scale 4, virtual 640×360
    const full = computeViewport(2560, 1440);
    expect(full.scale).toBe(4);
    expect(full.virtualW).toBe(640);
    expect(full.virtualH).toBe(360);

    // Cap at windowed scale 3 → same backing, more FOV, no zoom-in
    const capped = computeViewport(2560, 1440, DEFAULT_VIEWPORT_REFS, { maxScale: 3 });
    expect(capped.scale).toBe(3);
    expect(capped.mode).toBe('integer');
    expect(capped.virtualW).toBe(Math.floor(2560 / 3));
    expect(capped.virtualH).toBe(Math.floor(1440 / 3));
    expect(capped.virtualW).toBeGreaterThan(full.virtualW);
    expect(capped.virtualH).toBeGreaterThan(full.virtualH);
  });

  it('maxScale is ignored in downscaled mode', () => {
    const vp = computeViewport(320, 180, DEFAULT_VIEWPORT_REFS, { maxScale: 1 });
    expect(vp.mode).toBe('downscaled');
    expect(vp.scale).toBe(0.5);
  });
});
