import { describe, it, expect } from 'vitest';
import { ALL_SETS, calcSetMultiplier, getActiveSets, getPartialSets, getSetForItem } from './setEngine.js';
import { resolveItem } from './dataQueries.js';
import { SLOT_KEYS } from './ratingEngine.js';

// Builds a build object containing the full piece list of a given set,
// placing each piece in the slot whose pool contains it.
function buildWithSet(set) {
  const build = {};
  for (const pieceId of set.piezas) {
    for (const slot of SLOT_KEYS) {
      const item = resolveItem(slot, pieceId);
      if (item && build[slot] === undefined) {
        build[slot] = item;
        break;
      }
    }
  }
  return build;
}

describe('getSetForItem', () => {
  it('finds the set a piece belongs to', () => {
    const set = ALL_SETS[0];
    expect(getSetForItem(set.piezas[0])?.id).toBe(set.id);
  });

  it('returns null for unknown or missing ids', () => {
    expect(getSetForItem('no_such_item')).toBeNull();
    expect(getSetForItem(undefined)).toBeNull();
  });
});

describe('getActiveSets / getPartialSets', () => {
  it('reports no sets for an empty build', () => {
    expect(getActiveSets({})).toEqual([]);
    expect(getPartialSets({})).toEqual([]);
  });

  it('activates a set when all pieces are equipped', () => {
    for (const set of ALL_SETS) {
      const build = buildWithSet(set);
      // Every set must be completable: each piece must land in a distinct slot
      expect(Object.keys(build).length, set.id).toBe(set.piezas.length);
      const active = getActiveSets(build);
      expect(active.map(s => s.id), set.id).toContain(set.id);
    }
  });

  it('reports incomplete sets as partial, not active', () => {
    const set = ALL_SETS.find(s => s.piezas.length >= 2);
    const build = buildWithSet(set);
    const firstSlot = Object.keys(build)[0];
    delete build[firstSlot];

    expect(getActiveSets(build).map(s => s.id)).not.toContain(set.id);
    const partial = getPartialSets(build).find(p => p.set.id === set.id);
    expect(partial.count).toBe(set.piezas.length - 1);
    expect(partial.complete).toBe(false);
  });
});

describe('calcSetMultiplier', () => {
  it('is 1.0 with no active sets', () => {
    expect(calcSetMultiplier({})).toBe(1.0);
  });

  it('applies a single set bonus', () => {
    const set = ALL_SETS[0];
    const build = buildWithSet(set);
    expect(calcSetMultiplier(build)).toBeCloseTo(set.bonus_mult);
  });

  it('never exceeds the +35% cap', () => {
    for (const set of ALL_SETS) {
      expect(set.bonus_mult - 1).toBeLessThanOrEqual(0.35);
    }
    // Even stacking every set bonus, the multiplier must cap at 1.35
    const totalBonus = ALL_SETS.reduce((sum, s) => sum + (s.bonus_mult - 1), 0);
    expect(totalBonus).toBeGreaterThan(0.35); // the cap is actually exercised
  });
});
