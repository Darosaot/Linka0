import { describe, it, expect } from 'vitest';
import { createRng, simularDuelo, simularCopa, RONDAS_DUELO } from './versus.js';
import { ITEM_TYPES } from './dataQueries.js';
import { SLOT_KEYS, calcSlotScore } from './ratingEngine.js';

const firstBuild = Object.fromEntries(SLOT_KEYS.map(s => [s, ITEM_TYPES[s][0]]));

function extremeBuild(pick) {
  return Object.fromEntries(SLOT_KEYS.map(s => {
    const sorted = [...ITEM_TYPES[s]].sort((a, b) => calcSlotScore(s, a) - calcSlotScore(s, b));
    return [s, pick(sorted)];
  }));
}
const bestBuild = extremeBuild(pool => pool[pool.length - 1]);
const worstBuild = extremeBuild(pool => pool[0]);

describe('createRng', () => {
  it('is deterministic for a given seed', () => {
    const a = createRng(42);
    const b = createRng(42);
    for (let i = 0; i < 20; i++) expect(a()).toBe(b());
  });

  it('stays within [0, 1)', () => {
    const rng = createRng(7);
    for (let i = 0; i < 1000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('simularDuelo', () => {
  it('plays a fixed number of rounds and declares a winner', () => {
    const res = simularDuelo(firstBuild, bestBuild, createRng(1));
    expect(res.rondas).toHaveLength(RONDAS_DUELO);
    expect(res.marcador[0] + res.marcador[1]).toBe(RONDAS_DUELO);
    expect([0, 1]).toContain(res.ganador);
    expect(res.marcador[res.ganador]).toBeGreaterThan(res.marcador[1 - res.ganador]);
  });

  it('is deterministic for the same seed', () => {
    const a = simularDuelo(firstBuild, bestBuild, createRng(99));
    const b = simularDuelo(firstBuild, bestBuild, createRng(99));
    expect(a).toEqual(b);
  });

  it('a much stronger build wins the large majority of duels', () => {
    let wins = 0;
    for (let seed = 0; seed < 200; seed++) {
      if (simularDuelo(bestBuild, worstBuild, createRng(seed)).ganador === 0) wins++;
    }
    expect(wins / 200).toBeGreaterThan(0.8);
  });
});

describe('simularCopa', () => {
  const participants = ['a', 'b', 'c', 'd'].map(id => ({ id, build: firstBuild }));

  it('plays a 4-bracket as semifinals plus final', () => {
    const res = simularCopa(participants, 5);
    expect(res.rounds).toHaveLength(2);
    expect(res.rounds[0]).toHaveLength(2);
    expect(res.rounds[1]).toHaveLength(1);
    expect(['a', 'b', 'c', 'd']).toContain(res.campeonId);
  });

  it('the champion wins the final', () => {
    const res = simularCopa(participants, 11);
    expect(res.rounds[1][0].ganadorId).toBe(res.campeonId);
  });

  it('every tie winner advances to the next round', () => {
    const res = simularCopa(participants, 3);
    const finalists = [res.rounds[1][0].a, res.rounds[1][0].b];
    for (const tie of res.rounds[0]) {
      expect(finalists).toContain(tie.ganadorId);
    }
  });

  it('is deterministic for the same seed', () => {
    expect(simularCopa(participants, 77)).toEqual(simularCopa(participants, 77));
  });
});
