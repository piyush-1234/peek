export default function Nav({ online, onLogoClick, showStats = true }) {
  return (
    <nav className="nav">
      <img
        src="/peek-logo.png"
        alt="Peek — Home"
        className="nav-logo nav-logo-clickable"
        onClick={onLogoClick}
        title="Back to home"
      />
      {showStats && (
        <div className="nav-stats">
          <div className="online-pill">
            <span className="dot-live" />
            {online?.total > 0 ? `${online.total} online now` : 'Be the first one here'}
          </div>
          {online?.uniqueTotal > 0 && (
            <div className="unique-pill">
              ✨ {online.uniqueTotal.toLocaleString()} joined all-time
            </div>
          )}
        </div>
      )}
    </nav>
  );
}