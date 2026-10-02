import { Link } from '../lib/router.jsx';

export default function Footer() {
  return (
    <footer className="footer">
      <img src="/peek-logo-60.webp" alt="Peek Moment" width="48" height="48" className="footer-logo" loading="lazy" />
      <p className="footer-line">Real Connections. Global Community.</p>

      <nav className="footer-nav">
        <Link href="/#about">About</Link>
        <span>·</span>
        <Link href="/#features">Features</Link>
        <span>·</span>
        <Link href="/#how-to-use">How to Use</Link>
        <span>·</span>
        <Link href="/#compare">Compare</Link>
        <span>·</span>
        <Link href="/#faq">FAQ</Link>
        <span>·</span>
        <Link href="/#community">Community</Link>
      </nav>

      <nav className="footer-nav footer-nav-legal">
        <Link href="/terms">Terms & Conditions</Link>
        <span>·</span>
        <Link href="/privacy">Privacy Policy</Link>
        <span>·</span>
        <Link href="/disclaimer">Disclaimer</Link>
        <span>·</span>
        <Link href="/community-guidelines">Community Guidelines</Link>
      </nav>

      <p className="footer-copyright">
        © {new Date().getFullYear()} Peek Moment. All rights reserved.
      </p>
      <p className="footer-note">
        Peek Moment is an independent platform. Not affiliated with Omegle, OmeTV, or Chatroulette.
      </p>
    </footer>
  );
}