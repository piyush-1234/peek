import { config } from '../config.js';
import { log } from '../logger.js';
import { popTwo, allRegions, enqueue } from './queue.js';
import {
  getSession,
  updateSession,
  SessionState,
} from '../session/store.js';

export function startMatcher(io) {
  setInterval(() => {
    for (const region of allRegions()) {
      let pair;
      while ((pair = popTwo(region)) !== null) {
        const [aId, bId] = pair;

        const a = getSession(aId);
        const b = getSession(bId);

        const aValid = a && a.state === SessionState.WAITING;
        const bValid = b && b.state === SessionState.WAITING;

        // Ghost prevention: if one side vanished, put the other back
        if (!aValid && bValid) { enqueue(region, bId); continue; }
        if (aValid && !bValid) { enqueue(region, aId); continue; }
        if (!aValid && !bValid) { continue; }

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

        io.to(aId).emit('matched', { peerId: bId, initiator: aIsInitiator, region });
        io.to(bId).emit('matched', { peerId: aId, initiator: !aIsInitiator, region });

        log.info(`Matched ${aId} <-> ${bId} [${region}]`);
      }
    }
  }, config.matchIntervalMs);
}