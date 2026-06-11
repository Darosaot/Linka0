import { getAllMazmorras } from './dataQueries.js';
import { calcTeamRating, calcBuildProfile } from './ratingEngine.js';
import { buildLinksRivales } from './rivalBuilder.js';
import { calcSetMultiplier, getActiveSets } from './setEngine.js';

export const PUNTOS_DUELO = { victoria_clara: 25, victoria_ajustada: 18, derrota_ajustada: 8, derrota: 4, ko: 0 };

// Tuned via Monte Carlo (see balance.test.js): a player who drafts well
// should comfortably win on explorador, fight for Campeón/Héroe on normal,
// and need completed sets to stand a chance on leyenda.
const DIFICULTAD_MULT = { explorador: 0.78, normal: 0.92, leyenda: 1.10 };

const PROB_KO = 0.05; // 5% fixed KO chance per round

// How much of each fighter's performance comes from terrain affinity (the
// dungeon's stat weights crossed with their profile) vs overall rating.
const TERRAIN_BLEND = 0.4;

export function rivalRating(rival) {
  const { poder = 0, defensa = 0, agilidad = 0, magia = 0, resistencia = 0 } = rival.attributes;
  return poder * 0.35 + defensa * 0.20 + agilidad * 0.25 + magia * 0.15 + resistencia * 0.05;
}

// Weighted average of a fighter's profile using the dungeon's stat weights:
// high when the fighter is strong in the stats this dungeon rewards.
export function terrainScore(profile, mods) {
  const weighted =
    profile.fuerza * mods.fuerza_weight +
    profile.defensa * mods.defensa_weight +
    profile.agilidad * mods.agilidad_weight +
    profile.magia * mods.magia_weight;
  const totalWeight = mods.fuerza_weight + mods.defensa_weight + mods.agilidad_weight + mods.magia_weight;
  return totalWeight > 0 ? weighted / totalWeight : 0;
}

export function rivalProfile(rival) {
  const { poder = 0, defensa = 0, agilidad = 0, magia = 0 } = rival.attributes;
  return { fuerza: poder, defensa, agilidad, magia };
}

// The dungeon dimension that matters most for this duel
export function favoredStat(mods) {
  const entries = [
    ['fuerza', mods.fuerza_weight],
    ['defensa', mods.defensa_weight],
    ['agilidad', mods.agilidad_weight],
    ['magia', mods.magia_weight],
  ];
  return entries.reduce((best, e) => (e[1] > best[1] ? e : best))[0];
}

function calcLinkPerf(base, terrain, mazmorra, setMult, hasBotas) {
  const effective = base * (1 - TERRAIN_BLEND) + terrain * TERRAIN_BLEND;
  const rainBonus = Math.random() < mazmorra.modifiers.lluvia_probability && hasBotas ? 3 : 0;
  const variance = (Math.random() - 0.5) * 14;
  return Math.max(0, effective * setMult + rainBonus + variance);
}

function calcRivalLinkPerf(rival, mazmorra, dificultadMult) {
  const base = rivalRating(rival);
  const terrain = terrainScore(rivalProfile(rival), mazmorra.modifiers);
  const effective = base * (1 - TERRAIN_BLEND) + terrain * TERRAIN_BLEND;
  const ambushBonus = Math.random() < mazmorra.modifiers.emboscada_probability ? 4 : 0;
  const variance = (Math.random() - 0.5) * 12;
  return Math.max(0, effective * dificultadMult + ambushBonus + variance);
}

export function duelResult(linkPerf, rivalPerf, ko) {
  if (ko) return { tag: 'ko', puntos: PUNTOS_DUELO.ko };
  const diff = (linkPerf - rivalPerf) / Math.max(rivalPerf, 1);
  if (diff > 0.15)  return { tag: 'victoria_clara',    puntos: PUNTOS_DUELO.victoria_clara };
  if (diff > 0)     return { tag: 'victoria_ajustada', puntos: PUNTOS_DUELO.victoria_ajustada };
  if (diff > -0.15) return { tag: 'derrota_ajustada',  puntos: PUNTOS_DUELO.derrota_ajustada };
  return              { tag: 'derrota',               puntos: PUNTOS_DUELO.derrota };
}

export function simularTorneo(build, dificultad = 'normal') {
  const allMazmorras = getAllMazmorras();
  const rivales = buildLinksRivales();
  const dificultadMult = DIFICULTAD_MULT[dificultad] ?? 1.0;

  const linkStats = {
    puntos: 0,
    victoriasLink: 0,
    derrotasLink: 0,
    kos: 0,
  };
  const combatLog = [];
  const setMult = calcSetMultiplier(build);
  const linkBase = calcTeamRating(build);
  const linkProfile = calcBuildProfile(build);

  for (const rival of rivales) {
    const mazmorra = allMazmorras[Math.floor(Math.random() * allMazmorras.length)];
    const ko = Math.random() < PROB_KO;

    const linkTerrain = terrainScore(linkProfile, mazmorra.modifiers);
    const rivalTerrain = terrainScore(rivalProfile(rival), mazmorra.modifiers);
    const linkPerfDuel = ko ? -1 : calcLinkPerf(linkBase, linkTerrain, mazmorra, setMult, Boolean(build.botas));
    const rivalPerf = calcRivalLinkPerf(rival, mazmorra, dificultadMult);
    const duelo = duelResult(linkPerfDuel, rivalPerf, ko);

    linkStats.puntos += duelo.puntos;
    if (ko) {
      linkStats.kos++;
    } else if (duelo.tag === 'victoria_clara' || duelo.tag === 'victoria_ajustada') {
      linkStats.victoriasLink++;
    } else {
      linkStats.derrotasLink++;
    }

    combatLog.push({
      rival: { name: rival.name, alias: rival.alias, emoji: rival.emoji, game: rival.game, year: rival.year, equipamiento: rival.equipamiento },
      mazmorra: mazmorra.name,
      arenaEmoji: mazmorra.emoji,
      terreno: {
        favorece: favoredStat(mazmorra.modifiers),
        linkAfinidad: Math.round(linkTerrain),
        rivalAfinidad: Math.round(rivalTerrain),
      },
      duelo,
      puntosRonda: duelo.puntos,
      rivalRating: Math.round(rivalRating(rival)),
    });
  }

  const maxPuntos = rivales.length * PUNTOS_DUELO.victoria_clara;

  const rivalAvgRating = Math.round(
    rivales.reduce((sum, r) => sum + rivalRating(r), 0) / rivales.length
  );

  return {
    combatLog,
    linkStats,
    totalRondas: rivales.length,
    maxPuntos,
    rivalAvgRating,
    activeSets: getActiveSets(build),
  };
}
