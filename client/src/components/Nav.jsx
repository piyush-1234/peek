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
        src="/peek-logo-60.webp"
        alt="Peek Moment — Home"
        width="60"
        height="60"
        srcSet="/peek-logo-60.webp 1x, /peek-logo-128.webp 2x"
        className="nav-logo nav-logo-clickable"
        onClick={onLogoClick}
        title="Back to home"
        fetchpriority="high"
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