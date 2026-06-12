import { getAllMazmorras } from './dataQueries.js';
import { calcTeamRating, calcBuildProfile } from './ratingEngine.js';
import { calcSetMultiplier } from './setEngine.js';
import { terrainScore, favoredStat } from './simulator.js';

// Head-to-head engine for the online cup: two player builds fight a
// best-of-N series across random dungeons. Unlike the solo tournament,
// both sides use the exact same formula (no difficulty multiplier, no
// ambushes, no KOs) and all randomness flows through a seeded RNG so the
// server simulates the bracket once and every client sees the same result.

export const RONDAS_DUELO = 5;

const TERRAIN_BLEND = 0.4;
const VARIANCE = 14;

// mulberry32: tiny deterministic PRNG, good enough for game simulation
export function createRng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function fighterPerf(fighter, mazmorra, rng) {
  const effective = fighter.base * (1 - TERRAIN_BLEND) + terrainScore(fighter.profile, mazmorra.modifiers) * TERRAIN_BLEND;
  const rainBonus = rng() < mazmorra.modifiers.lluvia_probability && fighter.hasBotas ? 3 : 0;
  const variance = (rng() - 0.5) * VARIANCE;
  return Math.max(0, effective * fighter.setMult + rainBonus + variance);
}

function makeFighter(build) {
  return {
    base: calcTeamRating(build),
    profile: calcBuildProfile(build),
    setMult: calcSetMultiplier(build),
    hasBotas: Boolean(build.botas),
  };
}

// Simulates a best-of-RONDAS_DUELO duel. Returns per-round detail and the
// winner index (0 = buildA, 1 = buildB). Ties per round go to the higher
// overall rating, so a series can never end level.
export function simularDuelo(buildA, buildB, rng) {
  const mazmorras = getAllMazmorras();
  const fighters = [makeFighter(buildA), makeFighter(buildB)];
  const rondas = [];
  const winsPerSide = [0, 0];

  for (let i = 0; i < RONDAS_DUELO; i++) {
    const mazmorra = mazmorras[Math.floor(rng() * mazmorras.length)];
    const perfA = fighterPerf(fighters[0], mazmorra, rng);
    const perfB = fighterPerf(fighters[1], mazmorra, rng);
    const ganador = perfA > perfB ? 0 : perfB > perfA ? 1 : (fighters[0].base >= fighters[1].base ? 0 : 1);
    winsPerSide[ganador]++;
    rondas.push({
      mazmorra: mazmorra.name,
      arenaEmoji: mazmorra.emoji,
      favorece: favoredStat(mazmorra.modifiers),
      perfA: Math.round(perfA),
      perfB: Math.round(perfB),
      ganador,
    });
  }

  const ganador = winsPerSide[0] > winsPerSide[1] ? 0 : 1;
  return { rondas, marcador: winsPerSide, ganador };
}

// Single-elimination bracket over 4 or 8 participants:
// [{ id, name, emoji, isCpu, build }]. Participants are paired in the
// given order (the caller shuffles with the same rng for fair seeding).
// Returns rounds of ties, each tie carrying the duel detail.
export function simularCopa(participants, seed) {
  const rng = createRng(seed);
  const rounds = [];
  let alive = [...participants];

  while (alive.length > 1) {
    const ties = [];
    const next = [];
    for (let i = 0; i < alive.length; i += 2) {
      const [pa, pb] = [alive[i], alive[i + 1]];
      const duelo = simularDuelo(pa.build, pb.build, rng);
      const winner = duelo.ganador === 0 ? pa : pb;
      ties.push({ a: pa.id, b: pb.id, duelo, ganadorId: winner.id });
      next.push(winner);
    }
    rounds.push(ties);
    alive = next;
  }

  return { rounds, campeonId: alive[0].id };
}
