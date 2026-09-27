
import { writeReport } from '../reports/store.js';
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
const timeoutTimers = new Map(); // socketId -> timeout handle

export function registerHandlers(io, socket) {
  log.info(`Connected: ${socket.id}`);
  createSession(socket.id);

  socket.on('find_match', ({ region } = {}) => {
    const session = getSession(socket.id);
    if (!session) return;
    if (session.state !== SessionState.IDLE && session.state !== SessionState.MATCHED) return;
    if (!region || !ALLOWED_REGIONS.has(region)) {
      socket.emit('error', { code: 'BAD_REGION', message: 'Invalid region' });
      return;
    }

    // If matched, tear down peer relationship first
    if (session.peerId) {
      io.to(session.peerId).emit('peer_left', {});
      updateSession(session.peerId, { state: SessionState.CLOSED, peerId: null });
    }

    updateSession(socket.id, {
      state: SessionState.WAITING,
      region,
      peerId: null,
      initiator: false,
      matchedAt: null,
    });
    enqueue(region, socket.id);
    socket.emit('waiting', { region });

    // Match timeout
    clearTimeout(timeoutTimers.get(socket.id));
    const t = setTimeout(() => {
      const s = getSession(socket.id);
      if (s && s.state === SessionState.WAITING) {
        dequeue(socket.id);
        updateSession(socket.id, { state: SessionState.IDLE, region: null });
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
      updateSession(socket.id, { state: SessionState.IDLE, region: null });
      socket.emit('cancelled', {});
    }
  });

  socket.on('signal', (msg) => {
    relaySignal(io, socket, msg);
  });

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

    log.warn(`REPORT ${socket.id} -> ${peerSocketId} reason=${reason || 'none'}`);

    if (peerSocketId) {
      io.to(peerSocketId).emit('reported_by_peer', {});
    }

    cleanup(io, socket, 'reported');
  });

  socket.on('disconnect', () => {
    log.info(`Disconnected: ${socket.id}`);
    cleanup(io, socket, 'disconnect');
    deleteSession(socket.id);
  });
}

function cleanup(io, socket, reason) {
  const s = getSession(socket.id);
  if (!s) return;

  // Notify peer
  if (s.peerId) {
    io.to(s.peerId).emit('peer_left', { reason });
    updateSession(s.peerId, {
      state: SessionState.IDLE,
      peerId: null,
      initiator: false,
      matchedAt: null,
    });
  }

  // Remove from queue
  dequeue(socket.id);
  clearTimeout(timeoutTimers.get(socket.id));
  timeoutTimers.delete(socket.id);

  updateSession(socket.id, {
    state: SessionState.IDLE,
    peerId: null,
    region: null,
    initiator: false,
    matchedAt: null,
  });
}