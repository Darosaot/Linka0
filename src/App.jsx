import useGameStore from './stores/gameStore.js';
import Home from './pages/Home.jsx';
import Game from './pages/Game.jsx';
import Simulation from './pages/Simulation.jsx';
import Results from './pages/Results.jsx';
import Copa from './pages/Copa.jsx';

export default function App() {
  const fase = useGameStore(state => state.fase);

  if (fase === 'inicio') return <Home />;
  if (fase === 'draft') return <Game />;
  if (fase === 'simulacion') return <Simulation />;
  if (fase === 'resultados') return <Results />;
  if (fase === 'copa') return <Copa />;

  return <Home />;
}
