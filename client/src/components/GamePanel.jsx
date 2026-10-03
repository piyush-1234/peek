import TwoTruthsPanel from './TwoTruthsPanel.jsx';

export default function GamePanel({ wyr, tt, onClose }) {
  const anyActive = wyr.active || tt.active;

  // ---------- GAME SELECTOR ----------
  if (!anyActive) {
    return (
      <aside className="game-panel">
        <div className="game-header">
          <div className="game-title">
            <span className="game-icon">🎮</span>
            <span>Play a game</span>
          </div>
          <button className="game-close" onClick={onClose} title="Close">✕</button>
        </div>
        <div className="game-body game-selector-body">
          <div className="game-start-title">Pick a game</div>
          <div className="game-start-sub">
            Both of you will see the same game. First to click picks it.
          </div>

          <button className="game-choice" onClick={() => wyr.startGame('wyr')}>
            <span className="game-choice-icon">🤔</span>
            <span className="game-choice-body">
              <span className="game-choice-title">Would You Rather</span>
              <span className="game-choice-desc">Quick votes. See if you agree.</span>
            </span>
            <span className="game-choice-arrow">→</span>
          </button>

          <button className="game-choice" onClick={() => tt.start()}>
            <span className="game-choice-icon">🎭</span>
            <span className="game-choice-body">
              <span className="game-choice-title">2 Truths 1 Lie</span>
              <span className="game-choice-desc">Write 3 things. Peer guesses the lie.</span>
            </span>
            <span className="game-choice-arrow">→</span>
          </button>
        </div>
      </aside>
    );
  }

  // ---------- 2 TRUTHS 1 LIE ----------
  if (tt.active) {
    return <TwoTruthsPanel game={tt} onClose={tt.leave} />;
  }

  // ---------- WOULD YOU RATHER ----------
  if (wyr.active) {
    return <WYRPanel game={wyr} onClose={wyr.leave} />;
  }

  return null;
}

function WYRPanel({ game, onClose }) {
  const { round, prompt, myVote, peerVote, reveal, vote, next, leave } = game;

  if (!prompt) return null;

  const agreed = reveal && myVote === peerVote;

  return (
    <aside className="game-panel">
      <div className="game-header">
        <div className="game-title">
          <span className="game-icon">🤔</span>
          <span>Would You Rather</span>
        </div>
        <button className="game-close" onClick={leave} title="End game">✕</button>
      </div>

      <div className="game-body">
        <div className="game-round">Round {round + 1}</div>
        <div className="game-prompt">Would you rather…</div>

        <div className="game-options">
          <button
            className={`game-option ${myVote === 'a' ? 'picked' : ''} ${reveal ? 'revealed' : ''} ${reveal && peerVote === 'a' ? 'peer-picked' : ''}`}
            onClick={() => vote('a')}
            disabled={!!myVote}
          >
            <span className="game-option-label">A</span>
            <span className="game-option-text">{prompt.a}</span>
            {reveal && peerVote === 'a' && <span className="game-option-badge">both 👀</span>}
          </button>

          <div className="game-or">OR</div>

          <button
            className={`game-option ${myVote === 'b' ? 'picked' : ''} ${reveal ? 'revealed' : ''} ${reveal && peerVote === 'b' ? 'peer-picked' : ''}`}
            onClick={() => vote('b')}
            disabled={!!myVote}
          >
            <span className="game-option-label">B</span>
            <span className="game-option-text">{prompt.b}</span>
            {reveal && peerVote === 'b' && <span className="game-option-badge">both 👀</span>}
          </button>
        </div>

        {reveal && (
          <div className={`game-result ${agreed ? 'agreed' : 'different'}`}>
            {agreed ? '✨ You both picked the same!' : '🤔 You picked different ones'}
          </div>
        )}
        {!myVote && <div className="game-hint">Pick one to see what they chose</div>}
        {myVote && !peerVote && <div className="game-hint">Waiting for them to pick…</div>}
      </div>

      <div className="game-footer">
        <button className="game-btn game-btn-next" onClick={next} disabled={!reveal}>
          Next question →
        </button>
      </div>
    </aside>
  );
}