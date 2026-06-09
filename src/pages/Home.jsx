import { useState } from 'react';
import useGameStore from '../stores/gameStore.js';
import { ERA_LABELS } from '../utils/dataQueries.js';
import Button from '../components/ui/Button.jsx';

const ERAS = Object.entries(ERA_LABELS);

const DIFICULTADES = [
  { id: 'explorador', label: '🌿 Explorador', desc: 'Los Bokoblins son más débiles. Ideal para empezar.' },
  { id: 'normal',     label: '⚔️ Héroe',       desc: 'El desafío equilibrado de un verdadero aventurero.' },
  { id: 'leyenda',    label: '💀 Leyenda',     desc: 'Solo los más fuertes sobreviven. Los Bokoblins no perdonan.' },
];

export default function Home() {
  const { setEra, setDificultad, startGame, era, dificultad } = useGameStore();
  const [selEra, setSelEra] = useState(era || 'era_abierta');
  const [selDif, setSelDif] = useState(dificultad || 'normal');

  function handleStart() {
    setEra(selEra);
    setDificultad(selDif);
    startGame();
  }

  return (
    <div className="min-h-screen bg-zelda-darkgreen flex flex-col items-center justify-center px-4 py-10 gap-8">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-5xl sm:text-6xl font-bold text-zelda-gold tracking-widest drop-shadow-lg">
          LINKA0
        </h1>
        <p className="text-zelda-gold/70 text-sm mt-2 tracking-widest">⚔️ LINK vs BOKOBLINS ⚔️</p>
        <p className="text-gray-300 text-xs mt-1">El torneo de las generaciones</p>
      </div>

      {/* Description */}
      <div className="max-w-md text-center text-gray-300 text-sm leading-relaxed bg-zelda-green/50 border border-zelda-gold/30 rounded-xl px-6 py-4">
        <p>
          Equipa a <span className="text-zelda-gold font-bold">Link</span> con armas, armadura y compañeros
          a través de un <span className="text-zelda-gold">sistema de cartas</span>. Luego, enfréntate
          a <span className="text-zelda-gold">Bokoblins de distintas generaciones</span> en un torneo épico por las mazmorras de Hyrule.
        </p>
      </div>

      {/* Era selection */}
      <div className="w-full max-w-lg">
        <h2 className="text-zelda-gold text-sm font-bold mb-3 tracking-wider">SELECCIONA UNA ERA</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {ERAS.map(([id, label]) => (
            <button
              key={id}
              onClick={() => setSelEra(id)}
              className={`rounded-lg border-2 px-3 py-2 text-sm font-semibold transition-all duration-150
                ${selEra === id
                  ? 'border-zelda-gold bg-zelda-green text-zelda-gold scale-[1.02]'
                  : 'border-gray-600 bg-gray-900/50 text-gray-300 hover:border-zelda-gold/50 hover:text-zelda-gold/80'
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty selection */}
      <div className="w-full max-w-lg">
        <h2 className="text-zelda-gold text-sm font-bold mb-3 tracking-wider">DIFICULTAD</h2>
        <div className="flex flex-col gap-2">
          {DIFICULTADES.map(d => (
            <button
              key={d.id}
              onClick={() => setSelDif(d.id)}
              className={`rounded-lg border-2 px-4 py-3 text-left transition-all duration-150
                ${selDif === d.id
                  ? 'border-zelda-gold bg-zelda-green'
                  : 'border-gray-600 bg-gray-900/50 hover:border-zelda-gold/40'
                }`}
            >
              <div className={`font-bold text-sm ${selDif === d.id ? 'text-zelda-gold' : 'text-gray-300'}`}>{d.label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{d.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Start button */}
      <Button onClick={handleStart} size="lg" className="w-full max-w-lg">
        ⚔️ COMENZAR AVENTURA
      </Button>

      <p className="text-gray-600 text-xs text-center">
        Inspirado en F1sim · La leyenda continúa...
      </p>
    </div>
  );
}
