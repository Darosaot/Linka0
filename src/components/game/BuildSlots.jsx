import { SLOT_CONFIG } from '../../utils/ratingEngine.js';
import useGameStore from '../../stores/gameStore.js';

export default function BuildSlots() {
  const { build } = useGameStore();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
      {SLOT_CONFIG.map(slot => {
        const item = build[slot.key];
        const filled = item !== undefined && item !== null;

        return (
          <div
            key={slot.key}
            className={`rounded-lg border-2 p-2 min-h-[60px] flex flex-col gap-1 transition-all duration-200
              ${filled ? 'border-zelda-gold bg-zelda-green' : 'border-gray-600 bg-gray-900 border-dashed'}`}
          >
            <div className="text-xs text-gray-400 leading-tight">{slot.label}</div>
            {filled ? (
              <div className="text-xs font-bold text-zelda-gold leading-tight">
                {slot.key === 'rupias' ? `${item} pts` : slot.key === 'corazones' ? `${item} pts` : item?.name}
              </div>
            ) : (
              <div className="text-xs text-gray-600 italic">Vacío</div>
            )}
            <div className="text-xs text-gray-500">{Math.round(slot.weight * 100)}%</div>
          </div>
        );
      })}
    </div>
  );
}
