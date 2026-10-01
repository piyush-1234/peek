import { useCallback, useEffect, useRef, useState } from 'react';
import { socket } from '../lib/socket.js';

export const GroupState = Object.freeze({
  IDLE: 'idle',
  REQUESTING_MEDIA: 'requesting_media',
  WAITING: 'waiting',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
});

const ICE_TIMEOUT_MS = 15000;

async function fetchIceServers() {
  try {
    const base = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
    const res = await fetch(`${base}/ice`);
    const data = await res.json();
    return data.iceServers || [];
  } catch {
    return [{ urls: 'stun:stun.l.google.com:19302' }];
  }
}

export function useGroupChat() {
  const [state, setState] = useState(GroupState.IDLE);
  const [roomId, setRoomId] = useState(null);
  const [peers, setPeers] = useState([]); // [{ socketId, stream, videoEnabled }]
  const [error, setError] = useState(null);
  const [online, setOnline] = useState({ total: 0, waiting: 0, uniqueTotal: 0 });
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [messages, setMessages] = useState([]);
  const [someoneTyping, setSomeoneTyping] = useState(false);
  const [game, setGame] = useState({ active: false, round: 0, votes: {}, myVote: null, prompt: null });

  const localStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const peersRef = useRef(new Map()); // socketId -> { pc, stream }
  const iceServersRef = useRef([]);
  const mountedRef = useRef(true);

  // ---------- Media attach ----------
  const attachLocal = useCallback((stream) => {
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
  }, []);

  // ---------- Create peer connection to a specific room member ----------
  const createPeerConnection = useCallback(async (peerSocketId, isInitiator) => {
    if (peersRef.current.has(peerSocketId)) return peersRef.current.get(peerSocketId).pc;

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
      if (!stream) return;
      setPeers((prev) =>
        prev.map((p) => (p.socketId === peerSocketId ? { ...p, stream } : p))
      );
      const entry = peersRef.current.get(peerSocketId);
      if (entry) entry.stream = stream;
    };

    // ICE candidate relay
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('signal_to_room_peer', {
          to: peerSocketId,
          type: 'ice',
          payload: event.candidate,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      const s = pc.connectionState;
      if (s === 'connected') {
        setState(GroupState.CONNECTED);
      } else if (s === 'failed') {
        console.warn('peer failed', peerSocketId);
      }
    };

    peersRef.current.set(peerSocketId, { pc, stream: null });

    // Add to peers state (dedupe)
    setPeers((prev) => {
      if (prev.some((p) => p.socketId === peerSocketId)) return prev;
      return [...prev, { socketId: peerSocketId, stream: null, videoEnabled: true }];
    });

    if (isInitiator) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('signal_to_room_peer', {
        to: peerSocketId,
        type: 'offer',
        payload: offer,
      });
    }

    return pc;
  }, []);

  // ---------- Handle incoming signals ----------
  useEffect(() => {
    mountedRef.current = true;

    const onSignal = async ({ from, type, payload }) => {
      let entry = peersRef.current.get(from);
      let pc = entry?.pc;

      if (!pc) {
        pc = await createPeerConnection(from, false);
      }

      try {
        if (type === 'offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(payload));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('signal_to_room_peer', { to: from, type: 'answer', payload: answer });
        } else if (type === 'answer') {
          await pc.setRemoteDescription(new RTCSessionDescription(payload));
        } else if (type === 'ice') {
          if (pc.remoteDescription && pc.remoteDescription.type) {
            try { await pc.addIceCandidate(new RTCIceCandidate(payload)); } catch {}
          }
        }
      } catch (err) {
        console.warn('signal error', err);
      }
    };

    const onGroupTextMessage = (msg) => {
      setMessages((prev) => [...prev, { ...msg, mine: false }]);
    };

    const onGroupTyping = ({ from, active }) => {
      // Track typing per peer in a set
      setSomeoneTyping((prev) => {
        if (active) return true;
        // Just clear — simplest
        return false;
      });
    };

    const onGroupGameEvent = ({ from, event, payload }) => {
      if (event === 'start') {
        setGame({
          active: true,
          round: 0,
          votes: {},
          myVote: null,
          prompt: payload.prompt || null,
          seed: payload.seed || 0,
        });
      } else if (event === 'vote') {
        setGame((g) => ({
          ...g,
          votes: { ...g.votes, [from]: payload.choice },
        }));
      } else if (event === 'next') {
        setGame((g) => ({
          ...g,
          round: g.round + 1,
          votes: {},
          myVote: null,
          prompt: payload.prompt || null,
        }));
      } else if (event === 'leave') {
        setGame({ active: false, round: 0, votes: {}, myVote: null, prompt: null });
      }
    };

    const onRoomCreated = ({ roomId: rid }) => {
      setRoomId(rid);
      setState(GroupState.WAITING);
    };

    const onRoomJoined = async ({ roomId: rid, members }) => {
      setRoomId(rid);
      setState(GroupState.CONNECTING);
      // We initiate to each existing member
      for (const memberId of members) {
        await createPeerConnection(memberId, true);
      }
    };

    const onPeerJoined = ({ peerId }) => {
      // A new peer joined. They will initiate. We just wait for the offer.
      setPeers((prev) => {
        if (prev.some((p) => p.socketId === peerId)) return prev;
        return [...prev, { socketId: peerId, stream: null, videoEnabled: true }];
      });
    };

    const onPeerLeft = ({ peerId }) => {
      const entry = peersRef.current.get(peerId);
      if (entry) {
        try { entry.pc.close(); } catch {}
        peersRef.current.delete(peerId);
      }
      setPeers((prev) => prev.filter((p) => p.socketId !== peerId));
    };

    const onOnlineCount = (data) => {
      if (mountedRef.current) setOnline(data);
    };

    const onError = (err) => {
      setError({ message: err?.message || 'Something went wrong' });
    };

    socket.on('signal', onSignal);
    socket.on('room_created', onRoomCreated);
    socket.on('room_joined', onRoomJoined);
    socket.on('peer_joined_room', onPeerJoined);
    socket.on('peer_left_room', onPeerLeft);
    socket.on('online_count', onOnlineCount);
    socket.on('error', onError);
    socket.on('group_text_message', onGroupTextMessage);
    socket.on('group_typing', onGroupTyping);
    socket.on('group_game_event', onGroupGameEvent);

    return () => {
      socket.off('signal', onSignal);
      socket.off('room_created', onRoomCreated);
      socket.off('room_joined', onRoomJoined);
      socket.off('peer_joined_room', onPeerJoined);
      socket.off('peer_left_room', onPeerLeft);
      socket.off('online_count', onOnlineCount);
      socket.off('error', onError);
      socket.off('group_text_message', onGroupTextMessage);
      socket.off('group_typing', onGroupTyping);
      socket.off('group_game_event', onGroupGameEvent);
      
    };
  }, [createPeerConnection]);

  // ---------- Begin (request media) ----------
  const begin = useCallback(async (region, interests = []) => {
    setError(null);
    setState(GroupState.REQUESTING_MEDIA);

    try {
      if (!localStreamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 } },
          audio: true,
        });
        localStreamRef.current = stream;
      }
      if (!mountedRef.current) return;
      setVideoEnabled(true);
      requestAnimationFrame(() => attachLocal(localStreamRef.current));
      setState(GroupState.WAITING);
      socket.emit('find_group_match', { region, interests });
    } catch (err) {
      if (!mountedRef.current) return;
      const name = err?.name || '';
      let msg = 'Could not access camera/mic.';
      if (name === 'NotAllowedError') msg = 'Permission denied. Enable camera and mic.';
      else if (name === 'NotFoundError') msg = 'No camera or microphone found.';
      setError({ message: msg });
      setState(GroupState.DISCONNECTED);
    }
  }, [attachLocal]);

  // ---------- Toggle own video ----------
  const toggleVideo = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const nextState = !videoEnabled;
    stream.getVideoTracks().forEach((t) => { t.enabled = nextState; });
    setVideoEnabled(nextState);
  }, [videoEnabled]);

  // ---------- Leave ----------
  const leave = useCallback(() => {
    socket.emit('leave_group');
    peersRef.current.forEach((entry) => {
      try { entry.pc.close(); } catch {}
    });
    peersRef.current.clear();
    setPeers([]);
    setRoomId(null);
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => { try { t.stop(); } catch {} });
      localStreamRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (mountedRef.current) {
      setState(GroupState.IDLE);
      setError(null);
    }
  }, []);

  const report = useCallback((reason) => {
    // Reports in group mode are simpler: just log and leave
    socket.emit('report', { reason });
  }, []);

    // ---------- Group text ----------
  const sendGroupMessage = useCallback((text) => {
    const trimmed = text.trim().slice(0, 1000);
    if (!trimmed) return;
    socket.emit('group_text_message', { text: trimmed });
    setMessages((prev) => [
      ...prev,
      { from: 'me', text: trimmed, ts: Date.now(), mine: true, id: `me-${Date.now()}` },
    ]);
  }, []);

  const notifyGroupTyping = useCallback(() => {
    socket.emit('group_typing', { active: true });
  }, []);

  // ---------- Group games ----------
  const startGroupGame = useCallback((prompt) => {
    setGame({ active: true, round: 0, votes: {}, myVote: null, prompt });
    socket.emit('group_game_event', { event: 'start', payload: { prompt } });
  }, []);

  const voteGroupGame = useCallback((choice) => {
    if (game.myVote) return;
    setGame((g) => ({ ...g, myVote: choice, votes: { ...g.votes, me: choice } }));
    socket.emit('group_game_event', { event: 'vote', payload: { choice } });
  }, [game.myVote]);

  const nextGroupGame = useCallback((nextPrompt) => {
    setGame((g) => ({
      ...g,
      round: g.round + 1,
      votes: {},
      myVote: null,
      prompt: nextPrompt,
    }));
    socket.emit('group_game_event', { event: 'next', payload: { prompt: nextPrompt } });
  }, []);

  const leaveGroupGame = useCallback(() => {
    setGame({ active: false, round: 0, votes: {}, myVote: null, prompt: null });
    socket.emit('group_game_event', { event: 'leave' });
  }, []);

  // ---------- Cleanup on unmount ----------
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      peersRef.current.forEach((entry) => {
        try { entry.pc.close(); } catch {}
      });
      peersRef.current.clear();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => { try { t.stop(); } catch {} });
      }
    };
  }, []);

  
  return {
    state, roomId, peers, error, online, videoEnabled,
    localVideoRef,
    messages, someoneTyping,
    game,
    begin, toggleVideo, leave, report,
    sendGroupMessage, notifyGroupTyping,
    startGroupGame, voteGroupGame, nextGroupGame, leaveGroupGame,
  };
}