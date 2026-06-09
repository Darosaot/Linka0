import useGameStore from '../stores/gameStore.js';
import CardDisplay from '../components/game/CardDisplay.jsx';
import BuildSlots from '../components/game/BuildSlots.jsx';
import OcarinaButton from '../components/game/OcarinaButton.jsx';
import { ERA_LABELS } from '../utils/dataQueries.js';
import { SLOT_CONFIG } from '../utils/ratingEngine.js';

export default function Game() {
  const { build, era, getFilledSlotCount, cartaActual } = useGameStore();
  const filledCount = getFilledSlotCount();
  const totalSlots = SLOT_CONFIG.length;
  const progress = Math.round((filledCount / totalSlots) * 100);

  return (
    <div className="min-h-screen bg-zelda-darkgreen px-4 py-6">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold text-zelda-gold">Preparación de Equipamiento</h1>
            <p className="text-sm text-gray-400">Era: {ERA_LABELS[era] || era}</p>
          </div>
          <div className="text-right">
            <div className="text-zelda-gold font-bold">{filledCount}/{totalSlots} huecos</div>
            <div className="text-xs text-gray-400">{progress}% completado</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-zelda-gold rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Build overview */}
        <div>
          <h2 className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Tu Equipamiento</h2>
          <BuildSlots />
        </div>

        {/* Card area */}
        <div>
          <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
              {cartaActual ? 'Elige un Ítem' : 'Cargando cartas...'}
            </h2>
            <OcarinaButton />
          </div>
          {cartaActual ? (
            <CardDisplay />
          ) : (
            <div className="text-center py-10 text-gray-500">
              <div className="text-4xl mb-2">🎴</div>
              <p>Preparando las cartas de esta generación...</p>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-600 text-center">
          Haz clic en un ítem para añadirlo a tu equipamiento. Usa la Ocarina para robar nuevas cartas.
        </p>
      </div>
    </div>
  );
}
