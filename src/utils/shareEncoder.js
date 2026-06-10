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

// Parses a "?build=<code>" query string and resolves item ids back to full
// items. Returns a complete build object, or null if the code is missing,
// malformed, or references unknown items.
export function parseSharedBuild(search) {
  const code = new URLSearchParams(search).get('build');
  if (!code) return null;

  const payload = decodeBuild(code);
  if (!payload || typeof payload !== 'object') return null;

  const build = {};
  for (const slot of SLOT_KEYS) {
    const item = resolveItem(slot, payload[slot]);
    if (!item) return null;
    build[slot] = item;
  }
  return build;
}

export function buildShareUrl(build) {
  const code = encodeBuild(build);
  if (!code) return window.location.origin;
  return `${window.location.origin}?build=${code}`;
}
