import { describe, it, expect } from 'vitest';
import { ITEM_TYPES, getAllLinksRivales, getAllMazmorras } from '../utils/dataQueries.js';
import { ALL_SETS } from '../utils/setEngine.js';

const ALL_ITEM_IDS = new Set(
  Object.values(ITEM_TYPES).flatMap(pool => pool.map(item => item.id))
);

describe('item pools', () => {
  it('every item has id, name, generation and attributes', () => {
    for (const [slot, pool] of Object.entries(ITEM_TYPES)) {
      expect(pool.length, slot).toBeGreaterThan(0);
      for (const item of pool) {
        expect(item.id, `${slot} item missing id`).toBeTruthy();
        expect(item.name, item.id).toBeTruthy();
        expect(item.generation, item.id).toBeTruthy();
        expect(item.attributes, item.id).toBeTypeOf('object');
      }
    }
  });

  it('item ids are globally unique', () => {
    const all = Object.values(ITEM_TYPES).flatMap(pool => pool.map(i => i.id));
    expect(new Set(all).size).toBe(all.length);
  });
});

describe('sets', () => {
  it('every set piece references an existing item', () => {
    for (const set of ALL_SETS) {
      for (const pieza of set.piezas) {
        expect(ALL_ITEM_IDS.has(pieza), `${set.id} → ${pieza}`).toBe(true);
      }
    }
  });

  it('every set has a valid bonus multiplier', () => {
    for (const set of ALL_SETS) {
      expect(set.bonus_mult, set.id).toBeGreaterThan(1);
      expect(set.bonus_mult, set.id).toBeLessThanOrEqual(1.35);
    }
  });

  it('no item belongs to more than one set', () => {
    const seen = new Set();
    for (const set of ALL_SETS) {
      for (const pieza of set.piezas) {
        expect(seen.has(pieza), `${pieza} appears in multiple sets`).toBe(false);
        seen.add(pieza);
      }
    }
  });
});

describe('mazmorras', () => {
  it('every mazmorra has the modifier fields the simulator reads', () => {
    const required = [
      'fuerza_weight',
      'defensa_weight',
      'agilidad_weight',
      'magia_weight',
      'lluvia_probability',
      'emboscada_probability',
    ];
    for (const maz of getAllMazmorras()) {
      for (const field of required) {
        expect(maz.modifiers?.[field], `${maz.id}.${field}`).toBeTypeOf('number');
      }
    }
  });
});

describe('links rivales', () => {
  it('there are 10 rivals with the attributes the simulator reads', () => {
    const rivales = getAllLinksRivales();
    expect(rivales).toHaveLength(10);
    for (const rival of rivales) {
      for (const attr of ['poder', 'defensa', 'agilidad', 'magia', 'resistencia']) {
        expect(rival.attributes?.[attr], `${rival.id}.${attr}`).toBeTypeOf('number');
      }
    }
  });
});
