import { getSession, SessionState } from '../session/store.js';
import { log } from '../logger.js';

/**
 * Relay a WebRTC signal to the peer.
 * Payload is opaque — server never inspects it.
 */
export function relaySignal(io, socket, message) {
  const { to, type, payload } = message || {};

  if (!to || !type) return;

  const session = getSession(socket.id);
  if (!session || session.state !== SessionState.MATCHED) return;
  if (session.peerId !== to) {
    log.warn(`Signal from ${socket.id} targeting ${to} but peer is ${session.peerId}`);
    return;
  }

  io.to(to).emit('signal', {
    from: socket.id,
    type,
    payload,
  });
}