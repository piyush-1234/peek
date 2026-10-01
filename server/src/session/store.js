/**
 * In-memory session store.
 * Key = socketId
 * Value = Session object
 *
 * No persistence. Sessions die with the socket.
 * This is intentional — it's what makes the privacy promise credible.
 */

const sessions = new Map();

export const SessionState = Object.freeze({
  IDLE: 'idle',
  WAITING: 'waiting',
  MATCHED: 'matched',
  CLOSED: 'closed',
});

export function createSession(socketId) {
  const session = {
    socketId,
    state: SessionState.IDLE,
    region: null,
    mode: null,
    interests: [],
    peerId: null,
    initiator: false,
    createdAt: Date.now(),
    matchedAt: null,
    waitingSince: null,
  };
  sessions.set(socketId, session);
  return session;
}

export function getSession(socketId) {
  return sessions.get(socketId) || null;
}

export function updateSession(socketId, patch) {
  const session = sessions.get(socketId);
  if (!session) return null;
  Object.assign(session, patch);
  return session;
}

export function deleteSession(socketId) {
  sessions.delete(socketId);
}

export function countSessions() {
  return sessions.size;
}