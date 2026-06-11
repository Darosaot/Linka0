import linksRivalesData from '../data/links_rivales.json';
import espadasData from '../data/espadas.json';
import armasSecundarasData from '../data/armas_secundarias.json';
import armadurasData from '../data/armaduras.json';
import habilidadesData from '../data/habilidades.json';
import companerosData from '../data/companeros.json';
import botasData from '../data/botas.json';
import maestrosData from '../data/maestros.json';
import arcosData from '../data/arcos.json';
import mazmorrrasData from '../data/mazmorras.json';

export const ITEM_TYPES = {
  espada1: espadasData,
  espada2: armasSecundarasData,
  armadura: armadurasData,
  habilidad: habilidadesData,
  companero: companerosData,
  botas: botasData,
  maestro: maestrosData,
  arco: arcosData,
};

export function resolveItem(type, id) {
  const pool = ITEM_TYPES[type];
  if (!pool) return null;
  return pool.find(item => item.id === id) || null;
}

export function getAllLinksRivales() {
  return linksRivalesData;
}

export function getAllMazmorras() {
  return mazmorrrasData;
}

export const ERA_LABELS = {
  era_clasica: 'Era Clásica',
  era_3d: 'Era 3D',
  era_viento: 'Era del Viento',
  era_crepusculo: 'Era del Crepúsculo',
  era_cielo: 'Era del Cielo',
  era_abierta: 'Era Abierta',
};

// The four dimensions dungeons reward (see simulator terrainScore)
export const STAT_LABELS = {
  fuerza: '💪 fuerza',
  defensa: '🛡️ defensa',
  agilidad: '🏃 agilidad',
  magia: '✨ magia',
};

export const SLOT_LABELS = {
  espada1: '⚔️ Espada Principal',
  espada2: '🗡️ Arma Secundaria',
  armadura: '🛡️ Armadura',
  habilidad: '✨ Habilidad Especial',
  companero: '🧚 Compañero',
  botas: '👟 Botas',
  maestro: '📜 Maestro',
  arco: '🏹 Arco',
};
