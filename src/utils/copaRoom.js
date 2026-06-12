import { resolveItem, getAllLinksRivales } from './dataQueries.js';
import { SLOT_KEYS } from './ratingEngine.js';
import { draftCpuBuild } from './cpuDrafter.js';
import { simularCopa, createRng } from './versus.js';

// Pure state machine for online cup rooms. The Netlify function only does
// IO (load room blob → apply one of these transitions → save); everything
// here is deterministic given the injected rng, which keeps it unit-testable
// and guarantees every client renders the same simulated bracket.

export const COPA_SIZES = [4, 8];
export const ROOM_TTL_MS = 24 * 60 * 60 * 1000;

const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no I/L/O/0/1
const PLAYER_EMOJIS = ['🗡️', '🛡️', '🏹', '🪄', '🦊', '🐺', '🦅', '🐉'];

export class CopaError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

export function generateCode(rng = Math.random) {
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += CODE_ALPHABET[Math.floor(rng() * CODE_ALPHABET.length)];
  }
  return code;
}

function generateToken(rng) {
  let token = '';
  for (let i = 0; i < 24; i++) {
    token += CODE_ALPHABET[Math.floor(rng() * CODE_ALPHABET.length)];
  }
  return token;
}

function cleanName(name) {
  const trimmed = String(name ?? '').trim().slice(0, 20);
  if (!trimmed) throw new CopaError('nombre_invalido', 'El nombre no puede estar vacío');
  return trimmed;
}

export function createRoom({ hostName, size, now = Date.now(), rng = Math.random }) {
  if (!COPA_SIZES.includes(size)) throw new CopaError('tamano_invalido', 'La copa debe ser de 4 u 8 participantes');
  const host = {
    id: 'p1',
    name: cleanName(hostName),
    emoji: PLAYER_EMOJIS[0],
    isCpu: false,
    token: generateToken(rng),
    buildIds: null,
  };
  const room = {
    code: generateCode(rng),
    createdAt: now,
    size,
    phase: 'lobby', // lobby → drafting → finished
    seed: Math.floor(rng() * 2 ** 31),
    players: [host],
    resultados: null,
  };
  return { room, player: host };
}

export function isExpired(room, now = Date.now()) {
  return now - room.createdAt > ROOM_TTL_MS;
}

export function joinRoom(room, name, rng = Math.random) {
  if (room.phase !== 'lobby') throw new CopaError('ya_empezada', 'La copa ya ha empezado');
  const humans = room.players.filter(p => !p.isCpu);
  if (humans.length >= room.size) throw new CopaError('sala_llena', 'La sala está llena');
  const player = {
    id: `p${room.players.length + 1}`,
    name: cleanName(name),
    emoji: PLAYER_EMOJIS[room.players.length % PLAYER_EMOJIS.length],
    isCpu: false,
    token: generateToken(rng),
    buildIds: null,
  };
  return {
    room: { ...room, players: [...room.players, player] },
    player,
  };
}

function findByToken(room, token) {
  const player = room.players.find(p => !p.isCpu && p.token === token);
  if (!player) throw new CopaError('no_autorizado', 'Jugador no encontrado en esta sala');
  return player;
}

// Host starts the cup: remaining slots are filled with CPU Links drafted
// deterministically from the room seed, and everyone moves to drafting.
export function startCopa(room, token) {
  if (room.phase !== 'lobby') throw new CopaError('ya_empezada', 'La copa ya ha empezado');
  const requester = findByToken(room, token);
  if (requester.id !== room.players[0].id) throw new CopaError('solo_host', 'Solo el anfitrión puede iniciar la copa');

  const rng = createRng(room.seed);
  const rivales = getAllLinksRivales();
  const cpus = [];
  for (let i = room.players.length; i < room.size; i++) {
    const rival = rivales[Math.floor(rng() * rivales.length)];
    const build = draftCpuBuild('setchaser', rng);
    cpus.push({
      id: `p${i + 1}`,
      name: `CPU · ${rival.name}`,
      emoji: rival.emoji,
      isCpu: true,
      token: null,
      buildIds: Object.fromEntries(SLOT_KEYS.map(s => [s, build[s].id])),
    });
  }
  return { ...room, phase: 'drafting', players: [...room.players, ...cpus] };
}

function resolveBuild(buildIds) {
  const build = {};
  for (const slot of SLOT_KEYS) {
    const item = resolveItem(slot, buildIds?.[slot]);
    if (!item) throw new CopaError('build_invalida', `Ítem desconocido para el hueco ${slot}`);
    build[slot] = item;
  }
  return build;
}

function seededShuffle(arr, rng) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// A player submits their finished draft. When the last human build arrives,
// the bracket is simulated once and stored on the room.
export function submitBuild(room, token, buildIds) {
  if (room.phase !== 'drafting') throw new CopaError('fase_invalida', 'La copa no está en fase de draft');
  const player = findByToken(room, token);
  if (player.buildIds) throw new CopaError('ya_enviada', 'Ya has enviado tu build');
  resolveBuild(buildIds); // validates

  const players = room.players.map(p => (p.id === player.id ? { ...p, buildIds } : p));
  let next = { ...room, players };

  if (players.every(p => p.buildIds)) {
    const rng = createRng(next.seed ^ 0x5eed);
    const participants = seededShuffle(players, rng).map(p => ({
      id: p.id,
      build: resolveBuild(p.buildIds),
    }));
    next = { ...next, phase: 'finished', resultados: simularCopa(participants, next.seed) };
  }
  return next;
}

// What clients see: tokens stripped, plus which player the requester is.
export function publicView(room, token = null) {
  const me = room.players.find(p => !p.isCpu && p.token != null && p.token === token);
  return {
    code: room.code,
    size: room.size,
    phase: room.phase,
    createdAt: room.createdAt,
    miId: me?.id ?? null,
    players: room.players.map(p => ({
      id: p.id,
      name: p.name,
      emoji: p.emoji,
      isCpu: p.isCpu,
      listo: Boolean(p.buildIds),
      buildIds: room.phase === 'finished' ? p.buildIds : undefined,
    })),
    resultados: room.resultados,
  };
}
