import { useCallback, useEffect, useRef, useState } from 'react';
import { socket } from '../lib/socket.js';

export const TextState = Object.freeze({
  IDLE: 'idle',
  WAITING: 'waiting',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
});

export function useTextChat() {
  const [state, setState] = useState(TextState.IDLE);
  const [peerId, setPeerId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sharedInterests, setSharedInterests] = useState([]);
  const [online, setOnline] = useState({ total: 0, waiting: 0, uniqueTotal: 0 });

  const peerIdRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const onWaiting = () => {
      if (!mountedRef.current) return;
      setState(TextState.WAITING);
    };

    const onMatched = ({ peerId: newPeerId, sharedInterests: si = [] }) => {
      if (!mountedRef.current) return;
      peerIdRef.current = newPeerId;
      setPeerId(newPeerId);
      setSharedInterests(si);
      setMessages([]);
      setState(TextState.CONNECTED);
    };

    const onTextMessage = ({ from, text, ts }) => {
      if (!mountedRef.current) return;
      setMessages((prev) => [...prev, { from, text, ts, mine: false }]);
    };

    const onPeerLeft = () => {
      if (!mountedRef.current) return;
      peerIdRef.current = null;
      setPeerId(null);
      setState(TextState.DISCONNECTED);
    };

    const onTimeout = () => {
      if (!mountedRef.current) return;
      setState(TextState.IDLE);
    };

    const onOnlineCount = (data) => {
      if (!mountedRef.current) return;
      setOnline(data);
    };

    const onError = (err) => {
      if (!mountedRef.current) return;
      // surface as toast or silent — for now just log
      console.warn('text chat error', err);
    };

    socket.on('waiting', onWaiting);
    socket.on('matched', onMatched);
    socket.on('text_message', onTextMessage);
    socket.on('peer_left', onPeerLeft);
    socket.on('match_timeout', onTimeout);
    socket.on('online_count', onOnlineCount);
    socket.on('error', onError);

    return () => {
      socket.off('waiting', onWaiting);
      socket.off('matched', onMatched);
      socket.off('text_message', onTextMessage);
      socket.off('peer_left', onPeerLeft);
      socket.off('match_timeout', onTimeout);
      socket.off('online_count', onOnlineCount);
      socket.off('error', onError);
    };
  }, []);

  const start = useCallback((region, interests = []) => {
    setMessages([]);
    setState(TextState.WAITING);
    socket.emit('find_match', { region, mode: 'text', interests });
  }, []);

  const sendMessage = useCallback((text) => {
    const target = peerIdRef.current;
    if (!target || !text.trim()) return;
    const trimmed = text.trim().slice(0, 1000);
    socket.emit('text_message', { to: target, text: trimmed });
    setMessages((prev) => [
      ...prev,
      { from: 'me', text: trimmed, ts: Date.now(), mine: true },
    ]);
  }, []);

  const next = useCallback((region, interests = []) => {
    setMessages([]);
    socket.emit('leave');
    setState(TextState.WAITING);
    socket.emit('find_match', { region, mode: 'text', interests });
  }, []);

  const leave = useCallback(() => {
    socket.emit('leave');
    peerIdRef.current = null;
    setPeerId(null);
    setMessages([]);
    setState(TextState.IDLE);
  }, []);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    state, peerId, messages, online, sharedInterests,
    start, sendMessage, next, leave,
  };
}