import { useState } from 'react';
import Nav from './Nav.jsx';

export default function SelfPreview({ localVideoRef, onReady, onLeave, online }) {
  const [countdown, setCountdown] = useState(null);

  const handleReady = () => {
    setCountdown(3);
    let n = 3;
    const t = setInterval(() => {
      n -= 1;
      if (n <= 0) { clearInterval(t); onReady(); }
      else setCountdown(n);
    }, 800);
  };

  return (
    <div className="preview-page">
      <div className="blob blob-a" />
      <div className="blob blob-b" />
      <Nav online={online} onLogoClick={onLeave} showStats />

      <div className="preview-inner">
        <div className="preview-video-box">
          <video ref={localVideoRef} autoPlay playsInline muted className="preview-video" />
          {countdown !== null && (
            <div className="preview-countdown-overlay">
              <div className="preview-countdown-number">{countdown}</div>
            </div>
          )}
          <div className="preview-live-badge">● This is you</div>
        </div>

        <div className="preview-info">
          <h2 className="preview-title">Looking good! ✨</h2>
          <p className="preview-sub">
            Take a moment. When you're ready, we'll find someone new for you.
          </p>
        </div>

        <div className="preview-controls">
          <button className="preview-btn-primary" onClick={handleReady} disabled={countdown !== null}>
            {countdown !== null ? 'Starting…' : "I'm ready →"}
          </button>
          <button className="preview-btn-ghost" onClick={onLeave}>
            ← Not now
          </button>
        </div>
      </div>
    </div>
  );
}