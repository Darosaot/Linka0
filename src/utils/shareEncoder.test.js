import { describe, it, expect } from 'vitest';
import { encodeBuild, decodeBuild, parseSharedBuild } from './shareEncoder.js';
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
