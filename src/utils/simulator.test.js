import { describe, it, expect } from 'vitest';
import { duelResult, rivalRating, simularTorneo, PUNTOS_DUELO } from './simulator.js';
import { getAllLinksRivales, ITEM_TYPES } from './dataQueries.js';
import { SLOT_KEYS } from './ratingEngine.js';

describe('duelResult', () => {
  it('returns ko regardless of performances', () => {
    expect(duelResult(100, 1, true)).toEqual({ tag: 'ko', puntos: 0 });
  });

  it('classifies clear victory above +15% margin', () => {
    expect(duelResult(120, 100, false).tag).toBe('victoria_clara');
  });

  it('classifies narrow victory between 0 and +15%', () => {
    expect(duelResult(110, 100, false).tag).toBe('victoria_ajustada');
  });

  it('classifies narrow defeat between 0 and -15%', () => {
    expect(duelResult(90, 100, false).tag).toBe('derrota_ajustada');
  });

  it('classifies clear defeat below -15%', () => {
    expect(duelResult(80, 100, false).tag).toBe('derrota');
  });

  it('a tie counts as narrow defeat', () => {
    expect(duelResult(100, 100, false).tag).toBe('derrota_ajustada');
  });
});

describe('rivalRating', () => {
  it('stays within 0–100 for every rival', () => {
    for (const rival of getAllLinksRivales()) {
      const rating = rivalRating(rival);
      expect(rating, rival.id).toBeGreaterThan(0);
      expect(rating, rival.id).toBeLessThanOrEqual(100);
    }
  });
});

describe('simularTorneo', () => {
  const fullBuild = Object.fromEntries(SLOT_KEYS.map(slot => [slot, ITEM_TYPES[slot][0]]));

  it('plays one round per rival', () => {
    const res = simularTorneo(fullBuild, 'normal');
    expect(res.totalRondas).toBe(getAllLinksRivales().length);
    expect(res.combatLog).toHaveLength(res.totalRondas);
  });

  it('total points equal the sum of round points and never exceed the max', () => {
    const res = simularTorneo(fullBuild, 'normal');
    const sum = res.combatLog.reduce((acc, c) => acc + c.puntosRonda, 0);
    expect(res.linkStats.puntos).toBe(sum);
    expect(res.linkStats.puntos).toBeLessThanOrEqual(res.maxPuntos);
    expect(res.maxPuntos).toBe(res.totalRondas * PUNTOS_DUELO.victoria_clara);
  });

  it('wins, defeats and KOs add up to the number of rounds', () => {
    const res = simularTorneo(fullBuild, 'leyenda');
    const { victoriasLink, derrotasLink, kos } = res.linkStats;
    expect(victoriasLink + derrotasLink + kos).toBe(res.totalRondas);
  });

  it('falls back to normal difficulty for unknown values', () => {
    expect(() => simularTorneo(fullBuild, 'no_such_difficulty')).not.toThrow();
  });

  it('every combat log entry carries a known duel tag', () => {
    const tags = Object.keys(PUNTOS_DUELO);
    const res = simularTorneo(fullBuild, 'explorador');
    for (const c of res.combatLog) {
      expect(tags).toContain(c.duelo.tag);
    }
  });
});
