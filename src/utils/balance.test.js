import { describe, it, expect } from 'vitest';
import { simularTorneo } from './simulator.js';
import { calcSetMultiplier } from './setEngine.js';
import { draftCpuBuild } from './cpuDrafter.js';

// Monte Carlo balance regression: simulates bot players drafting builds the
// same way the store does (including set resonance) and checks that each
// difficulty stays in its intended outcome band. Ranges are deliberately
// wide so only real balance regressions (data or engine changes) fail.

const RUNS = 600;

function medianPct(strategy, dificultad) {
  const pcts = [];
  for (let i = 0; i < RUNS; i++) {
    const res = simularTorneo(draftCpuBuild(strategy), dificultad);
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
      totalMult += calcSetMultiplier(draftCpuBuild('setchaser'));
    }
    expect(totalMult / RUNS).toBeGreaterThan(1.04);
  });
});
