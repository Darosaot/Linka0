import useGameStore from '../stores/gameStore.js';
import BattleLog from '../components/results/BattleLog.jsx';
import FinalScore from '../components/results/FinalScore.jsx';
import ShareButton from '../components/results/ShareButton.jsx';
import Button from '../components/ui/Button.jsx';

export default function Results() {
  const { resultados, build, dificultad, resetGame } = useGameStore();

  const difLabel = { explorador: '🌿 Explorador', normal: '⚔️ Héroe', leyenda: '💀 Leyenda' };

  return (
    <div className="min-h-screen bg-zelda-bg px-4 py-6">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div className="pb-4 border-b border-zelda-border">
          <p className="text-zelda-muted text-xs tracking-widest uppercase">Torneo · {difLabel[dificultad] ?? dificultad}</p>
          <h1 className="text-2xl font-black text-zelda-ink mt-0.5">Resultados del Torneo</h1>
        </div>

        <FinalScore build={build} resultados={resultados} />

        <div>
          <p className="text-zelda-muted text-xs font-bold uppercase tracking-widest mb-3">📜 Registro de Combates</p>
          <BattleLog combatLog={resultados?.combatLog} />
        </div>

        <div className="flex flex-wrap justify-center gap-3 pt-4 pb-10">
          <Button onClick={resetGame} size="lg">
            🔄 Nueva Aventura
          </Button>
          <ShareButton build={build} era="todas" />
        </div>
      </div>
    </div>
  );
}
