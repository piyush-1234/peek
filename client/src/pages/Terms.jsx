import Nav from '../components/Nav.jsx';
import Footer from '../components/Footer.jsx';
import { Link, navigate } from '../lib/router.jsx';

export default function Terms({ online }) {
  return (
    <div className="legal-page">
      <Nav online={online} onLogoClick={() => navigate('/')} showStats />

      <article className="legal-content">
        <h1>Terms & Conditions</h1>
        <p className="legal-updated">Last updated: October 2026</p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using Peek Moment ("the Service", "we", "us"), operated at peekmoment.com,
          you agree to be bound by these Terms & Conditions. If you do not agree with any part of
          these terms, you must not use the Service.
        </p>

        <h2>2. Eligibility</h2>
        <p>
          Peek Moment is strictly for users who are <strong>18 years of age or older</strong>.
          By using the Service, you represent and warrant that you are at least 18 years old.
          We reserve the right to terminate any account or session if we have reason to believe
          the user is underage.
        </p>

        <h2>3. Nature of the Service</h2>
        <p>
          Peek Moment is a real-time, anonymous video, audio, and text communication platform that
          randomly connects users with strangers worldwide. The Service is provided on an
          <strong> "as is" and "as available"</strong> basis. We do not guarantee:
        </p>
        <ul>
          <li>Continuous availability of the Service</li>
          <li>Connection quality or stability</li>
          <li>The behaviour, identity, or intent of any other user</li>
          <li>That you will find suitable, respectful, or interesting conversation partners</li>
        </ul>

        <h2>4. User Conduct — Prohibited Content & Behaviour</h2>
        <p>You agree NOT to engage in any of the following:</p>
        <ul>
          <li>Broadcasting nudity, sexual content, or sexually explicit material</li>
          <li>Harassment, threats, bullying, stalking, or hate speech</li>
          <li>Racism, sexism, homophobia, transphobia, or discrimination of any kind</li>
          <li>Impersonation of any person or entity</li>
          <li>Sharing illegal content, including CSAM or content harmful to minors</li>
          <li>Advertising, promoting, or soliciting commercial services</li>
          <li>Recording, screenshotting, or distributing another user's video or audio without consent</li>
          <li>Using bots, scrapers, or automated tools</li>
          <li>Attempting to hack, disrupt, or exploit the Service</li>
          <li>Sharing personal information of others without consent</li>
          <li>Any illegal activity under applicable law</li>
        </ul>

        <h2>5. Moderation & Enforcement</h2>
        <p>
          We use automated moderation and user reports to monitor content. Users who violate these
          Terms may be temporarily suspended, permanently banned, or reported to law enforcement.
          Reports are logged and reviewed. We may take action without prior notice.
        </p>

        <h2>6. No Recording</h2>
        <p>
          Peek Moment does not record, store, or archive your video, audio, or chat sessions. All
          media streams are peer-to-peer and never touch our servers. However, we cannot prevent a
          user from recording their screen using external tools — always behave as though you are
          being recorded.
        </p>

        <h2>7. Privacy</h2>
        <p>
          Please refer to our <Link href="/privacy">Privacy Policy</Link> for full details on what
          data we collect and how we handle it.
        </p>

        <h2>8. Payments & Rewards</h2>
        <p>
          Some features (rewards, gifting, food ordering) may be paid. All virtual currency, rewards,
          and coins are non-refundable and have no real-world monetary value unless explicitly stated.
          We reserve the right to modify pricing at any time.
        </p>

        <h2>9. Intellectual Property</h2>
        <p>
          All content, logos, branding, code, and design belong to Peek Moment. You may not copy,
          modify, distribute, or reverse-engineer any part of the Service.
        </p>

        <h2>10. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, Peek Moment shall not be liable for any indirect,
          incidental, special, or consequential damages arising from your use of the Service,
          including but not limited to emotional distress, loss of data, or interactions with other
          users.
        </p>

        <h2>11. Disclaimer of Warranties</h2>
        <p>
          The Service is provided "as is" without warranties of any kind, express or implied. We do
          not warrant that the Service will meet your expectations or be error-free.
        </p>

        <h2>12. Termination</h2>
        <p>
          We reserve the right to suspend or terminate your access to Peek Moment at any time, with
          or without cause, without notice.
        </p>

        <h2>13. Changes to Terms</h2>
        <p>
          We may update these Terms from time to time. Continued use of the Service after changes
          constitutes acceptance of the new Terms.
        </p>

        <h2>14. Governing Law</h2>
        <p>
          These Terms are governed by the laws of India. Any disputes shall be subject to the
          exclusive jurisdiction of courts in India.
        </p>

        <h2>15. Contact</h2>
        <p>
          For questions about these Terms, contact us at{' '}
          <a href="mailto:legal@peekmoment.com">legal@peekmoment.com</a>.
        </p>
      </article>

      <Footer />
    </div>
  );
}