import { useEffect, useState } from 'react';
import { VideoState } from '../hooks/useVideoChat.js';
import Icebreaker from './Icebreaker.jsx';

export default function VideoRoom({ chat, region }) {
  const {
    state, error,
    localVideoRef, remoteVideoRef, localStreamRef,
    next, retry, leave, report,
  } = chat;

  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [state, localStreamRef, localVideoRef]);

  const overlayText = (() => {
    switch (state) {
      case VideoState.WAITING: return 'Looking for someone…';
      case VideoState.NEGOTIATING: return 'Connecting…';
      case VideoState.FAILED: return error?.message || 'Something went wrong';
      default: return '';
    }
  })();

  const showOverlay =
    state === VideoState.WAITING ||
    state === VideoState.NEGOTIATING ||
    state === VideoState.FAILED;

  return (
    <div style={styles.wrap}>
      <div style={styles.videos}>
        <video ref={remoteVideoRef} autoPlay playsInline style={styles.remote} />
        <div style={styles.localWrap}>
          <video ref={localVideoRef} autoPlay playsInline muted style={styles.local} />
          <span style={styles.localLabel}>You</span>
        </div>

        {state === VideoState.CONNECTED && <Icebreaker visible />}

        {showOverlay && (
          <div style={styles.overlay}>
            {state === VideoState.WAITING && (
              <div style={styles.spinner} aria-hidden="true" />
            )}
            <div style={styles.overlayText}>{overlayText}</div>
            {state === VideoState.FAILED && (
              <div style={{ marginTop: 16 }}>
                <button style={styles.btn} onClick={() => retry(region)}>Try again</button>
              </div>
            )}
          </div>
        )}

        {state === VideoState.DISCONNECTED && (
          <div style={styles.overlay}>
            <div style={styles.overlayText}>They left the chat.</div>
            <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button style={styles.btn} onClick={() => next(region)}>Meet someone new</button>
              <button style={{ ...styles.btn, background: 'linear-gradient(135deg, #ef4444, #f43f5e)' }} onClick={leave}>Leave</button>
            </div>
          </div>
        )}
      </div>

      <div style={styles.controls}>
        <button style={styles.btn} onClick={() => next(region)} disabled={state === VideoState.WAITING}>Next</button>
        <button style={styles.btn} onClick={() => setReportOpen(true)} disabled={state !== VideoState.CONNECTED}>Report</button>
        <button style={{ ...styles.btn, background: 'linear-gradient(135deg, #ef4444, #f43f5e)' }} onClick={leave}>Leave</button>
      </div>

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
        <h3 style={{ margin: '0 0 12px', fontSize: 18 }}>Report this chat</h3>
        <select value={reason} onChange={(e) => setReason(e.target.value)} style={styles.select}>
          <option value="nudity">Nudity / sexual content</option>
          <option value="harassment">Harassment / abuse</option>
          <option value="minor">Underage user</option>
          <option value="spam">Spam / bot</option>
          <option value="other">Other</option>
        </select>
        <div style={{ marginTop: 20, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button style={styles.btn} onClick={onCancel}>Cancel</button>
          <button style={{ ...styles.btn, background: 'linear-gradient(135deg, #f59e0b, #f97316)' }} onClick={() => onSubmit(reason)}>Report & Leave</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrap: { fontFamily: "'Poppins', system-ui", minHeight: '100vh', background: '#0e0e10', color: '#fff', display: 'flex', flexDirection: 'column' },
  videos: { position: 'relative', flex: 1, maxWidth: 900, width: '100%', margin: '0 auto', background: '#000', overflow: 'hidden' },
  remote: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  localWrap: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 140,
    height: 105,
    borderRadius: 14,
    overflow: 'hidden',
    border: '2px solid rgba(168,85,247,0.6)',
    boxShadow: '0 8px 24px rgba(168,85,247,0.4)',
    background: '#111',
  },
  local: { width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', display: 'block' },
  localLabel: {
    position: 'absolute',
    bottom: 4,
    left: 8,
    fontSize: 11,
    color: '#fff',
    textShadow: '0 1px 2px rgba(0,0,0,0.8)',
    fontWeight: 600,
  },
  overlay: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(10,5,25,0.88)', padding: 20, textAlign: 'center' },
  overlayText: { fontSize: 16, color: '#e0d5f5' },
  overlaySub: { marginTop: 10, fontSize: 13, color: '#a78bfa' },
  spinner: { width: 44, height: 44, border: '3px solid rgba(168,85,247,0.2)', borderTopColor: '#a855f7', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: 20 },
  controls: { display: 'flex', justifyContent: 'center', gap: 12, padding: 20, flexWrap: 'wrap' },
  btn: { padding: '12px 26px', fontSize: 15, background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: '#fff', border: 'none', borderRadius: 999, cursor: 'pointer', fontWeight: 600, fontFamily: "'Fredoka', sans-serif", boxShadow: '0 8px 20px -6px rgba(168,85,247,0.5)' },
  modalBg: { position: 'fixed', inset: 0, background: 'rgba(10,5,25,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 },
  modal: { background: '#1a0f2e', padding: 24, borderRadius: 20, minWidth: 300, maxWidth: 400, width: '100%', border: '1px solid rgba(168,85,247,0.3)' },
  select: { width: '100%', padding: 12, fontSize: 14, background: '#0e0820', color: '#fff', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 10 },
};