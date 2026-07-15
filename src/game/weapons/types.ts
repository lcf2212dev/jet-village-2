/** Pure weapon definition — pose atlas is presentation; systems never hardcode skin paths. */
export interface WeaponDef {
  readonly id: string;
  readonly weaponClass: string;
  /** In-game display name (pt-BR). */
  readonly displayName: string;
  readonly poseAtlasId: string;
  readonly poseTextureId: string;
}
