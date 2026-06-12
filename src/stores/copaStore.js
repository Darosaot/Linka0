import { create } from 'zustand';
import { copaApi } from '../utils/copaApi.js';
import { SLOT_KEYS } from '../utils/ratingEngine.js';

// Client state for the online cup. The room itself lives on the server
// (view = publicView of the room); this store keeps the session (code +
// token, persisted so a page refresh rejoins) and exposes the API actions.

const SESSION_KEY = 'linka0_copa';

function loadSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY)) ?? {};
  } catch {
    return {};
  }
}

function saveSession(code, token) {
  try {
    if (code) sessionStorage.setItem(SESSION_KEY, JSON.stringify({ code, token }));
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // storage unavailable (private mode) — the session just won't survive refreshes
  }
}

const session = loadSession();

const useCopaStore = create((set, get) => ({
  code: session.code ?? null,
  token: session.token ?? null,
  view: null,
  error: null,
  busy: false,
  enviando: false,

  async crear(name, size) {
    set({ busy: true, error: null });
    try {
      const { code, token, view } = await copaApi.create(name, size);
      saveSession(code, token);
      set({ code, token, view, busy: false });
    } catch (e) {
      set({ error: e.message, busy: false });
    }
  },

  async unirse(code, name) {
    set({ busy: true, error: null });
    try {
      const res = await copaApi.join(code.trim().toUpperCase(), name);
      saveSession(res.code, res.token);
      set({ code: res.code, token: res.token, view: res.view, busy: false });
    } catch (e) {
      set({ error: e.message, busy: false });
    }
  },

  async iniciar() {
    const { code, token } = get();
    set({ busy: true, error: null });
    try {
      const { view } = await copaApi.start(code, token);
      set({ view, busy: false });
    } catch (e) {
      set({ error: e.message, busy: false });
    }
  },

  // Submits the finished draft; guarded so the polling/draft effects can
  // call it idempotently.
  async enviarBuild(build) {
    const { code, token, enviando, view } = get();
    if (enviando) return;
    const me = view?.players?.find(p => p.id === view.miId);
    if (me?.listo) return;
    set({ enviando: true, error: null });
    try {
      const buildIds = Object.fromEntries(SLOT_KEYS.map(s => [s, build[s]?.id]));
      const res = await copaApi.submit(code, token, buildIds);
      set({ view: res.view, enviando: false });
    } catch (e) {
      set({ error: e.message, enviando: false });
    }
  },

  async refrescar() {
    const { code, token } = get();
    if (!code) return;
    try {
      const view = await copaApi.state(code, token);
      set({ view, error: null });
    } catch (e) {
      // A vanished room (expired/cleaned) ends the session; transient
      // network errors just skip this poll.
      if (e.message.includes('no encontrada')) {
        saveSession(null);
        set({ code: null, token: null, view: null, error: e.message });
      }
    }
  },

  salir() {
    saveSession(null);
    set({ code: null, token: null, view: null, error: null, busy: false, enviando: false });
  },
}));

export default useCopaStore;
