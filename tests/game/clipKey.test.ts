import { describe, expect, it } from 'vitest';
import { clipKey, resolveClip } from '../../src/game/animation/clipKey';

describe('clipKey', () => {
  it('builds state-direction keys', () => {
    expect(clipKey('run', 'up-left')).toBe('run-up-left');
    expect(clipKey('sit', 'down')).toBe('sit-down');
  });
});

describe('resolveClip', () => {
  it('returns primary when present', () => {
    const has = (k: string) => k === 'walk-down-right';
    expect(resolveClip(has, 'walk', 'down-right')).toBe('walk-down-right');
  });

  it('falls run back to walk', () => {
    const keys = new Set(['walk-down']);
    expect(resolveClip((k) => keys.has(k), 'run', 'down')).toBe('walk-down');
  });

  it('falls sit back to idle', () => {
    const keys = new Set(['idle-left']);
    expect(resolveClip((k) => keys.has(k), 'sit', 'left')).toBe('idle-left');
  });
});
