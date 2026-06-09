import { SLOT_CONFIG } from '../../utils/ratingEngine.js';
import { getPartialSets, SET_ERA_COLORS } from '../../utils/setEngine.js';
import useGameStore from '../../stores/gameStore.js';

function SetProgress({ partialSets }) {
  if (!partialSets.length) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {partialSets.map(({ set, count, total, complete }) => {
        const colors = SET_ERA_COLORS[set.era] ?? SET_ERA_COLORS.era_abierta;
        return (
          <div
            key={set.id}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all
              ${complete
                ? 'bg-zelda-gold text-white border-amber-500 shadow-md'
                : `${colors.bg} ${colors.text} ${colors.border}`
              }`}
          >
            <span>{set.emoji}</span>
            <span className={complete ? 'font-black' : ''}>{set.name}</span>
            <span className={`font-black ${complete ? 'text-white' : colors.text}`}>
              {count}/{total}
            </span>
            {complete && <span className="font-black">· {set.bonus_label} ⚡</span>}
          </div>
        );
      })}
    </div>
  );
}

export default function BuildSlots() {
  const { build } = useGameStore();
  const partialSets = getPartialSets(build);

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                <div className="text-xs font-bold text-zelda-ink leading-tight">{item?.name}</div>
              ) : (
                <div className="text-xs text-zelda-border italic">Vacío</div>
              )}
              <div className="text-xs text-zelda-muted">{Math.round(slot.weight * 100)}%</div>
            </div>
          );
        })}
      </div>

      <SetProgress partialSets={partialSets} />
    </div>
  );
}
