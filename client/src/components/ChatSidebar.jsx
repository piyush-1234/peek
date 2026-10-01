import { useEffect, useRef, useState } from 'react';
import EmojiPicker from './EmojiPicker.jsx';
import ChatBubble from './ChatBubble.jsx';
import { useChatMessages } from '../hooks/useChatMessages.js';

export default function ChatSidebar({ peerId, visible }) {
  const { messages, peerTyping, send, notifyTyping, markAllRead } = useChatMessages(peerId);
  const [input, setInput] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, peerTyping]);

  useEffect(() => {
    if (visible && peerId) markAllRead();
  }, [visible, peerId, markAllRead]);

  const handleSend = (e) => {
    e?.preventDefault();
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

  if (!visible) return null;

  return (
    <aside className="chat-sidebar">
      <div className="chat-sidebar-header">
        Chat
        {peerTyping && <span className="typing-dot-row"><span /><span /><span /></span>}
      </div>

      <div className="chat-sidebar-body">
        {messages.length === 0 && peerId && (
          <div className="chat-sidebar-empty">Say hi 👋</div>
        )}
        {!peerId && (
          <div className="chat-sidebar-empty muted">Waiting for a match…</div>
        )}
        {messages.map((m, i) => (
          <ChatBubble key={m.id || i} message={m} variant="sidebar" />
        ))}
        {peerTyping && (
          <div className="chat-bubble theirs typing-bubble">
            <span className="typing-dots"><span /><span /><span /></span>
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
            disabled={!peerId}
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
          placeholder="Type a message…"
          maxLength={1000}
          disabled={!peerId}
        />
        <button
          className="chat-sidebar-send"
          type="submit"
          disabled={!peerId || !input.trim()}
        >
          ➤
        </button>
      </form>
    </aside>
  );
}