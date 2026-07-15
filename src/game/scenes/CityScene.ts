import type { AssetStore } from '../../core/contracts/AssetStore';
import type { InputSource } from '../../core/contracts/InputSource';
import type { Renderer, ResizableRenderer } from '../../core/contracts/Renderer';
import type { Scene } from '../../core/contracts/Scene';
import type { TileMapData } from '../../core/contracts/asset-data';
import { World } from '../../core/ecs/World';
import {
  ColliderKey,
  EquippedWeaponKey,
  HealthKey,
  PlayerIntentKey,
  PlayerTagKey,
  SpriteAnimationKey,
  TransformKey,
  VelocityKey,
} from '../components';
import { ASSET_IDS, TILE_SIZE } from '../config';
import { AnimationPlaybackSystem } from '../systems/AnimationPlaybackSystem';
import { AnimationStateSystem } from '../systems/AnimationStateSystem';
import { CameraSystem } from '../systems/CameraSystem';
import { CollisionSystem } from '../systems/CollisionSystem';
import { MovementSystem } from '../systems/MovementSystem';
import { PlayerInputSystem } from '../systems/PlayerInputSystem';
import { RenderSystem } from '../systems/RenderSystem';
import { defaultWeaponId, getWeapon } from '../weapons/registry';
import { buildCityMap } from '../world/buildCityMap';
import { Camera } from '../world/Camera';
import { TileMap } from '../world/TileMap';
/** Asset store that can register a map at boot (MemoryAssetStore implements this). */
export interface MutableMapStore extends AssetStore {
  setMap(id: string, map: TileMapData): void;
}

export class CityScene implements Scene {
  private readonly world = new World();
  private map!: TileMap;
  private camera = new Camera();
  private renderSystem!: RenderSystem;
  private player = 0;

  constructor(
    private readonly renderer: Renderer,
    private readonly input: InputSource,
    private readonly assets: MutableMapStore,
  ) {}

  async load(signal: AbortSignal): Promise<void> {
    if (signal.aborted) throw new DOMException('Aborted', 'AbortError');

    const data = buildCityMap();
    this.assets.setMap(ASSET_IDS.cityMap, data);
    this.map = new TileMap(data);

    this.camera.setWorldSize(this.map.pixelWidth, this.map.pixelHeight);
    this.syncCameraViewport();

    this.world.addSystem(new PlayerInputSystem(this.input));
    this.world.addSystem(new MovementSystem());
    this.world.addSystem(new CollisionSystem(this.map));
    this.world.addSystem(new AnimationStateSystem());
    this.world.addSystem(new AnimationPlaybackSystem(this.assets));
    this.world.addSystem(new CameraSystem(this.camera));
    // Ground tileset + texture must be registered by the composition root before load.
    if (!this.assets.hasTexture(ASSET_IDS.cityTilesTexture)) {
      throw new Error(`Missing city tiles texture: ${ASSET_IDS.cityTilesTexture}`);
    }
    // throws if missing
    this.assets.tileset(ASSET_IDS.cityTileset);

    this.renderSystem = new RenderSystem(this.renderer, this.map, this.camera, this.assets);
    this.world.addSystem(this.renderSystem);

    const weapon = getWeapon(defaultWeaponId());
    const spawnPx = data.spawn.x * TILE_SIZE + TILE_SIZE / 2;
    const spawnPy = data.spawn.y * TILE_SIZE + TILE_SIZE / 2;

    this.player = this.world.createEntity();
    this.world.add(this.player, PlayerTagKey, { kind: 'player' });
    this.world.add(this.player, TransformKey, { x: spawnPx, y: spawnPy });
    this.world.add(this.player, VelocityKey, { x: 0, y: 0 });
    this.world.add(this.player, PlayerIntentKey, {
      moveX: 0,
      moveY: 0,
      attackPressed: false,
      killPressed: false,
    });
    this.world.add(this.player, ColliderKey, { ox: -6, oy: -4, w: 12, h: 8 });
    this.world.add(this.player, HealthKey, { hp: 10, maxHp: 10 });
    this.world.add(this.player, EquippedWeaponKey, { weaponId: weapon.id });
    this.world.add(this.player, SpriteAnimationKey, {
      state: 'idle',
      direction: 'down',
      frame: 0,
      elapsed: 0,
      atlasId: weapon.poseAtlasId,
      textureId: weapon.poseTextureId,
      clipFinished: false,
    });

    this.camera.centerOn(spawnPx, spawnPy);
  }

  enter(): void {
    this.syncCameraViewport();
  }

  private syncCameraViewport(): void {
    const resizable = this.renderer as ResizableRenderer;
    if (typeof resizable.virtualSize === 'function') {
      const { width, height } = resizable.virtualSize();
      this.camera.setViewport(width, height);
    }
  }

  update(dt: number): void {
    this.syncCameraViewport();
    this.world.update(dt);
  }

  render(alpha: number): void {
    this.renderSystem.draw(this.world, alpha);
  }

  exit(): void {
    // no-op for 0.1.0
  }
}
