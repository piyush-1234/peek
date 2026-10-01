import { config } from '../config.js';
import { log } from '../logger.js';
import { allRegions, enqueue, peekQueue, removeFromQueue } from './queue.js';
import {
  getSession,
  updateSession,
  SessionState,
} from '../session/store.js';

const FALLBACK_WAIT_MS = 10000; // after 10s waiting, ignore interest matching

function shareInterest(a, b) {
  if (!a.interests?.length || !b.interests?.length) return false;
  return a.interests.some((i) => b.interests.includes(i));
}

function findBestPair(queue) {
  const now = Date.now();

  // Pass 1: find a pair that shares at least one interest
  for (let i = 0; i < queue.length; i++) {
    const a = getSession(queue[i]);
    if (!a || a.state !== SessionState.WAITING) continue;
    for (let j = i + 1; j < queue.length; j++) {
      const b = getSession(queue[j]);
      if (!b || b.state !== SessionState.WAITING) continue;
      if (shareInterest(a, b)) {
        return [queue[i], queue[j]];
      }
    }
  }

  // Pass 2: if anyone has waited too long, match them with anyone
  for (let i = 0; i < queue.length; i++) {
    const a = getSession(queue[i]);
    if (!a || a.state !== SessionState.WAITING) continue;
    const aWaited = now - (a.waitingSince || a.createdAt);
    if (aWaited > FALLBACK_WAIT_MS) {
      for (let j = i + 1; j < queue.length; j++) {
        const b = getSession(queue[j]);
        if (!b || b.state !== SessionState.WAITING) continue;
        return [queue[i], queue[j]];
      }
    }
  }

  // Pass 3: both users have been waiting a long time — match anyway
  if (queue.length >= 2) {
    const a = getSession(queue[0]);
    const b = getSession(queue[1]);
    const aWaited = now - (a?.waitingSince || 0);
    const bWaited = now - (b?.waitingSince || 0);
    if (aWaited > FALLBACK_WAIT_MS && bWaited > FALLBACK_WAIT_MS) {
      return [queue[0], queue[1]];
    }
  }

  return null;
}

export function startMatcher(io) {
  setInterval(() => {
    for (const queueKey of allRegions()) {
      const queue = peekQueue(queueKey);
      if (queue.length < 2) continue;

      // Clean up dead sessions
      for (const socketId of [...queue]) {
        const s = getSession(socketId);
        if (!s || s.state !== SessionState.WAITING) {
          removeFromQueue(queueKey, socketId);
        }
      }

      const refreshed = peekQueue(queueKey);
      if (refreshed.length < 2) continue;

      let pair = findBestPair(refreshed);
      while (pair) {
        const [aId, bId] = pair;
        removeFromQueue(queueKey, aId);
        removeFromQueue(queueKey, bId);

        const a = getSession(aId);
        const b = getSession(bId);
        if (!a || !b) break;

        const aIsInitiator = a.createdAt <= b.createdAt;

        updateSession(aId, {
          state: SessionState.MATCHED,
          peerId: bId,
          initiator: aIsInitiator,
          matchedAt: Date.now(),
        });
        updateSession(bId, {
          state: SessionState.MATCHED,
          peerId: aId,
          initiator: !aIsInitiator,
          matchedAt: Date.now(),
        });

        const shared = (a.interests || []).filter((i) => (b.interests || []).includes(i));

        io.to(aId).emit('matched', {
          peerId: bId,
          initiator: aIsInitiator,
          region: queueKey,
          sharedInterests: shared,
        });
        io.to(bId).emit('matched', {
          peerId: aId,
          initiator: !aIsInitiator,
          region: queueKey,
          sharedInterests: shared,
        });

        log.info('Matched', {
          a: aId,
          b: bId,
          queue: queueKey,
          sharedInterests: shared,
        });

        const remaining = peekQueue(queueKey);
        if (remaining.length < 2) break;
        pair = findBestPair(remaining);
      }
    }
  }, config.matchIntervalMs);
}