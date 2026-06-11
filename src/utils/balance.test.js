import { describe, it, expect } from 'vitest';
import { simularTorneo } from './simulator.js';
import { ITEM_TYPES } from './dataQueries.js';
import { SLOT_KEYS, calcSlotScore } from './ratingEngine.js';
import { calcSetMultiplier, getMissingSetPieces } from './setEngine.js';

// Monte Carlo balance regression: simulates bot players drafting builds the
// same way the store does (including set resonance) and checks that each
// difficulty stays in its intended outcome band. Ranges are deliberately
// wide so only real balance regressions (data or engine changes) fail.

const RESONANCE_PROB = 0.35; // keep in sync with gameStore.js
const RUNS = 600;

function rollFor(build, emptySlots) {
  const missing = getMissingSetPieces(build);
  const items = {};
  for (const slot of emptySlots) {
    const pool = ITEM_TYPES[slot];
    const resonant = pool.filter(i => missing.includes(i.id));
    items[slot] = (resonant.length && Math.random() < RESONANCE_PROB)
      ? resonant[Math.floor(Math.random() * resonant.length)]
      : pool[Math.floor(Math.random() * pool.length)];
  }
  return items;
}

// 'greedy' always equips the best-scoring offer; 'setchaser' prioritizes
// pieces that advance a set it already started.
function playBuild(strategy) {
  const build = {};
  let empty = [...SLOT_KEYS];
  while (empty.length) {
    const offer = rollFor(build, empty);
    const missing = getMissingSetPieces(build);
    let best = null;
    for (const slot of empty) {
      const item = offer[slot];
      let score = calcSlotScore(slot, item);
      if (strategy === 'setchaser' && missing.includes(item.id)) score += 100;
      if (!best || score > best.score) best = { slot, item, score };
    }
    build[best.slot] = best.item;
    empty = empty.filter(s => s !== best.slot);
  }
  return build;
}

function medianPct(strategy, dificultad) {
  const pcts = [];
  for (let i = 0; i < RUNS; i++) {
    const res = simularTorneo(playBuild(strategy), dificultad);
    pcts.push((res.linkStats.puntos / res.maxPuntos) * 100);
  }
  pcts.sort((a, b) => a - b);
  return pcts[Math.floor(RUNS / 2)];
}

describe('game balance', () => {
  it('explorador is winnable for a player who drafts well', () => {
    expect(medianPct('greedy', 'explorador')).toBeGreaterThanOrEqual(65);
  });

  it('normal is challenging but fair', () => {
    const median = medianPct('greedy', 'normal');
    expect(median).toBeGreaterThanOrEqual(45);
    expect(median).toBeLessThanOrEqual(80);
  });

  it('leyenda is hard but not hopeless', () => {
    const median = medianPct('greedy', 'leyenda');
    expect(median).toBeGreaterThanOrEqual(25);
    expect(median).toBeLessThanOrEqual(60);
  });

  it('set resonance makes completing sets a viable strategy', () => {
    let totalMult = 0;
    for (let i = 0; i < RUNS; i++) {
      totalMult += calcSetMultiplier(playBuild('setchaser'));
    }
    expect(totalMult / RUNS).toBeGreaterThan(1.04);
  });
});
