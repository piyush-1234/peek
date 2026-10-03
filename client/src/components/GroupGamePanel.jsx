import { WYR_PROMPTS } from '../lib/wyr-prompts.js';

export default function GroupGamePanel({ chat, onClose }) {
  const {
    game, peers,
    startGroupGame, voteGroupGame, nextGroupGame, leaveGroupGame,
  } = chat;

  // No active game — show selector
  if (!game.active) {
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
            Everyone in the room will play together.
          </div>

          <button className="game-choice" onClick={() => startGroupGame()}>
            <span className="game-choice-icon">🤔</span>
            <span className="game-choice-body">
              <span className="game-choice-title">Would You Rather</span>
              <span className="game-choice-desc">All vote, see who agrees.</span>
            </span>
            <span className="game-choice-arrow">→</span>
          </button>

          <button className="game-choice" disabled title="Coming soon">
            <span className="game-choice-icon">🎭</span>
            <span className="game-choice-body">
              <span className="game-choice-title">2 Truths 1 Lie</span>
              <span className="game-choice-desc">Coming to group mode soon</span>
            </span>
            <span className="game-choice-arrow">→</span>
          </button>
        </div>
      </aside>
    );
  }

  // Active WYR game
  const prompt = game.prompt;
  if (!prompt) return null;

  const votes = game.votes || {};
  const voteValues = Object.values(votes);
  const countA = voteValues.filter((v) => v === 'a').length;
  const countB = voteValues.filter((v) => v === 'b').length;
  const totalVotes = voteValues.length;
  const totalPlayers = peers.length + 1;
  const allVoted = totalVotes === totalPlayers;
  const myVote = game.myVote;

  return (
    <aside className="game-panel">
      <div className="game-header">
        <div className="game-title">
          <span className="game-icon">🤔</span>
          <span>Would You Rather</span>
        </div>
        <button className="game-close" onClick={leaveGroupGame} title="End game">✕</button>
      </div>

      <div className="game-body">
        <div className="game-round">Round {game.round + 1}</div>
        <div className="game-prompt">Would you rather…</div>

        <div className="game-options">
          <button
            className={`game-option ${myVote === 'a' ? 'picked' : ''} ${allVoted ? 'revealed' : ''}`}
            onClick={() => voteGroupGame('a')}
            disabled={!!myVote}
          >
            <span className="game-option-label">A</span>
            <span className="game-option-text">{prompt.a}</span>
            {allVoted && <span className="game-option-votes">{countA}/{totalPlayers}</span>}
          </button>

          <div className="game-or">OR</div>

          <button
            className={`game-option ${myVote === 'b' ? 'picked' : ''} ${allVoted ? 'revealed' : ''}`}
            onClick={() => voteGroupGame('b')}
            disabled={!!myVote}
          >
            <span className="game-option-label">B</span>
            <span className="game-option-text">{prompt.b}</span>
            {allVoted && <span className="game-option-votes">{countB}/{totalPlayers}</span>}
          </button>
        </div>

        {!myVote && <div className="game-hint">Pick one to see what everyone chooses</div>}
        {myVote && !allVoted && (
          <div className="game-hint">
            {totalVotes} of {totalPlayers} voted…
          </div>
        )}

        {allVoted && (
          <div className={`game-result ${countA === countB ? 'different' : 'agreed'}`}>
            {countA === countB
              ? `🤔 Split right down the middle (${countA}–${countB})`
              : countA > countB
              ? `✨ ${countA} of ${totalPlayers} picked A`
              : `✨ ${countB} of ${totalPlayers} picked B`}
          </div>
        )}
      </div>

      <div className="game-footer">
        <button className="game-btn game-btn-next" onClick={() => nextGroupGame()} disabled={!allVoted}>
          Next question →
        </button>
      </div>
    </aside>
  );
}