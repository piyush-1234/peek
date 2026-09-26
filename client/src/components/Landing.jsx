import { useState } from 'react';
import { MatchState } from '../hooks/useMatch.js';

const REGIONS = [
  { id: 'en:in', label: 'English · India' },
  { id: 'hi:in', label: 'Hindi · India' },
  { id: 'en:us', label: 'English · US' },
  { id: 'en:uk', label: 'English · UK' },
  { id: 'es:mx', label: 'Spanish · Mexico' },
];

export default function Landing({ onStart }) {
  const [region, setRegion] = useState('en:in');
  return (
    <div style={styles.wrap}>
      <h1 style={styles.h1}>Stranger Chat</h1>
      <p style={styles.sub}>Talk to someone new. No profile. No history.</p>
      <select value={region} onChange={(e) => setRegion(e.target.value)} style={styles.select}>
        {REGIONS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
      </select>
      <button style={styles.btn} onClick={() => onStart(region)}>Start</button>
      <p style={styles.warn}>18+ only. Be kind. Report abuse.</p>
    </div>
  );
}

const styles = {
  wrap: { maxWidth: 400, margin: '80px auto', textAlign: 'center', fontFamily: 'system-ui' },
  h1: { fontSize: 32, marginBottom: 8 },
  sub: { color: '#666', marginBottom: 24 },
  select: { width: '100%', padding: 12, fontSize: 16, marginBottom: 16, borderRadius: 8, border: '1px solid #ccc' },
  btn: { width: '100%', padding: 14, fontSize: 16, background: '#111', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' },
  warn: { fontSize: 12, color: '#999', marginTop: 16 },
};