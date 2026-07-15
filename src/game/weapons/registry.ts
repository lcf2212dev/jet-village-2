import { ASSET_IDS } from '../config';
import type { WeaponDef } from './types';

const STARTER_SWORD: WeaponDef = {
  id: 'starter_sword',
  weaponClass: 'oneHandSword',
  displayName: 'Espada inicial',
  poseAtlasId: ASSET_IDS.warriorAtlas,
  poseTextureId: ASSET_IDS.warriorTexture,
};

const byId = new Map<string, WeaponDef>([[STARTER_SWORD.id, STARTER_SWORD]]);

export function getWeapon(id: string): WeaponDef {
  const w = byId.get(id);
  if (!w) throw new Error(`Unknown weapon: ${id}`);
  return w;
}

export function defaultWeaponId(): string {
  return STARTER_SWORD.id;
}
