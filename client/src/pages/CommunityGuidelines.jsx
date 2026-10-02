import Nav from '../components/Nav.jsx';

export default function CommunityGuidelines() {
  return (
    <div className="legal-page">
      <Nav onLogoClick={() => { window.location.href = '/'; }} showStats={false} />

      <article className="legal-content">
        <h1>Community Guidelines</h1>
        <p className="legal-updated">Last updated: October 2026</p>

        <p className="legal-highlight">
          Peek Moment works because real people show up to have real conversations. These guidelines
          keep it that way.
        </p>

        <h2>✅ Be Kind</h2>
        <p>
          Treat every stranger the way you would want to be treated. A little warmth goes a long way.
        </p>

        <h2>✅ Be Curious</h2>
        <p>
          Ask questions. Listen. Share something interesting. The best chats come from genuine
          interest in the other person.
        </p>

        <h2>✅ Respect Boundaries</h2>
        <p>
          If someone says "next" or leaves, respect it. Don't chase, message again, or take it
          personally.
        </p>

        <h2>✅ Keep It Legal</h2>
        <p>
          Follow all applicable laws. Nothing illegal — no drugs, weapons, violence, or harmful
          content.
        </p>

        <h2>🚫 Zero Tolerance — Instant Ban</h2>
        <ul>
          <li><strong>Nudity or sexual content</strong> — any explicit content = permanent ban</li>
          <li><strong>Minors</strong> — anyone under 18, on video or in chat, will be blocked</li>
          <li><strong>Harassment, threats, hate speech</strong> — racism, sexism, homophobia, or bullying</li>
          <li><strong>Doxxing</strong> — sharing someone's personal info without consent</li>
          <li><strong>Recording without consent</strong> — screenshotting or recording another user</li>
          <li><strong>Scams</strong> — fake charity, financial solicitations, phishing</li>
          <li><strong>Advertising</strong> — promoting products, services, or other platforms</li>
          <li><strong>Bots</strong> — automated accounts or scraping</li>
        </ul>

        <h2>🎯 Reporting</h2>
        <p>
          If someone breaks the rules, tap <strong>Report</strong>. Reports go directly to our
          moderation log. Repeat offenders are banned automatically.
        </p>

        <h2>🛡️ Your Safety</h2>
        <p>Basic safety rules for every chat:</p>
        <ul>
          <li>Never share your full name, address, phone number, or financial details</li>
          <li>Never move to another app (WhatsApp, Telegram, etc.) with a stranger on the first chat</li>
          <li>Never click links sent by strangers</li>
          <li>Never send money or gifts to strangers</li>
          <li>Trust your gut — if it feels off, tap Next immediately</li>
        </ul>

        <h2>🤝 How to Have Great Chats</h2>
        <ul>
          <li>Start with a genuine hello, not a "hi" and stare</li>
          <li>Ask open-ended questions: "What's the best part of your day?" beats "how are you"</li>
          <li>Match the energy — if someone's shy, be gentle</li>
          <li>Play games if conversation stalls — Would You Rather always breaks the ice</li>
          <li>Say goodbye warmly. Every chat is a small human moment.</li>
        </ul>

        <h2>Contact</h2>
        <p>
          Report issues or ask questions at <a href="mailto:community@peekmoment.com">community@peekmoment.com</a>.
        </p>
      </article>
    </div>
  );
}