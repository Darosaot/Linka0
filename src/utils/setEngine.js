import setsData from '../data/sets.json';
import { SLOT_KEYS } from './ratingEngine.js';

// Reverse lookup: item_id → set_id
const ITEM_TO_SET_ID = {};
for (const set of setsData) {
  for (const pieceId of set.piezas) {
    ITEM_TO_SET_ID[pieceId] = set.id;
  }
}

const SET_BY_ID = Object.fromEntries(setsData.map(s => [s.id, s]));

// Colors per era for UI badges
export const SET_ERA_COLORS = {
  era_clasica:    { bg: 'bg-amber-100',   border: 'border-amber-400',   text: 'text-amber-800' },
  era_3d:         { bg: 'bg-green-100',   border: 'border-green-400',   text: 'text-green-800' },
  era_viento:     { bg: 'bg-blue-100',    border: 'border-blue-400',    text: 'text-blue-800'  },
  era_crepusculo: { bg: 'bg-purple-100',  border: 'border-purple-400',  text: 'text-purple-800'},
  era_cielo:      { bg: 'bg-sky-100',     border: 'border-sky-400',     text: 'text-sky-800'   },
  era_abierta:    { bg: 'bg-emerald-100', border: 'border-emerald-400', text: 'text-emerald-800'},
};

export function getSetForItem(itemId) {
  if (!itemId) return null;
  const setId = ITEM_TO_SET_ID[itemId];
  return setId ? SET_BY_ID[setId] : null;
}

function countPiecesInBuild(build) {
  const counts = {};
  for (const slot of SLOT_KEYS) {
    const item = build[slot];
    if (!item?.id) continue;
    const setId = ITEM_TO_SET_ID[item.id];
    if (setId) counts[setId] = (counts[setId] || 0) + 1;
  }
  return counts;
}

export function getActiveSets(build) {
  const counts = countPiecesInBuild(build);
  return Object.entries(counts)
    .filter(([setId, count]) => count >= SET_BY_ID[setId].piezas.length)
    .map(([setId]) => SET_BY_ID[setId]);
}

export function getPartialSets(build) {
  const counts = countPiecesInBuild(build);
  return Object.entries(counts).map(([setId, count]) => ({
    set: SET_BY_ID[setId],
    count,
    total: SET_BY_ID[setId].piezas.length,
    complete: count >= SET_BY_ID[setId].piezas.length,
  }));
}

// Returns combined bonus multiplier (additive bonuses, capped at +35%)
export function calcSetMultiplier(build) {
  const active = getActiveSets(build);
  if (active.length === 0) return 1.0;
  const totalBonus = active.reduce((sum, s) => sum + (s.bonus_mult - 1), 0);
  return 1 + Math.min(totalBonus, 0.35);
}

export { setsData as ALL_SETS };
