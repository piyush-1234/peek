import { useEffect, useRef, useState } from 'react';
import { socket } from '../lib/socket.js';

export default function ChatSidebar({ peerId, visible }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);
  const peerIdRef = useRef(peerId);

  useEffect(() => {
    peerIdRef.current = peerId;
    // Clear when peer changes
    setMessages([]);
  }, [peerId]);

  useEffect(() => {
    const onTextMessage = ({ from, text, ts }) => {
      setMessages((prev) => [...prev, { from, text, ts, mine: false }]);
    };
    socket.on('text_message', onTextMessage);
    return () => socket.off('text_message', onTextMessage);
  }, []);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    const target = peerIdRef.current;
    if (!target || !input.trim()) return;
    const trimmed = input.trim().slice(0, 1000);
    socket.emit('text_message', { to: target, text: trimmed });
    setMessages((prev) => [
      ...prev,
      { from: 'me', text: trimmed, ts: Date.now(), mine: true },
    ]);
    setInput('');
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
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble ${m.mine ? 'mine' : 'theirs'}`}>
            {m.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form className="chat-sidebar-input-row" onSubmit={handleSend}>
        <input
          className="chat-sidebar-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
          maxLength={1000}
          disabled={!peerId}
        />
        <button className="chat-sidebar-send" type="submit" disabled={!peerId || !input.trim()}>
          ➤
        </button>
      </form>
    </aside>
  );
}