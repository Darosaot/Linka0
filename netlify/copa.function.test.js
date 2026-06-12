import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ITEM_TYPES } from '../src/utils/dataQueries.js';
import { SLOT_KEYS } from '../src/utils/ratingEngine.js';

// In-memory stand-in for Netlify Blobs so the whole HTTP surface of the
// function can be exercised in CI.
const blobs = new Map();
vi.mock('@netlify/blobs', () => ({
  getStore: () => ({
    get: async (key) => blobs.get(key) ?? null,
    setJSON: async (key, value) => { blobs.set(key, JSON.parse(JSON.stringify(value))); },
  }),
}));

const { default: handler } = await import('./functions/copa.mjs');

const post = (body) =>
  handler(new Request('http://localhost/api/copa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }));

const getState = (code, token = '') =>
  handler(new Request(`http://localhost/api/copa?code=${code}&token=${token}`));

const validBuildIds = Object.fromEntries(SLOT_KEYS.map(s => [s, ITEM_TYPES[s][0].id]));

beforeEach(() => blobs.clear());

describe('copa function', () => {
  it('runs a full cup over HTTP: create → join → start → submit → finished', async () => {
    const created = await (await post({ action: 'create', name: 'Ana', size: 4 })).json();
    expect(created.code).toMatch(/^[A-Z2-9]{5}$/);
    expect(created.view.miId).toBe('p1');

    const joined = await (await post({ action: 'join', code: created.code, name: 'Bea' })).json();
    expect(joined.view.players).toHaveLength(2);

    const started = await (await post({ action: 'start', code: created.code, token: created.token })).json();
    expect(started.view.phase).toBe('drafting');
    expect(started.view.players).toHaveLength(4);

    await post({ action: 'submit', code: created.code, token: created.token, buildIds: validBuildIds });
    const final = await (await post({ action: 'submit', code: created.code, token: joined.token, buildIds: validBuildIds })).json();
    expect(final.view.phase).toBe('finished');
    expect(final.view.resultados.campeonId).toBeTruthy();

    // Spectator GET sees the finished bracket without a token
    const spectator = await (await getState(created.code)).json();
    expect(spectator.phase).toBe('finished');
    expect(spectator.miId).toBeNull();
    expect(JSON.stringify(spectator)).not.toContain(created.token);
  });

  it('returns 404 for unknown rooms and 400 for unknown actions', async () => {
    expect((await getState('XXXXX')).status).toBe(404);
    expect((await post({ action: 'sorpresa' })).status).toBe(400);
  });

  it('rejects non-host start and bad submits with game error codes', async () => {
    const created = await (await post({ action: 'create', name: 'Ana', size: 4 })).json();
    const joined = await (await post({ action: 'join', code: created.code, name: 'Bea' })).json();

    const res = await post({ action: 'start', code: created.code, token: joined.token });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('solo_host');

    await post({ action: 'start', code: created.code, token: created.token });
    const bad = await post({ action: 'submit', code: created.code, token: created.token, buildIds: { espada1: 'nope' } });
    expect(bad.status).toBe(400);
    expect((await bad.json()).error).toBe('build_invalida');
  });
});
