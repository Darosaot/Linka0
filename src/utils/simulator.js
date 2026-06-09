import { getAllMazmorras } from './dataQueries.js';
import { calcTeamRating } from './ratingEngine.js';
import { buildLinksRivales } from './rivalBuilder.js';

const PUNTOS_DUELO = { victoria_clara: 25, victoria_ajustada: 18, derrota_ajustada: 8, derrota: 4, ko: 0 };

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


function calcProbKO() {
  return 0.05; // 5% fixed KO chance per round
}

function rivalBaseRating(rival) {
  const { poder = 0, defensa = 0, agilidad = 0, magia = 0, resistencia = 0 } = rival.attributes;
  return Math.round(poder * 0.35 + defensa * 0.20 + agilidad * 0.25 + magia * 0.15 + resistencia * 0.05);
}

function duelResult(linkPerf, rivalPerf, ko) {
  if (ko) return { tag: 'ko', puntos: PUNTOS_DUELO.ko, label: '💀 K.O.' };
  const diff = (linkPerf - rivalPerf) / Math.max(rivalPerf, 1);
  if (diff > 0.15)  return { tag: 'victoria_clara',    puntos: PUNTOS_DUELO.victoria_clara,    label: '🏆 Victoria' };
  if (diff > 0)     return { tag: 'victoria_ajustada', puntos: PUNTOS_DUELO.victoria_ajustada, label: '⚔️ Victoria ajustada' };
  if (diff > -0.15) return { tag: 'derrota_ajustada',  puntos: PUNTOS_DUELO.derrota_ajustada,  label: '🛡️ Resistió' };
  return              { tag: 'derrota',               puntos: PUNTOS_DUELO.derrota,            label: '❌ Derrota' };
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
    kos: 0,
  };
  const combatLog = [];

  for (const rival of rivales) {
    const mazmorra = allMazmorras[Math.floor(Math.random() * allMazmorras.length)];
    const ko = Math.random() < calcProbKO();

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

    combatLog.push({
      rival: { name: rival.name, alias: rival.alias, emoji: rival.emoji, game: rival.game, year: rival.year, equipamiento: rival.equipamiento },
      mazmorra: mazmorra.name,
      arenaEmoji: mazmorra.emoji,
      duelo,
      puntosRonda: duelo.puntos,
      rivalRating: rivalBaseRating(rival),
      duelDesc: makeDuelDesc(duelo.tag, 'Link', rival.name, rival.game),
      cardStyle: roundStyle(duelo.tag),
    });
  }

  const maxPuntos = rivales.length * PUNTOS_DUELO.victoria_clara;

  const rivalAvgRating = Math.round(
    rivales.reduce((sum, r) => {
      const { poder = 0, defensa = 0, agilidad = 0, magia = 0, resistencia = 0 } = r.attributes;
      return sum + (poder * 0.35 + defensa * 0.20 + agilidad * 0.25 + magia * 0.15 + resistencia * 0.05);
    }, 0) / rivales.length
  );

  return {
    combatLog,
    linkStats,
    totalRondas: rivales.length,
    maxPuntos,
    rivalAvgRating,
  };
}
