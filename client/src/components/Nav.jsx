export default function Nav({
  online,
  onLogoClick,
  showStats = true,
  region,
  onRegionChange,
  regions = [],
  showRegionSelector = false,
}) {
  return (
    <nav className="nav">
      <img
        src="/peek-logo.png"
        alt="Peek — Home"
        className="nav-logo nav-logo-clickable"
        onClick={onLogoClick}
        title="Back to home"
      />

      <div className="nav-right">
        {showRegionSelector && (
          <div className="nav-region-wrap">
            <button className="nav-region-btn">
              <span>{regions.find((r) => r.id === region)?.label || '🌍 Anywhere'}</span>
              <span className="region-chevron">▾</span>
            </button>
            <div className="nav-region-menu">
              {regions.map((r) => (
                <button
                  key={r.id}
                  className={`nav-region-item ${r.id === region ? 'active' : ''}`}
                  onClick={() => onRegionChange?.(r.id)}
                >
                  <span className="nav-region-label">{r.label}</span>
                  <span className="nav-region-sub">{r.sub}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {showStats && (
          <div className="nav-stats">
            <div className="online-pill">
              <span className="dot-live" />
              {online?.total > 0 ? `${online.total} online` : 'Be the first'}
            </div>
            {online?.uniqueTotal > 0 && (
              <div className="unique-pill">
                ✨ {online.uniqueTotal.toLocaleString()} joined
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}