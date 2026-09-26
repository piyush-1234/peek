/**
 * Region-based matchmaking queue.
 * queues = { "en:in": [socketId1, socketId2], "en:us": [...] }
 */

const queues = new Map(); // region -> Array<socketId>

export function enqueue(region, socketId) {
  if (!queues.has(region)) queues.set(region, []);
  const q = queues.get(region);
  if (!q.includes(socketId)) q.push(socketId);
}

export function dequeue(socketId) {
  for (const [region, q] of queues.entries()) {
    const idx = q.indexOf(socketId);
    if (idx !== -1) {
      q.splice(idx, 1);
      if (q.length === 0) queues.delete(region);
      return region;
    }
  }
  return null;
}

export function popTwo(region) {
  const q = queues.get(region);
  if (!q || q.length < 2) return null;
  const a = q.shift();
  const b = q.shift();
  if (q.length === 0) queues.delete(region);
  return [a, b];
}

export function queueSizes() {
  const out = {};
  for (const [region, q] of queues.entries()) out[region] = q.length;
  return out;
}

export function allRegions() {
  return Array.from(queues.keys());
}