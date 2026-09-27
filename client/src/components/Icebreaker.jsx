import { useEffect, useState } from 'react';
import { randomIcebreaker } from '../lib/icebreakers.js';

export default function Icebreaker({ visible }) {
  const [prompt, setPrompt] = useState(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!visible) {
      setShown(false);
      setPrompt(null);
      return;
    }
    setPrompt(randomIcebreaker());
    setShown(true);
    const t = setTimeout(() => setShown(false), 15000);
    return () => clearTimeout(t);
  }, [visible]);

  if (!shown || !prompt) return null;

  return (
    <div style={styles.wrap}>
      <span style={styles.label}>Try asking</span>
      <span style={styles.text}>{prompt}</span>
    </div>
  );
}

const styles = {
  wrap: { position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.75)', padding: '12px 20px', borderRadius: 999, display: 'flex', gap: 10, alignItems: 'center', backdropFilter: 'blur(8px)', maxWidth: '90%', animation: 'fadeIn 0.4s ease' },
  label: { fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' },
  text: { fontSize: 14, color: '#fff' },
};