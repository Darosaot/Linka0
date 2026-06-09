import { getAllLinksRivales } from './dataQueries.js';

export function buildLinksRivales() {
  const all = getAllLinksRivales();
  // Return all 10 in chronological order (already ordered in JSON)
  return all.map(link => ({
    ...link,
    puntos: 0,
    victorias: 0,
    derrotas: 0,
    kos: 0,
  }));
}
