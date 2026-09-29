import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const STATS_FILE = path.join(DATA_DIR, 'stats.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load existing stats
let stats = { uniqueIps: [] };
try {
  if (fs.existsSync(STATS_FILE)) {
    const raw = fs.readFileSync(STATS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.uniqueIps)) {
      stats = parsed;
    }
  }
} catch {
  stats = { uniqueIps: [] };
}

const uniqueSet = new Set(stats.uniqueIps);
let dirty = false;

export function recordUnique(ip) {
  if (!ip) return;
  // Skip localhost — not a real user
  if (ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1') return;
  if (uniqueSet.has(ip)) return;
  uniqueSet.add(ip);
  dirty = true;
}

export function getTotalUnique() {
  return uniqueSet.size;
}

// Persist to disk every 30 seconds (only if changed)
setInterval(() => {
  if (!dirty) return;
  try {
    stats.uniqueIps = Array.from(uniqueSet);
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats));
    dirty = false;
  } catch (err) {
    console.error('Failed to save stats:', err.message);
  }
}, 30 * 1000);

// Save on shutdown
for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => {
    try {
      stats.uniqueIps = Array.from(uniqueSet);
      fs.writeFileSync(STATS_FILE, JSON.stringify(stats));
    } catch {}
  });
}