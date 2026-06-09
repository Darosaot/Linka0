import { ERA_LABELS } from '../../utils/dataQueries.js';

const ERA_COLORS = {
  era_clasica: 'bg-yellow-800 text-yellow-200',
  era_3d: 'bg-blue-800 text-blue-200',
  era_viento: 'bg-teal-800 text-teal-200',
  era_crepusculo: 'bg-purple-900 text-purple-200',
  era_cielo: 'bg-sky-800 text-sky-200',
  era_abierta: 'bg-green-800 text-green-200',
};

export default function GenerationBadge({ generation, size = 'sm' }) {
  const color = ERA_COLORS[generation] || 'bg-gray-700 text-gray-200';
  const label = ERA_LABELS[generation] || generation;
  return (
    <span className={`${color} rounded px-2 py-0.5 font-semibold ${size === 'xs' ? 'text-xs' : 'text-xs'}`}>
      {label}
    </span>
  );
}
