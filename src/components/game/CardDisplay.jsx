import StatBar from '../ui/StatBar.jsx';
import GenerationBadge from '../ui/GenerationBadge.jsx';
import { SLOT_LABELS } from '../../utils/dataQueries.js';
import useGameStore from '../../stores/gameStore.js';

function ItemCard({ slotKey, item, onPick, disabled }) {
  if (!item) return null;

  const attrEntries = Object.entries(item.attributes || {}).slice(0, 4);
  const label = SLOT_LABELS[slotKey] || slotKey;

  return (
    <div
      className={`bg-zelda-green border-2 rounded-lg p-3 flex flex-col gap-2 cursor-pointer transition-all duration-150
        ${disabled ? 'border-gray-600 opacity-50 cursor-not-allowed' : 'border-zelda-gold hover:border-yellow-300 hover:bg-green-800 hover:scale-[1.02] active:scale-95'}`}
      onClick={() => !disabled && onPick(slotKey, item)}
    >
      <div className="text-xs text-gray-400">{label}</div>
      <div className="font-bold text-zelda-gold text-sm leading-tight">{item.name}</div>
      <GenerationBadge generation={item.generation} />
      <p className="text-xs text-gray-300 leading-snug line-clamp-2">{item.bio}</p>
      <div className="flex flex-col gap-1 mt-1">
        {attrEntries.map(([k, v]) => (
          <StatBar key={k} label={k} value={v} />
        ))}
      </div>
    </div>
  );
}

function RupiasCarta({ value, onPick, disabled }) {
  return (
    <div
      className={`bg-zelda-green border-2 rounded-lg p-3 flex flex-col gap-2 cursor-pointer transition-all duration-150
        ${disabled ? 'border-gray-600 opacity-50 cursor-not-allowed' : 'border-zelda-gold hover:border-yellow-300 hover:bg-green-800 hover:scale-[1.02] active:scale-95'}`}
      onClick={() => !disabled && onPick('rupias', value)}
    >
      <div className="text-xs text-gray-400">{SLOT_LABELS.rupias}</div>
      <div className="font-bold text-zelda-gold text-sm">Fondo de Rupias</div>
      <p className="text-xs text-gray-300">Índice de financiación de la aventura.</p>
      <StatBar label="Rupias" value={value} color="bg-emerald-400" />
    </div>
  );
}

function CorazonesCarta({ value, onPick, disabled }) {
  return (
    <div
      className={`bg-zelda-green border-2 rounded-lg p-3 flex flex-col gap-2 cursor-pointer transition-all duration-150
        ${disabled ? 'border-gray-600 opacity-50 cursor-not-allowed' : 'border-zelda-gold hover:border-yellow-300 hover:bg-green-800 hover:scale-[1.02] active:scale-95'}`}
      onClick={() => !disabled && onPick('corazones', value)}
    >
      <div className="text-xs text-gray-400">{SLOT_LABELS.corazones}</div>
      <div className="font-bold text-zelda-gold text-sm">Corazones Extra</div>
      <p className="text-xs text-gray-300">Contenedores de corazón adicionales. Reduce la probabilidad de K.O.</p>
      <StatBar label="Corazones" value={value} color="bg-red-500" />
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
        const alreadyFilled = build[slot] !== undefined;
        return (
          <ItemCard
            key={slot}
            slotKey={slot}
            item={items[slot]}
            onPick={pickItem}
            disabled={alreadyFilled}
          />
        );
      })}
      {items.rupias !== undefined && (
        <RupiasCarta
          value={items.rupias}
          onPick={pickItem}
          disabled={build.rupias !== undefined}
        />
      )}
      {items.corazones !== undefined && (
        <CorazonesCarta
          value={items.corazones}
          onPick={pickItem}
          disabled={build.corazones !== undefined}
        />
      )}
    </div>
  );
}
