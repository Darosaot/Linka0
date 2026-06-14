import { useEffect, useState } from 'react';
import useCopaStore from '../stores/copaStore.js';
import useGameStore from '../stores/gameStore.js';
import Button from '../components/ui/Button.jsx';
import { SLOT_KEYS } from '../utils/ratingEngine.js';
import { STAT_LABELS } from '../utils/dataQueries.js';
import { COPA_SIZES } from '../utils/copaRoom.js';
import { buildCopaInviteUrl } from '../utils/shareEncoder.js';

const POLL_MS = 3000;

const ROUND_NAMES = ['Final', 'Semifinales', 'Cuartos de final'];
const roundName = (roundIdx, totalRounds) => ROUND_NAMES[totalRounds - 1 - roundIdx] ?? `Ronda ${roundIdx + 1}`;

function Shell({ title, subtitle, onExit, children }) {
  return (
    <div className="min-h-screen bg-zelda-bg px-4 py-6">
      <div className="max-w-2xl mx-auto flex flex-col gap-5">
        <div className="flex items-end justify-between pb-3 border-b border-zelda-border">
          <div>
            <p className="text-zelda-muted text-xs tracking-widest uppercase">🏆 Copa Online</p>
            <h1 className="text-xl font-black text-zelda-ink mt-0.5">{title}</h1>
            {subtitle && <p className="text-xs text-zelda-muted mt-1">{subtitle}</p>}
          </div>
          {onExit && (
            <Button onClick={onExit} variant="ghost" size="sm">Salir</Button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

function ErrorBanner({ error }) {
  if (!error) return null;
  return (
    <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded px-3 py-2">
      {error}
    </div>
  );
}

function Menu() {
  const crear = useCopaStore(s => s.crear);
  const unirse = useCopaStore(s => s.unirse);
  const busy = useCopaStore(s => s.busy);
  const error = useCopaStore(s => s.error);
  const pendingInvite = useCopaStore(s => s.pendingInvite);
  const resetGame = useGameStore(s => s.resetGame);

  const [name, setName] = useState('');
  const [size, setSize] = useState(4);
  const [joinCode, setJoinCode] = useState(pendingInvite ?? '');

  const inputClass = 'border border-zelda-border rounded px-3 py-2 text-sm bg-white text-zelda-ink w-full focus:outline-none focus:border-zelda-ink';

  return (
    <Shell
      title={pendingInvite ? 'Te han invitado a una copa' : 'Elige tu copa'}
      subtitle={pendingInvite ? 'Escribe tu nombre y únete a la sala' : 'Crea una sala y comparte el código, o únete con uno'}
      onExit={resetGame}
    >
      <ErrorBanner error={error} />

      {pendingInvite && (
        <div className="bg-amber-50 border-2 border-zelda-gold rounded-xl px-4 py-3 text-center">
          <div className="text-xs text-zelda-muted uppercase tracking-widest">🎟️ Invitación a la sala</div>
          <div className="text-2xl font-black text-zelda-ink tracking-[0.3em] mt-1">{pendingInvite}</div>
        </div>
      )}

      <div className="bg-white border border-zelda-border rounded-xl p-4 flex flex-col gap-3">
        <label className="text-xs font-bold text-zelda-muted uppercase tracking-widest">Tu nombre</label>
        <input
          className={inputClass}
          value={name}
          maxLength={20}
          placeholder="Link de Ordon"
          onChange={e => setName(e.target.value)}
        />
      </div>

      <div className="bg-white border border-zelda-border rounded-xl p-4 flex flex-col gap-3">
        <div className="font-bold text-zelda-ink text-sm">Crear sala nueva</div>
        <div className="flex gap-2">
          {COPA_SIZES.map(n => (
            <button
              key={n}
              onClick={() => setSize(n)}
              className={`flex-1 rounded border px-3 py-2 text-sm font-bold transition-all
                ${size === n ? 'bg-zelda-ink text-white border-zelda-ink' : 'bg-white text-zelda-ink border-zelda-border hover:border-zelda-ink'}`}
            >
              {n} participantes
            </button>
          ))}
        </div>
        <p className="text-xs text-zelda-muted">Los huecos sin jugadores se rellenan con CPUs que draftean solas.</p>
        <Button onClick={() => crear(name, size)} disabled={busy || !name.trim()}>
          {busy ? 'Creando…' : 'Crear sala →'}
        </Button>
      </div>

      <div className="bg-white border border-zelda-border rounded-xl p-4 flex flex-col gap-3">
        <div className="font-bold text-zelda-ink text-sm">Entrar con código</div>
        <input
          className={`${inputClass} uppercase tracking-[0.3em] font-black text-center`}
          value={joinCode}
          maxLength={5}
          placeholder="ABCDE"
          onChange={e => setJoinCode(e.target.value.toUpperCase())}
        />
        <Button onClick={() => unirse(joinCode, name)} disabled={busy || !name.trim() || joinCode.trim().length < 5} variant={pendingInvite ? 'primary' : 'secondary'}>
          {busy ? 'Entrando…' : 'Unirse a la sala →'}
        </Button>
      </div>
    </Shell>
  );
}

function PlayerRow({ player, miId }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <span className="text-xl">{player.emoji}</span>
      <span className="font-bold text-zelda-ink text-sm">
        {player.name}
        {player.id === miId && <span className="text-zelda-gold"> (tú)</span>}
      </span>
      {player.isCpu && (
        <span className="text-xs bg-slate-100 border border-slate-300 text-slate-600 rounded px-1.5 py-0.5">CPU</span>
      )}
      <span className="ml-auto text-xs font-bold">
        {player.listo
          ? <span className="text-green-700">✓ listo</span>
          : <span className="text-zelda-muted">draftando…</span>}
      </span>
    </div>
  );
}

function Sala({ view, onExit }) {
  const iniciar = useCopaStore(s => s.iniciar);
  const busy = useCopaStore(s => s.busy);
  const error = useCopaStore(s => s.error);
  const [copied, setCopied] = useState(false);
  const [linkShared, setLinkShared] = useState(false);

  const soyHost = view.miId === view.players[0]?.id;
  const cpusNecesarias = view.size - view.players.length;

  function copyCode() {
    navigator.clipboard?.writeText(view.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // Native share sheet on mobile, clipboard fallback elsewhere
  async function shareInvite() {
    const url = buildCopaInviteUrl(view.code);
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Linka0 — Copa Online',
          text: `Únete a mi copa en Linka0 (código ${view.code})`,
          url,
        });
        return;
      } catch {
        // user cancelled the share sheet — nothing to do
        return;
      }
    }
    navigator.clipboard?.writeText(url).then(() => {
      setLinkShared(true);
      setTimeout(() => setLinkShared(false), 2000);
    });
  }

  return (
    <Shell title="Sala de espera" subtitle={`Copa de ${view.size} participantes`} onExit={onExit}>
      <ErrorBanner error={error} />

      <button
        onClick={copyCode}
        className="bg-white border-2 border-zelda-gold rounded-xl px-6 py-4 text-center cursor-pointer hover:shadow-md transition-all"
      >
        <div className="text-xs text-zelda-muted uppercase tracking-widest mb-1">Código de sala — compártelo</div>
        <div className="text-4xl font-black text-zelda-ink tracking-[0.3em]">{view.code}</div>
        <div className="text-xs text-zelda-gold font-bold mt-1">{copied ? '✅ ¡Copiado!' : '📋 Toca para copiar'}</div>
      </button>

      <Button onClick={shareInvite} variant="secondary">
        {linkShared ? '✅ ¡Enlace copiado!' : '🔗 Compartir enlace de invitación'}
      </Button>

      <div className="bg-white border border-zelda-border rounded-xl overflow-hidden">
        <div className="px-4 py-2 text-sm font-bold text-zelda-ink bg-zelda-surface border-b border-zelda-border">
          Jugadores ({view.players.length}/{view.size})
        </div>
        <div className="divide-y divide-zelda-border">
          {view.players.map(p => <PlayerRow key={p.id} player={p} miId={view.miId} />)}
        </div>
      </div>

      {soyHost ? (
        <div className="flex flex-col items-center gap-2">
          <Button onClick={iniciar} disabled={busy} size="lg">
            {busy ? 'Iniciando…' : '⚔️ Iniciar la copa'}
          </Button>
          {cpusNecesarias > 0 && (
            <p className="text-xs text-zelda-muted">
              {cpusNecesarias} hueco{cpusNecesarias > 1 ? 's' : ''} se rellenará{cpusNecesarias > 1 ? 'n' : ''} con CPU
            </p>
          )}
        </div>
      ) : (
        <p className="text-center text-sm text-zelda-muted">Esperando a que el anfitrión inicie la copa…</p>
      )}
    </Shell>
  );
}

function Espera({ view, onExit }) {
  const error = useCopaStore(s => s.error);
  const pendientes = view.players.filter(p => !p.listo);
  return (
    <Shell title="Draft enviado" subtitle="Esperando al resto de participantes" onExit={onExit}>
      <ErrorBanner error={error} />
      <div className="text-center py-6">
        <div className="text-5xl mb-3 animate-bounce">🎴</div>
        <p className="text-sm text-zelda-muted">
          {pendientes.length
            ? `Faltan ${pendientes.length} jugador${pendientes.length > 1 ? 'es' : ''} por terminar su draft`
            : 'Simulando la copa…'}
        </p>
      </div>
      <div className="bg-white border border-zelda-border rounded-xl overflow-hidden divide-y divide-zelda-border">
        {view.players.map(p => <PlayerRow key={p.id} player={p} miId={view.miId} />)}
      </div>
    </Shell>
  );
}

function DueloDetalle({ duelo, nameA, nameB }) {
  return (
    <div className="mt-2 flex flex-col gap-1">
      {duelo.rondas.map((r, i) => (
        <div key={i} className="flex items-center justify-between gap-2 text-xs bg-zelda-surface rounded px-2 py-1">
          <span className="text-zelda-muted truncate">
            {r.arenaEmoji} {r.mazmorra} · favorece {STAT_LABELS[r.favorece] ?? r.favorece}
          </span>
          <span className="font-bold shrink-0">
            <span className={r.ganador === 0 ? 'text-green-700' : 'text-zelda-muted'}>{r.perfA}</span>
            <span className="text-zelda-muted"> – </span>
            <span className={r.ganador === 1 ? 'text-green-700' : 'text-zelda-muted'}>{r.perfB}</span>
          </span>
        </div>
      ))}
      <div className="text-xs text-zelda-muted text-right">
        {nameA} {duelo.marcador[0]} – {duelo.marcador[1]} {nameB}
      </div>
    </div>
  );
}

function Resultados({ view, onExit }) {
  const byId = Object.fromEntries(view.players.map(p => [p.id, p]));
  const { rounds, campeonId } = view.resultados;
  const campeon = byId[campeonId];
  const soyCampeon = campeonId === view.miId;

  return (
    <Shell title="Resultados de la copa" onExit={onExit}>
      <div className={`border-2 rounded-xl px-6 py-5 text-center ${soyCampeon ? 'bg-amber-50 border-zelda-gold' : 'bg-white border-zelda-border'}`}>
        <div className="text-4xl mb-1">🏆</div>
        <div className="text-xs text-zelda-muted uppercase tracking-widest">Campeón</div>
        <div className="text-2xl font-black text-zelda-ink mt-1">{campeon.emoji} {campeon.name}</div>
        {soyCampeon && <div className="text-sm font-bold text-zelda-gold mt-1">¡Has ganado la copa! 🎉</div>}
      </div>

      {rounds.map((ties, roundIdx) => (
        <div key={roundIdx}>
          <p className="text-zelda-muted text-xs font-bold uppercase tracking-widest mb-2">
            {roundName(roundIdx, rounds.length)}
          </p>
          <div className="flex flex-col gap-2">
            {ties.map((tie, i) => {
              const pa = byId[tie.a];
              const pb = byId[tie.b];
              return (
                <details key={i} className="bg-white border border-zelda-border rounded-lg px-4 py-3">
                  <summary className="cursor-pointer flex items-center justify-between gap-2 text-sm list-none">
                    <span className={`font-bold ${tie.ganadorId === tie.a ? 'text-zelda-ink' : 'text-zelda-muted line-through'}`}>
                      {pa.emoji} {pa.name}{pa.id === view.miId ? ' (tú)' : ''}
                    </span>
                    <span className="font-black text-zelda-gold shrink-0">
                      {tie.duelo.marcador[0]} – {tie.duelo.marcador[1]}
                    </span>
                    <span className={`font-bold text-right ${tie.ganadorId === tie.b ? 'text-zelda-ink' : 'text-zelda-muted line-through'}`}>
                      {pb.emoji} {pb.name}{pb.id === view.miId ? ' (tú)' : ''}
                    </span>
                  </summary>
                  <DueloDetalle duelo={tie.duelo} nameA={pa.name} nameB={pb.name} />
                </details>
              );
            })}
          </div>
        </div>
      ))}

      <div className="text-center pb-8">
        <Button onClick={onExit} size="lg">🔄 Nueva partida</Button>
      </div>
    </Shell>
  );
}

export default function Copa() {
  const code = useCopaStore(s => s.code);
  const view = useCopaStore(s => s.view);
  const refrescar = useCopaStore(s => s.refrescar);
  const enviarBuild = useCopaStore(s => s.enviarBuild);
  const salir = useCopaStore(s => s.salir);

  const build = useGameStore(s => s.build);
  const modo = useGameStore(s => s.modo);
  const startGame = useGameStore(s => s.startGame);
  const resetGame = useGameStore(s => s.resetGame);

  const me = view?.players?.find(p => p.id === view.miId);

  // Poll the room while it can still change under us
  useEffect(() => {
    if (!code) return;
    refrescar();
    const id = setInterval(() => {
      if (useCopaStore.getState().view?.phase !== 'finished') refrescar();
    }, POLL_MS);
    return () => clearInterval(id);
  }, [code, refrescar]);

  // Drafting phase: send the finished cup build, or kick off my draft.
  // The modo guard avoids submitting a leftover build from a solo run.
  useEffect(() => {
    if (view?.phase !== 'drafting' || !me || me.listo) return;
    const buildComplete = modo === 'copa' && SLOT_KEYS.every(s => build[s] !== undefined);
    if (buildComplete) enviarBuild(build);
    else startGame('copa');
  }, [view?.phase, me, build, modo, enviarBuild, startGame]);

  function handleExit() {
    salir();
    resetGame();
  }

  if (!code) return <Menu />;
  if (!view) {
    return (
      <Shell title="Conectando con la sala…" onExit={handleExit}>
        <div className="text-center py-10 text-4xl animate-bounce">🎵</div>
      </Shell>
    );
  }
  if (view.phase === 'lobby') return <Sala view={view} onExit={handleExit} />;
  if (view.phase === 'finished' && view.resultados) return <Resultados view={view} onExit={handleExit} />;
  return <Espera view={view} onExit={handleExit} />;
}
