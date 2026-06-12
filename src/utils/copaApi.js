// Thin client for the online cup API (netlify/functions/copa.mjs)

const BASE = '/api/copa';

async function request(path, options) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, options);
  } catch {
    throw new Error('No se pudo conectar con el servidor de la copa');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message ?? 'Error inesperado del servidor');
  }
  return data;
}

const post = (payload) =>
  request('', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

export const copaApi = {
  create: (name, size) => post({ action: 'create', name, size }),
  join: (code, name) => post({ action: 'join', code, name }),
  start: (code, token) => post({ action: 'start', code, token }),
  submit: (code, token, buildIds) => post({ action: 'submit', code, token, buildIds }),
  state: (code, token) =>
    request(`?code=${encodeURIComponent(code)}&token=${encodeURIComponent(token ?? '')}`),
};
