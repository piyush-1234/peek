import { useEffect, useRef, useState } from 'react';
import { socket } from '../lib/socket.js';
import EmojiPicker from './EmojiPicker.jsx';

export default function GroupChat({ roomId, visible }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [someoneTyping, setSomeoneTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimerRef = useRef(null);
  const myTypingRef = useRef(false);

  useEffect(() => {
    if (!visible) return;

    const onTextMessage = ({ from, text, ts }) => {
      setMessages((prev) => [...prev, { from, text, ts, mine: false }]);
    };
    const onTyping = ({ active }) => {
      setSomeoneTyping(!!active);
    };

    socket.on('text_message', onTextMessage);
    socket.on('typing', onTyping);

    return () => {
      socket.off('text_message', onTextMessage);
      socket.off('typing', onTyping);
    };
  }, [visible]);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, someoneTyping]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!input.trim() || !roomId) return;
    // In group mode, send to room (server handles relay — but our current server relays to peerId only)
    // We need a group-relay: emit text_message to all room members. Simplest: reuse socket room broadcast
    // Actually our server doesn't have socket.io rooms for group — for now, we broadcast via a new event.
    // Fallback: skip group text for now — will add in follow-up.
    console.warn('Group chat message send not yet wired — coming soon');
    setInput('');
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
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble ${m.mine ? 'mine' : 'theirs'}`}>
            {m.text}
          </div>
        ))}
        {someoneTyping && (
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
            title="Emoji"
          >
            😊
          </button>
          {emojiOpen && (
            <EmojiPicker
              onPick={(e) => setInput((v) => (v + e).slice(0, 1000))}
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
          placeholder="Group chat coming soon…"
          disabled
        />
        <button className="chat-sidebar-send" type="submit" disabled>
          ➤
        </button>
      </form>
    </aside>
  );
}