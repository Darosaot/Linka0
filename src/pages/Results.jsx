import useGameStore from '../stores/gameStore.js';
import BattleLog from '../components/results/BattleLog.jsx';
import FinalScore from '../components/results/FinalScore.jsx';
import ShareButton from '../components/results/ShareButton.jsx';
import Button from '../components/ui/Button.jsx';
import { ERA_LABELS } from '../utils/dataQueries.js';

export default function Results() {
  const { resultados, build, era, resetGame } = useGameStore();

  return (
    <div className="min-h-screen bg-zelda-darkgreen px-4 py-6">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-zelda-gold">Resultados del Torneo</h1>
          <p className="text-gray-400 text-sm mt-1">Era: {ERA_LABELS[era] || era}</p>
        </div>

        {/* Final score summary */}
        <FinalScore build={build} resultados={resultados} />

        {/* Battle log */}
        <div>
          <h2 className="text-zelda-gold font-bold mb-3">📜 Registro de Combates</h2>
          <BattleLog combatLog={resultados?.combatLog} />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap justify-center gap-3 pt-4 pb-8">
          <Button onClick={resetGame} size="lg">
            🔄 Nueva Aventura
          </Button>
          <ShareButton build={build} era={era} />
        </div>
      </div>
    </div>
  );
}
