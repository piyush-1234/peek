import { useEffect, useRef, useState } from 'react';
import { TextState } from '../hooks/useTextChat.js';
import Nav from './Nav.jsx';
import EmojiPicker from './EmojiPicker.jsx';
import ChatBubble from './ChatBubble.jsx';
import { useChatMessages } from '../hooks/useChatMessages.js';

export default function TextRoom({ chat, region, onLeave, interests = [] }) {
  const { state, peerId, online, sharedInterests, next, leave } = chat;
  const { messages, peerTyping, send, notifyTyping, markAllRead } = useChatMessages(peerId);
  const [input, setInput] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, peerTyping]);

  useEffect(() => {
    if (state === TextState.CONNECTED && peerId) markAllRead();
  }, [state, peerId, markAllRead]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    send(input);
    setInput('');
    setEmojiOpen(false);
  };

  const handleChange = (e) => {
    setInput(e.target.value);
    notifyTyping();
  };

  const handleEmoji = (emoji) => {
    setInput((v) => (v + emoji).slice(0, 1000));
    inputRef.current?.focus();
  };

  return (
    <div className="text-page">
      <Nav online={online} onLogoClick={leave} showStats />

      <div className="text-inner">
        <div className="text-card">
          <div className="text-card-liquid" aria-hidden="true">
            <div className="liquid-blob liquid-blob-1" />
            <div className="liquid-blob liquid-blob-2" />
            <div className="liquid-blob liquid-blob-3" />
          </div>

          <div className="text-header">
            <div className="text-header-status">
              {state === TextState.CONNECTED && (
                <>
                  <span className="text-status-dot" />
                  <span>
                    {sharedInterests?.length > 0
                      ? `You both like ${sharedInterests.join(' · ')}`
                      : 'Connected to a stranger'}
                  </span>
                  {peerTyping && <span className="typing-dot-row"><span /><span /><span /></span>}
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
                <button className="text-btn-mini" onClick={() => next(region, interests)}>Next</button>
              )}
              <button className="text-btn-mini text-btn-danger" onClick={leave}>Leave</button>
            </div>
          </div>

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
                  <button className="text-btn-primary" onClick={() => next(region, interests)}>Meet someone new</button>
                  <button className="text-btn-ghost" onClick={leave}>Leave</button>
                </div>
              </div>
            )}

            {state === TextState.CONNECTED && (
              <div className="text-messages">
                {messages.length === 0 && (
                  <div className="text-hello">Say hi 👋 — this chat is private and disappears when you leave.</div>
                )}
                {messages.map((m, i) => (
                  <ChatBubble key={m.id || i} message={m} variant="default" />
                ))}
                {peerTyping && (
                  <div className="text-bubble theirs typing-bubble">
                    <span className="typing-dots"><span /><span /><span /></span>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {state === TextState.CONNECTED && (
            <form className="text-input-row" onSubmit={handleSend}>
              <div className="chat-emoji-wrap">
                <button
                  type="button"
                  className="chat-emoji-trigger"
                  onClick={() => setEmojiOpen((v) => !v)}
                  title="Emoji"
                >
                  😊
                </button>
                {emojiOpen && (
                  <EmojiPicker onPick={handleEmoji} onClose={() => setEmojiOpen(false)} />
                )}
              </div>

              <input
                ref={inputRef}
                className="text-input"
                type="text"
                value={input}
                onChange={handleChange}
                placeholder="Type a message…"
                maxLength={1000}
                autoFocus
              />
              <button className="text-send" type="submit" disabled={!input.trim()}>Send</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}