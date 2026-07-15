import { describe, expect, it } from 'vitest';
import { World, componentKey } from '../../src/core/ecs/World';
import type { System } from '../../src/core/contracts/System';

interface Health {
  hp: number;
}
const HealthKey = componentKey<Health>('health');
const TagKey = componentKey<{ name: string }>('tag');

describe('World (minimal ECS — spec §8.1)', () => {
  it('adds, gets, removes components and destroys entities', () => {
    const world = new World();
    const entity = world.createEntity();
    world.add(entity, HealthKey, { hp: 10 });
    expect(world.get(entity, HealthKey)?.hp).toBe(10);
    world.remove(entity, HealthKey);
    expect(world.get(entity, HealthKey)).toBeUndefined();
    world.add(entity, HealthKey, { hp: 3 });
    world.destroyEntity(entity);
    expect(world.get(entity, HealthKey)).toBeUndefined();
  });

  it('require() throws for missing components (fail fast in systems)', () => {
    const world = new World();
    const entity = world.createEntity();
    expect(() => world.require(entity, HealthKey)).toThrowError(/health/);
  });

  it('query returns only entities holding ALL requested components', () => {
    const world = new World();
    const both = world.createEntity();
    const onlyHealth = world.createEntity();
    world.add(both, HealthKey, { hp: 1 });
    world.add(both, TagKey, { name: 'jett' });
    world.add(onlyHealth, HealthKey, { hp: 2 });
    expect(world.query(HealthKey, TagKey)).toEqual([both]);
    expect(world.query(HealthKey)).toEqual([both, onlyHealth]);
  });

  it('executes systems in ascending order even when registered out of order', () => {
    const world = new World();
    const calls: number[] = [];
    const make = (order: number): System => ({ order, update: () => calls.push(order) });
    world.addSystem(make(7));
    world.addSystem(make(1));
    world.addSystem(make(3));
    world.update(1 / 60);
    expect(calls).toEqual([1, 3, 7]);
  });
});
