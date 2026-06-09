import { calcTeamRating, getVeredicto } from '../../utils/ratingEngine.js';

export default function FinalScore({ build, resultados }) {
  if (!resultados) return null;

  const { linkStats, linkPos, totalCombates, clasificacion } = resultados;
  const rating = calcTeamRating(build);
  const { titulo, descripcion } = getVeredicto(rating);

  return (
    <div className="flex flex-col gap-5">
      {/* Hero title */}
      <div className="text-center bg-white border-2 border-zelda-border rounded-xl p-6">
        <div className="text-4xl mb-2">🏆</div>
        <div className="text-2xl font-black text-zelda-ink mb-1">{titulo}</div>
        <div className="text-sm text-zelda-muted max-w-md mx-auto">{descripcion}</div>
        <div className="mt-3 flex justify-center gap-6 text-sm">
          <span className="text-zelda-muted">
            Rating de equipamiento: <span className="font-black text-zelda-ink">{rating}/100</span>
          </span>
          <span className="text-zelda-muted">
            Posición final: <span className="font-black text-zelda-ink">{linkPos}º/{clasificacion.length}</span>
          </span>
        </div>
      </div>

      {/* Combat stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Puntos ⭐', value: linkStats.puntos, color: 'text-zelda-gold' },
          { label: 'Victorias 🏆', value: linkStats.victorias, color: 'text-green-700' },
          { label: 'Podios 🥈', value: linkStats.podios, color: 'text-blue-700' },
          { label: 'K.O. 💀', value: linkStats.kos, color: 'text-red-600' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-zelda-border rounded-lg p-3 text-center">
            <div className="text-xs text-zelda-muted">{s.label}</div>
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Standings */}
      <div className="bg-white border border-zelda-border rounded-xl overflow-hidden">
        <div className="px-4 py-2 font-bold text-zelda-ink text-sm border-b border-zelda-border bg-zelda-surface">
          Clasificación Final del Torneo
        </div>
        <div className="divide-y divide-zelda-border">
          {clasificacion.slice(0, 11).map((c, i) => (
            <div
              key={c.id || c.name}
              className={`flex items-center justify-between px-4 py-2 text-sm
                ${c.isLink ? 'bg-amber-50 font-bold' : ''}`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-5 text-center font-black text-sm
                  ${i === 0 ? 'text-zelda-gold' : i < 3 ? 'text-zelda-ink' : 'text-zelda-muted'}`}>
                  {i + 1}
                </span>
                <span className={c.isLink ? 'text-zelda-ink' : 'text-zelda-muted'}>
                  {c.isLink ? '🗡️ Link' : `👹 ${c.name}`}
                </span>
              </div>
              <span className={`font-black ${c.isLink ? 'text-zelda-gold' : 'text-zelda-muted'}`}>
                {c.puntos} ⭐
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
