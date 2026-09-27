import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const REPORT_FILE = path.join(DATA_DIR, 'reports.jsonl');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Append a report to the JSONL log.
 * Never throws — a failed log should not break a live session.
 */
export function writeReport({
  reporterSocket, peerSocket,
  reporterIp, peerIp,
  reporterUA, peerUA,
  reason,
}) {
  const entry = {
    ts: new Date().toISOString(),
    reporterSocket,
    peerSocket,
    reporterIp,
    peerIp,
    reporterUA,
    peerUA,
    reason: reason || 'unspecified',
  };
  try {
    fs.appendFileSync(REPORT_FILE, JSON.stringify(entry) + '\n');
    return entry;
  } catch (err) {
    console.error('Failed to write report:', err.message);
    return null;
  }
}