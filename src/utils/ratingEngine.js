// Slot weights — must sum to 1.0
export const SLOT_WEIGHTS = {
  espada1: 0.24,
  armadura: 0.17,
  habilidad: 0.16,
  espada2: 0.10,
  companero: 0.10,
  botas: 0.06,
  maestro: 0.05,
  arco: 0.05,
  rupias: 0.04,
  corazones: 0.03,
};

export const SLOT_CONFIG = [
  { key: 'espada1',   label: '⚔️ Espada Principal',   weight: 0.24 },
  { key: 'armadura',  label: '🛡️ Armadura',            weight: 0.17 },
  { key: 'habilidad', label: '✨ Habilidad Especial',  weight: 0.16 },
  { key: 'espada2',   label: '🗡️ Arma Secundaria',     weight: 0.10 },
  { key: 'companero', label: '🧚 Compañero',           weight: 0.10 },
  { key: 'botas',     label: '👟 Botas',               weight: 0.06 },
  { key: 'maestro',   label: '📜 Maestro',             weight: 0.05 },
  { key: 'arco',      label: '🏹 Arco',                weight: 0.05 },
  { key: 'rupias',    label: '💎 Rupias',              weight: 0.04 },
  { key: 'corazones', label: '❤️ Corazones',           weight: 0.03 },
];

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

export function calcTeamRating(build) {
  let totalWeight = 0;
  let weightedScore = 0;

  for (const slot of SLOT_CONFIG) {
    const item = build[slot.key];
    if (!item) continue;

    let rawScore;
    if (slot.key === 'rupias') {
      rawScore = typeof item === 'number' ? item : 0;
    } else if (slot.key === 'corazones') {
      rawScore = typeof item === 'number' ? item : 0;
    } else {
      rawScore = calcSlotScore(slot.key, item);
    }

    weightedScore += rawScore * slot.weight;
    totalWeight += slot.weight;
  }

  if (totalWeight === 0) return 0;
  return Math.round(weightedScore / totalWeight);
}

export function getVeredicto(rating) {
  if (rating >= 95) return { titulo: 'El Elegido', descripcion: 'Tu equipamiento es digno del portador de la Trifuerza. Ningún rival puede resistirte.' };
  if (rating >= 85) return { titulo: 'Héroe del Tiempo', descripcion: 'Un equipamiento legendario. Los bardos cantarán tus hazañas durante generaciones.' };
  if (rating >= 75) return { titulo: 'Campeón de Hyrule', descripcion: 'Un build sólido y temible. Los Links rivales tiemblan ante tu nombre.' };
  if (rating >= 65) return { titulo: 'Aventurero Valiente', descripcion: 'Buen equipamiento. Ganarás la mayoría de tus combates con habilidad.' };
  if (rating >= 55) return { titulo: 'Aprendiz de Héroe', descripcion: 'Equipamiento básico pero funcional. Necesitarás mucha habilidad para salir victorioso.' };
  return { titulo: 'Aldeano con Espada de Madera', descripcion: 'Este equipamiento no impresionaría ni a un Bokoblin Rojo. ¡Prueba de nuevo!' };
}
