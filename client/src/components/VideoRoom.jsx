import { useState } from 'react';
import { VideoState } from '../hooks/useVideoChat.js';

export default function VideoRoom({ chat, region }) {
  const {
    state, peerId, localVideoRef, remoteVideoRef, error,
    next, retry, leave, report,
  } = chat;
  const [reportOpen, setReportOpen] = useState(false);

  const showOverlay =
    state !== VideoState.CONNECTED && state !== VideoState.DISCONNECTED;

  const overlayText = (() => {
    switch (state) {
      case VideoState.WAITING: return 'Looking for someone...';
      case VideoState.NEGOTIATING: return 'Connecting...';
      case VideoState.REQUESTING_MEDIA: return 'Requesting camera...';
      case VideoState.FAILED: return error?.message || 'Failed';
      default: return '';
    }
  })();

  return (
    <div style={styles.wrap}>
      <div style={styles.videos}>
        <video ref={remoteVideoRef} autoPlay playsInline style={styles.remote} />
        <video ref={localVideoRef} autoPlay playsInline muted style={styles.local} />

        {showOverlay && (
          <div style={styles.overlay}>
            <div>{overlayText}</div>
            {state === VideoState.FAILED && (
              <div style={{ marginTop: 12 }}>
                <button style={styles.btn} onClick={() => retry(region)}>Try again</button>
              </div>
            )}
          </div>
        )}

        {state === VideoState.DISCONNECTED && (
          <div style={styles.overlay}>
            <div>Stranger disconnected.</div>
            <div style={{ marginTop: 12, display: 'flex', gap: 12 }}>
              <button style={styles.btn} onClick={() => next(region)}>Next</button>
              <button style={{ ...styles.btn, background: '#c33' }} onClick={leave}>Leave</button>
            </div>
          </div>
        )}
      </div>

      <div style={styles.controls}>
        <button style={styles.btn} onClick={() => next(region)}>Next</button>
        <button style={styles.btn} onClick={() => setReportOpen(true)}>Report</button>
        <button style={{ ...styles.btn, background: '#c33' }} onClick={leave}>Leave</button>
      </div>

      {peerId && <div style={styles.peer}>Peer: {peerId.slice(0, 8)}</div>}

      {reportOpen && (
        <ReportDialog
          onCancel={() => setReportOpen(false)}
          onSubmit={(reason) => {
            report(reason);
            setReportOpen(false);
            leave();
          }}
        />
      )}
    </div>
  );
}

function ReportDialog({ onCancel, onSubmit }) {
  const [reason, setReason] = useState('nudity');
  return (
    <div style={styles.modalBg}>
      <div style={styles.modal}>
        <h3 style={{ margin: '0 0 12px' }}>Report stranger</h3>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          style={styles.select}
        >
          <option value="nudity">Nudity / sexual content</option>
          <option value="harassment">Harassment / abuse</option>
          <option value="minor">Underage user</option>
          <option value="spam">Spam / bot</option>
          <option value="other">Other</option>
        </select>
        <div style={{ marginTop: 16, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button style={styles.btn} onClick={onCancel}>Cancel</button>
          <button style={{ ...styles.btn, background: '#c33' }} onClick={() => onSubmit(reason)}>Report & Leave</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrap: { fontFamily: 'system-ui', minHeight: '100vh', background: '#111', color: '#fff' },
  videos: { position: 'relative', maxWidth: 900, margin: '0 auto', aspectRatio: '16/9', background: '#000' },
  remote: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  local: { position: 'absolute', bottom: 16, right: 16, width: 160, height: 120, objectFit: 'cover', border: '2px solid #fff', borderRadius: 8, transform: 'scaleX(-1)' },
  overlay: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', fontSize: 18, textAlign: 'center', padding: 20 },
  controls: { display: 'flex', justifyContent: 'center', gap: 16, padding: 20 },
  btn: { padding: '12px 24px', fontSize: 16, background: '#333', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' },
  peer: { textAlign: 'center', fontSize: 12, color: '#666', paddingBottom: 16 },
  modalBg: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal: { background: '#222', padding: 24, borderRadius: 12, minWidth: 320 },
  select: { width: '100%', padding: 10, fontSize: 14, background: '#111', color: '#fff', border: '1px solid #444', borderRadius: 6 },
};