import Footer from './Footer.jsx';
import { useEffect, useState } from 'react';
import Nav from './Nav.jsx';
import FeatureCards from './FeatureCards.jsx';
import AboutSection from './AboutSection.jsx';
import HowToUseSection from './HowToUseSection.jsx';
import CompareSection from './CompareSection.jsx';
import CommunitySection from './CommunitySection.jsx';
import FAQSection from './FAQSection.jsx';
import { Link } from '../lib/router.jsx';
import { INTERESTS, MAX_INTERESTS } from '../lib/interests.js';

const REGIONS = [
  { id: 'anywhere', label: '🌍 Anywhere', sub: 'Match with anyone, worldwide' },
  { id: 'en:in', label: '🇮🇳 India (English)', sub: 'English speakers in India' },
  { id: 'hi:in', label: '🇮🇳 India (Hindi)', sub: 'Hindi speakers in India' },
  { id: 'en:us', label: '🇺🇸 United States', sub: 'Match with users in the US' },
  { id: 'en:uk', label: '🇬🇧 United Kingdom', sub: 'Match with users in the UK' },
  { id: 'es:mx', label: '🇲🇽 Mexico', sub: 'Spanish speakers in Mexico' },
];

export default function Landing({ onStart, online }) {
  const [region, setRegion] = useState('anywhere');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [mockupView, setMockupView] = useState(0);

  useEffect(() => {
    if (localStorage.getItem('peek_age_ok') === '1') setAgeConfirmed(true);
    const saved = localStorage.getItem('peek_interests');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setSelectedInterests(parsed.slice(0, MAX_INTERESTS));
      } catch {}
    }
  }, []);

  useEffect(() => {
    const t = setInterval(() => setMockupView((v) => (v + 1) % 3), 3500);
    return () => clearInterval(t);
  }, []);

  const handleAge = (checked) => {
    setAgeConfirmed(checked);
    if (checked) localStorage.setItem('peek_age_ok', '1');
    else localStorage.removeItem('peek_age_ok');
  };

  const toggleInterest = (id) => {
    setSelectedInterests((prev) => {
      let next;
      if (prev.includes(id)) next = prev.filter((i) => i !== id);
      else if (prev.length < MAX_INTERESTS) next = [...prev, id];
      else next = [...prev.slice(1), id];
      localStorage.setItem('peek_interests', JSON.stringify(next));
      return next;
    });
  };

  const handleStart = (mode) => {
    if (!ageConfirmed) return;
    onStart(region, mode, selectedInterests);
  };

  return (
    <div className="landing">
      <div className="blob blob-a" />
      <div className="blob blob-b" />
      <div className="blob blob-c" />
      <div className="blob blob-d" />

      <Nav
        online={online}
        onLogoClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        showStats
        showRegionSelector
        region={region}
        onRegionChange={setRegion}
        regions={REGIONS}
      />

      <main className="hero-compact">
        <div className="hero-actions">
          <p className="hero-eyebrow-tight">
            Real people · Random chats · Endless fun
          </p>

          <h1 className="hero-title-tight">
            Meet <span className="grad-purple">strangers</span>. Make <span className="grad-pink">memories</span>.
          </h1>

          <p className="hero-sub-tight">
            Chat, play games, send rewards — no profiles, no history. Just real people.
          </p>

          <div className="interest-inline">
            <span className="interest-inline-label">
              Topics <span className="interest-optional">(optional)</span>
            </span>
            <div className="interest-chips-tight">
              {INTERESTS.map((i) => (
                <button
                  key={i.id}
                  type="button"
                  className={`interest-chip-tight ${selectedInterests.includes(i.id) ? 'active' : ''}`}
                  onClick={() => toggleInterest(i.id)}
                >
                  {i.label}
                </button>
              ))}
            </div>
          </div>

          <label className="age-check-tight">
            <input
              type="checkbox"
              checked={ageConfirmed}
              onChange={(e) => handleAge(e.target.checked)}
            />
            <span>
              I am 18+ and consent to the processing of my data as described in the{' '}
              <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>
                Privacy Policy
              </a>
            </span>
          </label>

          <div className="cta-quad">
            <button className="cta-pill cta-pill-video" disabled={!ageConfirmed} onClick={() => handleStart('video')}>
              <span className="cta-pill-icon">📹</span>
              <span className="cta-pill-label">Video</span>
            </button>
            <button className="cta-pill cta-pill-audio" disabled={!ageConfirmed} onClick={() => handleStart('audio')}>
              <span className="cta-pill-icon">🎙</span>
              <span className="cta-pill-label">Audio</span>
            </button>
            <button className="cta-pill cta-pill-text" disabled={!ageConfirmed} onClick={() => handleStart('text')}>
              <span className="cta-pill-icon">💬</span>
              <span className="cta-pill-label">Text</span>
            </button>
            <button className="cta-pill cta-pill-group" disabled={!ageConfirmed} onClick={() => handleStart('group')}>
              <span className="cta-pill-icon">👥</span>
              <span className="cta-pill-label">Group</span>
            </button>
          </div>

          <p className="footnote-tight">
            🛡️ Moderated · 18+ only · Leave anytime
          </p>
        </div>

        <div className="hero-mockup">
          <div className="phone-frame">
            <div className="phone-notch" />
            <div className="phone-top">
              {mockupView === 0 && (
                <>
                  <div className="phone-pill phone-pill-live">● LIVE</div>
                  <div className="phone-pill phone-pill-count">👁 2.4K</div>
                </>
              )}
              {mockupView === 1 && (
                <div className="phone-pill phone-pill-group">● GROUP · 4</div>
              )}
              {mockupView === 2 && (
                <div className="phone-pill phone-pill-game">🎮 GAME</div>
              )}
            </div>

            {mockupView === 0 && (
              <div className="phone-body solo">
                <div className="phone-main-face">
                  <div className="face-emoji">👩</div>
                  <div className="phone-speech">Hi! Where are you from? 🌍</div>
                  <div className="phone-self">
                    <span className="face-small">🧑</span>
                    <span className="phone-self-label">You</span>
                  </div>
                </div>
                <div className="phone-actions">
                  <button>🎙</button>
                  <button>📷</button>
                  <button>❤️</button>
                  <button>⏭</button>
                </div>
              </div>
            )}

            {mockupView === 1 && (
              <div className="phone-body group">
                <div className="group-mini-grid">
                  <div className="group-mini-tile g1"><span>👦</span></div>
                  <div className="group-mini-tile g2"><span>👩</span></div>
                  <div className="group-mini-tile g3"><span>🧑</span></div>
                  <div className="group-mini-tile g4"><span>👧</span></div>
                </div>
                <div className="group-mini-chat">
                  <div className="mini-msg mini-a">👦: Hey all!</div>
                  <div className="mini-msg mini-b">👩: hii 👋</div>
                  <div className="mini-msg mini-c">🧑: where you from?</div>
                </div>
              </div>
            )}

            {mockupView === 2 && (
              <div className="phone-body game">
                <div className="phone-game-header">🎮 Would You Rather</div>
                <div className="phone-game-q">Would you rather…</div>
                <div className="phone-game-opt picked">
                  <span className="opt-tag">A</span>
                  <span>Travel to the past</span>
                  <span className="opt-count">2/4</span>
                </div>
                <div className="phone-game-opt">
                  <span className="opt-tag">B</span>
                  <span>Travel to the future</span>
                  <span className="opt-count">1/4</span>
                </div>
                <div className="phone-game-votes">
                  <span className="vote-chip v1">👦</span>
                  <span className="vote-chip v2">👩</span>
                  <span className="vote-chip v3">🧑</span>
                  <span className="vote-chip v4 pending">…</span>
                </div>
                <div className="phone-game-bar">
                  <div className="bar-a" />
                  <div className="bar-b" />
                </div>
              </div>
            )}

            <div className="float-tag ft-1">🎁 Send rewards</div>
            <div className="float-tag ft-2">🎮 Play games</div>
            <div className="float-tag ft-3">🍔 Order food</div>
          </div>
        </div>
      </main>

      <FeatureCards />
      <AboutSection />
      <HowToUseSection />
      <CompareSection />
      <FAQSection />
      <CommunitySection />

      <Footer />
    </div>
  );
}