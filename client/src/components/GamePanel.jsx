export default function GamePanel({ game, onClose }) {
  const { prompt, round, myVote, peerVote, reveal, vote, next } = game;

  if (!prompt) return null;

  const agreed = reveal && myVote === peerVote;

  return (
    <aside className="game-panel">
      <div className="game-header">
        <div className="game-title">
          <span className="game-icon">🎮</span>
          <span>Would You Rather</span>
        </div>
        <button className="game-close" onClick={onClose} title="Close game">✕</button>
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

        {!myVote && (
          <div className="game-hint">Pick one to see what they chose</div>
        )}
        {myVote && !peerVote && (
          <div className="game-hint">Waiting for them to pick…</div>
        )}
      </div>

      <div className="game-footer">
        <button
          className="game-btn game-btn-next"
          onClick={next}
          disabled={!reveal}
        >
          Next question →
        </button>
      </div>
    </aside>
  );
}