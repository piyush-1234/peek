import { VideoState } from '../hooks/useVideoChat.js';

export default function VideoRoom({ chat, region }) {
  const { state, peerId, localVideoRef, remoteVideoRef, error, next, leave } = chat;

  return (
    <div style={styles.wrap}>
      <div style={styles.videos}>
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          style={styles.remote}
        />
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          style={styles.local}
        />
        {state !== VideoState.CONNECTED && (
          <div style={styles.overlay}>
            {state === VideoState.WAITING && 'Looking for someone...'}
            {state === VideoState.NEGOTIATING && 'Connecting...'}
            {state === VideoState.FAILED && (error?.message || 'Failed')}
            {state === VideoState.REQUESTING_MEDIA && 'Requesting camera...'}
          </div>
        )}
      </div>
      <div style={styles.controls}>
        <button style={styles.btn} onClick={() => next(region)}>Next</button>
        <button style={{ ...styles.btn, background: '#c33' }} onClick={leave}>Leave</button>
      </div>
      {peerId && <div style={styles.peer}>Peer: {peerId.slice(0, 8)}</div>}
    </div>
  );
}

const styles = {
  wrap: { fontFamily: 'system-ui', minHeight: '100vh', background: '#111', color: '#fff' },
  videos: { position: 'relative', maxWidth: 900, margin: '0 auto', aspectRatio: '16/9', background: '#000' },
  remote: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  local: { position: 'absolute', bottom: 16, right: 16, width: 160, height: 120, objectFit: 'cover', border: '2px solid #fff', borderRadius: 8, transform: 'scaleX(-1)' },
  overlay: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', fontSize: 18 },
  controls: { display: 'flex', justifyContent: 'center', gap: 16, padding: 20 },
  btn: { padding: '12px 28px', fontSize: 16, background: '#333', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' },
  peer: { textAlign: 'center', fontSize: 12, color: '#666', paddingBottom: 16 },
};