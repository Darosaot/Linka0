import StatBar from '../ui/StatBar.jsx';
import GenerationBadge from '../ui/GenerationBadge.jsx';
import { SLOT_LABELS } from '../../utils/dataQueries.js';
import useGameStore from '../../stores/gameStore.js';

function avgRating(attributes) {
  if (!attributes) return 0;
  const vals = Object.values(attributes);
  return Math.round(vals.reduce((s, v) => s + v, 0) / vals.length);
}

function RatingBadge({ value }) {
  const color =
    value >= 80 ? 'bg-amber-100 text-amber-800 border-amber-400' :
    value >= 65 ? 'bg-green-100 text-green-800 border-green-400' :
    value >= 50 ? 'bg-blue-100 text-blue-800 border-blue-300' :
                  'bg-gray-100 text-gray-600 border-gray-300';
  return (
    <span className={`rounded border px-2 py-0.5 text-xs font-black ${color}`}>
      ★ {value}
    </span>
  );
}

function ItemCard({ slotKey, item, onPick, disabled }) {
  if (!item) return null;

  const attrEntries = Object.entries(item.attributes || {}).slice(0, 4);
  const label = SLOT_LABELS[slotKey] || slotKey;
  const avg = avgRating(item.attributes);

  return (
    <div
      className={`bg-white border-2 rounded-lg p-3 flex flex-col gap-2 transition-all duration-100
        ${disabled
          ? 'border-zelda-border opacity-40 cursor-not-allowed'
          : 'border-zelda-border hover:border-zelda-ink cursor-pointer hover:shadow-md active:scale-[0.98]'
        }`}
      onClick={() => !disabled && onPick(slotKey, item)}
    >
      <div className="text-xs text-zelda-muted">{label}</div>
      <div className="flex items-start justify-between gap-1">
        <div className="font-bold text-zelda-ink text-sm leading-tight">{item.name}</div>
        <RatingBadge value={avg} />
      </div>
      <GenerationBadge generation={item.generation} />
      <p className="text-xs text-zelda-muted leading-snug line-clamp-2">{item.bio}</p>
      <div className="flex flex-col gap-1 mt-1">
        {attrEntries.map(([k, v]) => (
          <StatBar key={k} label={k} value={v} />
        ))}
      </div>
    </div>
  );
}

function SimpleCard({ slotKey, value, label, onPick, disabled, color = 'bg-green-100 text-green-800 border-green-300' }) {
  return (
    <div
      className={`bg-white border-2 rounded-lg p-3 flex flex-col gap-2 transition-all duration-100
        ${disabled
          ? 'border-zelda-border opacity-40 cursor-not-allowed'
          : 'border-zelda-border hover:border-zelda-ink cursor-pointer hover:shadow-md active:scale-[0.98]'
        }`}
      onClick={() => !disabled && onPick(slotKey, value)}
    >
      <div className="text-xs text-zelda-muted">{SLOT_LABELS[slotKey] || slotKey}</div>
      <div className="flex items-center justify-between">
        <div className="font-bold text-zelda-ink text-sm">{label}</div>
        <RatingBadge value={value} />
      </div>
      <StatBar label={label} value={value} color={slotKey === 'rupias' ? 'bg-emerald-500' : 'bg-red-400'} />
    </div>
  );
}

export default function CardDisplay() {
  const { cartaActual, build, pickItem } = useGameStore();

  if (!cartaActual) return null;

  const { items } = cartaActual;
  const ITEM_SLOTS = ['espada1', 'espada2', 'armadura', 'habilidad', 'companero', 'botas', 'maestro', 'arco'];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {ITEM_SLOTS.map(slot => {
        if (!items[slot]) return null;
        return (
          <ItemCard
            key={slot}
            slotKey={slot}
            item={items[slot]}
            onPick={pickItem}
            disabled={build[slot] !== undefined}
          />
        );
      })}
      {items.rupias !== undefined && (
        <SimpleCard
          slotKey="rupias"
          value={items.rupias}
          label="Rupias"
          onPick={pickItem}
          disabled={build.rupias !== undefined}
        />
      )}
      {items.corazones !== undefined && (
        <SimpleCard
          slotKey="corazones"
          value={items.corazones}
          label="Corazones"
          onPick={pickItem}
          disabled={build.corazones !== undefined}
        />
      )}
    </div>
  );
}
