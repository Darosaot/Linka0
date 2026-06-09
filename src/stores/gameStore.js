import { create } from 'zustand';
import { getGeneracionesForEra, getItemsForSlotAndEra, ITEM_TYPES, ERA_LABELS } from '../utils/dataQueries.js';
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
  // Config
  era: null,
  dificultad: 'normal',

  // Game state
  fase: 'inicio',   // 'inicio' | 'draft' | 'simulacion' | 'resultados'
  build: { ...EMPTY_BUILD },
  ocaRinasRestantes: 3,
  cartaActual: null,
  usedGeneracionIds: [],
  rollCount: 0,

  // Results
  resultados: null,

  // Actions
  setEra: (era) => set({ era }),
  setDificultad: (dificultad) => set({ dificultad }),

  startGame: () => {
    set({
      fase: 'draft',
      build: { ...EMPTY_BUILD },
      ocaRinasRestantes: 3,
      cartaActual: null,
      usedGeneracionIds: [],
      rollCount: 0,
      resultados: null,
    });
    get().rollCard();
  },

  rollCard: () => {
    const { era, build, usedGeneracionIds } = get();

    // Find unfilled item slots
    const emptySlots = ITEM_SLOTS.filter(slot => build[slot] === undefined);
    const needsRupias = build.rupias === undefined;
    const needsCorazones = build.corazones === undefined;

    if (emptySlots.length === 0 && !needsRupias && !needsCorazones) {
      // All filled — trigger simulation
      get().triggerSimulation();
      return;
    }

    // Try up to 15 times to find a card with at least one pickable item
    let card = null;
    for (let attempt = 0; attempt < 15; attempt++) {
      const gens = getGeneracionesForEra(era);
      if (!gens.length) break;

      const gen = gens[Math.floor(Math.random() * gens.length)];

      // Build card items
      const items = {};
      for (const slot of ITEM_SLOTS) {
        if (emptySlots.includes(slot)) {
          const pool = getItemsForSlotAndEra(slot, era);
          if (pool.length) {
            items[slot] = pool[Math.floor(Math.random() * pool.length)];
          }
        }
      }

      if (needsRupias) items.rupias = gen.rupias_index;
      if (needsCorazones) items.corazones = gen.corazones_index;

      const hasPickable =
        Object.keys(items).some(k => emptySlots.includes(k) || (k === 'rupias' && needsRupias) || (k === 'corazones' && needsCorazones));

      if (hasPickable) {
        card = { gen, items };
        break;
      }
    }

    set(state => ({
      cartaActual: card,
      rollCount: state.rollCount + 1,
    }));
  },

  pickItem: (slotKey, item) => {
    const { build } = get();
    const newBuild = { ...build, [slotKey]: item };

    const allFilled = ITEM_SLOTS.every(s => newBuild[s] !== undefined) &&
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
    const { build, era } = get();

    // Small delay for UX
    setTimeout(() => {
      const resultados = simularTorneo(build, era);
      set({ resultados, fase: 'resultados' });
    }, 1200);
  },

  resetGame: () => {
    set({
      fase: 'inicio',
      build: { ...EMPTY_BUILD },
      ocaRinasRestantes: 3,
      cartaActual: null,
      usedGeneracionIds: [],
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
