import { getAllMazmorras } from './dataQueries.js';
import { SLOT_WEIGHTS, calcSlotScore } from './ratingEngine.js';
import { buildBokoblinRivalesForEra, bokoblinRating } from './rivalBuilder.js';

const PUNTOS_TRIFORCE = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

function calcLinkPerf(build, mazmorra) {
  const espada = build.espada1;
  const armadura = build.armadura;
  const botas = build.botas;
  const habilidad = build.habilidad;
  const companero = build.companero;
  const arco = build.arco;
  const rupias = build.rupias ?? 50;
  const corazones = build.corazones ?? 50;

  // Weapon part
  let armaPart = 0;
  if (espada) {
    const { poder = 0, velocidad = 0, alcance = 0 } = espada.attributes;
    armaPart = poder * 0.45 + velocidad * 0.30 + alcance * 0.25;
    armaPart *= mazmorra.modifiers.fuerza_weight;
  }

  // Defense part
  let defensaPart = 0;
  if (armadura) {
    const { defensa = 0, durabilidad = 0 } = armadura.attributes;
    const agilidadBonus = botas ? botas.attributes.agilidad * 0.20 : 0;
    defensaPart = defensa * 0.50 + durabilidad * 0.30 + agilidadBonus;
    defensaPart *= mazmorra.modifiers.defensa_weight;
  }

  // Skill part
  let habilidadPart = 0;
  if (habilidad) {
    const { poder: hp = 0, versatilidad = 0 } = habilidad.attributes;
    const companeroBonus = companero ? companero.bonus * 0.35 : 0;
    const arcoPrecision = arco ? arco.attributes.precision * 0.25 : 0;
    habilidadPart = hp * 0.40 + companeroBonus + arcoPrecision;
    habilidadPart *= mazmorra.modifiers.magia_weight;
  }

  let basePerf = (armaPart + defensaPart + habilidadPart) / 3;

  // Agility modifier
  if (botas) {
    basePerf *= (1 + (botas.attributes.agilidad - 50) / 200 * mazmorra.modifiers.agilidad_weight);
  }

  // Rain bonus (like wet performance)
  if (Math.random() < mazmorra.modifiers.lluvia_probability) {
    basePerf *= 1.05;
  }

  // Rupias budget bonus
  basePerf += (rupias - 50) * 0.05;

  // Consistency variance based on hearts
  const varianza = (Math.random() - 0.5) * 8 * (1 - corazones / 100);
  return Math.max(0, basePerf + varianza);
}

function calcBokoblinPerf(bokoblin, mazmorra) {
  const { fuerza = 0, agilidad = 0, astucia = 0, defensa = 0, resistencia = 0 } = bokoblin.attributes;

  let perf =
    fuerza   * mazmorra.modifiers.fuerza_weight   * 0.35 +
    defensa  * mazmorra.modifiers.defensa_weight  * 0.20 +
    agilidad * mazmorra.modifiers.agilidad_weight * 0.25 +
    astucia  * mazmorra.modifiers.magia_weight    * 0.15 +
    resistencia                                   * 0.05;

  // Emboscada (ambush) bonus
  if (Math.random() < mazmorra.modifiers.emboscada_probability) {
    perf *= 1.08;
  }

  // Random variance ±12%
  perf *= 0.88 + Math.random() * 0.24;
  return Math.max(0, perf);
}

function calcProbKO(build) {
  const corazones = build.corazones ?? 50;
  return Math.max(0.02, (100 - corazones) / 100 * 0.16);
}

function getLinknQualifyingPos(build, mazmorra, bokoblins) {
  const qualifier = build.espada1
    ? build.espada1.attributes.poder * 0.52 +
      (build.espada1.attributes.velocidad || 0) * 0.18 +
      (build.armadura ? build.armadura.attributes.defensa : 0) * 0.15 +
      (build.arco ? build.arco.attributes.precision : 0) * 0.15
    : 30;

  const bokoblinQuali = bokoblins.map(b =>
    b.attributes.fuerza * 0.6 + b.attributes.agilidad * 0.4 + (Math.random() - 0.5) * 8
  );

  const allPerfs = [{ name: 'Link', perf: qualifier + (Math.random() - 0.5) * 6 }, ...bokoblinQuali.map((p, i) => ({ name: bokoblins[i].name, perf: p }))];
  allPerfs.sort((a, b) => b.perf - a.perf);
  return allPerfs.findIndex(p => p.name === 'Link') + 1;
}

