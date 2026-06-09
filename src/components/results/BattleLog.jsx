const RESULTADO_STYLES = {
  victoria: 'border-amber-400 bg-amber-50',
  podio:    'border-green-400 bg-green-50',
  neutral:  'border-zelda-border bg-white',
  derrota:  'border-red-400 bg-red-50',
  ko:       'border-red-600 bg-red-100',
};

const RESULTADO_LABEL = {
  victoria: '🏆 1.º',
  podio:    '🥈 Podio',
  neutral:  '— Mid',
  derrota:  '❌ Derrota',
  ko:       '💀 K.O.',
};

function BossResult({ boss }) {
  if (!boss) return null;
  const style = boss.victoria
    ? 'bg-amber-100 border-amber-400 text-amber-800'
    : boss.resistencia
    ? 'bg-blue-50 border-blue-300 text-blue-800'
    : 'bg-red-50 border-red-300 text-red-800';

  return (
    <div className={`mt-2 rounded border px-3 py-2 text-xs ${style}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="font-bold">
          {boss.emoji} Jefe: {boss.jefe}
        </span>
        {boss.bonus > 0 && (
          <span className="font-black text-zelda-gold">+{boss.bonus} ⭐</span>
        )}
      </div>
      <p className="mt-0.5 opacity-90 leading-snug">{boss.descripcion}</p>
    </div>
  );
}

export default function BattleLog({ combatLog }) {
  if (!combatLog?.length) return null;

  return (
    <div className="flex flex-col gap-2">
      {combatLog.map((c, i) => (
        <div
          key={i}
          className={`rounded border-2 p-4 ${RESULTADO_STYLES[c.resultado] ?? RESULTADO_STYLES.neutral}`}
        >
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xl">{c.emoji}</span>
              <div>
                <div className="font-bold text-zelda-ink text-sm">{c.mazmorra}</div>
                <div className="text-xs text-zelda-muted">
                  Ganó: <span className="font-semibold">{c.topRival}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span className="font-bold text-sm text-zelda-ink">
                {RESULTADO_LABEL[c.resultado]} · Pos {c.linkPos}
              </span>
              <span className="font-black text-zelda-gold text-sm">+{c.puntos} ⭐</span>
            </div>
          </div>
          <p className="text-xs text-zelda-muted mt-2 leading-snug">{c.descripcion}</p>
          <BossResult boss={c.bossResult} />
        </div>
      ))}
    </div>
  );
}
