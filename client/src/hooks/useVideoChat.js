import { useCallback, useEffect, useRef, useState } from 'react';
import { socket } from '../lib/socket.js';

export const VideoState = Object.freeze({
  IDLE: 'idle',
  PREVIEW: 'preview',
  REQUESTING_MEDIA: 'requesting_media',
  WAITING: 'waiting',
  NEGOTIATING: 'negotiating',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  FAILED: 'failed',
});

const ICE_CONNECT_TIMEOUT_MS = 15000;
const ICE_RESTART_ATTEMPTS = 2;
const AUDIO_FADE_MS = 1500;

async function fetchIceServers() {
  try {
    // const base = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
    const base = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
    const res = await fetch(`${base}/ice`);
    const data = await res.json();
    return data.iceServers || [];
  } catch {
    return [{ urls: 'stun:stun.l.google.com:19302' }];
  }
}

export function useVideoChat() {
  const [state, setState] = useState(VideoState.IDLE);
  const [peerId, setPeerId] = useState(null);
  const [initiator, setInitiator] = useState(false);
  const [error, setError] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const localStreamRef = useRef(null);
  const pcRef = useRef(null);
  const peerIdRef = useRef(null);
  const initiatorRef = useRef(false);
  const iceServersRef = useRef([]);
  const pendingCandidatesRef = useRef([]);
  const iceTimeoutRef = useRef(null);
  const iceRestartCountRef = useRef(0);
  const mountedRef = useRef(true);
  const generationRef = useRef(0);
  const audioFadeRef = useRef(null);

  // ---- Video attach ----
  const attachLocal = useCallback((stream) => {
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
  }, []);

  const attachRemote = useCallback((stream) => {
    const el = remoteVideoRef.current;
    if (!el) return;
    el.srcObject = stream;

    // Audio fade-in: start muted, ramp volume to 1
    el.volume = 0;
    if (audioFadeRef.current) clearInterval(audioFadeRef.current);
    const steps = 30;
    const stepMs = AUDIO_FADE_MS / steps;
    let i = 0;
    audioFadeRef.current = setInterval(() => {
      i += 1;
      el.volume = Math.min(1, i / steps);
      if (i >= steps) {
        clearInterval(audioFadeRef.current);
        audioFadeRef.current = null;
      }
    }, stepMs);
  }, []);

  const clearIceTimeout = useCallback(() => {
    if (iceTimeoutRef.current) {
      clearTimeout(iceTimeoutRef.current);
      iceTimeoutRef.current = null;
    }
  }, []);

  const teardownPeer = useCallback(() => {
    clearIceTimeout();
    generationRef.current += 1;

    if (audioFadeRef.current) {
      clearInterval(audioFadeRef.current);
      audioFadeRef.current = null;
    }

    const pc = pcRef.current;
    if (pc) {
      try {
        pc.getSenders().forEach((s) => {
          try { pc.removeTrack(s); } catch {}
        });
        pc.ontrack = null;
        pc.onicecandidate = null;
        pc.onconnectionstatechange = null;
        pc.oniceconnectionstatechange = null;
        pc.onicecandidateerror = null;
        pc.close();
      } catch {}
      pcRef.current = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
      remoteVideoRef.current.volume = 1;
    }
    pendingCandidatesRef.current = [];
    peerIdRef.current = null;
    initiatorRef.current = false;
    iceRestartCountRef.current = 0;

    if (mountedRef.current) {
      setPeerId(null);
      setInitiator(false);
    }
  }, [clearIceTimeout]);

  const armIceTimeout = useCallback((pc, generation) => {
    clearIceTimeout();
    iceTimeoutRef.current = setTimeout(() => {
      if (generation !== generationRef.current) return;
      if (!mountedRef.current) return;
      const cs = pc.connectionState;
      if (cs !== 'connected' && cs !== 'completed') {
        setState(VideoState.FAILED);
        setError({ message: 'Could not connect. Try Next.' });
      }
    }, ICE_CONNECT_TIMEOUT_MS);
  }, [clearIceTimeout]);

  const createPeer = useCallback(async (generation) => {
    if (iceServersRef.current.length === 0) {
      iceServersRef.current = await fetchIceServers();
    }

    const pc = new RTCPeerConnection({ iceServers: iceServersRef.current });

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    pc.ontrack = (event) => {
      if (generation !== generationRef.current) return;
      const [stream] = event.streams;
      if (stream) attachRemote(stream);
    };

    pc.onicecandidate = (event) => {
      if (generation !== generationRef.current) return;
      if (event.candidate && peerIdRef.current) {
        socket.emit('signal', {
          to: peerIdRef.current,
          type: 'ice',
          payload: event.candidate,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (generation !== generationRef.current) return;
      if (!mountedRef.current) return;
      const s = pc.connectionState;
      if (s === 'connected') {
        clearIceTimeout();
        setState(VideoState.CONNECTED);
        setError(null);
      } else if (s === 'failed') {
        if (iceRestartCountRef.current < ICE_RESTART_ATTEMPTS && initiatorRef.current) {
          iceRestartCountRef.current += 1;
          try {
            pc.restartIce();
            setState(VideoState.NEGOTIATING);
          } catch {
            setState(VideoState.FAILED);
            setError({ message: 'Connection failed' });
          }
        } else {
          setState(VideoState.FAILED);
          setError({ message: 'Connection failed. Try Next.' });
        }
      } else if (s === 'disconnected') {
        setState(VideoState.NEGOTIATING);
      } else if (s === 'closed') {
        setState(VideoState.IDLE);
      }
    };

    pc.onicecandidateerror = () => {};

    pcRef.current = pc;
    armIceTimeout(pc, generation);
    return pc;
  }, [attachRemote, clearIceTimeout, armIceTimeout]);

  // ---- Socket listeners ----
  useEffect(() => {
    mountedRef.current = true;

    const onMatched = async ({ peerId: newPeerId, initiator: isInit }) => {
      if (!mountedRef.current) return;
      teardownPeer();

      const generation = generationRef.current;
      peerIdRef.current = newPeerId;
      initiatorRef.current = isInit;
      setPeerId(newPeerId);
      setInitiator(isInit);
      setState(VideoState.NEGOTIATING);
      setError(null);

      try {
        const pc = await createPeer(generation);
        if (generation !== generationRef.current) return;

        if (isInit) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          if (generation !== generationRef.current) return;
          socket.emit('signal', { to: newPeerId, type: 'offer', payload: offer });
        }
      } catch (err) {
        if (generation !== generationRef.current) return;
        setError({ message: err.message });
        setState(VideoState.FAILED);
      }
    };

    const onSignal = async ({ from, type, payload }) => {
      const pc = pcRef.current;
      if (!pc) return;
      if (from !== peerIdRef.current) return;

      const generation = generationRef.current;

      try {
        if (type === 'offer') {
          if (initiatorRef.current) return;
          if (pc.signalingState !== 'stable') return;
          await pc.setRemoteDescription(new RTCSessionDescription(payload));
          if (generation !== generationRef.current) return;

          for (const c of pendingCandidatesRef.current) {
            try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch {}
          }
          pendingCandidatesRef.current = [];

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          if (generation !== generationRef.current) return;
          socket.emit('signal', { to: from, type: 'answer', payload: answer });
        } else if (type === 'answer') {
          if (!initiatorRef.current) return;
          if (pc.signalingState !== 'have-local-offer') return;
          await pc.setRemoteDescription(new RTCSessionDescription(payload));
          if (generation !== generationRef.current) return;

          for (const c of pendingCandidatesRef.current) {
            try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch {}
          }
          pendingCandidatesRef.current = [];
        } else if (type === 'ice') {
          if (pc.remoteDescription && pc.remoteDescription.type) {
            try { await pc.addIceCandidate(new RTCIceCandidate(payload)); } catch {}
          } else {
            pendingCandidatesRef.current.push(payload);
          }
        }
      } catch (err) {
        console.warn('signal error', err);
      }
    };

    const onPeerLeft = () => {
      if (!mountedRef.current) return;
      teardownPeer();
      setState(VideoState.DISCONNECTED);
    };

    socket.on('matched', onMatched);
    socket.on('signal', onSignal);
    socket.on('peer_left', onPeerLeft);

    return () => {
      socket.off('matched', onMatched);
      socket.off('signal', onSignal);
      socket.off('peer_left', onPeerLeft);
    };
  }, [createPeer, teardownPeer]);

  // ---- Public: begin (request media → PREVIEW state) ----
  const begin = useCallback(async () => {
    setError(null);
    setState(VideoState.REQUESTING_MEDIA);
    try {
      if (!localStreamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 } },
          audio: true,
        });
        localStreamRef.current = stream;
      }
      if (!mountedRef.current) return;
      // Attach after state change so element is mounted
      requestAnimationFrame(() => attachLocal(localStreamRef.current));
      setState(VideoState.PREVIEW);
    } catch (err) {
      if (!mountedRef.current) return;
      const name = err?.name || '';
      let msg = 'Could not access camera/mic.';
      if (name === 'NotAllowedError') msg = 'Permission denied. Enable camera and mic to continue.';
      else if (name === 'NotFoundError') msg = 'No camera or microphone found.';
      else if (name === 'NotReadableError') msg = 'Camera is in use by another app.';
      setError({ message: msg });
      setState(VideoState.FAILED);
    }
  }, [attachLocal]);

  // ---- Public: confirm ready (enter queue) ----
  const confirmReady = useCallback((region) => {
    if (!localStreamRef.current) return begin();
    setState(VideoState.WAITING);
    socket.emit('find_match', { region });
  }, [begin]);

  // ---- Public: next ----
  const next = useCallback((region) => {
    if (!localStreamRef.current) return begin();
    teardownPeer();
    setState(VideoState.WAITING);
    setError(null);
    socket.emit('find_match', { region });
  }, [teardownPeer, begin]);

  const retry = next;

  // ---- Public: leave ----
  const leave = useCallback(() => {
    socket.emit('leave');
    teardownPeer();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => {
        try { t.stop(); } catch {}
      });
      localStreamRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (mountedRef.current) {
      setState(VideoState.IDLE);
      setError(null);
    }
  }, [teardownPeer]);

  const report = useCallback((reason) => {
    socket.emit('report', { reason });
  }, []);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      teardownPeer();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => {
          try { t.stop(); } catch {}
        });
      }
      if (audioFadeRef.current) clearInterval(audioFadeRef.current);
    };
  }, [teardownPeer]);

  return {
    state, peerId, initiator, error,
    localVideoRef, remoteVideoRef,
    localStreamRef,
    begin, confirmReady, next, retry, leave, report,
  };
}