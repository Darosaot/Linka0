import { create } from 'zustand';
import { ITEM_TYPES } from '../utils/dataQueries.js';
import { simularTorneo } from '../utils/simulator.js';
import { SLOT_CONFIG } from '../utils/ratingEngine.js';

const ITEM_SLOTS = ['espada1', 'espada2', 'armadura', 'habilidad', 'companero', 'botas', 'maestro', 'arco'];

const EMPTY_BUILD = {
  espada1: undefined,
  espada2: undefined,
  armadura: undefined,
  habilidad: undefined,
  companero: undefined,
  botas: undefined,
  maestro: undefined,
  arco: undefined,
  rupias: undefined,
  corazones: undefined,
};

const useGameStore = create((set, get) => ({
  // Config — era removed from build, only dificultad remains
  dificultad: 'normal',

  // Game state
  fase: 'inicio',
  build: { ...EMPTY_BUILD },
  ocaRinasRestantes: 3,
  cartaActual: null,
  rollCount: 0,

  // Results
  resultados: null,

  setDificultad: (dificultad) => set({ dificultad }),

  startGame: () => {
    set({
      fase: 'draft',
      build: { ...EMPTY_BUILD },
      ocaRinasRestantes: 3,
      cartaActual: null,
      rollCount: 0,
      resultados: null,
    });
    get().rollCard();
  },

  rollCard: () => {
    const { build } = get();

    const emptySlots = ITEM_SLOTS.filter(slot => build[slot] === undefined);
    const needsRupias = build.rupias === undefined;
    const needsCorazones = build.corazones === undefined;

    if (emptySlots.length === 0 && !needsRupias && !needsCorazones) {
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

    if (needsRupias) {
      items.rupias = 35 + Math.floor(Math.random() * 55); // 35–90
    }
    if (needsCorazones) {
      items.corazones = 35 + Math.floor(Math.random() * 55); // 35–90
    }

    set(state => ({
      cartaActual: { items },
      rollCount: state.rollCount + 1,
    }));
  },

  pickItem: (slotKey, item) => {
    const { build } = get();
    const newBuild = { ...build, [slotKey]: item };

    const allFilled =
      ITEM_SLOTS.every(s => newBuild[s] !== undefined) &&
      newBuild.rupias !== undefined &&
      newBuild.corazones !== undefined;

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

    setTimeout(() => {
      // Era is 'todas' — Bokoblins drawn from all generations
      const resultados = simularTorneo(build, 'todas', dificultad);
      set({ resultados, fase: 'resultados' });
    }, 1400);
  },

  resetGame: () => {
    set({
      fase: 'inicio',
      build: { ...EMPTY_BUILD },
      ocaRinasRestantes: 3,
      cartaActual: null,
      rollCount: 0,
      resultados: null,
    });
  },

  getEmptySlots: () => {
    const { build } = get();
    return SLOT_CONFIG.filter(s => {
      if (s.key === 'rupias') return build.rupias === undefined;
      if (s.key === 'corazones') return build.corazones === undefined;
      return build[s.key] === undefined;
    });
  },

  getFilledSlotCount: () => {
    const { build } = get();
    return SLOT_CONFIG.filter(s => {
      if (s.key === 'rupias') return build.rupias !== undefined;
      if (s.key === 'corazones') return build.corazones !== undefined;
      return build[s.key] !== undefined;
    }).length;
  },
}));

export default useGameStore;
