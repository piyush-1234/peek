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
  wrap: { minHeight: '100vh', background: 'radial-gradient(900px 600px at 30% 20%, #f3e8ff 0%, transparent 60%), radial-gradient(700px 500px at 80% 80%, #fce7f3 0%, transparent 60%), #fdfaff', color: '#2d1b4e', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'Poppins', system-ui" },
  videoBox: { position: 'relative', width: '100%', maxWidth: 480, aspectRatio: '4/3', background: '#000', borderRadius: 24, overflow: 'hidden', boxShadow: '0 20px 50px -15px rgba(168,85,247,0.5)', border: '3px solid #fff' },
  video: { width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' },
  countdownOverlay: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)' },
  countdownNumber: { fontSize: 96, fontWeight: 700, color: '#fff', fontFamily: "'Fredoka', sans-serif" },
  info: { textAlign: 'center', marginTop: 24, maxWidth: 400 },
  h2: { fontFamily: "'Fredoka', sans-serif", fontSize: 26, margin: '0 0 8px', color: '#2d1b4e' },
  sub: { color: '#6b5b8a', fontSize: 14, margin: 0 },
  controls: { display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap', justifyContent: 'center' },
  btnPrimary: { padding: '16px 40px', fontSize: 16, background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: '#fff', border: 'none', borderRadius: 999, cursor: 'pointer', fontWeight: 600, fontFamily: "'Fredoka', sans-serif", boxShadow: '0 14px 30px -8px rgba(168,85,247,0.5)' },
  btnGhost: { padding: '16px 32px', fontSize: 15, background: 'transparent', color: '#6b5b8a', border: '1px solid #e8e0f5', borderRadius: 999, cursor: 'pointer', fontWeight: 500 },
};