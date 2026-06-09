function DuelRow({ label, result, desc }) {
  const color = (result?.tag === 'victoria_clara')
    ? 'text-green-700'
    : (result?.tag === 'victoria_ajustada')
    ? 'text-amber-700'
    : (result?.tag === 'derrota_ajustada')
    ? 'text-blue-700'
    : 'text-red-600';

  return (
    <div className="mt-2 text-xs">
      <div className="flex items-center justify-between gap-2">
        <span className="font-bold text-zelda-ink">{label}</span>
        <div className="flex items-center gap-2">
          <span className={`font-bold ${color}`}>{result?.label}</span>
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
      {combatLog.map((c, i) => (
        <div key={i} className={`rounded border-2 p-4 ${c.cardStyle}`}>

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
              desc={c.duelDesc}
            />
          </div>

        </div>
      ))}
    </div>
  );
}
