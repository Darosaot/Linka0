import { ERA_LABELS } from '../../utils/dataQueries.js';

const ERA_COLORS = {
  era_clasica:    'bg-amber-100 text-amber-800 border-amber-300',
  era_3d:         'bg-blue-100 text-blue-800 border-blue-300',
  era_viento:     'bg-teal-100 text-teal-800 border-teal-300',
  era_crepusculo: 'bg-purple-100 text-purple-800 border-purple-300',
  era_cielo:      'bg-sky-100 text-sky-800 border-sky-300',
  era_abierta:    'bg-green-100 text-green-800 border-green-300',
};

export default function GenerationBadge({ generation }) {
  const color = ERA_COLORS[generation] || 'bg-gray-100 text-gray-700 border-gray-300';
  const label = ERA_LABELS[generation] || generation;
  return (
    <span className={`${color} rounded border px-1.5 py-0.5 text-xs font-semibold`}>
      {label}
    </span>
  );
}
