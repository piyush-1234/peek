import { MatchState } from '../hooks/useMatch.js';

export default function StatusPanel({ state, peerId, initiator, error, onCancel, onLeave }) {
  return (
    <div style={styles.wrap}>
      <div style={styles.status}>
        {state === MatchState.WAITING && 'Looking for someone...'}
        {state === MatchState.MATCHED && `Matched! ${initiator ? '(you initiate)' : '(peer initiates)'}`}
        {state === MatchState.TIMEOUT && 'No one available right now.'}
        {state === MatchState.ERROR && `Error: ${error?.message || 'unknown'}`}
      </div>
      {peerId && <div style={styles.peer}>Peer: {peerId.slice(0, 8)}</div>}
      <div style={styles.row}>
        {state === MatchState.WAITING && <button style={styles.btn} onClick={onCancel}>Cancel</button>}
        {state === MatchState.MATCHED && <button style={styles.btn} onClick={onLeave}>Leave</button>}
      </div>
    </div>
  );
}

const styles = {
  wrap: { maxWidth: 500, margin: '40px auto', textAlign: 'center', fontFamily: 'system-ui' },
  status: { fontSize: 18, padding: 20, background: '#f5f5f5', borderRadius: 8 },
  peer: { fontSize: 12, color: '#999', marginTop: 8 },
  row: { marginTop: 16 },
  btn: { padding: '10px 24px', fontSize: 14, background: '#111', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' },
};