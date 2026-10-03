import { useCallback, useEffect, useRef, useState } from 'react';
import { socket } from '../lib/socket.js';

/**
 * 2 Truths 1 Lie — 1-on-1 game hook.
 * Phases: idle → writing → guessing → revealed → writing...
 */
export function useTwoTruths(peerId) {
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState('idle');
  const [round, setRound] = useState(0);
  const [myStatements, setMyStatements] = useState([]);     // [{text, isLie}]
  const [peerStatements, setPeerStatements] = useState([]); // [{text}]
  const [peerSubmitted, setPeerSubmitted] = useState(false);
  const [mySubmitted, setMySubmitted] = useState(false);
  const [myGuess, setMyGuess] = useState(null);             // 0 | 1 | 2
  const [peerGuess, setPeerGuess] = useState(null);
  const [myScore, setMyScore] = useState(0);
  const [peerScore, setPeerScore] = useState(0);

  const peerIdRef = useRef(peerId);
  useEffect(() => { peerIdRef.current = peerId; }, [peerId]);

  // Reset on peer change
  useEffect(() => {
    setActive(false); setPhase('idle'); setRound(0);
    setMyStatements([]); setPeerStatements([]);
    setPeerSubmitted(false); setMySubmitted(false);
    setMyGuess(null); setPeerGuess(null);
    setMyScore(0); setPeerScore(0);
  }, [peerId]);

  const send = useCallback((event, payload = {}) => {
    const target = peerIdRef.current;
    if (!target) return;
    socket.emit('game_event', { to: target, event, payload });
  }, []);

  // Socket listeners
  useEffect(() => {
    const onGameEvent = ({ event, payload }) => {
      if (event === 'start_2t1l') {
        setActive(true);
        setPhase('writing');
        setRound(0);
        setMyStatements([]); setPeerStatements([]);
        setPeerSubmitted(false); setMySubmitted(false);
        setMyGuess(null); setPeerGuess(null);
        setMyScore(0); setPeerScore(0);
      } else if (event === 'submit_2t1l') {
        setPeerStatements(payload.statements || []);
        setPeerSubmitted(true);
      } else if (event === 'guess_2t1l') {
        setPeerGuess(payload.index);
      } else if (event === 'next_2t1l') {
        setPhase('writing');
        setRound((r) => r + 1);
        setMyStatements([]); setPeerStatements([]);
        setPeerSubmitted(false); setMySubmitted(false);
        setMyGuess(null); setPeerGuess(null);
      } else if (event === 'leave_2t1l') {
        setActive(false); setPhase('idle');
      }
    };
    socket.on('game_event', onGameEvent);
    return () => socket.off('game_event', onGameEvent);
  }, []);

  // Auto-transition: both submitted → guessing
  useEffect(() => {
    if (phase === 'writing' && mySubmitted && peerSubmitted) {
      setPhase('guessing');
    }
  }, [phase, mySubmitted, peerSubmitted]);

  // Auto-transition: both guessed → revealed
  useEffect(() => {
    if (phase === 'guessing' && myGuess !== null && peerGuess !== null) {
      // Calculate scores
      const myLieIndex = peerStatements.findIndex((s) => s.isLie);
      const peerLieIndex = myStatements.findIndex((s) => s.isLie);
      if (myGuess === myLieIndex) setMyScore((s) => s + 1);
      if (peerGuess === peerLieIndex) setPeerScore((s) => s + 1);
      setPhase('revealed');
    }
  }, [phase, myGuess, peerGuess, peerStatements, myStatements]);

  // Public API
  const start = useCallback(() => {
    setActive(true);
    setPhase('writing');
    setRound(0);
    setMyStatements([]); setPeerStatements([]);
    setPeerSubmitted(false); setMySubmitted(false);
    setMyGuess(null); setPeerGuess(null);
    setMyScore(0); setPeerScore(0);
    send('start_2t1l');
  }, [send]);

  const submit = useCallback((statements) => {
    // statements: [{text, isLie}] — exactly 3, one has isLie:true
    setMyStatements(statements);
    setMySubmitted(true);
    send('submit_2t1l', { statements });
  }, [send]);

  const guess = useCallback((index) => {
    if (myGuess !== null) return;
    setMyGuess(index);
    send('guess_2t1l', { index });
  }, [myGuess, send]);

  const next = useCallback(() => {
    setPhase('writing');
    setRound((r) => r + 1);
    setMyStatements([]); setPeerStatements([]);
    setPeerSubmitted(false); setMySubmitted(false);
    setMyGuess(null); setPeerGuess(null);
    send('next_2t1l');
  }, [send]);

  const leave = useCallback(() => {
    setActive(false); setPhase('idle');
    send('leave_2t1l');
  }, [send]);

  return {
    active, phase, round,
    myStatements, peerStatements,
    peerSubmitted, mySubmitted,
    myGuess, peerGuess,
    myScore, peerScore,
    start, submit, guess, next, leave,
  };
}