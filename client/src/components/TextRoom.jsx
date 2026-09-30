import { useEffect, useRef, useState } from 'react';
import { TextState } from '../hooks/useTextChat.js';
import Nav from './Nav.jsx';

export default function TextRoom({ chat, region, onLeave }) {
  const { state, peerId, messages, online, sendMessage, next, leave } = chat;
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <div className="text-page">
      <Nav online={online} onLogoClick={leave} showStats />

      <div className="text-inner">
        <div className="text-card">
          {/* header */}
          <div className="text-header">
            <div className="text-header-status">
              {state === TextState.CONNECTED && (
                <>
                  <span className="text-status-dot" />
                  <span>Connected to a stranger</span>
                </>
              )}
              {state === TextState.WAITING && (
                <>
                  <span className="text-status-dot waiting" />
                  <span>Finding someone…</span>
                </>
              )}
              {state === TextState.DISCONNECTED && (
                <>
                  <span className="text-status-dot offline" />
                  <span>They left the chat</span>
                </>
              )}
            </div>
            <div className="text-header-actions">
              {state === TextState.CONNECTED && (
                <button className="text-btn-mini" onClick={() => next(region)}>
                  Next
                </button>
              )}
              <button className="text-btn-mini text-btn-danger" onClick={leave}>
                Leave
              </button>
            </div>
          </div>

          {/* body */}
          <div className="text-body">
            {state === TextState.WAITING && (
              <div className="text-empty">
                <div className="text-spinner" />
                <div className="text-empty-title">Looking for someone…</div>
                <div className="text-empty-sub">
                  {online?.waiting > 0
                    ? `${online.waiting} ${online.waiting === 1 ? 'person is' : 'people are'} waiting with you`
                    : 'Hang tight. You’ll be matched soon.'}
                </div>
              </div>
            )}

            {state === TextState.DISCONNECTED && (
              <div className="text-empty">
                <div className="text-empty-emoji">👋</div>
                <div className="text-empty-title">They left the chat</div>
                <div className="text-empty-actions">
                  <button className="text-btn-primary" onClick={() => next(region)}>
                    Meet someone new
                  </button>
                  <button className="text-btn-ghost" onClick={leave}>
                    Leave
                  </button>
                </div>
              </div>
            )}

            {state === TextState.CONNECTED && (
              <div className="text-messages">
                {messages.length === 0 && (
                  <div className="text-hello">
                    Say hi 👋 — this chat is private and disappears when you leave.
                  </div>
                )}
                {messages.map((m, i) => (
                  <div key={i} className={`text-bubble ${m.mine ? 'mine' : 'theirs'}`}>
                    <div className="text-bubble-content">{m.text}</div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* input */}
          {state === TextState.CONNECTED && (
            <form className="text-input-row" onSubmit={handleSend}>
              <input
                className="text-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message…"
                maxLength={1000}
                autoFocus
              />
              <button className="text-send" type="submit" disabled={!input.trim()}>
                Send
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}