function gridBonus(pos) {
  if (pos === 1) return 12;
  if (pos <= 3) return 8;
  if (pos <= 6) return 4;
  if (pos <= 10) return 0;
  return -5;
}

function describeResultado(linkPerf, bokoblinPerf, bokoblinName, mazmorra, ko) {
  if (ko) {
    return `💀 K.O. en ${mazmorra.name}. ${bokoblinName} superó a Link con una emboscada devastadora.`;
  }
  const diff = linkPerf - bokoblinPerf;
  if (diff > 15) return `🏆 Victoria decisiva en ${mazmorra.name} contra ${bokoblinName}. Link dominó el combate.`;
  if (diff > 5) return `✅ Victoria justa en ${mazmorra.name}. ${bokoblinName} fue un rival duro.`;
  if (diff > -5) return `🤝 Empate reñido en ${mazmorra.name}. Ambos se retiraron exhaustos.`;
  if (diff > -15) return `⚠️ Derrota ajustada en ${mazmorra.name}. ${bokoblinName} ganó por muy poco.`;
  return `❌ Derrota clara en ${mazmorra.name}. ${bokoblinName} fue claramente superior.`;
}

export function simularTorneo(build, era) {
  const allMazmorras = getAllMazmorras();
  const count = Math.min(10, allMazmorras.length);

  // Pick random mazmorras
  const mazmorras = [...allMazmorras].sort(() => Math.random() - 0.5).slice(0, count);

  // Build rival bokoblins
  const bokoblins = buildBokoblinRivalesForEra(era, count);

  const linkStats = {
    name: 'Link',
    puntos: 0,
    victorias: 0,
    derrotas: 0,
    kos: 0,
    podios: 0,
  };

  const combatLog = [];

  for (let i = 0; i < mazmorras.length; i++) {
    const mazmorra = mazmorras[i];
    const bokoblin = bokoblins[i % bokoblins.length];

    // Qualifying
    const posClasif = getLinknQualifyingPos(build, mazmorra, bokoblins.slice(0, 5));
    const posBonus = gridBonus(posClasif);

    // KO check
    const ko = Math.random() < calcProbKO(build);
    if (ko) {
      linkStats.kos++;
      linkStats.derrotas++;
      combatLog.push({
        mazmorra: mazmorra.name,
        emoji: mazmorra.emoji,
        bokoblin: bokoblin.name,
        resultado: 'ko',
        posClasif,
        puntos: 0,
        descripcion: describeResultado(0, 1, bokoblin.name, mazmorra, true),
      });
      continue;
    }

    const linkPerf = calcLinkPerf(build, mazmorra) + posBonus;
    const bokoblinPerf = calcBokoblinPerf(bokoblin, mazmorra);

    // Final position (1 vs 1 simplified)
    const linkGana = linkPerf >= bokoblinPerf;
    const diff = linkPerf - bokoblinPerf;

    let pos;
    if (diff > 15) pos = 1;
    else if (diff > 5) pos = 2;
    else if (diff > -5) pos = 3;
    else if (diff > -15) pos = 6;
    else pos = 10;

    const puntos = PUNTOS_TRIFORCE[pos - 1] ?? 0;
    linkStats.puntos += puntos;

    if (pos === 1) linkStats.victorias++;
    else if (pos > 3) linkStats.derrotas++;
    if (pos <= 3) linkStats.podios++;

    // Update bokoblin stats
    if (!linkGana) {
      bokoblin.victorias++;
      bokoblin.puntos += 25;
    }

    combatLog.push({
      mazmorra: mazmorra.name,
      emoji: mazmorra.emoji,
      bokoblin: bokoblin.name,
      bokoblinGeneration: bokoblin.generation,
      resultado: pos <= 1 ? 'victoria' : pos <= 3 ? 'podio' : pos <= 5 ? 'empate' : 'derrota',
      posClasif,
      pos,
      puntos,
      linkPerf: Math.round(linkPerf),
      bokoblinPerf: Math.round(bokoblinPerf),
      descripcion: describeResultado(linkPerf, bokoblinPerf, bokoblin.name, mazmorra, false),
    });
  }

  // Final standings
  const clasificacion = [
    { name: 'Link', ...linkStats, isLink: true },
    ...bokoblins.map(b => ({ ...b, isLink: false })),
  ].sort((a, b) => b.puntos - a.puntos);

  const linkPos = clasificacion.findIndex(c => c.isLink) + 1;

  return {
    combatLog,
    clasificacion,
    linkPos,
    linkStats,
    totalCombates: mazmorras.length,
  };
}
