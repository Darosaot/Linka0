export default function StatBar({ label, value, max = 100, color = 'bg-zelda-ink' }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-24 text-right text-zelda-muted shrink-0 capitalize">{label.replace(/_/g, ' ')}</span>
      <div className="flex-1 h-1.5 bg-zelda-border rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-7 text-right text-zelda-ink font-bold">{value}</span>
    </div>
  );
}
