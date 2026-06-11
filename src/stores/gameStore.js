import { create } from 'zustand';
import { ITEM_TYPES } from '../utils/dataQueries.js';
import { simularTorneo } from '../utils/simulator.js';
import { SLOT_KEYS } from '../utils/ratingEngine.js';
import { getMissingSetPieces } from '../utils/setEngine.js';

const EMPTY_BUILD = Object.fromEntries(SLOT_KEYS.map(key => [key, undefined]));

const SIM_DELAY_MS = 1400;

// Chance that an empty slot's roll "resonates" with a set the player already
// started, offering one of its missing pieces instead of a fully random item.
const RESONANCE_PROB = 0.35;

let simTimeout = null;

const useGameStore = create((set, get) => ({
  dificultad: 'normal',

  // Game state
  fase: 'inicio',
  build: { ...EMPTY_BUILD },
  ocaRinasRestantes: 3,
  cartaActual: null,

  // Results
  resultados: null,

  setDificultad: (dificultad) => set({ dificultad }),

  startGame: () => {
    clearTimeout(simTimeout);
    set({
      fase: 'draft',
      build: { ...EMPTY_BUILD },
      ocaRinasRestantes: 3,
      cartaActual: null,
      resultados: null,
    });
    get().rollCard();
  },

  rollCard: () => {
    const { build } = get();

    const emptySlots = SLOT_KEYS.filter(slot => build[slot] === undefined);

    if (emptySlots.length === 0) {
      get().triggerSimulation();
      return;
    }

    // Draw one item per empty slot from the FULL pool (all eras). If the
    // player has started a set, the ocarina may resonate and offer one of
    // its missing pieces for that slot instead.
    const missingPieces = getMissingSetPieces(build);
    const items = {};
    for (const slot of emptySlots) {
      const pool = ITEM_TYPES[slot];
      if (!pool?.length) continue;

      const resonant = pool.filter(item => missingPieces.includes(item.id));
      if (resonant.length && Math.random() < RESONANCE_PROB) {
        items[slot] = resonant[Math.floor(Math.random() * resonant.length)];
      } else {
        items[slot] = pool[Math.floor(Math.random() * pool.length)];
      }
    }

    set({ cartaActual: { items } });
  },

  pickItem: (slotKey, item) => {
    const { build } = get();
    if (build[slotKey] !== undefined) return;
    const newBuild = { ...build, [slotKey]: item };

    const allFilled = SLOT_KEYS.every(s => newBuild[s] !== undefined);

    set({ build: newBuild, cartaActual: null });

    if (allFilled) {
      get().triggerSimulation();
    } else {
      get().rollCard();
    }
  },

  useOcarina: () => {
    const { ocaRinasRestantes } = get();
    if (ocaRinasRestantes <= 0) return;
    set(state => ({ ocaRinasRestantes: state.ocaRinasRestantes - 1 }));
    get().rollCard();
  },

  triggerSimulation: () => {
    set({ fase: 'simulacion' });
    const { build, dificultad } = get();

    clearTimeout(simTimeout);
    simTimeout = setTimeout(() => {
      const resultados = simularTorneo(build, dificultad);
      set({ resultados, fase: 'resultados' });
    }, SIM_DELAY_MS);
  },

  // Entry point for shared "?build=" links: load the build and run the
  // tournament at the difficulty it was shared on
  loadSharedBuild: (build, dificultad = 'normal') => {
    set({ build: { ...build }, dificultad, cartaActual: null, resultados: null });
    get().triggerSimulation();
  },

  resetGame: () => {
    clearTimeout(simTimeout);
    set({
      fase: 'inicio',
      build: { ...EMPTY_BUILD },
      ocaRinasRestantes: 3,
      cartaActual: null,
      resultados: null,
    });
  },
}));

export default useGameStore;
