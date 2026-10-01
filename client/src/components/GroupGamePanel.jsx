export default function GroupGamePanel({ chat }) {
  const { game, peers, voteGroupGame, nextGroupGame } = chat;

  if (!game.active || !game.prompt) return null;

  const prompt = game.prompt;
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
          <span className="game-icon">🎮</span>
          <span>Would You Rather</span>
        </div>
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

        {allVoted && (
          <div className="group-vote-bar">
            <div className="group-vote-seg group-vote-a" style={{ flex: countA || 0.001 }}>
              {countA > 0 && <span>{countA}</span>}
            </div>
            <div className="group-vote-seg group-vote-b" style={{ flex: countB || 0.001 }}>
              {countB > 0 && <span>{countB}</span>}
            </div>
          </div>
        )}
      </div>

      <div className="game-footer">
        <button className="game-btn game-btn-next" onClick={nextGroupGame} disabled={!allVoted}>
          Next question →
        </button>
      </div>
    </aside>
  );
}