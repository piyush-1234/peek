import { useCallback, useEffect, useRef, useState } from 'react';
import { socket } from '../lib/socket.js';
// `${import.meta.env.VITE_SERVER_URL || 'http://172.28.202.191:4000'}/ice`
`${import.meta.env.VITE_SERVER_URL || 'http://localhost:4000'}/ice`

export const VideoState = Object.freeze({
  IDLE: 'idle',
  REQUESTING_MEDIA: 'requesting_media',
  WAITING: 'waiting',
  NEGOTIATING: 'negotiating',
  CONNECTED: 'connected',
  FAILED: 'failed',
  CLOSED: 'closed',
});

async function fetchIceServers() {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_SERVER_URL || 'http://localhost:4000'}/ice`
    );
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

  // ---- Attach local stream to <video> ----
  const attachLocal = useCallback((stream) => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
  }, []);

  const attachRemote = useCallback((stream) => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = stream;
    }
  }, []);

  // ---- Cleanup peer connection (but keep local stream) ----
  const teardownPeer = useCallback(() => {
    if (pcRef.current) {
      try {
        pcRef.current.getSenders().forEach((s) => {
          try { s.track && s.track.stop && s.track.stop(); } catch {}
        });
        pcRef.current.ontrack = null;
        pcRef.current.onicecandidate = null;
        pcRef.current.onconnectionstatechange = null;
        pcRef.current.close();
      } catch {}
      pcRef.current = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    pendingCandidatesRef.current = [];
    peerIdRef.current = null;
    initiatorRef.current = false;
    setPeerId(null);
    setInitiator(false);
  }, []);

  // ---- Create peer connection ----
  const createPeer = useCallback(async () => {
    if (iceServersRef.current.length === 0) {
      iceServersRef.current = await fetchIceServers();
    }

    const pc = new RTCPeerConnection({ iceServers: iceServersRef.current });

    // Add local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    // Remote track arrives
    pc.ontrack = (event) => {
      const [stream] = event.streams;
      if (stream) attachRemote(stream);
    };

    // ICE candidate to send to peer
    pc.onicecandidate = (event) => {
      if (event.candidate && peerIdRef.current) {
        socket.emit('signal', {
          to: peerIdRef.current,
          type: 'ice',
          payload: event.candidate,
        });
      }
    };

    // Connection state changes
    pc.onconnectionstatechange = () => {
      const s = pc.connectionState;
      if (s === 'connected') {
        setState(VideoState.CONNECTED);
      } else if (s === 'failed') {
        setState(VideoState.FAILED);
        setError({ message: 'Connection failed' });
      } else if (s === 'disconnected') {
        // transient — give ICE restart a chance
      } else if (s === 'closed') {
        setState(VideoState.CLOSED);
      }
    };

    pcRef.current = pc;
    return pc;
  }, [attachRemote]);

  // ---- Handle incoming signals ----
  useEffect(() => {
    const onMatched = async ({ peerId, initiator }) => {
      peerIdRef.current = peerId;
      initiatorRef.current = initiator;
      setPeerId(peerId);
      setInitiator(initiator);
      setState(VideoState.NEGOTIATING);

      try {
        const pc = await createPeer();

        if (initiator) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('signal', {
            to: peerId,
            type: 'offer',
            payload: offer,
          });
        }
      } catch (err) {
        setError({ message: err.message });
        setState(VideoState.FAILED);
      }
    };

    const onSignal = async ({ from, type, payload }) => {
      const pc = pcRef.current;
      if (!pc) return;

      try {
        if (type === 'offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(payload));
          // flush pending ICE
          for (const c of pendingCandidatesRef.current) {
            try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch {}
          }
          pendingCandidatesRef.current = [];

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('signal', { to: from, type: 'answer', payload: answer });
        } else if (type === 'answer') {
          await pc.setRemoteDescription(new RTCSessionDescription(payload));
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
        setError({ message: err.message });
      }
    };

    const onPeerLeft = () => {
      teardownPeer();
      setState(VideoState.IDLE);
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

  // ---- Public: start chat ----
  const start = useCallback(async (region) => {
    setError(null);
    setState(VideoState.REQUESTING_MEDIA);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
        audio: true,
      });
      localStreamRef.current = stream;
      attachLocal(stream);
      setState(VideoState.WAITING);
      socket.emit('find_match', { region });
    } catch (err) {
      setError({ message: 'Camera/mic access denied or unavailable' });
      setState(VideoState.FAILED);
    }
  }, [attachLocal]);

  // ---- Public: next (tear down peer, requeue) ----
  const next = useCallback((region) => {
    teardownPeer();
    setState(VideoState.WAITING);
    socket.emit('find_match', { region });
  }, [teardownPeer]);

  // ---- Public: leave (tear down everything) ----
  const leave = useCallback(() => {
    socket.emit('leave');
    teardownPeer();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    setState(VideoState.IDLE);
    setError(null);
  }, [teardownPeer]);

  // ---- Cleanup on unmount ----
  useEffect(() => {
    return () => {
      teardownPeer();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [teardownPeer]);

  return {
    state, peerId, initiator, error,
    localVideoRef, remoteVideoRef,
    start, next, leave,
  };
}