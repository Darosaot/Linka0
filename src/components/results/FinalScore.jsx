import { calcTeamRating, getVeredicto, SLOT_CONFIG } from '../../utils/ratingEngine.js';

function BuildSummary({ build }) {
  return (
    <div className="bg-white border border-zelda-border rounded-xl overflow-hidden">
      <div className="px-4 py-2 font-bold text-zelda-ink text-sm border-b border-zelda-border bg-zelda-surface">
        🎒 Tu Equipamiento Final
      </div>
      <div className="divide-y divide-zelda-border">
        {SLOT_CONFIG.map(slot => {
          const item = build[slot.key];
          if (item === undefined || item === null) return null;
          const isNumeric = slot.key === 'rupias' || slot.key === 'corazones';
          const name = isNumeric ? `${item} pts` : item.name;
          const sub = !isNumeric && item.game ? `${item.game}` : null;
          const era = !isNumeric && item.generation ? item.generation.replace('era_', '').replace('_', ' ') : null;
          return (
            <div key={slot.key} className="flex items-center justify-between px-4 py-2 text-sm gap-4">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-zelda-muted text-xs shrink-0 w-32">{slot.label}</span>
                <span className="font-bold text-zelda-ink truncate">{name}</span>
              </div>
              {sub && (
                <span className="text-xs text-zelda-muted whitespace-nowrap shrink-0">
                  {sub}{era ? ` · ${era}` : ''}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function FinalScore({ build, resultados }) {
  if (!resultados) return null;

  const { linkStats, totalRondas, maxPuntos, rivalAvgRating } = resultados;
  const rating = calcTeamRating(build);
  const { titulo, descripcion } = getVeredicto(rating);
  const pct = maxPuntos > 0 ? Math.round((linkStats.puntos / maxPuntos) * 100) : 0;

  const ratingDiff = rating - (rivalAvgRating ?? rating);
  const ratingDiffLabel = ratingDiff > 0
    ? `+${ratingDiff} por encima de la media`
    : ratingDiff < 0
    ? `${ratingDiff} por debajo de la media`
    : 'igual que la media';
  const ratingDiffColor = ratingDiff > 0 ? 'text-green-700' : ratingDiff < 0 ? 'text-red-600' : 'text-zelda-muted';

  return (
    <div className="flex flex-col gap-5">

      {/* Hero title */}
      <div className="text-center bg-white border-2 border-zelda-border rounded-xl p-6">
        <div className="text-4xl mb-2">🏆</div>
        <div className="text-2xl font-black text-zelda-ink mb-1">{titulo}</div>
        <div className="text-sm text-zelda-muted max-w-md mx-auto">{descripcion}</div>
        <div className="mt-3 flex justify-center gap-6 text-sm flex-wrap">
          <span className="text-zelda-muted">
            Tu rating: <span className="font-black text-zelda-ink">{rating}/100</span>
          </span>
          <span className="text-zelda-muted">
            Media rivales: <span className="font-black text-zelda-ink">{rivalAvgRating}/100</span>
          </span>
          <span className={`text-xs font-bold ${ratingDiffColor}`}>{ratingDiffLabel}</span>
        </div>
        <div className="mt-2 text-sm text-zelda-muted">
          Puntuación: <span className="font-black text-zelda-ink">{linkStats.puntos}/{maxPuntos}</span>
          <span className="text-xs ml-1">({pct}%)</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Puntos ⭐',    value: linkStats.puntos,       color: 'text-zelda-gold' },
          { label: 'Victorias 🏆', value: linkStats.victoriasLink, color: 'text-green-700' },
          { label: 'Derrotas ❌',  value: linkStats.derrotasLink,  color: 'text-red-500' },
          { label: 'K.O. 💀',      value: linkStats.kos,           color: 'text-red-700' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-zelda-border rounded-lg p-3 text-center">
            <div className="text-xs text-zelda-muted">{s.label}</div>
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-zelda-muted mb-1">
          <span>Rendimiento en el torneo</span>
          <span>{linkStats.puntos} / {maxPuntos} ⭐</span>
        </div>
        <div className="h-3 bg-zelda-border rounded-full overflow-hidden">
          <div
            className="h-full bg-zelda-gold rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Build summary */}
      <BuildSummary build={build} />

    </div>
  );
}
