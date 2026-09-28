import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const FLAG_FILE = path.join(DATA_DIR, 'moderation.jsonl');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function writeFlag({
  sessionSocket,
  peerSocket,
  reason,
  confidence,
  source,
}) {
  const entry = {
    ts: new Date().toISOString(),
    sessionSocket,
    peerSocket,
    reason: reason || 'unspecified',
    confidence: confidence ?? null,
    source: source || 'stub',
  };
  try {
    fs.appendFileSync(FLAG_FILE, JSON.stringify(entry) + '\n');
    return entry;
  } catch (err) {
    console.error('Failed to write moderation flag:', err.message);
    return null;
  }
}

/**
 * STUB — replace with real moderation (Rekognition/Hive/Sightengine)
 * Returns a promise that resolves to { flagged: false } for now.
 *
 * Real implementation would:
 *  - receive an image frame or audio sample
 *  - send to a moderation API
 *  - return { flagged: true/false, reason, confidence }
 */
export async function scanFrame() {
  console.log('[moderation] scanFrame called');
  return { flagged: false, reason: null, confidence: null };
}


// export async function scanFrame(frameBase64) {
//   const res = await fetch('https://api.sightengine.com/1.0/check.json', {
//     method: 'POST',
//     body: new URLSearchParams({
//       media: frameBase64,
//       models: 'nudity-2.0,offensive',
//       api_user: process.env.SIGHTENGINE_USER,
//       api_secret: process.env.SIGHTENGINE_SECRET,
//     }),
//   });
//   const data = await res.json();
//   const flagged = data.nudity?.sexual_activity > 0.7 || data.nudity?.very_suggestive > 0.7;
//   return {
//     flagged,
//     reason: flagged ? 'nudity' : null,
//     confidence: data.nudity?.sexual_activity ?? null,
//   };
// }