import Nav from '../components/Nav.jsx';
import { Link } from '../lib/router.jsx';

export default function Privacy() {
  return (
    <div className="legal-page">
      <Nav onLogoClick={() => { window.location.href = '/'; }} showStats={false} />

      <article className="legal-content">
        <h1>Privacy Policy</h1>
        <p className="legal-updated">Last updated: October 2026</p>

        <p className="legal-highlight">
          <strong>Short version:</strong> We don't record your video or audio. We don't build
          profiles. We don't sell your data. We collect the minimum required to run the Service.
        </p>

        <h2>1. What We Do Not Collect</h2>
        <ul>
          <li><strong>We do not record</strong> your video or audio streams — they are peer-to-peer</li>
          <li><strong>We do not store</strong> your chat messages — they are ephemeral</li>
          <li><strong>We do not require</strong> your name, email, or phone number to use the Service</li>
          <li><strong>We do not build</strong> user profiles or behavioural histories</li>
          <li><strong>We do not sell</strong> any data to third parties</li>
        </ul>

        <h2>2. What We Do Collect</h2>
        <p>To operate the Service, we collect:</p>
        <ul>
          <li><strong>IP address</strong> — for rate limiting, abuse prevention, and safety logging</li>
          <li><strong>User agent / browser info</strong> — for compatibility and bot filtering</li>
          <li><strong>Anonymous session ID</strong> — generated per session, deleted when you leave</li>
          <li><strong>Report logs</strong> — if you report another user, we log the timestamp, reason, and session IDs involved</li>
          <li><strong>Aggregate counts</strong> — total unique visitors, online counts (no personal data)</li>
        </ul>

        <h2>3. How We Use Your Data</h2>
        <ul>
          <li>To match you with other users</li>
          <li>To prevent abuse, spam, and rate-limit misuse</li>
          <li>To improve the Service (aggregate analytics only)</li>
          <li>To comply with legal obligations</li>
        </ul>

        <h2>4. Data Retention</h2>
        <ul>
          <li><strong>Session data:</strong> Deleted immediately when you close the tab</li>
          <li><strong>Report logs:</strong> Retained for 90 days for safety review, then deleted</li>
          <li><strong>Aggregate counters:</strong> Retained indefinitely (anonymised)</li>
        </ul>

        <h2>5. Third-Party Services</h2>
        <p>We use the following third-party services:</p>
        <ul>
          <li><strong>Cloudflare</strong> — DNS and CDN (privacy policy: cloudflare.com/privacy)</li>
          <li><strong>DigitalOcean</strong> — hosting (privacy policy: digitalocean.com/legal/privacy-policy)</li>
          <li><strong>Let's Encrypt</strong> — SSL certificates</li>
        </ul>
        <p>
          Video/audio streams do not pass through any of these providers. They only serve the
          signalling and static files.
        </p>

        <h2>6. Cookies & Local Storage</h2>
        <p>We use browser localStorage for:</p>
        <ul>
          <li>Remembering your age confirmation (18+)</li>
          <li>Remembering your interest preferences</li>
          <li>Marking test devices (internal use only)</li>
        </ul>
        <p>We do not use tracking cookies or third-party analytics cookies.</p>

        <h2>7. Your Rights (GDPR / DPDP Act)</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access your data — though we retain almost none</li>
          <li>Request deletion of report logs related to you</li>
          <li>Object to data processing</li>
          <li>Lodge a complaint with a supervisory authority</li>
        </ul>
        <p>
          Since we don't store identifiable user data, most requests can only relate to IP-based
          logs. Email <a href="mailto:privacy@peekmoment.com">privacy@peekmoment.com</a> for any request.
        </p>

        <h2>8. Children's Privacy</h2>
        <p>
          Peek Moment is strictly 18+. We do not knowingly collect data from users under 18. If we
          learn a minor has used the Service, we will terminate the session and block the IP.
        </p>

        <h2>9. Security</h2>
        <ul>
          <li>All connections are encrypted with HTTPS / WSS</li>
          <li>Video/audio uses WebRTC's built-in DTLS-SRTP encryption</li>
          <li>We do not store passwords (no accounts exist)</li>
        </ul>

        <h2>10. International Transfers</h2>
        <p>
          Our servers are located in Bangalore, India. By using Peek Moment, you consent to your
          session data being processed in India.
        </p>

        <h2>11. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy. Material changes will be noted at the top of this page.
        </p>

        <h2>12. Contact</h2>
        <p>
          Data protection contact: <a href="mailto:privacy@peekmoment.com">privacy@peekmoment.com</a>
        </p>
      </article>
    </div>
  );
}