import { useEffect, useRef, useState, useCallback } from 'react';
import { socket } from '../lib/socket.js';

export const MatchState = Object.freeze({
  IDLE: 'idle',
  WAITING: 'waiting',
  MATCHED: 'matched',
  TIMEOUT: 'timeout',
  ERROR: 'error',
});

export function useMatch() {
  const [state, setState] = useState(MatchState.IDLE);
  const [region, setRegion] = useState('en:in');
  const [peerId, setPeerId] = useState(null);
  const [initiator, setInitiator] = useState(false);
  const [error, setError] = useState(null);
  const peerIdRef = useRef(null);

  useEffect(() => {
    const onWaiting = () => setState(MatchState.WAITING);
    const onMatched = ({ peerId, initiator }) => {
      peerIdRef.current = peerId;
      setPeerId(peerId);
      setInitiator(initiator);
      setState(MatchState.MATCHED);
    };
    const onTimeout = () => setState(MatchState.TIMEOUT);
    const onPeerLeft = () => {
      peerIdRef.current = null;
      setPeerId(null);
      setInitiator(false);
      setState(MatchState.IDLE);
    };
    const onError = (e) => {
      setError(e);
      setState(MatchState.ERROR);
    };

    socket.on('waiting', onWaiting);
    socket.on('matched', onMatched);
    socket.on('match_timeout', onTimeout);
    socket.on('peer_left', onPeerLeft);
    socket.on('error', onError);

    return () => {
      socket.off('waiting', onWaiting);
      socket.off('matched', onMatched);
      socket.off('match_timeout', onTimeout);
      socket.off('peer_left', onPeerLeft);
      socket.off('error', onError);
    };
  }, []);

  const findMatch = useCallback((r) => {
    setError(null);
    const useRegion = r || region;
    setRegion(useRegion);
    setState(MatchState.WAITING);
    socket.emit('find_match', { region: useRegion });
  }, [region]);

  const cancel = useCallback(() => {
    socket.emit('cancel_match');
    setState(MatchState.IDLE);
    setPeerId(null);
    peerIdRef.current = null;
  }, []);

  const leave = useCallback(() => {
    socket.emit('leave');
    setState(MatchState.IDLE);
    setPeerId(null);
    peerIdRef.current = null;
  }, []);

  return { state, region, setRegion, peerId, initiator, error, findMatch, cancel, leave };
}