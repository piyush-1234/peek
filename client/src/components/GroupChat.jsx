import { useEffect, useRef, useState } from 'react';
import EmojiPicker from './EmojiPicker.jsx';

const COLORS = ['#a855f7', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1'];

function colorFor(socketId) {
  if (!socketId) return '#a855f7';
  let hash = 0;
  for (let i = 0; i < socketId.length; i++) hash = (hash * 31 + socketId.charCodeAt(i)) | 0;
  return COLORS[Math.abs(hash) % COLORS.length];
}

function initialsFor(socketId) {
  if (!socketId || socketId === 'me') return 'Y';
  return socketId.slice(0, 2).toUpperCase();
}

export default function GroupChat({ chat, visible }) {
  const { messages, someoneTyping, sendGroupMessage, notifyGroupTyping } = chat;
  const [input, setInput] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimerRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, someoneTyping]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!input.trim()) return;
    sendGroupMessage(input);
    setInput('');
    setEmojiOpen(false);
  };

  const handleChange = (e) => {
    setInput(e.target.value);
    notifyGroupTyping();
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {}, 1500);
  };

  const handleEmoji = (emoji) => {
    setInput((v) => (v + emoji).slice(0, 1000));
    inputRef.current?.focus();
  };

  if (!visible) return null;

  return (
    <aside className="chat-sidebar">
      <div className="chat-sidebar-header">
        Group Chat
        {someoneTyping && <span className="typing-dot-row"><span /><span /><span /></span>}
      </div>

      <div className="chat-sidebar-body">
        {messages.length === 0 && (
          <div className="chat-sidebar-empty">Say hi to the group 👋</div>
        )}

        {messages.map((m, i) => {
          const isEmojiOnly = /^[\p{Emoji}\s]+$/u.test(m.text) && m.text.trim().length > 0;
          return (
            <div key={m.id || i} className={`group-msg-row ${m.mine ? 'mine' : ''}`}>
              {!m.mine && (
                <div
                  className="group-msg-avatar"
                  style={{ background: colorFor(m.from) }}
                >
                  {initialsFor(m.from)}
                </div>
              )}
              <div className={`group-msg-bubble ${m.mine ? 'mine' : 'theirs'} ${isEmojiOnly ? 'emoji-only' : ''}`}>
                {m.text}
              </div>
            </div>
          );
        })}

        {someoneTyping && (
          <div className="group-msg-row">
            <div className="group-msg-avatar" style={{ background: '#a78bfa' }}>…</div>
            <div className="group-msg-bubble theirs typing-bubble">
              <span className="typing-dots"><span /><span /><span /></span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <form className="chat-sidebar-input-row" onSubmit={handleSend}>
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
          className="chat-sidebar-input"
          type="text"
          value={input}
          onChange={handleChange}
          placeholder="Message the group…"
          maxLength={1000}
        />
        <button className="chat-sidebar-send" type="submit" disabled={!input.trim()}>
          ➤
        </button>
      </form>
    </aside>
  );
}