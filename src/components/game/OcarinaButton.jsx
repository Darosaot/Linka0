import useGameStore from '../../stores/gameStore.js';
import Button from '../ui/Button.jsx';

export default function OcarinaButton() {
  const { ocaRinasRestantes, useOcarina, cartaActual } = useGameStore();
  const disabled = ocaRinasRestantes <= 0;

  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        onClick={useOcarina}
        disabled={disabled}
        variant={disabled ? 'ghost' : 'secondary'}
        size="md"
      >
        🎵 Tocar la Ocarina ({ocaRinasRestantes})
      </Button>
      <p className="text-xs text-gray-400">Re-lanza todas las cartas. Quedan {ocaRinasRestantes} uso{ocaRinasRestantes !== 1 ? 's' : ''}.</p>
    </div>
  );
}
