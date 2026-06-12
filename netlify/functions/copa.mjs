import { getStore } from '@netlify/blobs';
import {
  createRoom,
  joinRoom,
  startCopa,
  submitBuild,
  publicView,
  isExpired,
  CopaError,
} from '../../src/utils/copaRoom.js';

// Online cup API backed by Netlify Blobs. All game rules live in
// copaRoom.js — this function only loads the room, applies one transition
// and saves it back.

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

async function loadRoom(store, code) {
  const room = await store.get(String(code ?? '').toUpperCase(), { type: 'json' });
  if (!room || isExpired(room)) throw new CopaError('sala_no_encontrada', 'Sala no encontrada o caducada');
  return room;
}

const saveRoom = (store, room) => store.setJSON(room.code, room);

export default async (req) => {
  const store = getStore('copas');

  try {
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const room = await loadRoom(store, url.searchParams.get('code'));
      return json(publicView(room, url.searchParams.get('token')));
    }

    if (req.method !== 'POST') return json({ error: 'metodo_no_soportado' }, 405);
    const body = await req.json();

    switch (body.action) {
      case 'create': {
        // Re-roll the code on the rare collision with a live room
        for (let attempt = 0; attempt < 5; attempt++) {
          const { room, player } = createRoom({ hostName: body.name, size: body.size });
          const existing = await store.get(room.code, { type: 'json' });
          if (existing && !isExpired(existing)) continue;
          await saveRoom(store, room);
          return json({ code: room.code, token: player.token, view: publicView(room, player.token) });
        }
        return json({ error: 'interno', message: 'No se pudo generar un código de sala' }, 500);
      }
      case 'join': {
        const room = await loadRoom(store, body.code);
        const { room: next, player } = joinRoom(room, body.name);
        await saveRoom(store, next);
        return json({ code: next.code, token: player.token, view: publicView(next, player.token) });
      }
      case 'start': {
        const room = await loadRoom(store, body.code);
        const next = startCopa(room, body.token);
        await saveRoom(store, next);
        return json({ view: publicView(next, body.token) });
      }
      case 'submit': {
        const room = await loadRoom(store, body.code);
        const next = submitBuild(room, body.token, body.buildIds);
        await saveRoom(store, next);
        return json({ view: publicView(next, body.token) });
      }
      default:
        return json({ error: 'accion_desconocida' }, 400);
    }
  } catch (e) {
    if (e instanceof CopaError) {
      const status = e.code === 'sala_no_encontrada' ? 404 : e.code === 'no_autorizado' ? 403 : 400;
      return json({ error: e.code, message: e.message }, status);
    }
    console.error('copa function error', e);
    return json({ error: 'interno' }, 500);
  }
};

export const config = { path: '/api/copa' };
