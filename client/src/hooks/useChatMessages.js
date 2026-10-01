import { useCallback, useEffect, useRef, useState } from 'react';
import { socket } from '../lib/socket.js';

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

const TYPING_STOP_MS = 1500;

export function useChatMessages(peerId) {
  const [messages, setMessages] = useState([]);
  const [peerTyping, setPeerTyping] = useState(false);

  const peerIdRef = useRef(peerId);
  const myTypingRef = useRef(false);
  const typingTimerRef = useRef(null);
  const unreadIdsRef = useRef([]);

  useEffect(() => {
    peerIdRef.current = peerId;
    setMessages([]);
    setPeerTyping(false);
    unreadIdsRef.current = [];
  }, [peerId]);

  // ---- Receive messages / delivered / read / typing ----
  useEffect(() => {
    const onTextMessage = ({ from, text, ts, id }) => {
      setMessages((prev) => [
        ...prev,
        { id, from, text, ts, mine: false, status: 'read' },
      ]);

      // Auto-mark as read since we're displaying it
      if (peerIdRef.current) {
        socket.emit('text_read', { to: peerIdRef.current, ids: [id] });
      }
    };

    const onDelivered = ({ id }) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === id && m.status === 'sent' ? { ...m, status: 'delivered' } : m))
      );
    };

    const onRead = ({ ids }) => {
      const idSet = new Set(ids);
      setMessages((prev) =>
        prev.map((m) => (m.mine && idSet.has(m.id) ? { ...m, status: 'read' } : m))
      );
    };

    const onTyping = ({ active }) => {
      setPeerTyping(!!active);
    };

    socket.on('text_message', onTextMessage);
    socket.on('text_delivered', onDelivered);
    socket.on('text_read', onRead);
    socket.on('typing', onTyping);

    return () => {
      socket.off('text_message', onTextMessage);
      socket.off('text_delivered', onDelivered);
      socket.off('text_read', onRead);
      socket.off('typing', onTyping);
    };
  }, []);

  // ---- Send ----
  const send = useCallback((text) => {
    const target = peerIdRef.current;
    const trimmed = text.trim().slice(0, 1000);
    if (!target || !trimmed) return;

    const id = uid();
    socket.emit('text_message', { to: target, text: trimmed, id });
    setMessages((prev) => [
      ...prev,
      { id, from: 'me', text: trimmed, ts: Date.now(), mine: true, status: 'sent' },
    ]);

    // Stop typing
    if (myTypingRef.current) {
      myTypingRef.current = false;
      socket.emit('typing', { to: target, active: false });
    }
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
  }, []);

  // ---- Typing indicator on input change ----
  const notifyTyping = useCallback(() => {
    const target = peerIdRef.current;
    if (!target) return;

    if (!myTypingRef.current) {
      myTypingRef.current = true;
      socket.emit('typing', { to: target, active: true });
    }

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      if (myTypingRef.current) {
        myTypingRef.current = false;
        socket.emit('typing', { to: target, active: false });
      }
      typingTimerRef.current = null;
    }, TYPING_STOP_MS);
  }, []);

  // ---- Mark all as read (called when chat mounts / peer changes) ----
  const markAllRead = useCallback(() => {
    const target = peerIdRef.current;
    if (!target) return;
    setMessages((prev) => {
      const unread = prev.filter((m) => !m.mine && m.status !== 'read');
      if (unread.length) {
        socket.emit('text_read', { to: target, ids: unread.map((m) => m.id) });
      }
      return prev.map((m) => (!m.mine ? { ...m, status: 'read' } : m));
    });
  }, []);

  return { messages, peerTyping, send, notifyTyping, markAllRead };
}