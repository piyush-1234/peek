const STEPS = [
  {
    num: 1,
    title: 'Confirm you\'re 18+',
    desc: 'Tick the age box on the home page. Peek Moment is strictly for adults.',
    icon: '🔞',
  },
  {
    num: 2,
    title: 'Pick what you want to talk about (optional)',
    desc: 'Choose up to 3 interest tags — Music, Gaming, Travel, Deep talks. We\'ll try to match you with someone who shares your vibe. Skip it for a totally random match.',
    icon: '🎯',
  },
  {
    num: 3,
    title: 'Choose your mode',
    desc: 'Video (1-on-1 camera) · Audio (voice only) · Text (chat only) · Group (up to 4 people). Each mode has its own queue — you only match with people in the same mode.',
    icon: '🎛️',
  },
  {
    num: 4,
    title: 'Allow camera & microphone',
    desc: 'The browser will ask for permission. For Video and Group mode you need both. For Audio you only need the mic. For Text mode, no permissions needed.',
    icon: '🎥',
  },
  {
    num: 5,
    title: 'Preview yourself before going live',
    desc: 'You\'ll see a self-preview first — fix your hair, close private tabs, check your lighting. When ready, tap "I\'m ready". A short countdown, then you\'re in.',
    icon: '✨',
  },
  {
    num: 6,
    title: 'Talk, play, or skip',
    desc: 'Use the built-in icebreakers if the chat stalls. Tap 🎮 Play Game for a round of Would You Rather. Not feeling it? Tap Next for a new match, or Leave to end.',
    icon: '💬',
  },
  {
    num: 7,
    title: 'Stay safe',
    desc: 'One-tap Report on every chat. Never share your full name, address, or phone number. If something feels off — trust your gut and tap Next.',
    icon: '🛡️',
  },
];

export default function HowToUseSection() {
  return (
    <section className="howto-section" id="how-to-use">
      <div className="section-head">
        <p className="section-eyebrow">Beginner-friendly</p>
        <h2 className="section-title">How to use Peek Moment — step by step</h2>
        <p className="section-sub">
          First time on a random video chat? Here\'s exactly what happens, from click to chat.
        </p>
      </div>

      <div className="howto-steps">
        {STEPS.map((s) => (
          <div key={s.num} className="howto-step">
            <div className="howto-num">{s.num}</div>
            <div className="howto-icon">{s.icon}</div>
            <div className="howto-body">
              <h3 className="howto-title">{s.title}</h3>
              <p className="howto-desc">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="howto-tips">
        <h3>💡 Tips for a great first chat</h3>
        <ul>
          <li>Have a go-to opening line ready. "Hi! Where are you joining from?" never fails.</li>
          <li>Smile before you connect — it genuinely changes your tone.</li>
          <li>Use headphones to avoid echo and hear the other person clearly.</li>
          <li>Good lighting helps — face a window or lamp.</li>
          <li>If someone is rude, don\'t argue. Tap Next. There are thousands of kind people on the other side.</li>
        </ul>
      </div>
    </section>
  );
}