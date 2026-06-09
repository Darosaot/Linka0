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
          const name = item.name;
          const sub = item.game ? `${item.game}` : null;
          const era = item.generation ? item.generation.replace('era_', '').replace('_', ' ') : null;
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

function RatingBar({ value, max = 100, color = 'bg-zelda-gold' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-1.5 bg-zelda-border rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function FinalScore({ build, resultados }) {
  if (!resultados) return null;

  const { linkStats, maxPuntos, rivalAvgRating } = resultados;
  const rating = calcTeamRating(build);
  const { titulo, descripcion } = getVeredicto(rating);
  const pct = maxPuntos > 0 ? Math.round((linkStats.puntos / maxPuntos) * 100) : 0;

  const ratingDiff = rating - (rivalAvgRating ?? rating);
  const diffPositive = ratingDiff > 0;
  const diffNeutral = ratingDiff === 0;
  const diffLabel = diffPositive
    ? `+${ratingDiff}`
    : ratingDiff < 0
    ? `${ratingDiff}`
    : '=';
  const diffColor = diffPositive ? 'text-green-600' : diffNeutral ? 'text-zelda-muted' : 'text-red-500';
  const diffBg = diffPositive ? 'bg-green-50 border-green-200' : diffNeutral ? 'bg-gray-50 border-gray-200' : 'bg-red-50 border-red-200';

  return (
    <div className="flex flex-col gap-4">

      {/* Hero card */}
      <div className="bg-white border-2 border-zelda-border rounded-xl overflow-hidden">

        {/* Title section */}
        <div className="text-center px-6 pt-6 pb-4 border-b border-zelda-border">
          <div className="text-4xl mb-2">🏆</div>
          <div className="text-2xl font-black text-zelda-ink mb-1">{titulo}</div>
          <p className="text-sm text-zelda-muted max-w-sm mx-auto leading-snug">{descripcion}</p>
        </div>

        {/* Rating comparison */}
        <div className="grid grid-cols-3 divide-x divide-zelda-border border-b border-zelda-border">
          <div className="px-4 py-4 text-center">
            <div className="text-xs text-zelda-muted uppercase tracking-wider mb-1">Tu rating</div>
            <div className="text-3xl font-black text-zelda-ink leading-none">{rating}</div>
            <div className="text-xs text-zelda-muted mt-0.5">/ 100</div>
            <div className="mt-2">
              <RatingBar value={rating} color="bg-zelda-gold" />
            </div>
          </div>
          <div className={`px-4 py-4 text-center flex flex-col items-center justify-center ${diffBg} border-x border-zelda-border`}>
            <div className="text-xs text-zelda-muted uppercase tracking-wider mb-1">Diferencia</div>
            <div className={`text-3xl font-black leading-none ${diffColor}`}>{diffLabel}</div>
            <div className={`text-xs font-medium mt-1 ${diffColor}`}>
              {diffPositive ? 'por encima' : diffNeutral ? 'igual' : 'por debajo'}
            </div>
          </div>
          <div className="px-4 py-4 text-center">
            <div className="text-xs text-zelda-muted uppercase tracking-wider mb-1">Media rivales</div>
            <div className="text-3xl font-black text-zelda-ink leading-none">{rivalAvgRating}</div>
            <div className="text-xs text-zelda-muted mt-0.5">/ 100</div>
            <div className="mt-2">
              <RatingBar value={rivalAvgRating} color="bg-slate-400" />
            </div>
          </div>
        </div>

        {/* Score row */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-zelda-muted uppercase tracking-wider">Puntuación del torneo</span>
            <span className="text-sm font-black text-zelda-ink">
              {linkStats.puntos} <span className="text-zelda-muted font-normal">/ {maxPuntos}</span>
              <span className="text-zelda-gold ml-1">⭐</span>
              <span className="text-xs text-zelda-muted font-normal ml-1">({pct}%)</span>
            </span>
          </div>
          <div className="h-2.5 bg-zelda-border rounded-full overflow-hidden">
            <div
              className="h-full bg-zelda-gold rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Puntos',    icon: '⭐', value: linkStats.puntos,        color: 'text-zelda-gold',  bg: 'bg-amber-50  border-amber-200'  },
          { label: 'Victorias', icon: '🏆', value: linkStats.victoriasLink,  color: 'text-green-700',   bg: 'bg-green-50  border-green-200'  },
          { label: 'Derrotas',  icon: '❌', value: linkStats.derrotasLink,   color: 'text-red-500',     bg: 'bg-red-50    border-red-200'    },
          { label: 'K.O.',      icon: '💀', value: linkStats.kos,            color: 'text-red-700',     bg: 'bg-red-100   border-red-300'    },
        ].map(s => (
          <div key={s.label} className={`border rounded-xl p-3 text-center ${s.bg}`}>
            <div className="text-lg mb-0.5">{s.icon}</div>
            <div className={`text-2xl font-black leading-none ${s.color}`}>{s.value}</div>
            <div className="text-xs text-zelda-muted mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Build summary */}
      <BuildSummary build={build} />

    </div>
  );
}
