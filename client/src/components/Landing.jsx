import { useEffect, useState } from 'react';

const REGIONS = [
  { id: 'anywhere', label: '🌍 Anywhere' },
  { id: 'en:in', label: '🇮🇳 India (English)' },
  { id: 'hi:in', label: '🇮🇳 India (Hindi)' },
  { id: 'en:us', label: '🇺🇸 United States' },
  { id: 'en:uk', label: '🇬🇧 United Kingdom' },
  { id: 'es:mx', label: '🇲🇽 Mexico' },
];

export default function Landing({ onStart }) {
  const [region, setRegion] = useState('anywhere');
  const [showRegions, setShowRegions] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('peek_age_ok') === '1') {
      setAgeConfirmed(true);
    }
  }, []);

  const handleAge = (checked) => {
    setAgeConfirmed(checked);
    if (checked) localStorage.setItem('peek_age_ok', '1');
    else localStorage.removeItem('peek_age_ok');
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.inner}>
        <div style={styles.logo}>Peek</div>

        <h1 style={styles.h1}>Meet someone new.<br />In seconds.</h1>
        <p style={styles.sub}>
          Peek connects you with a real person, somewhere in the world, right now.
          No profiles. No history. No pressure.
        </p>

        <label style={styles.ageRow}>
          <input
            type="checkbox"
            checked={ageConfirmed}
            onChange={(e) => handleAge(e.target.checked)}
            style={styles.checkbox}
          />
          <span style={styles.ageText}>I am 18 or older</span>
        </label>

        <button
          style={{ ...styles.cta, opacity: ageConfirmed ? 1 : 0.4, cursor: ageConfirmed ? 'pointer' : 'not-allowed' }}
          disabled={!ageConfirmed}
          onClick={() => onStart(region)}
        >
          Start Peeking
        </button>

        <button style={styles.regionToggle} onClick={() => setShowRegions((v) => !v)}>
          {REGIONS.find((r) => r.id === region)?.label} · change
        </button>

        {showRegions && (
          <div style={styles.regionList}>
            {REGIONS.map((r) => (
              <button
                key={r.id}
                style={{ ...styles.regionItem, background: r.id === region ? '#222' : 'transparent' }}
                onClick={() => { setRegion(r.id); setShowRegions(false); }}
              >
                {r.label}
              </button>
            ))}
          </div>
        )}

        <p style={styles.note}>
          Every chat is moderated. Leave anytime with one tap.
        </p>
      </div>

      <footer style={styles.footer}>
        <a href="/terms" style={styles.footerLink}>Terms</a>
        <span style={styles.dot}>·</span>
        <a href="/privacy" style={styles.footerLink}>Privacy</a>
        <span style={styles.dot}>·</span>
        <a href="/contact" style={styles.footerLink}>Contact</a>
      </footer>
    </div>
  );
}

const styles = {
  wrap: { minHeight: '100vh', background: '#0e0e10', color: '#fff', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui', padding: '40px 20px 20px' },
  inner: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', maxWidth: 480, margin: '0 auto', width: '100%' },
  logo: { fontSize: 20, fontWeight: 700, letterSpacing: -0.5, marginBottom: 40, color: '#fff' },
  h1: { fontSize: 36, lineHeight: 1.15, margin: '0 0 16px', fontWeight: 700, letterSpacing: -0.5 },
  sub: { fontSize: 15, color: '#999', lineHeight: 1.6, margin: '0 0 32px' },
  ageRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, cursor: 'pointer', userSelect: 'none' },
  checkbox: { width: 18, height: 18, accentColor: '#fff', cursor: 'pointer' },
  ageText: { fontSize: 14, color: '#ccc' },
  cta: { padding: '16px 40px', fontSize: 17, background: '#fff', color: '#000', border: 'none', borderRadius: 999, fontWeight: 600, width: '100%', maxWidth: 280, transition: 'opacity 0.2s' },
  regionToggle: { marginTop: 16, background: 'transparent', border: 'none', color: '#666', fontSize: 13, cursor: 'pointer', padding: 8 },
  regionList: { marginTop: 8, background: '#1a1a1c', borderRadius: 12, padding: 8, width: '100%', maxWidth: 280, display: 'flex', flexDirection: 'column', gap: 2 },
  regionItem: { background: 'transparent', border: 'none', color: '#fff', padding: '10px 16px', fontSize: 14, textAlign: 'left', borderRadius: 8, cursor: 'pointer' },
  note: { fontSize: 12, color: '#555', marginTop: 32, lineHeight: 1.5 },
  footer: { display: 'flex', justifyContent: 'center', gap: 8, paddingTop: 20, fontSize: 12 },
  footerLink: { color: '#666', textDecoration: 'none' },
  dot: { color: '#333' },
};