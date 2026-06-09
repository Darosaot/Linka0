import bokoblinsData from '../data/bokoblins.json';
import linksRivalesData from '../data/links_rivales.json';
import espadasData from '../data/espadas.json';
import armasSecundarasData from '../data/armas_secundarias.json';
import armadurasData from '../data/armaduras.json';
import habilidadesData from '../data/habilidades.json';
import companerosData from '../data/companeros.json';
import botasData from '../data/botas.json';
import maestrosData from '../data/maestros.json';
import arcosData from '../data/arcos.json';
import generacionesData from '../data/generaciones.json';
import mazmorrrasData from '../data/mazmorras.json';
import jefesData from '../data/jefes.json';

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

export function getGeneracionesByEra(era) {
  if (!era || era === 'todas') return generacionesData;
  return generacionesData.filter(g => g.generation === era);
}

export function getGeneracionById(id) {
  return generacionesData.find(g => g.id === id);
}

export function resolveItem(type, id) {
  const pool = ITEM_TYPES[type];
  if (!pool) return null;
  return pool.find(item => item.id === id) || null;
}

export function resolveItemsForGeneracion(gen) {
  return {
    espada1: resolveItem('espada1', gen.espada1),
    espada2: resolveItem('espada2', gen.espada2),
    armadura: resolveItem('armadura', gen.armadura),
    habilidad: resolveItem('habilidad', gen.habilidad),
    companero: resolveItem('companero', gen.companero),
    botas: resolveItem('botas', gen.botas),
    maestro: resolveItem('maestro', gen.maestro),
    arco: resolveItem('arco', gen.arco),
    rupias_index: gen.rupias_index,
    corazones_index: gen.corazones_index,
  };
}

export function getItemsForSlotAndEra(slotType, era) {
  const pool = ITEM_TYPES[slotType];
  if (!pool) return [];
  if (!era || era === 'todas') return pool;
  // Include items from the selected era plus one era back for variety
  const eraOrder = ['era_clasica', 'era_3d', 'era_viento', 'era_crepusculo', 'era_cielo', 'era_abierta'];
  const eraIndex = eraOrder.indexOf(era);
  const allowedEras = eraIndex <= 0
    ? [era]
    : [eraOrder[eraIndex - 1], era];
  return pool.filter(item => allowedEras.includes(item.generation));
}

export function getAvailableEras() {
  const eras = [...new Set(generacionesData.map(g => g.generation))];
  return eras;
}

export function getAvailableYears() {
  return [...new Set(generacionesData.map(g => g.year))].sort((a, b) => b - a);
}

export function getGeneracionesForEra(era) {
  return generacionesData.filter(g => g.generation === era);
}

export function getBokoblinsByGeneration(gen) {
  return bokoblinsData.filter(b => b.generation === gen);
}

export function getAllBokoblins() {
  return bokoblinsData;
}

export function getAllLinksRivales() {
  return linksRivalesData;
}

export function getAllMazmorras() {
  return mazmorrrasData;
}

export function getMazmorrById(id) {
  return mazmorrrasData.find(m => m.id === id);
}

export function getAllJefes() {
  return jefesData;
}

export function getJefeById(id) {
  return jefesData.find(j => j.id === id);
}

export const ERA_LABELS = {
  era_clasica: 'Era Clásica',
  era_3d: 'Era 3D',
  era_viento: 'Era del Viento',
  era_crepusculo: 'Era del Crepúsculo',
  era_cielo: 'Era del Cielo',
  era_abierta: 'Era Abierta',
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
  rupias: '💎 Rupias',
  corazones: '❤️ Corazones',
};
