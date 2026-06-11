import { describe, it, expect } from 'vitest';
import { duelResult, rivalRating, rivalProfile, terrainScore, favoredStat, simularTorneo, PUNTOS_DUELO } from './simulator.js';
import { getAllLinksRivales, getAllMazmorras, ITEM_TYPES } from './dataQueries.js';
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

describe('terrain', () => {
  it('terrainScore rewards the stats the dungeon weighs most', () => {
    const mods = { fuerza_weight: 1.0, defensa_weight: 0.5, agilidad_weight: 0.5, magia_weight: 0.5 };
    const bruiser = { fuerza: 90, defensa: 50, agilidad: 50, magia: 50 };
    const mage = { fuerza: 50, defensa: 50, agilidad: 50, magia: 90 };
    expect(terrainScore(bruiser, mods)).toBeGreaterThan(terrainScore(mage, mods));
  });

  it('favoredStat picks the highest-weighted dimension of every dungeon', () => {
    for (const maz of getAllMazmorras()) {
      const stat = favoredStat(maz.modifiers);
      expect(['fuerza', 'defensa', 'agilidad', 'magia']).toContain(stat);
      const weights = {
        fuerza: maz.modifiers.fuerza_weight,
        defensa: maz.modifiers.defensa_weight,
        agilidad: maz.modifiers.agilidad_weight,
        magia: maz.modifiers.magia_weight,
      };
      expect(weights[stat], maz.id).toBe(Math.max(...Object.values(weights)));
    }
  });

  it('rivalProfile maps rival attributes onto the four dungeon dimensions', () => {
    for (const rival of getAllLinksRivales()) {
      const profile = rivalProfile(rival);
      expect(profile.fuerza).toBe(rival.attributes.poder);
      expect(profile.magia).toBe(rival.attributes.magia);
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

  it('every combat log entry reports the terrain affinity duel', () => {
    const res = simularTorneo(fullBuild, 'normal');
    for (const c of res.combatLog) {
      expect(['fuerza', 'defensa', 'agilidad', 'magia']).toContain(c.terreno.favorece);
      expect(c.terreno.linkAfinidad).toBeTypeOf('number');
      expect(c.terreno.rivalAfinidad).toBeTypeOf('number');
    }
  });
});
