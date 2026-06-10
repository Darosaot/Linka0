export default function Simulation() {
  return (
    <div className="min-h-screen bg-zelda-bg flex flex-col items-center justify-center gap-6 px-4">
      <div className="text-6xl animate-bounce">⚔️</div>
      <h1 className="text-2xl font-black text-zelda-ink text-center">Simulando el Torneo...</h1>
      <p className="text-zelda-muted text-sm text-center max-w-sm leading-relaxed">
        Link se enfrenta a los Links del pasado en las mazmorras de Hyrule. Los dioses de la Trifuerza deciden el destino...
      </p>
      <div className="flex gap-2">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-3 h-3 bg-zelda-ink rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
}
