import { create } from 'zustand';
import { simularTorneo } from '../utils/simulator.js';
import { SLOT_KEYS } from '../utils/ratingEngine.js';
import { rollItems } from '../utils/cpuDrafter.js';

const EMPTY_BUILD = Object.fromEntries(SLOT_KEYS.map(key => [key, undefined]));

const useGameStore = create((set, get) => ({
  dificultad: 'normal',

  // Game state
  modo: 'solo', // 'solo' runs the historic tournament; 'copa' submits the build to an online cup
  fase: 'inicio',
  build: { ...EMPTY_BUILD },
  ocaRinasRestantes: 3,
  cartaActual: null,

  // Results
  resultados: null,

  setDificultad: (dificultad) => set({ dificultad }),

  startGame: (modo = 'solo') => {
    set({
      modo,
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

    // One item per empty slot from the FULL pool (all eras), with set
    // resonance — see rollItems
    set({ cartaActual: { items: rollItems(build, emptySlots) } });
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

  // Solo: runs the tournament immediately; the simulacion phase replays the
  // duels one by one and calls finishSimulation when the reveal is done.
  // Copa: the draft is done — the cup flow picks the build up and submits it.
  triggerSimulation: () => {
    const { build, dificultad, modo } = get();
    if (modo === 'copa') {
      set({ fase: 'copa' });
      return;
    }
    const resultados = simularTorneo(build, dificultad);
    set({ resultados, fase: 'simulacion' });
  },

  finishSimulation: () => {
    if (get().fase !== 'simulacion') return;
    set({ fase: 'resultados' });
  },

  // Entry point for shared "?build=" links: load the build and run the
  // tournament at the difficulty it was shared on
  loadSharedBuild: (build, dificultad = 'normal') => {
    set({ build: { ...build }, dificultad, cartaActual: null, resultados: null });
    get().triggerSimulation();
  },

  // Entry point for the cup flow: jump straight to the cup screens
  // (lobby/espera/bracket are owned by copaStore)
  goToCopa: () => {
    set({ modo: 'copa', fase: 'copa' });
  },

  resetGame: () => {
    set({
      modo: 'solo',
      fase: 'inicio',
      build: { ...EMPTY_BUILD },
      ocaRinasRestantes: 3,
      cartaActual: null,
      resultados: null,
    });
  },
}));

export default useGameStore;
