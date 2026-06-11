// Slot weights must sum to 1.0
export const SLOT_CONFIG = [
  { key: 'espada1',   label: '⚔️ Espada Principal',   weight: 0.26 },
  { key: 'armadura',  label: '🛡️ Armadura',            weight: 0.18 },
  { key: 'habilidad', label: '✨ Habilidad Especial',  weight: 0.17 },
  { key: 'espada2',   label: '🗡️ Arma Secundaria',     weight: 0.11 },
  { key: 'companero', label: '🧚 Compañero',           weight: 0.11 },
  { key: 'botas',     label: '👟 Botas',               weight: 0.07 },
  { key: 'maestro',   label: '📜 Maestro',             weight: 0.05 },
  { key: 'arco',      label: '🏹 Arco',                weight: 0.05 },
];

export const SLOT_KEYS = SLOT_CONFIG.map(s => s.key);

function scoreEspada(item) {
  if (!item) return 0;
  const { poder = 0, velocidad = 0, alcance = 0, magia = 0 } = item.attributes;
  return poder * 0.45 + velocidad * 0.25 + alcance * 0.20 + magia * 0.10;
}

function scoreArmaSecundaria(item) {
  if (!item) return 0;
  const { poder = 0, velocidad = 0, alcance = 0, magia = 0 } = item.attributes;
  return poder * 0.40 + velocidad * 0.30 + alcance * 0.20 + magia * 0.10;
}

function scoreArmadura(item) {
  if (!item) return 0;
  const { defensa = 0, durabilidad = 0, resistencia = 0, peso_reduccion = 0 } = item.attributes;
  return defensa * 0.35 + durabilidad * 0.30 + resistencia * 0.25 + peso_reduccion * 0.10;
}

function scoreHabilidad(item) {
  if (!item) return 0;
  const { poder = 0, versatilidad = 0, coste_magia = 0, recarga = 0 } = item.attributes;
  // Lower coste_magia is better, so we invert it
  return poder * 0.40 + versatilidad * 0.25 + (100 - coste_magia) * 0.20 + recarga * 0.15;
}

function scoreCompanero(item) {
  if (!item) return 0;
  const { guia = 0, combate = 0, magia = 0, moral = 0 } = item.attributes;
  return guia * 0.30 + combate * 0.35 + magia * 0.20 + moral * 0.15;
}

function scoreBotas(item) {
  if (!item) return 0;
  const { agilidad = 0, sigilo = 0, salto = 0, resistencia_terreno = 0 } = item.attributes;
  return agilidad * 0.40 + sigilo * 0.25 + salto * 0.25 + resistencia_terreno * 0.10;
}

function scoreMaestro(item) {
  if (!item) return 0;
  const { sabiduria = 0, tactica = 0, moral = 0, secretos = 0 } = item.attributes;
  return sabiduria * 0.30 + tactica * 0.35 + moral * 0.20 + secretos * 0.15;
}

function scoreArco(item) {
  if (!item) return 0;
  const { poder = 0, precision = 0, velocidad_disparo = 0, alcance = 0 } = item.attributes;
  return poder * 0.35 + precision * 0.30 + velocidad_disparo * 0.20 + alcance * 0.15;
}

const SLOT_SCORERS = {
  espada1: scoreEspada,
  espada2: scoreArmaSecundaria,
  armadura: scoreArmadura,
  habilidad: scoreHabilidad,
  companero: scoreCompanero,
  botas: scoreBotas,
  maestro: scoreMaestro,
  arco: scoreArco,
};

export function calcSlotScore(slotKey, item) {
  const scorer = SLOT_SCORERS[slotKey];
  if (!scorer || !item) return 0;
  return scorer(item);
}

// Combat profile of a build across the four dimensions dungeons modify.
// Each dimension aggregates the item attributes that express it, so a build
// can be strong overall yet weak in the stat a given dungeon rewards.
export function calcBuildProfile(build) {
  const attr = (slot, key) => build[slot]?.attributes?.[key] ?? 0;
  return {
    fuerza:
      attr('espada1', 'poder') * 0.45 +
      attr('espada2', 'poder') * 0.25 +
      attr('arco', 'poder') * 0.20 +
      attr('companero', 'combate') * 0.10,
    defensa:
      attr('armadura', 'defensa') * 0.45 +
      attr('armadura', 'durabilidad') * 0.25 +
      attr('armadura', 'resistencia') * 0.20 +
      attr('botas', 'resistencia_terreno') * 0.10,
    agilidad:
      attr('botas', 'agilidad') * 0.35 +
      attr('espada1', 'velocidad') * 0.25 +
      attr('botas', 'salto') * 0.15 +
      attr('arco', 'velocidad_disparo') * 0.15 +
      attr('botas', 'sigilo') * 0.10,
    magia:
      attr('habilidad', 'poder') * 0.35 +
      attr('companero', 'magia') * 0.25 +
      attr('espada1', 'magia') * 0.20 +
      attr('espada2', 'magia') * 0.10 +
      attr('habilidad', 'versatilidad') * 0.10,
  };
}

export function calcTeamRating(build) {
  let totalWeight = 0;
  let weightedScore = 0;

  for (const slot of SLOT_CONFIG) {
    const item = build[slot.key];
    if (!item) continue;

    const rawScore = calcSlotScore(slot.key, item);
    weightedScore += rawScore * slot.weight;
    totalWeight += slot.weight;
  }

  if (totalWeight === 0) return 0;
  return Math.round(weightedScore / totalWeight);
}

// pct: percentage of max tournament points scored (0–100)
export function getVeredicto(pct) {
  if (pct >= 85) return { titulo: 'El Elegido',             descripcion: 'Dominio absoluto. Ningún Link del pasado pudo resistirse a tu equipamiento.' };
  if (pct >= 70) return { titulo: 'Héroe del Tiempo',       descripcion: 'Una actuación legendaria. Los bardos cantarán tus hazañas durante generaciones.' };
  if (pct >= 55) return { titulo: 'Campeón de Hyrule',      descripcion: 'Más victorias que derrotas. Un verdadero héroe de Hyrule.' };
  if (pct >= 40) return { titulo: 'Aventurero Valiente',    descripcion: 'Resultado ajustado. Con mejor equipamiento, la historia sería otra.' };
  if (pct >= 25) return { titulo: 'Aprendiz de Héroe',      descripcion: 'Los Links del pasado fueron demasiado para ti esta vez. Vuelve más fuerte.' };
  return              { titulo: 'Aldeano con Espada de Madera', descripcion: 'Una derrota absoluta. Hasta un Bokoblin Rojo te habría dado problemas. ¡Inténtalo de nuevo!' };
}
