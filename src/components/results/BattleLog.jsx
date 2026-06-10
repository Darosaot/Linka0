// Presentation mapping for duel result tags produced by the simulator
const DUEL_PRESENTATION = {
  victoria_clara:    { label: '🏆 Victoria',           color: 'text-green-700', card: 'border-amber-400 bg-amber-50' },
  victoria_ajustada: { label: '⚔️ Victoria ajustada',  color: 'text-amber-700', card: 'border-green-400 bg-green-50' },
  derrota_ajustada:  { label: '🛡️ Resistió',           color: 'text-blue-700',  card: 'border-zelda-border bg-white' },
  derrota:           { label: '❌ Derrota',             color: 'text-red-600',   card: 'border-red-400 bg-red-50' },
  ko:                { label: '💀 K.O.',                color: 'text-red-600',   card: 'border-red-600 bg-red-100' },
};

const FALLBACK_PRESENTATION = { label: '', color: 'text-zelda-muted', card: 'border-zelda-border bg-white' };

function duelDesc(tag, rivalName, game) {
  switch (tag) {
    case 'victoria_clara':    return `🏆 Link arrasó a ${rivalName}. El equipamiento elegido fue claramente superior al de ${game}.`;
    case 'victoria_ajustada': return `⚔️ Victoria ajustada sobre ${rivalName}. Ambos Links estaban al límite, pero el nuestro salió victorioso.`;
    case 'derrota_ajustada':  return `🛡️ ${rivalName} ganó por los pelos. El Link de ${game} contaba con una ventaja de equipamiento mínima.`;
    case 'derrota':           return `❌ ${rivalName} dominó el combate. El equipamiento de ${game} fue claramente superior.`;
    case 'ko':                return `💀 K.O. fulminante. ${rivalName} no dejó a Link ni reaccionar.`;
    default:                  return '';
  }
}

function DuelRow({ label, result, desc }) {
  const pres = DUEL_PRESENTATION[result?.tag] ?? FALLBACK_PRESENTATION;

  return (
    <div className="mt-2 text-xs">
      <div className="flex items-center justify-between gap-2">
        <span className="font-bold text-zelda-ink">{label}</span>
        <div className="flex items-center gap-2">
          <span className={`font-bold ${pres.color}`}>{pres.label}</span>
          <span className="font-black text-zelda-gold">+{result?.puntos ?? 0} ⭐</span>
        </div>
      </div>
      {desc && <p className="mt-0.5 text-zelda-muted leading-snug">{desc}</p>}
    </div>
  );
}

export default function BattleLog({ combatLog }) {
  if (!combatLog?.length) return null;

  return (
    <div className="flex flex-col gap-3">
      {combatLog.map((c, i) => {
        const pres = DUEL_PRESENTATION[c.duelo?.tag] ?? FALLBACK_PRESENTATION;
        return (
          <div key={i} className={`rounded border-2 p-4 ${pres.card}`}>

            {/* Header: rival Link */}
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{c.rival.emoji}</span>
                <div>
                  <div className="font-black text-zelda-ink text-sm">{c.rival.name}</div>
                  <div className="text-xs text-zelda-muted">{c.rival.game} · {c.rival.year}</div>
                  {c.rivalRating != null && (
                    <span className="inline-block mt-0.5 text-xs font-bold bg-slate-100 border border-slate-300 text-slate-700 rounded px-1.5 py-0.5">
                      ★ {c.rivalRating} rival
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-zelda-muted">Arena: {c.arenaEmoji} {c.mazmorra}</div>
              </div>
            </div>

            {/* Gear preview */}
            <div className="mt-1.5 flex flex-wrap gap-1">
              {c.rival.equipamiento?.map(item => (
                <span key={item} className="text-xs bg-white border border-zelda-border rounded px-1.5 py-0.5 text-zelda-muted">
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-2 border-t border-zelda-border pt-2">
              <DuelRow
                label={`⚔️ Duelo vs ${c.rival.alias ?? c.rival.name}`}
                result={c.duelo}
                desc={duelDesc(c.duelo?.tag, c.rival.name, c.rival.game)}
              />
            </div>

          </div>
        );
      })}
    </div>
  );
}
