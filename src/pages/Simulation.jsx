export default function Simulation() {
  return (
    <div className="min-h-screen bg-zelda-darkgreen flex flex-col items-center justify-center gap-6 px-4">
      <div className="text-6xl animate-bounce">⚔️</div>
      <h1 className="text-2xl font-bold text-zelda-gold text-center">Simulando el Torneo...</h1>
      <p className="text-gray-300 text-sm text-center max-w-sm">
        Link se enfrenta a los Bokoblins en las mazmorras de Hyrule. Los dioses de la Trifuerza deciden el destino...
      </p>
      <div className="flex gap-2">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-3 h-3 bg-zelda-gold rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
}
