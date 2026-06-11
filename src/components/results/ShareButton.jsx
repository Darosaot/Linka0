import { useState } from 'react';
import { buildShareUrl } from '../../utils/shareEncoder.js';
import useGameStore from '../../stores/gameStore.js';
import Button from '../ui/Button.jsx';

export default function ShareButton({ build }) {
  const dificultad = useGameStore(state => state.dificultad);
  const [copied, setCopied] = useState(false);

  function handleShare() {
    const url = buildShareUrl(build, dificultad);
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Button onClick={handleShare} variant="ghost">
      {copied ? '✅ ¡Copiado!' : '🔗 Compartir Build'}
    </Button>
  );
}
