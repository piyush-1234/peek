import { useCallback, useEffect, useRef, useState } from 'react';
import { socket } from '../lib/socket.js';
import { gameSeed, promptForRound } from '../lib/wyr-prompts.js';

export function useGame(peerId, myId) {
  const [active, setActive] = useState(false);
  const [type, setType] = useState(null);
  const [round, setRound] = useState(0);
  const [myVote, setMyVote] = useState(null);
  const [peerVote, setPeerVote] = useState(null);
  const [reveal, setReveal] = useState(false);

  const peerIdRef = useRef(peerId);
  useEffect(() => {
    peerIdRef.current = peerId;
  }, [peerId]);

  // Reset when peer changes
  useEffect(() => {
    setActive(false);
    setType(null);
    setRound(0);
    setMyVote(null);
    setPeerVote(null);
    setReveal(false);
  }, [peerId]);

  // Listen for peer events
  useEffect(() => {
    const onGameEvent = ({ event, payload }) => {
      if (event === 'start') {
        setType(payload.type || 'wyr');
        setActive(true);
        setRound(0);
        setMyVote(null);
        setPeerVote(null);
        setReveal(false);
      } else if (event === 'vote') {
        setPeerVote(payload.choice || null);
      } else if (event === 'next') {
        setRound((r) => r + 1);
        setMyVote(null);
        setPeerVote(null);
        setReveal(false);
      } else if (event === 'leave') {
        setActive(false);
        setType(null);
        setRound(0);
        setMyVote(null);
        setPeerVote(null);
        setReveal(false);
      }
    };

    socket.on('game_event', onGameEvent);
    return () => socket.off('game_event', onGameEvent);
  }, []);

  // Auto-reveal when both voted
  useEffect(() => {
    if (myVote && peerVote) {
      setReveal(true);
    }
  }, [myVote, peerVote]);

  const send = useCallback((event, payload = {}) => {
    const target = peerIdRef.current;
    if (!target) return;
    socket.emit('game_event', { to: target, event, payload });
  }, []);

  const startGame = useCallback((gameType = 'wyr') => {
    setType(gameType);
    setActive(true);
    setRound(0);
    setMyVote(null);
    setPeerVote(null);
    setReveal(false);
    send('start', { type: gameType });
  }, [send]);

  const vote = useCallback((choice) => {
    if (myVote) return;
    setMyVote(choice);
    send('vote', { choice });
  }, [myVote, send]);

  const next = useCallback(() => {
    if (!reveal) return;
    setRound((r) => r + 1);
    setMyVote(null);
    setPeerVote(null);
    setReveal(false);
    send('next');
  }, [reveal, send]);

  const leave = useCallback(() => {
    setActive(false);
    setType(null);
    setRound(0);
    setMyVote(null);
    setPeerVote(null);
    setReveal(false);
    send('leave');
  }, [send]);

  // Current prompt (deterministic from both IDs + round)
  const seed = peerId && myId ? gameSeed(myId, peerId) : 0;
  const prompt = active ? promptForRound(seed, round) : null;

  return {
    active, type, round,
    prompt,
    myVote, peerVote, reveal,
    startGame, vote, next, leave,
  };
}