import { useState } from 'react';

const PROMPTS = [
  'A place you have traveled to',
  'A weird talent you have',
  'A job you have had',
  'Something nobody knows about you',
  'A food you would never eat again',
  'A skill you wish you had',
  'A movie you have watched 3+ times',
  'A famous person you have met',
];

export default function TwoTruthsPanel({ game }) {
  const {
    phase, round,
    myStatements, peerStatements,
    peerSubmitted, mySubmitted,
    myGuess, peerGuess,
    myScore, peerScore,
    submit, guess, next,
  } = game;

  const [statements, setStatements] = useState(['', '', '']);
  const [lieIndex, setLieIndex] = useState(0);
  const [error, setError] = useState('');

  if (phase === 'idle') return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = statements.map((t) => t.trim());
    if (clean.some((t) => !t)) {
      setError('Fill in all 3 statements');
      return;
    }
    if (clean.some((t) => t.length > 200)) {
      setError('Each statement must be under 200 characters');
      return;
    }
    setError('');
    const formatted = clean.map((text, i) => ({ text, isLie: i === lieIndex }));
    submit(formatted);
  };

  return (
    <aside className="game-panel two-truths-panel">
      <div className="game-header">
        <div className="game-title">
          <span className="game-icon">🎭</span>
          <span>2 Truths 1 Lie</span>
        </div>
      </div>

      <div className="game-body">
        <div className="game-round">
          Round {round + 1} · You {myScore} – {peerScore} Them
        </div>

        {phase === 'writing' && !mySubmitted && (
          <form onSubmit={handleSubmit} className="tt-form">
            <div className="tt-intro">
              Write 3 statements about yourself.<br />
              <strong>2 must be true, 1 must be a lie.</strong>
            </div>

            {[0, 1, 2].map((i) => (
              <div key={i} className="tt-input-row">
                <label className="tt-radio">
                  <input
                    type="radio"
                    name="lie"
                    checked={lieIndex === i}
                    onChange={() => setLieIndex(i)}
                  />
                  <span className="tt-radio-label">
                    {lieIndex === i ? '🎭 This is the lie' : 'Truth'}
                  </span>
                </label>
                <input
                  type="text"
                  className="tt-input"
                  placeholder={PROMPTS[i % PROMPTS.length]}
                  value={statements[i]}
                  maxLength={200}
                  onChange={(e) => {
                    const next = [...statements];
                    next[i] = e.target.value;
                    setStatements(next);
                  }}
                />
              </div>
            ))}

            {error && <div className="tt-error">{error}</div>}

            <button type="submit" className="game-btn game-btn-next">
              Submit →
            </button>
          </form>
        )}

        {phase === 'writing' && mySubmitted && (
          <div className="tt-waiting">
            <div className="tt-waiting-spinner" />
            <div className="tt-waiting-title">Submitted ✅</div>
            <div className="tt-waiting-sub">Waiting for them to write theirs…</div>
          </div>
        )}

        {phase === 'guessing' && (
          <div className="tt-guess">
            <div className="tt-guess-title">Pick their lie 👇</div>
            {peerStatements.map((s, i) => (
              <button
                key={i}
                className={`tt-guess-option ${myGuess === i ? 'picked' : ''}`}
                onClick={() => guess(i)}
                disabled={myGuess !== null}
              >
                <span className="tt-guess-letter">{String.fromCharCode(65 + i)}</span>
                <span className="tt-guess-text">{s.text}</span>
                {myGuess === i && <span className="tt-guess-mark">🎭</span>}
              </button>
            ))}
            {myGuess !== null && peerGuess === null && (
              <div className="tt-waiting-sub">Waiting for them to guess…</div>
            )}
          </div>
        )}

        {phase === 'revealed' && (
          <div className="tt-reveal">
            <div className="tt-reveal-title">
              {myGuess === peerStatements.findIndex((s) => s.isLie)
                ? '✅ You got it!'
                : '❌ Wrong guess'}
            </div>

            <div className="tt-reveal-section">
              <div className="tt-reveal-heading">Their statements:</div>
              {peerStatements.map((s, i) => (
                <div key={i} className={`tt-reveal-item ${s.isLie ? 'lie' : 'truth'}`}>
                  <span className="tt-reveal-letter">{String.fromCharCode(65 + i)}</span>
                  <span className="tt-reveal-text">{s.text}</span>
                  <span className="tt-reveal-tag">{s.isLie ? 'LIE' : 'TRUTH'}</span>
                </div>
              ))}
            </div>

            <div className="tt-reveal-section">
              <div className="tt-reveal-heading">Your statements:</div>
              {myStatements.map((s, i) => (
                <div key={i} className={`tt-reveal-item ${s.isLie ? 'lie' : 'truth'}`}>
                  <span className="tt-reveal-letter">{String.fromCharCode(65 + i)}</span>
                  <span className="tt-reveal-text">{s.text}</span>
                  <span className="tt-reveal-tag">{s.isLie ? 'LIE' : 'TRUTH'}</span>
                  {peerGuess === i && <span className="tt-reveal-guess">They picked this</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {phase === 'revealed' && (
        <div className="game-footer">
          <button className="game-btn game-btn-next" onClick={next}>
            Next round →
          </button>
        </div>
      )}
    </aside>
  );
}