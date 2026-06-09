import { getAllMazmorras, getJefeById } from './dataQueries.js';
import { calcTeamRating } from './ratingEngine.js';
import { buildBokoblinRivalesForEra } from './rivalBuilder.js';

const PUNTOS_TRIFORCE = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1, 0, 0, 0, 0, 0];
const BOSS_BONUS = [15, 8, 4, 0]; // victoria, resistencia, derrota, ko

const DIFICULTAD_MULT = {
  explorador: 0.82,
  normal: 1.00,
  leyenda: 1.18,
};

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

function calcBokoblinPerf(bokoblin, mazmorra, dificultadMult) {
  const { fuerza = 0, defensa = 0, agilidad = 0, astucia = 0, resistencia = 0 } = bokoblin.attributes;
  const base = fuerza * 0.35 + defensa * 0.20 + agilidad * 0.25 + astucia * 0.15 + resistencia * 0.05;
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
  // Bosses are naturally harder — 1.3x multiplier
  return Math.max(0, base * mod * dificultadMult * 1.3 + variance);
}

function calcProbKO(build) {
  const corazones = build.corazones ?? 50;
  return Math.max(0.02, (100 - corazones) / 100 * 0.13);
}

function makeBossDescription(linkPerf, bossPerf, jefe, ko) {
  if (ko) return `💀 ¡${jefe.name} venció a Link! El jefe era demasiado poderoso esta vez.`;
  if (linkPerf > bossPerf * 1.2) return `🏆 ¡Victoria sobre ${jefe.name}! Link dominó la batalla sin apenas recibir daño.`;
  if (linkPerf > bossPerf) return `⚔️ ¡${jefe.name} derrotado! Fue un combate reñido, pero el héroe prevaleció.`;
  if (linkPerf > bossPerf * 0.75) return `🛡️ ${jefe.name} resistió la embestida. Link sobrevivió pero no pudo terminar el combate.`;
  return `💀 ${jefe.name} fue demasiado para Link esta vez. El jefe sigue en pie.`;
}

function makeDescription(linkPos, mazmorra, ko, topRivalName) {
  if (ko) {
    return `💀 K.O. en ${mazmorra.name}. ${topRivalName} tendió una emboscada perfecta antes de que Link pudiera reaccionar.`;
  }
  if (linkPos === 1) {
    return `🏆 ¡Primer puesto en ${mazmorra.name}! Link dominó el combate y no dejó opciones a sus rivales.`;
  }
  if (linkPos === 2) {
    return `🥈 Segundo puesto en ${mazmorra.name}. ${topRivalName} fue imparable, pero Link se llevó un sólido resultado.`;
  }
  if (linkPos === 3) {
    return `🥉 Tercer puesto en ${mazmorra.name}. Un buen resultado, aunque quedó algo lejos del ganador.`;
  }
  if (linkPos <= 6) {
    return `⚠️ ${linkPos}º puesto en ${mazmorra.name}. Los Bokoblins más poderosos superaron a Link esta vez.`;
  }
  return `❌ ${linkPos}º puesto en ${mazmorra.name}. Una jornada muy dura — el equipo no fue suficiente aquí.`;
}

function resultadoTag(linkPos, ko) {
  if (ko) return 'ko';
  if (linkPos === 1) return 'victoria';
  if (linkPos <= 3) return 'podio';
  if (linkPos <= 6) return 'neutral';
  return 'derrota';
}

