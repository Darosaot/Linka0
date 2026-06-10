import useGameStore from '../../stores/gameStore.js';
import Button from '../ui/Button.jsx';

export default function OcarinaButton() {
  const ocaRinasRestantes = useGameStore(state => state.ocaRinasRestantes);
  const useOcarina = useGameStore(state => state.useOcarina);
  const disabled = ocaRinasRestantes <= 0;

  return (
    <div className="flex flex-col items-end gap-0.5">
      <Button onClick={useOcarina} disabled={disabled} variant="secondary" size="sm">
        🎵 Tocar la Ocarina ({ocaRinasRestantes})
      </Button>
      <p className="text-xs text-zelda-muted">Re-lanza todos los ítems</p>
    </div>
  );
}
