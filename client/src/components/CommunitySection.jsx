const COMMUNITIES = [
  { name: 'Discord', icon: '💬', desc: 'Live chat, events, and feature drops', url: 'https://discord.gg/peekmoment' },
  { name: 'Reddit', icon: '🔴', desc: 'r/peekmoment — stories & feedback', url: 'https://reddit.com/r/peekmoment' },
  { name: 'Telegram', icon: '✈️', desc: 'Quick updates, low-noise channel', url: 'https://t.me/peekmoment' },
  { name: 'WhatsApp', icon: '🟢', desc: 'Community group for Indian users', url: 'https://chat.whatsapp.com/peekmoment' },
  { name: 'Twitter / X', icon: '🐦', desc: 'Product updates & announcements', url: 'https://twitter.com/peekmoment' },
  { name: 'Instagram', icon: '📸', desc: 'Behind the scenes & fun moments', url: 'https://instagram.com/peekmoment' },
];

export default function CommunitySection() {
  const handleShare = async () => {
    const shareData = {
      title: 'Peek Moment',
      text: 'Safe random video chat with real people worldwide. No profiles, no history.',
      url: 'https://peekmoment.com',
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText('https://peekmoment.com');
        alert('Link copied! Share it with a friend 💜');
      }
    } catch {}
  };

  return (
    <section className="community-section" id="community">
      <div className="section-head">
        <p className="section-eyebrow">Join us</p>
        <h2 className="section-title">Be part of the Peek Moment community</h2>
        <p className="section-sub">
          Get the latest feature drops, virtual events, and behind-the-scenes updates.
        </p>
      </div>

      <div className="community-grid">
        {COMMUNITIES.map((c) => (
          <a
            key={c.name}
            href={c.url}
            target="_blank"
            rel="noopener noreferrer"
            className="community-card"
          >
            <span className="community-icon">{c.icon}</span>
            <span className="community-name">{c.name}</span>
            <span className="community-desc">{c.desc}</span>
            <span className="community-arrow">→</span>
          </a>
        ))}
      </div>

      <div className="community-cta">
        <p className="community-cta-text">
          <strong>Love Peek Moment?</strong> Share it with a friend — it works better when more people are online at once.
        </p>
        <button className="community-share-btn" onClick={handleShare}>
          📤 Share Peek Moment
        </button>
      </div>
    </section>
  );
}