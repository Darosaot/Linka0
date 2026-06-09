import { getAllBokoblins } from './dataQueries.js';

function bokoblinRating(bokoblin) {
  const { fuerza = 0, defensa = 0, agilidad = 0, astucia = 0, resistencia = 0 } = bokoblin.attributes;
  return fuerza * 0.35 + defensa * 0.20 + agilidad * 0.25 + astucia * 0.15 + resistencia * 0.05;
}

export function buildBokoblinRivales(count = 10) {
  const all = getAllBokoblins();

  // Shuffle deterministically with variance
  const shuffled = [...all].sort(() => Math.random() - 0.5);

  // Pick unique bokoblins up to count
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  return selected.map(b => ({
    ...b,
    rating: bokoblinRating(b) * (0.9 + Math.random() * 0.2), // ±10% variance
    puntos: 0,
    victorias: 0,
    derrotas: 0,
    kos: 0,
  }));
}

export function buildBokoblinRivalesForEra(era, count = 10) {
  const all = getAllBokoblins();
  const eraOrder = ['era_clasica', 'era_3d', 'era_viento', 'era_crepusculo', 'era_cielo', 'era_abierta'];
  const eraIndex = eraOrder.indexOf(era);

  // Include this era and up to 2 adjacent eras for variety
  const allowedEras = eraOrder.filter((_, i) => Math.abs(i - eraIndex) <= 1);
  const pool = all.filter(b => allowedEras.includes(b.generation));

  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  // Pad with random from all eras if not enough
  if (selected.length < count) {
    const remaining = all.filter(b => !selected.find(s => s.id === b.id));
    const extra = remaining.sort(() => Math.random() - 0.5).slice(0, count - selected.length);
    selected.push(...extra);
  }

  return selected.map(b => ({
    ...b,
    rating: bokoblinRating(b) * (0.9 + Math.random() * 0.2),
    puntos: 0,
    victorias: 0,
    derrotas: 0,
    kos: 0,
  }));
}

export { bokoblinRating };
