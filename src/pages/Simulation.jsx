import { useEffect, useState } from 'react';
import useGameStore from '../stores/gameStore.js';
import Button from '../components/ui/Button.jsx';
import { STAT_LABELS } from '../utils/dataQueries.js';

const REVEAL_MS = 950;
const FINISH_DELAY_MS = 1200;

const DUEL_BADGE = {
  victoria_clara:    { label: '🏆 Victoria',          color: 'text-amber-700' },
  victoria_ajustada: { label: '⚔️ Victoria ajustada', color: 'text-green-700' },
  derrota_ajustada:  { label: '🛡️ Resistió',          color: 'text-blue-700'  },
  derrota:           { label: '❌ Derrota',            color: 'text-red-600'   },
  ko:                { label: '💀 K.O.',               color: 'text-red-600'   },
};

function DuelLine({ entry }) {
  const badge = DUEL_BADGE[entry.duelo.tag] ?? { label: '', color: 'text-zelda-muted' };
  return (
    <div className="flex items-center justify-between gap-2 bg-white border border-zelda-border rounded px-3 py-2 text-sm animate-fadeIn">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xl shrink-0">{entry.rival.emoji}</span>
        <div className="min-w-0">
          <div className="font-bold text-zelda-ink truncate">{entry.rival.name}</div>
          <div className="text-xs text-zelda-muted truncate">
            {entry.arenaEmoji} {entry.mazmorra} · favorece {STAT_LABELS[entry.terreno?.favorece] ?? ''}
          </div>
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className={`text-xs font-bold ${badge.color}`}>{badge.label}</div>
        <div className="text-xs font-black text-zelda-gold">+{entry.puntosRonda} ⭐</div>
      </div>
    </div>
  );
}

export default function Simulation() {
  const resultados = useGameStore(state => state.resultados);
  const finishSimulation = useGameStore(state => state.finishSimulation);
  const [revealed, setRevealed] = useState(0);

  const combatLog = resultados?.combatLog ?? [];
  const total = combatLog.length;
  const done = revealed >= total;

  useEffect(() => {
    if (!total) {
      finishSimulation();
      return;
    }
    const timer = setTimeout(
      done ? finishSimulation : () => setRevealed(r => r + 1),
      done ? FINISH_DELAY_MS : REVEAL_MS,
    );
    return () => clearTimeout(timer);
  }, [revealed, done, total, finishSimulation]);

  const puntos = combatLog.slice(0, revealed).reduce((sum, c) => sum + c.puntosRonda, 0);
  const next = !done ? combatLog[revealed] : null;

  return (
    <div className="min-h-screen bg-zelda-bg px-4 py-6">
      <div className="max-w-2xl mx-auto flex flex-col gap-4">

        <div className="flex items-end justify-between pb-3 border-b border-zelda-border">
          <div>
            <p className="text-zelda-muted text-xs tracking-widest uppercase">Torneo en curso</p>
            <h1 className="text-xl font-black text-zelda-ink mt-0.5">
              {done ? '¡Torneo completado!' : `Duelo ${Math.min(revealed + 1, total)} de ${total}`}
            </h1>
          </div>
          <div className="text-right">
            <div className="font-black text-zelda-gold text-2xl leading-none">{puntos} ⭐</div>
            <div className="text-xs text-zelda-muted">puntos</div>
          </div>
        </div>

        {/* Current duel in progress */}
        {next && (
          <div className="bg-white border-2 border-zelda-ink rounded-lg px-4 py-3 flex items-center gap-3">
            <span className="text-3xl animate-bounce">⚔️</span>
            <div className="min-w-0">
              <div className="font-black text-zelda-ink">Link vs {next.rival.name}</div>
              <div className="text-xs text-zelda-muted">
                {next.arenaEmoji} {next.mazmorra} · favorece {STAT_LABELS[next.terreno?.favorece] ?? ''}
              </div>
            </div>
            <div className="ml-auto flex gap-1.5 shrink-0">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-2 h-2 bg-zelda-ink rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Revealed duels, latest first */}
        <div className="flex flex-col gap-2">
          {combatLog.slice(0, revealed).reverse().map(entry => (
            <DuelLine key={entry.rival.name} entry={entry} />
          ))}
        </div>

        {!done && (
          <div className="text-center pt-2">
            <Button onClick={finishSimulation} variant="ghost" size="sm">
              Saltar al resultado →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
