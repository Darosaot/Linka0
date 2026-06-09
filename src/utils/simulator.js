import { getAllMazmorras, getJefeById } from './dataQueries.js';
import { calcTeamRating } from './ratingEngine.js';
import { buildLinksRivales } from './rivalBuilder.js';

// Points for duel vs rival Link
const PUNTOS_DUELO = { victoria_clara: 25, victoria_ajustada: 18, derrota_ajustada: 8, derrota: 4, ko: 0 };
// Points for boss fight
const PUNTOS_JEFE = { victoria: 15, resistencia: 8, derrota: 4, ko: 0 };

const DIFICULTAD_MULT = { explorador: 0.80, normal: 1.00, leyenda: 1.22 };

function avgModifier(mods) {
  return (mods.fuerza_weight + mods.defensa_weight + mods.agilidad_weight + mods.magia_weight) / 4;
}

function calcLinkPerf(build, mazmorra) {
  const base = calcTeamRating(build);
  const mod = avgModifier(mazmorra.modifiers);
  const rainBonus = Math.random() < mazmorra.modifiers.lluvia_probability && build.botas ? 3 : 0;
  const variance = (Math.random() - 0.5) * 18;
  return Math.max(0, base * mod + rainBonus + variance);
}

function calcRivalLinkPerf(rival, mazmorra, dificultadMult) {
  const { poder = 0, defensa = 0, agilidad = 0, magia = 0, resistencia = 0 } = rival.attributes;
  const base = poder * 0.35 + defensa * 0.20 + agilidad * 0.25 + magia * 0.15 + resistencia * 0.05;
  const mod = avgModifier(mazmorra.modifiers);
  const ambushBonus = Math.random() < mazmorra.modifiers.emboscada_probability ? 4 : 0;
  const variance = (Math.random() - 0.5) * 16;
  return Math.max(0, base * mod * dificultadMult + ambushBonus + variance);
}

function calcBossPerf(jefe, mazmorra, dificultadMult) {
  const { fuerza = 0, defensa = 0, magia = 0, resistencia = 0, velocidad = 0 } = jefe.attributes;
  const base = fuerza * 0.30 + defensa * 0.20 + magia * 0.25 + resistencia * 0.15 + velocidad * 0.10;
  const mod = avgModifier(mazmorra.modifiers);
  const variance = (Math.random() - 0.5) * 14;
  return Math.max(0, base * mod * dificultadMult * 1.3 + variance);
}

function calcProbKO(build) {
  const corazones = build.corazones ?? 50;
  return Math.max(0.02, (100 - corazones) / 100 * 0.12);
}

function duelResult(linkPerf, rivalPerf, ko) {
  if (ko) return { tag: 'ko', puntos: PUNTOS_DUELO.ko, label: '💀 K.O.' };
  const diff = (linkPerf - rivalPerf) / Math.max(rivalPerf, 1);
  if (diff > 0.15)  return { tag: 'victoria_clara',    puntos: PUNTOS_DUELO.victoria_clara,    label: '🏆 Victoria' };
  if (diff > 0)     return { tag: 'victoria_ajustada', puntos: PUNTOS_DUELO.victoria_ajustada, label: '⚔️ Victoria ajustada' };
  if (diff > -0.15) return { tag: 'derrota_ajustada',  puntos: PUNTOS_DUELO.derrota_ajustada,  label: '🛡️ Resistió' };
  return              { tag: 'derrota',               puntos: PUNTOS_DUELO.derrota,            label: '❌ Derrota' };
}

function bossResult(linkPerf, bossPerf, ko) {
  if (ko) return { tag: 'ko', puntos: PUNTOS_JEFE.ko, label: '💀 K.O.' };
  const diff = (linkPerf - bossPerf) / Math.max(bossPerf, 1);
  if (diff > 0)      return { tag: 'victoria',   puntos: PUNTOS_JEFE.victoria,   label: '🏆 Jefe derrotado' };
  if (diff > -0.20)  return { tag: 'resistencia', puntos: PUNTOS_JEFE.resistencia, label: '🛡️ Resistió al jefe' };
  return               { tag: 'derrota',         puntos: PUNTOS_JEFE.derrota,     label: '❌ Derrotado por el jefe' };
}

