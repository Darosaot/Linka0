import { calcTeamRating, getVeredicto } from '../../utils/ratingEngine.js';
import StatBar from '../ui/StatBar.jsx';

export default function FinalScore({ build, resultados }) {
  if (!resultados) return null;

  const { linkStats, linkPos, totalCombates, clasificacion } = resultados;
  const rating = calcTeamRating(build);
  const { titulo, descripcion } = getVeredicto(rating);

  return (
    <div className="flex flex-col gap-6">
      {/* Hero title */}
      <div className="text-center bg-zelda-green border-2 border-zelda-gold rounded-xl p-6">
        <div className="text-4xl mb-2">🏆</div>
        <div className="text-2xl font-bold text-zelda-gold mb-1">{titulo}</div>
        <div className="text-sm text-gray-300 max-w-md mx-auto">{descripcion}</div>
        <div className="mt-4 text-lg font-bold text-white">
          Rating de Equipamiento: <span className="text-zelda-gold">{rating}</span>/100
        </div>
      </div>

      {/* Combat stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Puntos ⭐', value: linkStats.puntos, color: 'text-zelda-gold' },
          { label: 'Victorias 🏆', value: linkStats.victorias, color: 'text-green-400' },
          { label: 'Derrotas ❌', value: linkStats.derrotas, color: 'text-red-400' },
          { label: 'K.O. 💀', value: linkStats.kos, color: 'text-red-600' },
        ].map(s => (
          <div key={s.label} className="bg-zelda-green border border-zelda-gold/40 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-400">{s.label}</div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Standings */}
      <div className="bg-zelda-darkgreen border border-zelda-gold/40 rounded-xl overflow-hidden">
        <div className="bg-zelda-green px-4 py-2 font-bold text-zelda-gold text-sm border-b border-zelda-gold/30">
          Clasificación Final del Torneo
        </div>
        <div className="divide-y divide-gray-700">
          {clasificacion.slice(0, 11).map((c, i) => (
            <div
              key={c.id || c.name}
              className={`flex items-center justify-between px-4 py-2 text-sm
                ${c.isLink ? 'bg-yellow-900/40 font-bold' : ''}`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-5 text-center font-bold ${i === 0 ? 'text-zelda-gold' : i < 3 ? 'text-gray-300' : 'text-gray-500'}`}>
                  {i + 1}
                </span>
                <span className={c.isLink ? 'text-zelda-gold' : 'text-gray-300'}>
                  {c.isLink ? '🗡️ Link' : `👹 ${c.name}`}
                </span>
              </div>
              <span className={`font-bold ${c.isLink ? 'text-zelda-gold' : 'text-gray-400'}`}>
                {c.puntos} ⭐
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
