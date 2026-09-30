import { useEffect, useRef, useState } from 'react';
import { socket } from '../lib/socket.js';
import EmojiPicker from './EmojiPicker.jsx';

export default function ChatSidebar({ peerId, visible }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const peerIdRef = useRef(peerId);

  useEffect(() => {
    peerIdRef.current = peerId;
    setMessages([]);
  }, [peerId]);

  useEffect(() => {
    const onTextMessage = ({ text, ts }) => {
      setMessages((prev) => [...prev, { text, ts, mine: false }]);
    };
    socket.on('text_message', onTextMessage);
    return () => socket.off('text_message', onTextMessage);
  }, []);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e?.preventDefault();
    const target = peerIdRef.current;
    if (!target || !input.trim()) return;
    const trimmed = input.trim().slice(0, 1000);
    socket.emit('text_message', { to: target, text: trimmed });
    setMessages((prev) => [...prev, { text: trimmed, ts: Date.now(), mine: true }]);
    setInput('');
    setEmojiOpen(false);
  };

  const handleEmoji = (emoji) => {
    setInput((v) => (v + emoji).slice(0, 1000));
    inputRef.current?.focus();
  };

  if (!visible) return null;

  return (
    <aside className="chat-sidebar">
      <div className="chat-sidebar-header">Chat</div>

      <div className="chat-sidebar-body">
        {messages.length === 0 && peerId && (
          <div className="chat-sidebar-empty">Say hi 👋</div>
        )}
        {!peerId && (
          <div className="chat-sidebar-empty muted">Waiting for a match…</div>
        )}
        {messages.map((m, i) => {
          const isEmojiOnly = /^[\p{Emoji}\s]+$/u.test(m.text) && m.text.trim().length > 0;
          return (
            <div
              key={i}
              className={`chat-bubble ${m.mine ? 'mine' : 'theirs'} ${isEmojiOnly ? 'emoji-only' : ''}`}
            >
              {m.text}
            </div>
          );
        })}
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
            <EmojiPicker
              onPick={handleEmoji}
              onClose={() => setEmojiOpen(false)}
            />
          )}
        </div>

        <input
          ref={inputRef}
          className="chat-sidebar-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
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