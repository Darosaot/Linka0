import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { encodeBuild, decodeBuild, parseSharedBuild, buildCopaInviteUrl, parseCopaInvite } from './shareEncoder.js';
import { ITEM_TYPES } from './dataQueries.js';
import { SLOT_KEYS } from './ratingEngine.js';

const fullBuild = Object.fromEntries(SLOT_KEYS.map(slot => [slot, ITEM_TYPES[slot][0]]));

describe('encodeBuild / decodeBuild', () => {
  it('round-trips a full build to item ids', () => {
    const decoded = decodeBuild(encodeBuild(fullBuild));
    for (const slot of SLOT_KEYS) {
      expect(decoded[slot]).toBe(fullBuild[slot].id);
    }
  });

  it('returns null for malformed codes', () => {
    expect(decodeBuild('not-base64!!!')).toBeNull();
    expect(decodeBuild(btoa('not json'))).toBeNull();
  });
});

describe('parseSharedBuild', () => {
  it('resolves a shared query string back into full items', () => {
    const search = `?build=${encodeBuild(fullBuild)}`;
    const { build, dificultad } = parseSharedBuild(search);
    for (const slot of SLOT_KEYS) {
      expect(build[slot]).toEqual(fullBuild[slot]);
    }
    expect(dificultad).toBe('normal');
  });

  it('preserves the shared difficulty and rejects invalid ones', () => {
    const code = encodeBuild(fullBuild);
    expect(parseSharedBuild(`?build=${code}&dif=leyenda`).dificultad).toBe('leyenda');
    expect(parseSharedBuild(`?build=${code}&dif=imposible`).dificultad).toBe('normal');
  });

  it('returns null when the param is missing', () => {
    expect(parseSharedBuild('')).toBeNull();
    expect(parseSharedBuild('?foo=bar')).toBeNull();
  });

  it('returns null for codes referencing unknown items', () => {
    const payload = { ...Object.fromEntries(SLOT_KEYS.map(s => [s, 'no_such_item'])) };
    expect(parseSharedBuild(`?build=${btoa(JSON.stringify(payload))}`)).toBeNull();
  });

  it('returns null for incomplete builds', () => {
    const partial = { espada1: fullBuild.espada1.id };
    expect(parseSharedBuild(`?build=${btoa(JSON.stringify(partial))}`)).toBeNull();
  });
});

describe('parseCopaInvite', () => {
  it('reads and upper-cases the code from a "?copa=" query', () => {
    expect(parseCopaInvite('?copa=ABCDE')).toBe('ABCDE');
    expect(parseCopaInvite('?copa=abcde')).toBe('ABCDE');
  });

  it('returns null when there is no invite or it is malformed', () => {
    expect(parseCopaInvite('')).toBeNull();
    expect(parseCopaInvite('?build=xyz')).toBeNull();
    expect(parseCopaInvite('?copa=')).toBeNull();
    expect(parseCopaInvite('?copa=not a code!')).toBeNull();
  });
});

describe('buildCopaInviteUrl', () => {
  const origin = 'https://linka0.example';
  beforeAll(() => { globalThis.window = { location: { origin } }; });
  afterAll(() => { delete globalThis.window; });

  it('builds an invite link parseCopaInvite can read back', () => {
    const url = buildCopaInviteUrl('ABCDE');
    expect(url).toBe(`${origin}?copa=ABCDE`);
    expect(parseCopaInvite(url.slice(url.indexOf('?')))).toBe('ABCDE');
  });

  it('falls back to the origin when there is no code', () => {
    expect(buildCopaInviteUrl()).toBe(origin);
  });
});
