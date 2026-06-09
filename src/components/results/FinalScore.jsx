import { calcTeamRating, getVeredicto } from '../../utils/ratingEngine.js';

export default function FinalScore({ build, resultados }) {
  if (!resultados) return null;

  const { linkStats, totalRondas, maxPuntos } = resultados;
  const rating = calcTeamRating(build);
  const { titulo, descripcion } = getVeredicto(rating);
  const pct = maxPuntos > 0 ? Math.round((linkStats.puntos / maxPuntos) * 100) : 0;

  return (
    <div className="flex flex-col gap-5">

      {/* Hero title */}
      <div className="text-center bg-white border-2 border-zelda-border rounded-xl p-6">
        <div className="text-4xl mb-2">🏆</div>
        <div className="text-2xl font-black text-zelda-ink mb-1">{titulo}</div>
        <div className="text-sm text-zelda-muted max-w-md mx-auto">{descripcion}</div>
        <div className="mt-3 flex justify-center gap-6 text-sm flex-wrap">
          <span className="text-zelda-muted">
            Rating de equipamiento: <span className="font-black text-zelda-ink">{rating}/100</span>
          </span>
          <span className="text-zelda-muted">
            Puntuación: <span className="font-black text-zelda-ink">{linkStats.puntos}/{maxPuntos}</span>
            <span className="text-xs ml-1">({pct}%)</span>
          </span>
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

    </div>
  );
}
