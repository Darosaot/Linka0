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
            className={`rounded border-2 p-2 min-h-[64px] flex flex-col gap-1 transition-all duration-150
              ${filled
                ? 'border-zelda-ink bg-white'
                : 'border-dashed border-zelda-border bg-zelda-surface'
              }`}
          >
            <div className="text-xs text-zelda-muted leading-tight">{slot.label}</div>
            {filled ? (
              <div className="text-xs font-bold text-zelda-ink leading-tight">
                {slot.key === 'rupias' || slot.key === 'corazones' ? `${item} pts` : item?.name}
              </div>
            ) : (
              <div className="text-xs text-zelda-border italic">Vacío</div>
            )}
            <div className="text-xs text-zelda-muted">{Math.round(slot.weight * 100)}%</div>
          </div>
        );
      })}
    </div>
  );
}
