import { useEffect, useState } from 'react';

const REGIONS = [
  { id: 'anywhere', label: '🌍 Anywhere' },
  { id: 'en:in', label: '🇮🇳 India (English)' },
  { id: 'hi:in', label: '🇮🇳 India (Hindi)' },
  { id: 'en:us', label: '🇺🇸 United States' },
  { id: 'en:uk', label: '🇬🇧 United Kingdom' },
  { id: 'es:mx', label: '🇲🇽 Mexico' },
];

const FEATURES = [
  { emoji: '🌍', title: 'Random Global Chats', desc: 'Meet people from different regions, cultures and backgrounds — totally random!', color: 'blue' },
  { emoji: '👥', title: '1 to Many Video Chat', desc: 'Chat one-to-one or with multiple strangers in the same room.', color: 'pink' },
  { emoji: '🎁', title: 'Rewards System', desc: 'Send & receive virtual rewards when you vibe with someone.', color: 'yellow' },
  { emoji: '🎮', title: 'Play While You Chat', desc: 'Play fun games together and break the ice instantly.', color: 'green' },
  { emoji: '🍕', title: 'Order Food & Treat', desc: 'Order food for yourself or treat your new friend if you like them!', color: 'orange' },
];

export default function Landing({ onStart, online }) {
  const [region, setRegion] = useState('anywhere');
  const [showRegions, setShowRegions] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('peek_age_ok') === '1') setAgeConfirmed(true);
  }, []);

  const handleAge = (checked) => {
    setAgeConfirmed(checked);
    if (checked) localStorage.setItem('peek_age_ok', '1');
    else localStorage.removeItem('peek_age_ok');
  };

  const handleStart = () => {
    if (!ageConfirmed) return;
    onStart(region);
  };

  return (
    <div className="landing">
      {/* decorative blobs */}
      <div className="blob blob-a" />
      <div className="blob blob-b" />
      <div className="blob blob-c" />
      <div className="blob blob-d" />

      {/* NAV */}
      <nav className="nav">
        <img src="/peek-logo.png" alt="Peek" className="nav-logo" />
        <div className="nav-links">
          <a className="nav-link active">Home</a>
          <a className="nav-link">Features</a>
          <a className="nav-link">Community</a>
        </div>
        <button className="nav-cta" onClick={handleStart}>Join Now →</button>
      </nav>

      {/* HERO */}
      <main className="hero">
        <div className="hero-left">
          <p className="hero-eyebrow">Real People. Random Chats. Endless Fun.</p>
          <h1 className="hero-title">
            Meet <span className="grad-purple">Strangers</span>,<br />
            Make <span className="grad-pink">Memories</span>!
          </h1>
          <p className="hero-sub">
            Peek is a next-gen video chat platform where you can connect with people from around the world — chat, play, earn rewards, order food and more!
          </p>

          <div className="pills">
            <span className="pill pill-blue">🌍 Global Random Chats</span>
            <span className="pill pill-yellow">👑 Rewards & Gifting</span>
            <span className="pill pill-purple">🎮 Games Together</span>
            <span className="pill pill-orange">🍕 Order Food & Treat</span>
          </div>

          <div className="stats">
            <div className="online-pill">
              <span className="dot-live" />
              {online?.total > 0 ? `${online.total} online now` : 'Be the first one here'}
            </div>
            {online?.uniqueTotal > 0 && (
              <div className="unique-pill">
                ✨ {online.uniqueTotal.toLocaleString()} {online.uniqueTotal === 1 ? 'person has' : 'people have'} joined
              </div>
            )}
          </div>

          <label className="age-check">
            <input
              type="checkbox"
              checked={ageConfirmed}
              onChange={(e) => handleAge(e.target.checked)}
            />
            <span>I am 18 or older</span>
          </label>

          <button
            className="cta"
            disabled={!ageConfirmed}
            onClick={handleStart}
          >
            Start Chatting Now →
          </button>

          <button className="region-toggle" onClick={() => setShowRegions((v) => !v)}>
            {REGIONS.find((r) => r.id === region)?.label} · change
          </button>

          {showRegions && (
            <div className="region-list">
              {REGIONS.map((r) => (
                <button
                  key={r.id}
                  className={`region-item ${r.id === region ? 'active' : ''}`}
                  onClick={() => { setRegion(r.id); setShowRegions(false); }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}

          <p className="footnote">Every chat is moderated. Leave anytime with one tap.</p>
        </div>

        <div className="hero-right">
          <div className="mockup">
            <div className="mockup-frame">
              <div className="mockup-badge-live">● LIVE</div>
              <div className="mockup-badge-viewers">👁 2.4K</div>
              <div className="mockup-face">
                <span>😄</span>
              </div>
              <div className="mockup-grid">
                <div className="mockup-tile">👦</div>
                <div className="mockup-tile">👧</div>
                <div className="mockup-tile">🧑</div>
                <div className="mockup-tile">👩</div>
              </div>
              <div className="mockup-controls">
                <button>🎙</button>
                <button>📷</button>
                <button>❤️</button>
              </div>
            </div>

            <div className="float-badge fb-1">🎁 Send & Receive Rewards</div>
            <div className="float-badge fb-2">🎮 Play Games Together</div>
            <div className="float-badge fb-3">🍔 Order Food & Treat</div>
            <div className="float-badge fb-4">💜 New Friends Await</div>
          </div>
        </div>
      </main>

      <div className="ribbon">Chat + Play + Reward + Food = Peek</div>

      {/* FEATURES */}
      <section className="features">
        <div className="features-head">
          <p className="features-eyebrow">Why Peek?</p>
          <h2 className="features-title">More Than Just A Video Chat App</h2>
          <p className="features-sub">While other apps just connect you, Peek turns every conversation into an experience.</p>
        </div>
        <div className="features-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className={`feature-card feature-${f.color}`}>
              <div className="feature-emoji">{f.emoji}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="footer">
        <img src="/peek-logo.png" alt="Peek" className="footer-logo" />
        <p className="footer-line">Real Connections. Global Community.</p>
        <div className="footer-links">
          <a href="/terms">Terms</a>
          <span>·</span>
          <a href="/privacy">Privacy</a>
          <span>·</span>
          <a href="/contact">Contact</a>
        </div>
      </footer>
    </div>
  );
}