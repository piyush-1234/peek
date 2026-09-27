import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';

import { config } from './config.js';
import { log } from './logger.js';
import { registerHandlers } from './socket/handlers.js';
import { startMatcher } from './matching/matcher.js';
import { countSessions } from './session/store.js';
import { queueSizes } from './matching/queue.js';
import { getIceServers } from './turn/ice.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors({ origin: config.clientOrigin, credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    uptime: process.uptime(),
    sessions: countSessions(),
    queues: queueSizes(),
    env: config.env,
  });
});

app.get('/ice', (_req, res) => {
  res.json({ iceServers: getIceServers() });
});

// HTTPS setup
const certDir = path.join(__dirname, '..', 'certs');
const certFiles = fs.readdirSync(certDir);
const keyFile = certFiles.find((f) => f.endsWith('-key.pem'));
const crtFile = certFiles.find((f) => f.endsWith('.pem') && !f.endsWith('-key.pem'));

if (!keyFile || !crtFile) {
  log.error('Missing cert files in server/certs/. Expected a -key.pem and a .pem file.');
  process.exit(1);
}

const options = {
  key: fs.readFileSync(path.join(certDir, keyFile)),
  cert: fs.readFileSync(path.join(certDir, crtFile)),
};

const server = https.createServer(options, app);
const io = new Server(server, {
  cors: { origin: config.clientOrigin, credentials: true },
  pingInterval: 20000,
  pingTimeout: 25000,
});

io.on('connection', (socket) => registerHandlers(io, socket));

startMatcher(io);

server.listen(config.port, () => {
  log.info(`Signaling server listening on :${config.port} (HTTPS)`);
  log.info(`Accepting clients from ${config.clientOrigin}`);
});

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => {
    log.info(`Received ${sig}, shutting down...`);
    io.close(() => server.close(() => process.exit(0)));
  });
}