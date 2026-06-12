import { describe, it, expect } from 'vitest';
import {
  createRoom,
  joinRoom,
  startCopa,
  submitBuild,
  publicView,
  isExpired,
  generateCode,
  CopaError,
  ROOM_TTL_MS,
} from './copaRoom.js';
import { ITEM_TYPES } from './dataQueries.js';
import { SLOT_KEYS } from './ratingEngine.js';

const validBuildIds = Object.fromEntries(SLOT_KEYS.map(s => [s, ITEM_TYPES[s][0].id]));

function newRoom(size = 4) {
  return createRoom({ hostName: 'Ana', size });
}

describe('createRoom', () => {
  it('creates a lobby with the host as p1', () => {
    const { room, player } = newRoom();
    expect(room.phase).toBe('lobby');
    expect(room.players).toHaveLength(1);
    expect(player.id).toBe('p1');
    expect(player.token).toBeTruthy();
    expect(room.code).toMatch(/^[A-Z2-9]{5}$/);
  });

  it('rejects invalid sizes and empty names', () => {
    expect(() => createRoom({ hostName: 'Ana', size: 5 })).toThrow(CopaError);
    expect(() => createRoom({ hostName: '   ', size: 4 })).toThrow(CopaError);
  });

  it('generateCode avoids ambiguous characters', () => {
    for (let i = 0; i < 50; i++) {
      expect(generateCode()).not.toMatch(/[ILO01]/);
    }
  });
});

describe('joinRoom', () => {
  it('adds players until the room is full', () => {
    let { room } = newRoom(4);
    for (const name of ['Bea', 'Cleo', 'Dani']) {
      room = joinRoom(room, name).room;
    }
    expect(room.players).toHaveLength(4);
    expect(() => joinRoom(room, 'Eva')).toThrow(/llena/);
  });

  it('rejects joins after the cup started', () => {
    const { room, player } = newRoom(4);
    const started = startCopa(room, player.token);
    expect(() => joinRoom(started, 'Bea')).toThrow(/empezado/);
  });
});

describe('startCopa', () => {
  it('fills the remaining slots with CPU players carrying complete builds', () => {
    const { room, player } = newRoom(4);
    const started = startCopa(room, player.token);
    expect(started.phase).toBe('drafting');
    expect(started.players).toHaveLength(4);
    const cpus = started.players.filter(p => p.isCpu);
    expect(cpus).toHaveLength(3);
    for (const cpu of cpus) {
      for (const slot of SLOT_KEYS) {
        expect(cpu.buildIds[slot], `${cpu.id}.${slot}`).toBeTruthy();
      }
    }
  });

  it('only the host can start', () => {
    const { room } = newRoom(4);
    const { room: withBea, player: bea } = joinRoom(room, 'Bea');
    expect(() => startCopa(withBea, bea.token)).toThrow(/anfitrión/);
    expect(() => startCopa(withBea, 'WRONGTOKEN')).toThrow(CopaError);
  });
});

describe('submitBuild', () => {
  function draftingRoom() {
    const { room, player: host } = newRoom(4);
    const { room: r2, player: bea } = joinRoom(room, 'Bea');
    return { room: startCopa(r2, host.token), host, bea };
  }

  it('marks the player ready and simulates when the last build arrives', () => {
    const { room, host, bea } = draftingRoom();
    const afterHost = submitBuild(room, host.token, validBuildIds);
    expect(afterHost.phase).toBe('drafting');
    expect(afterHost.players.find(p => p.id === 'p1').buildIds).toEqual(validBuildIds);

    const finished = submitBuild(afterHost, bea.token, validBuildIds);
    expect(finished.phase).toBe('finished');
    expect(finished.resultados.rounds).toHaveLength(2);
    const ids = finished.players.map(p => p.id);
    expect(ids).toContain(finished.resultados.campeonId);
  });

  it('rejects incomplete builds, double submits and unknown tokens', () => {
    const { room, host } = draftingRoom();
    expect(() => submitBuild(room, host.token, { espada1: 'nope' })).toThrow(/Ítem desconocido/);
    expect(() => submitBuild(room, 'BADTOKEN', validBuildIds)).toThrow(/no encontrado/);
    const once = submitBuild(room, host.token, validBuildIds);
    expect(() => submitBuild(once, host.token, validBuildIds)).toThrow(/Ya has enviado/);
  });

  it('produces the same bracket for the same room (deterministic seed)', () => {
    const { room, host, bea } = draftingRoom();
    const runA = submitBuild(submitBuild(room, host.token, validBuildIds), bea.token, validBuildIds);
    const runB = submitBuild(submitBuild(room, host.token, validBuildIds), bea.token, validBuildIds);
    expect(runA.resultados).toEqual(runB.resultados);
  });
});

describe('publicView', () => {
  it('never leaks tokens and identifies the requester', () => {
    const { room, player } = newRoom(4);
    const view = publicView(room, player.token);
    expect(view.miId).toBe('p1');
    expect(JSON.stringify(view)).not.toContain(player.token);
    expect(publicView(room, null).miId).toBeNull();
  });

  it('hides builds until the cup is finished', () => {
    const { room, player } = newRoom(4);
    const started = startCopa(room, player.token);
    const during = publicView(started, player.token);
    expect(during.players.every(p => p.buildIds === undefined)).toBe(true);

    const finished = submitBuild(started, player.token, validBuildIds);
    const after = publicView(finished, player.token);
    expect(after.resultados).not.toBeNull();
    expect(after.players.find(p => p.id === 'p1').buildIds).toEqual(validBuildIds);
  });
});

describe('isExpired', () => {
  it('expires rooms after the TTL', () => {
    const { room } = newRoom(4);
    expect(isExpired(room, room.createdAt + ROOM_TTL_MS - 1)).toBe(false);
    expect(isExpired(room, room.createdAt + ROOM_TTL_MS + 1)).toBe(true);
  });
});