function makeDuelDesc(tag, linkName, rivalName, game) {
  switch (tag) {
    case 'victoria_clara':    return `🏆 Link arrasó a ${rivalName}. El equipamiento elegido fue claramente superior al de ${game}.`;
    case 'victoria_ajustada': return `⚔️ Victoria ajustada sobre ${rivalName}. Ambos Links estaban al límite, pero el nuestro salió victorioso.`;
    case 'derrota_ajustada':  return `🛡️ ${rivalName} ganó por los pelos. El Link de ${game} contaba con una ventaja de equipamiento mínima.`;
    case 'derrota':           return `❌ ${rivalName} dominó el combate. El equipamiento de ${game} fue claramente superior.`;
    case 'ko':                return `💀 K.O. fulminante. ${rivalName} no dejó a Link ni reaccionar.`;
    default:                  return '';
  }
}

function makeBossDesc(tag, jefeName) {
  switch (tag) {
    case 'victoria':   return `🏆 ¡${jefeName} derrotado! Link venció al guardián definitivo de la era.`;
    case 'resistencia': return `🛡️ ${jefeName} resistió, pero Link sobrevivió para contarlo. Cerca.`;
    case 'derrota':    return `❌ ${jefeName} fue demasiado poderoso. Link no pudo terminar el combate.`;
    case 'ko':         return `💀 ${jefeName} eliminó a Link antes de que pudiera intentarlo.`;
    default:           return '';
  }
}

// Map duel tag → card border color class
function roundStyle(duelTag) {
  if (duelTag === 'victoria_clara')    return 'border-amber-400 bg-amber-50';
  if (duelTag === 'victoria_ajustada') return 'border-green-400 bg-green-50';
  if (duelTag === 'derrota_ajustada')  return 'border-zelda-border bg-white';
  if (duelTag === 'derrota')           return 'border-red-400 bg-red-50';
  if (duelTag === 'ko')                return 'border-red-600 bg-red-100';
  return 'border-zelda-border bg-white';
}

export function simularTorneo(build, _era, dificultad = 'normal') {
  const allMazmorras = getAllMazmorras();
  const rivales = buildLinksRivales();
  const dificultadMult = DIFICULTAD_MULT[dificultad] ?? 1.0;

  const linkStats = {
    puntos: 0,
    victoriasLink: 0,
    derrotasLink: 0,
    jefesVencidos: 0,
    kos: 0,
  };
  const combatLog = [];

  for (const rival of rivales) {
    // Pick a random mazmorra as the arena for this round
    const mazmorra = allMazmorras[Math.floor(Math.random() * allMazmorras.length)];
    const ko = Math.random() < calcProbKO(build);

    // --- Duel vs rival Link ---
    const linkPerfDuel = ko ? -1 : calcLinkPerf(build, mazmorra);
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

    // --- Boss fight ---
    const jefe = getJefeById(rival.boss_id);
    let boss = null;
    if (jefe) {
      const linkPerfBoss = ko ? -1 : calcLinkPerf(build, mazmorra);
      const jefePerf = calcBossPerf(jefe, mazmorra, dificultadMult);
      boss = bossResult(linkPerfBoss, jefePerf, ko);
      linkStats.puntos += boss.puntos;
      if (boss.tag === 'victoria') linkStats.jefesVencidos++;
    }

    combatLog.push({
      rival: { name: rival.name, alias: rival.alias, emoji: rival.emoji, game: rival.game, year: rival.year, equipamiento: rival.equipamiento },
      jefe: jefe ? { name: jefe.name, emoji: jefe.emoji } : null,
      mazmorra: mazmorra.name,
      arenaEmoji: mazmorra.emoji,
      duelo,
      boss,
      puntosRonda: duelo.puntos + (boss?.puntos ?? 0),
      duelDesc: makeDuelDesc(duelo.tag, 'Link', rival.name, rival.game),
      bossDesc: jefe ? makeBossDesc(boss.tag, jefe.name) : null,
      cardStyle: roundStyle(duelo.tag),
    });
  }

  const maxPuntos = rivales.length * (PUNTOS_DUELO.victoria_clara + PUNTOS_JEFE.victoria);

  return {
    combatLog,
    linkStats,
    totalRondas: rivales.length,
    maxPuntos,
  };
}
