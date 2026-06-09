import { useState } from 'react';
import useGameStore from '../stores/gameStore.js';
import Button from '../components/ui/Button.jsx';

const DIFICULTADES = [
  { id: 'explorador', label: '🌿 Explorador', desc: 'Los Links rivales y sus jefes son más débiles. Ideal para empezar.' },
  { id: 'normal',     label: '⚔️ Héroe',       desc: 'El desafío equilibrado de un verdadero aventurero.' },
  { id: 'leyenda',    label: '💀 Leyenda',     desc: 'Solo los más fuertes sobreviven. Los Links del pasado no perdonan.' },
];

export default function Home() {
  const { setDificultad, startGame } = useGameStore();
  const [selDif, setSelDif] = useState('normal');

  function handleStart() {
    setDificultad(selDif);
    startGame();
  }

  return (
    <div className="min-h-screen bg-zelda-bg px-6 py-10">
      <div className="max-w-4xl mx-auto">

        {/* Top label */}
        <p className="text-zelda-muted text-xs tracking-widest uppercase mb-4">
          Torneo de las Generaciones · Hyrule
        </p>

        {/* Title block */}
        <div className="mb-10">
          <h1 className="text-6xl sm:text-7xl font-black text-zelda-ink leading-none tracking-tight">
            LINK<span className="text-zelda-gold">—</span>0
          </h1>
          <p className="text-zelda-ink font-black text-xl sm:text-2xl mt-3 uppercase leading-tight">
            TIRA LA OCARINA.<br />
            EQUIPA AL HÉROE.<br />
            DERROTA A LOS LINKS DEL PASADO.
          </p>
          <p className="text-zelda-muted text-sm mt-4 max-w-lg leading-relaxed">
            Equipa a Link con ítems de cualquier era. Luego enfrenta a los 10 Links
            más poderosos de la historia de Hyrule — cada uno con su jefe final.
            ¿Tu build puede con todos ellos?
          </p>
        </div>

        {/* Difficulty selection */}
        <div className="mb-8 max-w-lg">
          <p className="text-zelda-muted text-xs font-bold tracking-widest uppercase mb-3">DIFICULTAD</p>
          <div className="flex flex-col gap-2">
            {DIFICULTADES.map(d => (
              <button
                key={d.id}
                onClick={() => setSelDif(d.id)}
                className={`rounded border px-4 py-3 text-left transition-all duration-100
                  ${selDif === d.id
                    ? 'bg-zelda-ink text-white border-zelda-ink'
                    : 'bg-white text-zelda-ink border-zelda-border hover:border-zelda-ink'
                  }`}
              >
                <span className="font-bold text-sm">{d.label}</span>
                <span className={`block text-xs mt-0.5 ${selDif === d.id ? 'text-gray-300' : 'text-zelda-muted'}`}>
                  {d.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Button onClick={handleStart} size="lg">
          JUGAR AHORA →
        </Button>

        {/* Stats strip */}
        <div className="mt-10 pt-6 border-t border-zelda-border grid grid-cols-3 gap-4 text-center max-w-sm">
          {[
            { n: '10', label: 'Links rivales' },
            { n: '175+', label: 'ítems únicos' },
            { n: '22', label: 'mazmorras' },
          ].map(s => (
            <div key={s.label}>
              <div className="font-black text-xl text-zelda-ink">{s.n}</div>
              <div className="text-zelda-muted text-xs uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Steps */}
        <div className="mt-8 grid grid-cols-3 gap-0 border border-zelda-border rounded overflow-hidden text-sm">
          {[
            { n: '01', icon: '🎵', label: 'TOCA',   desc: 'Obtén ítems aleatorios de todas las eras de Zelda' },
            { n: '02', icon: '⚙️', label: 'EQUIPA', desc: 'Combina espadas, armaduras y compañeros de distintas generaciones' },
            { n: '03', icon: '⚔️', label: 'SIMULA', desc: 'Derrota a los 10 Links rivales y sus jefes finales de cada era' },
          ].map((s, i) => (
            <div key={s.n} className={`bg-white p-4 ${i < 2 ? 'border-r border-zelda-border' : ''}`}>
              <div className="text-zelda-gold font-black text-xs mb-1">{s.n} {s.icon} {s.label}</div>
              <div className="text-zelda-muted text-xs leading-snug">{s.desc}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
