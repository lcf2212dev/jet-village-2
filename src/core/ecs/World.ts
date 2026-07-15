import type { System } from '../contracts/System';

export type Entity = number;

/** Typed key identifying a component kind. Create once per component via `componentKey`. */
export interface ComponentKey<T> {
  readonly id: string;
  /** Phantom field so T participates in inference; never assigned at runtime. */
  readonly __type?: T;
}

export function componentKey<T>(id: string): ComponentKey<T> {
  return { id };
}

/**
 * Minimal pragmatic ECS (spec §8.1): entities are ids, components are pure data
 * stored per key, systems run in ascending `order`. No logic lives in components.
 */
export class World {
  private nextEntity: Entity = 1;
  private readonly stores = new Map<string, Map<Entity, unknown>>();
  private readonly systems: System[] = [];

  createEntity(): Entity {
    return this.nextEntity++;
  }

  destroyEntity(entity: Entity): void {
    for (const store of this.stores.values()) store.delete(entity);
  }

  add<T>(entity: Entity, key: ComponentKey<T>, component: T): void {
    let store = this.stores.get(key.id);
    if (!store) {
      store = new Map();
      this.stores.set(key.id, store);
    }
    store.set(entity, component);
  }

  get<T>(entity: Entity, key: ComponentKey<T>): T | undefined {
    return this.stores.get(key.id)?.get(entity) as T | undefined;
  }

  /** Like get(), but throws — for components a system requires to exist. */
  require<T>(entity: Entity, key: ComponentKey<T>): T {
    const component = this.get(entity, key);
    if (component === undefined) {
      throw new Error(`Entity ${entity} is missing required component "${key.id}"`);
    }
    return component;
  }

  remove<T>(entity: Entity, key: ComponentKey<T>): void {
    this.stores.get(key.id)?.delete(entity);
  }

  /** Entities holding ALL the given component kinds. */
  query(...keys: ComponentKey<unknown>[]): Entity[] {
    const [first, ...rest] = keys;
    if (!first) return [];
    const base = this.stores.get(first.id);
    if (!base) return [];
    const result: Entity[] = [];
    for (const entity of base.keys()) {
      if (rest.every((k) => this.stores.get(k.id)?.has(entity))) result.push(entity);
    }
    return result;
  }

  addSystem(system: System): void {
    this.systems.push(system);
    this.systems.sort((a, b) => a.order - b.order);
  }

  update(dt: number): void {
    for (const system of this.systems) system.update(this, dt);
  }
}
