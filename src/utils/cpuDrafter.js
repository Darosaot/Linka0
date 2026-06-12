import { ITEM_TYPES } from './dataQueries.js';
import { SLOT_KEYS, calcSlotScore } from './ratingEngine.js';
import { getMissingSetPieces } from './setEngine.js';

// Drafts a full build the same way a human player does: one roll per empty
// slot (with set resonance), pick one item, repeat. Used to fill empty cup
// slots with CPU players and by the balance regression test.
// strategy: 'greedy' always equips the best-scoring offer; 'setchaser'
// prioritizes pieces that advance a set it already started.
// rng is injectable so the cup server can draft CPUs deterministically.

export const RESONANCE_PROB = 0.35;

// One roll: a random item per empty slot, with set resonance. Shared by the
// player draft (gameStore) and the CPU drafter so both play the same game.
export function rollItems(build, emptySlots, rng = Math.random) {
  const missing = getMissingSetPieces(build);
  const items = {};
  for (const slot of emptySlots) {
    const pool = ITEM_TYPES[slot];
    const resonant = pool.filter(i => missing.includes(i.id));
    items[slot] = (resonant.length && rng() < RESONANCE_PROB)
      ? resonant[Math.floor(rng() * resonant.length)]
      : pool[Math.floor(rng() * pool.length)];
  }
  return items;
}

export function draftCpuBuild(strategy = 'setchaser', rng = Math.random) {
  const build = {};
  let empty = [...SLOT_KEYS];
  while (empty.length) {
    const offer = rollItems(build, empty, rng);
    const missing = getMissingSetPieces(build);
    let best = null;
    for (const slot of empty) {
      const item = offer[slot];
      let score = calcSlotScore(slot, item);
      if (strategy === 'setchaser' && missing.includes(item.id)) score += 100;
      if (!best || score > best.score) best = { slot, item, score };
    }
    build[best.slot] = best.item;
    empty = empty.filter(s => s !== best.slot);
  }
  return build;
}
