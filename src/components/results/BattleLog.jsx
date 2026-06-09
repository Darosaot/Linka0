import { ERA_LABELS } from '../../utils/dataQueries.js';

const RESULTADO_COLORS = {
  victoria: 'border-zelda-gold bg-yellow-900/30',
  podio: 'border-green-500 bg-green-900/20',
  empate: 'border-gray-500 bg-gray-800/20',
  derrota: 'border-red-600 bg-red-900/20',
  ko: 'border-red-800 bg-red-900/40',
};

const RESULTADO_LABEL = {
  victoria: '🏆 1º Victoria',
  podio: '🥈 Podio',
  empate: '🤝 Empate',
  derrota: '❌ Derrota',
  ko: '💀 K.O.',
};

export default function BattleLog({ combatLog }) {
  if (!combatLog?.length) return null;

  return (
    <div className="flex flex-col gap-3">
      {combatLog.map((combat, i) => (
        <div
          key={i}
          className={`rounded-lg border-2 p-4 ${RESULTADO_COLORS[combat.resultado] || 'border-gray-600'}`}
        >
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{combat.emoji}</span>
              <div>
                <div className="font-bold text-white">{combat.mazmorra}</div>
                <div className="text-xs text-gray-400">
                  vs. <span className="text-zelda-gold">{combat.bokoblin}</span>
                  {combat.bokoblinGeneration && (
                    <span className="ml-1 text-gray-500">({ERA_LABELS[combat.bokoblinGeneration] || combat.bokoblinGeneration})</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="font-bold text-sm">{RESULTADO_LABEL[combat.resultado]}</span>
              <span className="text-zelda-gold font-bold">{combat.puntos ?? 0} ⭐</span>
            </div>
          </div>
          <p className="text-sm text-gray-300 mt-2 leading-snug">{combat.descripcion}</p>
          {combat.posClasif && (
            <div className="text-xs text-gray-500 mt-1">
              Posición en reconocimiento previo: {combat.posClasif}º
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
