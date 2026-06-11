import { describe, it, expect } from 'vitest';
import { SLOT_CONFIG, SLOT_KEYS, calcBuildProfile, calcSlotScore, calcTeamRating, getVeredicto } from './ratingEngine.js';
import { ITEM_TYPES } from './dataQueries.js';

describe('SLOT_CONFIG', () => {
  it('weights sum to 1.0', () => {
    const total = SLOT_CONFIG.reduce((sum, s) => sum + s.weight, 0);
    expect(total).toBeCloseTo(1.0, 10);
  });

  it('covers every item pool exactly once', () => {
    expect([...SLOT_KEYS].sort()).toEqual(Object.keys(ITEM_TYPES).sort());
  });
});

describe('calcSlotScore', () => {
  it('returns 0 for missing item or unknown slot', () => {
    expect(calcSlotScore('espada1', null)).toBe(0);
    expect(calcSlotScore('no_such_slot', { attributes: {} })).toBe(0);
  });

  it('scores a known sword by its weighted attributes', () => {
    const item = { attributes: { poder: 100, velocidad: 100, alcance: 100, magia: 100 } };
    expect(calcSlotScore('espada1', item)).toBeCloseTo(100);
  });

  it('scores every real item within 0–100', () => {
    for (const [slot, pool] of Object.entries(ITEM_TYPES)) {
      for (const item of pool) {
        const score = calcSlotScore(slot, item);
        expect(score, `${slot}/${item.id}`).toBeGreaterThanOrEqual(0);
        expect(score, `${slot}/${item.id}`).toBeLessThanOrEqual(100);
      }
    }
  });
});

describe('calcTeamRating', () => {
  it('returns 0 for an empty build', () => {
    expect(calcTeamRating({})).toBe(0);
  });

  it('equals the slot score when only one slot is filled', () => {
    const item = ITEM_TYPES.espada1[0];
    const rating = calcTeamRating({ espada1: item });
    expect(rating).toBe(Math.round(calcSlotScore('espada1', item)));
  });

  it('rates a full build of real items within 0–100', () => {
    const build = Object.fromEntries(SLOT_KEYS.map(slot => [slot, ITEM_TYPES[slot][0]]));
    const rating = calcTeamRating(build);
    expect(rating).toBeGreaterThanOrEqual(0);
    expect(rating).toBeLessThanOrEqual(100);
  });
});

describe('getVeredicto', () => {
  it('maps score percentages to the right titles', () => {
    expect(getVeredicto(100).titulo).toBe('El Elegido');
    expect(getVeredicto(85).titulo).toBe('El Elegido');
    expect(getVeredicto(84).titulo).toBe('Héroe del Tiempo');
    expect(getVeredicto(70).titulo).toBe('Héroe del Tiempo');
    expect(getVeredicto(55).titulo).toBe('Campeón de Hyrule');
    expect(getVeredicto(40).titulo).toBe('Aventurero Valiente');
    expect(getVeredicto(25).titulo).toBe('Aprendiz de Héroe');
    expect(getVeredicto(0).titulo).toBe('Aldeano con Espada de Madera');
  });
});

describe('calcBuildProfile', () => {
  it('returns zeroed dimensions for an empty build', () => {
    expect(calcBuildProfile({})).toEqual({ fuerza: 0, defensa: 0, agilidad: 0, magia: 0 });
  });

  it('keeps every dimension within 0-100 for any full build', () => {
    for (let i = 0; i < 50; i++) {
      const build = Object.fromEntries(
        SLOT_KEYS.map(s => [s, ITEM_TYPES[s][Math.floor(Math.random() * ITEM_TYPES[s].length)]])
      );
      const profile = calcBuildProfile(build);
      for (const [dim, value] of Object.entries(profile)) {
        expect(value, dim).toBeGreaterThanOrEqual(0);
        expect(value, dim).toBeLessThanOrEqual(100);
      }
    }
  });
});
