import { resolveItem } from './dataQueries.js';
import { SLOT_KEYS } from './ratingEngine.js';

export function encodeBuild(build) {
  const payload = {};
  for (const slot of SLOT_KEYS) {
    payload[slot] = build[slot]?.id;
  }
  try {
    return btoa(JSON.stringify(payload));
  } catch {
    return null;
  }
}

export function decodeBuild(encoded) {
  try {
    return JSON.parse(atob(encoded));
  } catch {
    return null;
  }
}

const DIFICULTADES_VALIDAS = ['explorador', 'normal', 'leyenda'];

// Parses a "?build=<code>&dif=<dificultad>" query string and resolves item
// ids back to full items. Returns { build, dificultad }, or null if the code
// is missing, malformed, or references unknown items. Links without a (valid)
// "dif" param replay on normal.
export function parseSharedBuild(search) {
  const params = new URLSearchParams(search);
  const code = params.get('build');
  if (!code) return null;

  const payload = decodeBuild(code);
  if (!payload || typeof payload !== 'object') return null;

  const build = {};
  for (const slot of SLOT_KEYS) {
    const item = resolveItem(slot, payload[slot]);
    if (!item) return null;
    build[slot] = item;
  }

  const dif = params.get('dif');
  const dificultad = DIFICULTADES_VALIDAS.includes(dif) ? dif : 'normal';

  return { build, dificultad };
}

export function buildShareUrl(build, dificultad) {
  const code = encodeBuild(build);
  if (!code) return window.location.origin;
  const dif = DIFICULTADES_VALIDAS.includes(dificultad) ? `&dif=${dificultad}` : '';
  return `${window.location.origin}?build=${code}${dif}`;
}
