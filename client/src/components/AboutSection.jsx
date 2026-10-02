import { Link } from '../lib/router.js';

export default function AboutSection() {
  return (
    <section className="about-section" id="about">
      <div className="section-head">
        <p className="section-eyebrow">About Peek Moment</p>
        <h2 className="section-title">More than just a stranger chat app</h2>
      </div>

      <div className="about-grid">
        <div className="about-card about-main">
          <h3>What is Peek Moment?</h3>
          <p>
            Peek Moment is a next-generation random video chat platform built for people who want
            real conversations, not endless scrolling. It connects you with strangers from around
            the world in seconds — via video, voice, text, or group rooms of up to 4 people.
          </p>
          <p>
            Unlike traditional "Omegle-style" platforms that feel raw and unsafe, Peek Moment is
            designed from the ground up with <strong>safety, warmth, and human connection</strong> as
            its core principles. Every chat is moderated. Every user is an adult. Every interaction
            is one tap from leaving.
          </p>
        </div>

        <div className="about-card">
          <h3>🎯 What makes us different</h3>
          <ul className="about-list">
            <li><strong>Interest & topic matching</strong> — not just random. Pick what you love.</li>
            <li><strong>4 chat modes</strong> — Video, Audio-only, Text-only, and Group (up to 4).</li>
            <li><strong>Real safety, not theatre</strong> — 18+ enforcement, report logs, auto-ban.</li>
            <li><strong>Built-in icebreakers</strong> — prompts and games so chats never stall.</li>
            <li><strong>Zero profiles</strong> — no name, no photo, no history. Just you and a stranger.</li>
            <li><strong>No recording, ever</strong> — video is peer-to-peer, never touches our servers.</li>
          </ul>
        </div>

        <div className="about-card">
          <h3>🛡️ Our safety commitment</h3>
          <ul className="about-list">
            <li>18+ only — enforced at entry</li>
            <li>One-tap Report on every chat</li>
            <li>Automated content flagging</li>
            <li>Rate limiting to stop bots and abuse</li>
            <li>Report review process with logs</li>
            <li>No third-party trackers or data sales</li>
          </ul>
        </div>

        <div className="about-card">
          <h3>🌍 Who is Peek Moment for?</h3>
          <ul className="about-list">
            <li>People curious about other cultures</li>
            <li>Anyone feeling lonely or bored and wanting a real conversation</li>
            <li>Language learners practising with native speakers</li>
            <li>Shy people who want low-stakes social interaction</li>
            <li>Night owls looking for someone to talk to</li>
            <li>Anyone who misses the old, spontaneous internet</li>
          </ul>
        </div>
      </div>

      <div className="about-cta">
        <p>
          Ready to meet someone new?{' '}
          <Link href="/#how-to-use" className="about-link">See how it works →</Link>
        </p>
      </div>
    </section>
  );
}