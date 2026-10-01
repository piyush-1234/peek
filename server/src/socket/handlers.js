import { assignToRoom } from '../rooms/matcher.js';
import {
  getRoom,
  removeMember,
  findRoomForSocket,
} from '../rooms/store.js';
import { checkMatchLimit, checkConnectionLimit } from '../rateLimit.js';
import { writeReport } from '../reports/store.js';
import { recordUnique } from '../stats.js';
import { config } from '../config.js';
import { log } from '../logger.js';
import {
  createSession,
  getSession,
  updateSession,
  deleteSession,
  SessionState,
} from '../session/store.js';
import { enqueue, dequeue } from '../matching/queue.js';
import { relaySignal } from './relay.js';

const ALLOWED_REGIONS = new Set(['anywhere', 'en:in', 'hi:in', 'en:us', 'en:uk', 'es:mx']);
const ALLOWED_MODES = new Set(['video', 'text']);
const timeoutTimers = new Map();

export function registerHandlers(io, socket) {
  const ip = (socket.handshake.headers['x-forwarded-for'] || '').split(',')[0].trim() || socket.handshake.address;

  const connLimit = checkConnectionLimit(ip);
  if (!connLimit.ok) {
    log.warn('Connection rate limit hit', { ip });
    socket.emit('error', { code: 'RATE_LIMITED', message: 'Too many connections.' });
    socket.disconnect(true);
    return;
  }

  const isTestDevice = socket.handshake.auth?.testDevice === true;
  if (!isTestDevice) {
    recordUnique(ip, socket.handshake.headers['user-agent'] || '');
  }

  log.info('Connected', { socketId: socket.id, ip });
  createSession(socket.id);

  socket.on('find_match', ({ region, mode = 'video', interests = [] } = {}) => {
    const session = getSession(socket.id);
    if (!session) return;

    const matchLimit = checkMatchLimit(ip);
    if (!matchLimit.ok) {
      socket.emit('error', {
        code: 'RATE_LIMITED',
        message: `Too many matches. Try again in ${matchLimit.retryAfter}s.`,
      });
      return;
    }

    if (session.state !== SessionState.IDLE && session.state !== SessionState.MATCHED) return;
    if (!region || !ALLOWED_REGIONS.has(region)) {
      socket.emit('error', { code: 'BAD_REGION', message: 'Invalid region' });
      return;
    }
    if (!ALLOWED_MODES.has(mode)) {
      socket.emit('error', { code: 'BAD_MODE', message: 'Invalid mode' });
      return;
    }

    const cleanInterests = Array.isArray(interests)
      ? interests.filter((i) => typeof i === 'string').slice(0, 3)
      : [];

    if (session.peerId) {
      io.to(session.peerId).emit('peer_left', {});
      updateSession(session.peerId, { state: SessionState.CLOSED, peerId: null });
    }

    updateSession(socket.id, {
      state: SessionState.WAITING,
      region,
      mode,
      interests: cleanInterests,
      peerId: null,
      initiator: false,
      matchedAt: null,
      waitingSince: Date.now(),
    });

    // Queue key combines mode + region so video-only and text-only never mix
    const queueKey = `${mode}:${region}`;
    enqueue(queueKey, socket.id);
    socket.emit('waiting', { region, mode });

    clearTimeout(timeoutTimers.get(socket.id));
    const t = setTimeout(() => {
      const s = getSession(socket.id);
      if (s && s.state === SessionState.WAITING) {
        dequeue(socket.id);
        updateSession(socket.id, { state: SessionState.IDLE, region: null, mode: null });
        socket.emit('match_timeout', {});
      }
      timeoutTimers.delete(socket.id);
    }, config.matchTimeoutMs);
    timeoutTimers.set(socket.id, t);
  });

  socket.on('cancel_match', () => {
    const s = getSession(socket.id);
    if (!s) return;
    if (s.state === SessionState.WAITING) {
      dequeue(socket.id);
      clearTimeout(timeoutTimers.get(socket.id));
      timeoutTimers.delete(socket.id);
      updateSession(socket.id, { state: SessionState.IDLE, region: null, mode: null });
      socket.emit('cancelled', {});
    }
  });

  socket.on('signal', (msg) => {
    relaySignal(io, socket, msg);
  });

  socket.on('video_state', ({ to, enabled } = {}) => {
    const s = getSession(socket.id);
    if (!s || s.state !== SessionState.MATCHED) return;
    if (s.peerId !== to) return;
    io.to(to).emit('video_state', { enabled: !!enabled });
  });

    socket.on('game_event', ({ to, event, payload } = {}) => {
    const s = getSession(socket.id);
    if (!s || s.state !== SessionState.MATCHED) return;
    if (s.peerId !== to) return;
    if (!event || typeof event !== 'string') return;

    io.to(to).emit('game_event', {
      from: socket.id,
      event,
      payload: payload || {},
    });
  });

    // ---------- GROUP CHAT ----------
  socket.on('find_group_match', ({ region, interests = [] } = {}) => {
    const session = getSession(socket.id);
    if (!session) return;

    if (session.state !== SessionState.IDLE && session.state !== SessionState.MATCHED) return;
    if (!region || !ALLOWED_REGIONS.has(region)) {
      socket.emit('error', { code: 'BAD_REGION', message: 'Invalid region' });
      return;
    }

    // Clean up any previous 1-on-1 or room
    if (session.peerId) {
      io.to(session.peerId).emit('peer_left', {});
      updateSession(session.peerId, { state: SessionState.IDLE, peerId: null });
    }
    if (session.roomId) {
      leaveRoom(io, socket);
    }

    const cleanInterests = Array.isArray(interests)
      ? interests.filter((i) => typeof i === 'string').slice(0, 3)
      : [];

    const { room, isNew } = assignToRoom(socket, region, cleanInterests);

    updateSession(socket.id, {
      state: SessionState.MATCHED,
      region,
      mode: 'group',
      interests: cleanInterests,
      peerId: null,
      roomId: room.id,
      initiator: false,
      matchedAt: Date.now(),
      waitingSince: null,
    });

    const others = room.members.filter((id) => id !== socket.id);

    if (isNew || others.length === 0) {
      socket.emit('room_created', { roomId: room.id });
    } else {
      // New joiner: gets list of existing members (they will initiate to all)
      socket.emit('room_joined', {
        roomId: room.id,
        members: others,
      });

      // Existing members: get notified about the new peer
      for (const peerSocketId of others) {
        io.to(peerSocketId).emit('peer_joined_room', {
          roomId: room.id,
          peerId: socket.id,
        });
      }
    }
  });

  socket.on('signal_to_room_peer', ({ to, type, payload } = {}) => {
    const s = getSession(socket.id);
    if (!s || !s.roomId) return;
    const room = getRoom(s.roomId);
    if (!room) return;
    if (!room.members.includes(to)) return;
    io.to(to).emit('signal', { from: socket.id, type, payload });
  });

    socket.on('leave_group', () => {
    leaveRoom(io, socket);
  });

  // ---------- GROUP TEXT CHAT ----------
  socket.on('group_text_message', ({ text } = {}) => {
    const s = getSession(socket.id);
    if (!s || !s.roomId) return;
    const room = getRoom(s.roomId);
    if (!room) return;
    if (!text || typeof text !== 'string') return;
    const trimmed = text.slice(0, 1000).trim();
    if (!trimmed) return;

    const payload = {
      from: socket.id,
      text: trimmed,
      ts: Date.now(),
      id: `${socket.id}-${Date.now().toString(36)}`,
    };

    for (const memberId of room.members) {
      if (memberId !== socket.id) {
        io.to(memberId).emit('group_text_message', payload);
      }
    }
  });

  socket.on('group_typing', ({ active } = {}) => {
    const s = getSession(socket.id);
    if (!s || !s.roomId) return;
    const room = getRoom(s.roomId);
    if (!room) return;

    for (const memberId of room.members) {
      if (memberId !== socket.id) {
        io.to(memberId).emit('group_typing', {
          from: socket.id,
          active: !!active,
        });
      }
    }
  });

  // ---------- GROUP GAME EVENTS ----------
  socket.on('group_game_event', ({ event, payload } = {}) => {
    const s = getSession(socket.id);
    if (!s || !s.roomId) return;
    const room = getRoom(s.roomId);
    if (!room) return;
    if (!event || typeof event !== 'string') return;

    for (const memberId of room.members) {
      if (memberId !== socket.id) {
        io.to(memberId).emit('group_game_event', {
          from: socket.id,
          event,
          payload: payload || {},
        });
      }
    }
  });
  // Text message relay — no storage, no history
    socket.on('text_message', ({ to, text, id } = {}) => {
    const s = getSession(socket.id);
    if (!s || s.state !== SessionState.MATCHED) return;
    if (s.peerId !== to) return;
    if (!text || typeof text !== 'string') return;
    const trimmed = text.slice(0, 1000).trim();
    if (!trimmed) return;

    const messageId = typeof id === 'string' ? id.slice(0, 40) : null;

    io.to(to).emit('text_message', {
      from: socket.id,
      text: trimmed,
      ts: Date.now(),
      id: messageId,
    });

    // Delivery acknowledgment back to sender
    if (messageId) {
      socket.emit('text_delivered', { id: messageId, ts: Date.now() });
    }
  });

  socket.on('text_read', ({ to, ids } = {}) => {
    const s = getSession(socket.id);
    if (!s || s.state !== SessionState.MATCHED) return;
    if (s.peerId !== to) return;
    if (!Array.isArray(ids)) return;
    const clean = ids.filter((i) => typeof i === 'string').slice(0, 200);
    if (!clean.length) return;
    io.to(to).emit('text_read', { ids: clean, ts: Date.now() });
  });

  socket.on('typing', ({ to, active } = {}) => {
    const s = getSession(socket.id);
    if (!s || s.state !== SessionState.MATCHED) return;
    if (s.peerId !== to) return;
    io.to(to).emit('typing', { from: socket.id, active: !!active });
  });

  socket.on('moderation_sample', async () => {});

  socket.on('leave', () => {
    cleanup(io, socket, 'user_leave');
  });

  socket.on('report', ({ reason } = {}) => {
    const s = getSession(socket.id);
    const peerSocketId = s?.peerId;
    const peerSocket = peerSocketId ? io.sockets.sockets.get(peerSocketId) : null;

    writeReport({
      reporterSocket: socket.id,
      peerSocket: peerSocketId || null,
      reporterIp: socket.handshake.address,
      peerIp: peerSocket?.handshake?.address || null,
      reporterUA: socket.handshake.headers['user-agent'] || null,
      peerUA: peerSocket?.handshake?.headers?.['user-agent'] || null,
      reason: reason || 'unspecified',
    });

    log.warn('Report', { reporter: socket.id, peer: peerSocketId, reason: reason || 'unspecified' });

    if (peerSocketId) {
      io.to(peerSocketId).emit('reported_by_peer', {});
    }

    cleanup(io, socket, 'reported');
  });

  socket.on('disconnect', () => {
    log.info('Disconnected', { socketId: socket.id });
    leaveRoom(io, socket);
    cleanup(io, socket, 'disconnect');
    deleteSession(socket.id);
  });
}

function cleanup(io, socket, reason) {
  const s = getSession(socket.id);
  if (!s) return;

  if (s.peerId) {
    io.to(s.peerId).emit('peer_left', { reason });
    updateSession(s.peerId, {
      state: SessionState.IDLE,
      peerId: null,
      initiator: false,
      matchedAt: null,
    });
  }

  dequeue(socket.id);
  clearTimeout(timeoutTimers.get(socket.id));
  timeoutTimers.delete(socket.id);

  updateSession(socket.id, {
    state: SessionState.IDLE,
    peerId: null,
    region: null,
    mode: null,
    initiator: false,
    matchedAt: null,
  });

  function leaveRoom(io, socket) {
    const s = getSession(socket.id);
    if (!s || !s.roomId) return;

    const roomId = s.roomId;
    const updated = removeMember(roomId, socket.id);

    if (updated) {
      for (const memberId of updated.members) {
        io.to(memberId).emit('peer_left_room', {
          roomId,
          peerId: socket.id,
        });
      }
    }

    updateSession(socket.id, {
      roomId: null,
      mode: null,
      state: SessionState.IDLE,
    });
  }
}