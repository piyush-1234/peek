import { useState } from 'react';

export default function SelfPreview({ localVideoRef, onReady, onLeave }) {
  const [countdown, setCountdown] = useState(null);

  const handleReady = () => {
    setCountdown(3);
    let n = 3;
    const t = setInterval(() => {
      n -= 1;
      if (n <= 0) {
        clearInterval(t);
        onReady();
      } else {
        setCountdown(n);
      }
    }, 800);
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.videoBox}>
        <video ref={localVideoRef} autoPlay playsInline muted style={styles.video} />
        {countdown !== null && (
          <div style={styles.countdownOverlay}>
            <div style={styles.countdownNumber}>{countdown}</div>
          </div>
        )}
      </div>
      <div style={styles.info}>
        <h2 style={styles.h2}>This is you</h2>
        <p style={styles.sub}>Take a moment. When you're ready, we'll find someone new.</p>
      </div>
      <div style={styles.controls}>
        <button style={styles.btnPrimary} onClick={handleReady} disabled={countdown !== null}>
          {countdown !== null ? 'Starting…' : "I'm ready"}
        </button>
        <button style={styles.btnGhost} onClick={onLeave}>Not now</button>
      </div>
    </div>
  );
}

const styles = {
  wrap: { minHeight: '100vh', background: '#0e0e10', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: 'system-ui' },
  videoBox: { position: 'relative', width: '100%', maxWidth: 480, aspectRatio: '4/3', background: '#000', borderRadius: 16, overflow: 'hidden' },
  video: { width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' },
  countdownOverlay: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)' },
  countdownNumber: { fontSize: 96, fontWeight: 700 },
  info: { textAlign: 'center', marginTop: 24, maxWidth: 400 },
  h2: { fontSize: 22, margin: '0 0 8px' },
  sub: { color: '#999', fontSize: 14, margin: 0 },
  controls: { display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap', justifyContent: 'center' },
  btnPrimary: { padding: '14px 32px', fontSize: 16, background: '#fff', color: '#000', border: 'none', borderRadius: 999, cursor: 'pointer', fontWeight: 600 },
  btnGhost: { padding: '14px 24px', fontSize: 16, background: 'transparent', color: '#999', border: '1px solid #333', borderRadius: 999, cursor: 'pointer' },
};