export function simularTorneo(build, era, dificultad = 'normal') {
  const allMazmorras = getAllMazmorras();
  const mazmorras = [...allMazmorras].sort(() => Math.random() - 0.5).slice(0, 10);
  const rivales = buildBokoblinRivalesForEra(era, 10);
  const dificultadMult = DIFICULTAD_MULT[dificultad] ?? 1.0;

  const linkStats = { puntos: 0, victorias: 0, podios: 0, kos: 0, derrotas: 0, jefesVencidos: 0 };
  const rivalStandings = rivales.map(b => ({ ...b, puntos: 0, victorias: 0 }));
  const combatLog = [];

  for (const mazmorra of mazmorras) {
    const ko = Math.random() < calcProbKO(build);
    const linkPerf = ko ? -1 : calcLinkPerf(build, mazmorra);
    const bokoblinPerfs = rivales.map(b => calcBokoblinPerf(b, mazmorra, dificultadMult));

    // Full-field sort
    const allPerfs = [
      { id: 'link', name: 'Link', perf: linkPerf, ko },
      ...rivales.map((b, i) => ({ id: b.id, name: b.name, perf: bokoblinPerfs[i], ko: false })),
    ].sort((a, b) => {
      if (a.ko && b.ko) return 0;
      if (a.ko) return 1;
      if (b.ko) return -1;
      return b.perf - a.perf;
    });

    allPerfs.forEach((p, posIdx) => {
      const pts = p.ko ? 0 : (PUNTOS_TRIFORCE[posIdx] ?? 0);
      if (p.id === 'link') {
        linkStats.puntos += pts;
        if (!ko && posIdx === 0) linkStats.victorias++;
        if (!ko && posIdx < 3) linkStats.podios++;
        if (ko) linkStats.kos++;
        if (!ko && posIdx >= 6) linkStats.derrotas++;
      } else {
        const rs = rivalStandings.find(r => r.id === p.id);
        if (rs) {
          rs.puntos += pts;
          if (posIdx === 0) rs.victorias++;
        }
      }
    });

    const linkPos = allPerfs.findIndex(p => p.id === 'link') + 1;
    const topRival = allPerfs.find(p => p.id !== 'link');
    const puntosRonda = ko ? 0 : (PUNTOS_TRIFORCE[linkPos - 1] ?? 0);

    // Boss combat
    let bossResult = null;
    const jefe = mazmorra.boss_id ? getJefeById(mazmorra.boss_id) : null;
    if (jefe && !ko) {
      const linkBossPerf = calcLinkPerf(build, mazmorra);
      const bossPerf = calcBossPerf(jefe, mazmorra, dificultadMult);
      const bossVictoria = linkBossPerf > bossPerf;
      const bossResistencia = !bossVictoria && linkBossPerf > bossPerf * 0.75;
      let bossBonus = 0;
      if (bossVictoria) { bossBonus = BOSS_BONUS[0]; linkStats.jefesVencidos++; }
      else if (bossResistencia) bossBonus = BOSS_BONUS[1];
      else bossBonus = BOSS_BONUS[2];
      linkStats.puntos += bossBonus;
      bossResult = {
        jefe: jefe.name,
        emoji: jefe.emoji,
        victoria: bossVictoria,
        resistencia: bossResistencia,
        bonus: bossBonus,
        descripcion: makeBossDescription(linkBossPerf, bossPerf, jefe, false),
      };
    } else if (jefe && ko) {
      bossResult = {
        jefe: jefe.name,
        emoji: jefe.emoji,
        victoria: false,
        resistencia: false,
        bonus: 0,
        descripcion: makeBossDescription(0, 1, jefe, true),
      };
    }

    combatLog.push({
      mazmorra: mazmorra.name,
      emoji: mazmorra.emoji,
      linkPos,
      ko,
      puntos: puntosRonda,
      topRival: topRival?.name ?? '???',
      resultado: resultadoTag(linkPos, ko),
      descripcion: makeDescription(linkPos, mazmorra, ko, topRival?.name ?? 'un Bokoblin'),
      bossResult,
    });
  }

  const clasificacion = [
    { name: 'Link', isLink: true, ...linkStats },
    ...rivalStandings,
  ].sort((a, b) => b.puntos - a.puntos);

  const linkClasifPos = clasificacion.findIndex(c => c.isLink) + 1;

  return {
    combatLog,
    clasificacion,
    linkPos: linkClasifPos,
    linkStats,
    totalCombates: mazmorras.length,
  };
}
