const FEATURES = [
  {
    emoji: '🌍',
    title: 'Random Global Chats',
    desc: 'Meet people from different regions, cultures and backgrounds — totally random!',
    color: 'blue',
  },
  {
    emoji: '👥',
    title: '1 to Many Video Chat',
    desc: 'Chat one-to-one or with up to 4 strangers in the same room.',
    color: 'pink',
  },
  {
    emoji: '💬',
    title: 'Video, Audio & Text',
    desc: 'Choose how you want to talk — video on, voice only, or text only.',
    color: 'purple',
  },
  {
    emoji: '🎯',
    title: 'Interest & Topic Matching',
    desc: 'Pick what you love. We match you with someone who shares your interests.',
    color: 'green',
  },
  {
    emoji: '🎮',
    title: 'Play While You Chat',
    desc: 'In-chat games like Would You Rather break the ice instantly.',
    color: 'yellow',
  },
  {
    emoji: '🎁',
    title: 'Rewards System',
    desc: 'Send & receive virtual rewards when you vibe with someone.',
    color: 'orange',
  },
  {
    emoji: '🍕',
    title: 'Order Food & Treat',
    desc: 'Order food for yourself or treat your new friend if you like them!',
    color: 'red',
  },
  {
    emoji: '🛡️',
    title: 'Safety Built-in',
    desc: '18+ only, one-tap report, no recording, no profiles, no history.',
    color: 'teal',
  },
];

export default function FeatureCards() {
  return (
    <section className="features" id="features">
      <div className="section-head">
        <p className="section-eyebrow">Why Peek?</p>
        <h2 className="section-title">More Than Just A Video Chat App</h2>
        <p className="section-sub">
          While other apps just connect you, Peek turns every conversation into an experience.
        </p>
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
  );
}