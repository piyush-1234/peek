/**
 * Simple in-memory rate limiter.
 * Tracks actions per IP per time window.
 */

const buckets = new Map(); // key -> { count, resetAt }

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_MATCHES_PER_HOUR = 5;
const MAX_CONNECTIONS_PER_IP = 10;

function key(ip, action) {
  return `${action}:${ip}`;
}

function checkLimit(ip, action, max) {
  const k = key(ip, action);
  const now = Date.now();
  const bucket = buckets.get(k);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(k, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true, remaining: max - 1 };
  }

  if (bucket.count >= max) {
    return { ok: false, remaining: 0, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { ok: true, remaining: max - bucket.count };
}

export function checkMatchLimit(ip) {
  return checkLimit(ip, 'match', MAX_MATCHES_PER_HOUR);
}

export function checkConnectionLimit(ip) {
  return checkLimit(ip, 'conn', MAX_CONNECTIONS_PER_IP);
}

// Periodic cleanup of expired buckets
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of buckets.entries()) {
    if (v.resetAt < now) buckets.delete(k);
  }
}, 5 * 60 * 1000);