import { create } from 'zustand';
import { ITEM_TYPES } from '../utils/dataQueries.js';
import { simularTorneo } from '../utils/simulator.js';
import { SLOT_KEYS } from '../utils/ratingEngine.js';

const EMPTY_BUILD = Object.fromEntries(SLOT_KEYS.map(key => [key, undefined]));

const SIM_DELAY_MS = 1400;

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

    // Draw one random item per empty slot from the FULL pool (all eras)
    const items = {};
    for (const slot of emptySlots) {
      const pool = ITEM_TYPES[slot];
      if (pool?.length) {
        items[slot] = pool[Math.floor(Math.random() * pool.length)];
      }
    }

    set({ cartaActual: { items } });
  },

  pickItem: (slotKey, item) => {
    const { build } = get();
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

  // Entry point for shared "?build=" links: load the build and run the tournament
  loadSharedBuild: (build) => {
    set({ build: { ...build }, cartaActual: null, resultados: null });
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
