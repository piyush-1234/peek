import Nav from '../components/Nav.jsx';

export default function Disclaimer() {
  return (
    <div className="legal-page">
      <Nav onLogoClick={() => { window.location.href = '/'; }} showStats={false} />

      <article className="legal-content">
        <h1>Disclaimer</h1>
        <p className="legal-updated">Last updated: October 2026</p>

        <h2>Use at Your Own Risk</h2>
        <p>
          Peek Moment is a free, anonymous, real-time video chat platform that pairs users with
          random strangers for live, unscripted conversations. All interactions are initiated by
          users at their own discretion and at their own risk.
        </p>

        <h2>No Endorsement of User Content</h2>
        <p>
          We do not pre-screen, verify, or endorse any user. The views, opinions, language, or
          behaviour of users on Peek Moment do not reflect the views of Peek Moment or its operators.
        </p>

        <h2>No Guarantee of Match Quality</h2>
        <p>
          We do not guarantee that you will find conversations that interest you, or that other
          users will behave respectfully. The matching algorithm is random and interest-based, but
          not curated by humans.
        </p>

        <h2>Technical Limitations</h2>
        <p>
          Video quality depends on your internet connection, device capability, and network path
          to the other user. We are not responsible for:
        </p>
        <ul>
          <li>Connection failures or lag</li>
          <li>Camera or microphone not working on your device</li>
          <li>Network firewall or ISP restrictions blocking WebRTC</li>
          <li>Battery drain or data usage on mobile</li>
        </ul>

        <h2>Age Restriction</h2>
        <p>
          Peek Moment is strictly for adults 18 and over. Parents and guardians are responsible for
          monitoring minors' internet usage. We are not liable for any harm arising from minors
          accessing the Service through misrepresentation of age.
        </p>

        <h2>Third-Party Links</h2>
        <p>
          Any third-party links shared by users are not our responsibility. Click at your own risk.
        </p>

        <h2>External Recording</h2>
        <p>
          While Peek Moment does not record your sessions, other users may record their screen
          using external tools (screen recording, OBS, phone camera). <strong>Never share
          sensitive, private, or identifying information on video chat.</strong>
        </p>

        <h2>Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, Peek Moment and its operators are not liable for
          any damages, emotional distress, or losses arising from your use of the Service or
          interactions with other users.
        </p>

        <h2>Contact</h2>
        <p>
          Questions? Email <a href="mailto:hello@peekmoment.com">hello@peekmoment.com</a>.
        </p>
      </article>
    </div>
  );
}