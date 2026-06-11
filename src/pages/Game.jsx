import useGameStore from '../stores/gameStore.js';
import CardDisplay from '../components/game/CardDisplay.jsx';
import BuildSlots from '../components/game/BuildSlots.jsx';
import OcarinaButton from '../components/game/OcarinaButton.jsx';
import { SLOT_CONFIG, calcTeamRating, calcBuildProfile } from '../utils/ratingEngine.js';
import { STAT_LABELS } from '../utils/dataQueries.js';

export default function Game() {
  const build = useGameStore(state => state.build);
  const cartaActual = useGameStore(state => state.cartaActual);
  const filledCount = SLOT_CONFIG.filter(s => build[s.key] !== undefined).length;
  const totalSlots = SLOT_CONFIG.length;
  const progress = Math.round((filledCount / totalSlots) * 100);
  const rating = filledCount > 0 ? calcTeamRating(build) : null;

  return (
    <div className="min-h-screen bg-zelda-bg px-4 py-6">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-zelda-border">
          <div>
            <p className="text-zelda-muted text-xs tracking-widest uppercase">Fase de Preparación</p>
            <h1 className="text-xl font-black text-zelda-ink mt-0.5">Equipamiento de Link</h1>
          </div>
          <div className="flex items-center gap-4">
            {rating !== null && (
              <div className="text-right">
                <div className="font-black text-zelda-gold text-lg leading-none">★ {rating}</div>
                <div className="text-xs text-zelda-muted">rating actual</div>
              </div>
            )}
            <div className="text-right">
              <div className="font-bold text-zelda-ink">{filledCount}/{totalSlots} huecos</div>
              <div className="text-xs text-zelda-muted">{progress}% completado</div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-zelda-border rounded-full overflow-hidden">
          <div
            className="h-full bg-zelda-ink rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Build overview */}
        <div>
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
            <p className="text-zelda-muted text-xs font-bold uppercase tracking-widest">Tu Equipamiento</p>
            {filledCount > 0 && (
              <div className="flex gap-3 text-xs text-zelda-muted">
                {Object.entries(calcBuildProfile(build)).map(([stat, value]) => (
                  <span key={stat} title={`Las mazmorras que favorecen ${stat} premian este valor`}>
                    {STAT_LABELS[stat]} <span className="font-bold text-zelda-ink">{Math.round(value)}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
          <BuildSlots />
        </div>

        {/* Card area */}
        <div>
          <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
            <p className="text-zelda-muted text-xs font-bold uppercase tracking-widest">
              {cartaActual ? 'Elige un Ítem' : 'Cargando...'}
            </p>
            <OcarinaButton />
          </div>
          {cartaActual ? (
            <CardDisplay />
          ) : (
            <div className="text-center py-10 text-zelda-muted text-sm">
              <div className="text-4xl mb-2">🎴</div>
              Preparando los ítems...
            </div>
          )}
        </div>

        <p className="text-xs text-zelda-muted text-center">
          Haz clic en un ítem para añadirlo a tu build. Si ya tienes piezas de un set,
          la ocarina resonará con él y ofrecerá sus piezas restantes más a menudo. 🎵
        </p>
      </div>
    </div>
  );
}
