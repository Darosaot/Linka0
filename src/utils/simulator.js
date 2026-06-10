import { getAllMazmorras } from './dataQueries.js';
import { calcTeamRating } from './ratingEngine.js';
import { buildLinksRivales } from './rivalBuilder.js';
import { calcSetMultiplier, getActiveSets } from './setEngine.js';

export const PUNTOS_DUELO = { victoria_clara: 25, victoria_ajustada: 18, derrota_ajustada: 8, derrota: 4, ko: 0 };

const DIFICULTAD_MULT = { explorador: 0.80, normal: 1.00, leyenda: 1.22 };

const PROB_KO = 0.05; // 5% fixed KO chance per round

function avgModifier(mods) {
  return (mods.fuerza_weight + mods.defensa_weight + mods.agilidad_weight + mods.magia_weight) / 4;
}

export function rivalRating(rival) {
  const { poder = 0, defensa = 0, agilidad = 0, magia = 0, resistencia = 0 } = rival.attributes;
  return poder * 0.35 + defensa * 0.20 + agilidad * 0.25 + magia * 0.15 + resistencia * 0.05;
}

function calcLinkPerf(build, mazmorra, setMult) {
  const base = calcTeamRating(build);
  const mod = avgModifier(mazmorra.modifiers);
  const rainBonus = Math.random() < mazmorra.modifiers.lluvia_probability && build.botas ? 3 : 0;
  const variance = (Math.random() - 0.5) * 18;
  return Math.max(0, base * mod * setMult + rainBonus + variance);
}

function calcRivalLinkPerf(rival, mazmorra, dificultadMult) {
  const base = rivalRating(rival);
  const mod = avgModifier(mazmorra.modifiers);
  const ambushBonus = Math.random() < mazmorra.modifiers.emboscada_probability ? 4 : 0;
  const variance = (Math.random() - 0.5) * 16;
  return Math.max(0, base * mod * dificultadMult + ambushBonus + variance);
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

  for (const rival of rivales) {
    const mazmorra = allMazmorras[Math.floor(Math.random() * allMazmorras.length)];
    const ko = Math.random() < PROB_KO;

    const linkPerfDuel = ko ? -1 : calcLinkPerf(build, mazmorra, setMult);
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
