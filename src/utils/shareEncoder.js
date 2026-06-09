export function encodeBuild(build, era) {
  const payload = {
    era,
    espada1: build.espada1?.id,
    espada2: build.espada2?.id,
    armadura: build.armadura?.id,
    habilidad: build.habilidad?.id,
    companero: build.companero?.id,
    botas: build.botas?.id,
    maestro: build.maestro?.id,
    arco: build.arco?.id,
  };
  try {
    return btoa(JSON.stringify(payload));
  } catch {
    return null;
  }
}

export function decodeBuild(encoded) {
  try {
    return JSON.parse(atob(encoded));
  } catch {
    return null;
  }
}

export function buildShareUrl(build, era) {
  const code = encodeBuild(build, era);
  if (!code) return window.location.origin;
  return `${window.location.origin}?build=${code}`;
}
