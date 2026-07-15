import { componentKey } from '../../core/ecs/World';
import type { Direction } from '../directions';

export interface Transform {
  x: number;
  y: number;
}

export interface Velocity {
  x: number;
  y: number;
}

/** Player move/attack intent for this sim tick (multiplayer-ready). */
export interface PlayerIntent {
  moveX: number;
  moveY: number;
  attackPressed: boolean;
  killPressed: boolean;
}

export type AnimState = 'idle' | 'walk' | 'attack' | 'death';

export interface SpriteAnimation {
  state: AnimState;
  direction: Direction;
  frame: number;
  elapsed: number;
  atlasId: string;
  textureId: string;
  /** One-shot finished (attack/death). */
  clipFinished: boolean;
}

export interface PlayerTag {
  readonly kind: 'player';
}

export interface Collider {
  /** AABB offset from transform (feet-centered typically). */
  ox: number;
  oy: number;
  w: number;
  h: number;
}

export interface EquippedWeapon {
  weaponId: string;
}

export interface Health {
  hp: number;
  maxHp: number;
}

export const TransformKey = componentKey<Transform>('Transform');
export const VelocityKey = componentKey<Velocity>('Velocity');
export const PlayerIntentKey = componentKey<PlayerIntent>('PlayerIntent');
export const SpriteAnimationKey = componentKey<SpriteAnimation>('SpriteAnimation');
export const PlayerTagKey = componentKey<PlayerTag>('PlayerTag');
export const ColliderKey = componentKey<Collider>('Collider');
export const EquippedWeaponKey = componentKey<EquippedWeapon>('EquippedWeapon');
export const HealthKey = componentKey<Health>('Health');
