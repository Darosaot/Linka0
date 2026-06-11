import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import useGameStore from './gameStore.js';
import { ITEM_TYPES } from '../utils/dataQueries.js';
import { SLOT_KEYS } from '../utils/ratingEngine.js';

const fullBuild = Object.fromEntries(SLOT_KEYS.map(slot => [slot, ITEM_TYPES[slot][0]]));

beforeEach(() => {
  vi.useFakeTimers();
  useGameStore.getState().resetGame();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('draft flow', () => {
  it('startGame deals a card with one item per empty slot', () => {
    useGameStore.getState().startGame();
    const { fase, cartaActual, ocaRinasRestantes } = useGameStore.getState();
    expect(fase).toBe('draft');
    expect(ocaRinasRestantes).toBe(3);
    expect(Object.keys(cartaActual.items).sort()).toEqual([...SLOT_KEYS].sort());
  });

  it('pickItem fills the slot and redeals the remaining ones', () => {
    useGameStore.getState().startGame();
    const { cartaActual, pickItem } = useGameStore.getState();
    pickItem('espada1', cartaActual.items.espada1);

    const state = useGameStore.getState();
    expect(state.build.espada1).toBe(cartaActual.items.espada1);
    expect(Object.keys(state.cartaActual.items)).not.toContain('espada1');
  });

  it('picking the last item triggers the simulation and produces results', () => {
    useGameStore.getState().startGame();
    for (const slot of SLOT_KEYS) {
      const { cartaActual, pickItem } = useGameStore.getState();
      pickItem(slot, cartaActual.items[slot]);
    }
    const { fase, resultados } = useGameStore.getState();
    expect(fase).toBe('simulacion');
    expect(resultados.combatLog.length).toBeGreaterThan(0);

    useGameStore.getState().finishSimulation();
    expect(useGameStore.getState().fase).toBe('resultados');
  });

  it('pickItem ignores picks for an already-filled slot', () => {
    useGameStore.getState().startGame();
    const { cartaActual, pickItem } = useGameStore.getState();
    const picked = cartaActual.items.espada1;
    pickItem('espada1', picked);
    pickItem('espada1', ITEM_TYPES.espada1[1]);
    expect(useGameStore.getState().build.espada1).toBe(picked);
  });

  it('useOcarina redeals and spends a use, but never goes below zero', () => {
    useGameStore.getState().startGame();
    const { useOcarina } = useGameStore.getState();
    useOcarina();
    useOcarina();
    useOcarina();
    expect(useGameStore.getState().ocaRinasRestantes).toBe(0);
    useOcarina();
    expect(useGameStore.getState().ocaRinasRestantes).toBe(0);
  });
});

describe('loadSharedBuild', () => {
  it('runs the tournament for a shared build', () => {
    useGameStore.getState().loadSharedBuild(fullBuild);
    const { fase, resultados, build } = useGameStore.getState();
    expect(fase).toBe('simulacion');
    expect(build.espada1).toBe(fullBuild.espada1);
    expect(resultados).not.toBeNull();
  });

  it('replays the tournament at the shared difficulty', () => {
    useGameStore.getState().loadSharedBuild(fullBuild, 'leyenda');
    expect(useGameStore.getState().dificultad).toBe('leyenda');
  });
});

describe('resetGame', () => {
  it('clears results and returns to the start screen', () => {
    useGameStore.getState().loadSharedBuild(fullBuild);
    expect(useGameStore.getState().fase).toBe('simulacion');

    useGameStore.getState().resetGame();

    const { fase, resultados } = useGameStore.getState();
    expect(fase).toBe('inicio');
    expect(resultados).toBeNull();

    // A stale finishSimulation (e.g. from an unmounting reveal screen)
    // must not flip the phase after a reset
    useGameStore.getState().finishSimulation();
    expect(useGameStore.getState().fase).toBe('inicio');
  });
});
