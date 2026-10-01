import { roomCount } from './rooms/store.js';
import { getTotalUnique } from './stats.js';
import http from 'http';
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

const app = express();
app.use(cors({ origin: config.clientOrigin, credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    uptime: process.uptime(),
    sessions: countSessions(),
    queues: queueSizes(),
    rooms: roomCount(),
    env: config.env,
  });
});

app.get('/ice', (_req, res) => {
  res.json({ iceServers: getIceServers() });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: config.clientOrigin, credentials: true },
  pingInterval: 20000,
  pingTimeout: 25000,
});

setInterval(() => {
  const total = countSessions();
  const waiting = Object.values(queueSizes()).reduce((a, b) => a + b, 0);
  const uniqueTotal = getTotalUnique();
  io.emit('online_count', { total, waiting, uniqueTotal });
}, 5000);

io.on('connection', (socket) => registerHandlers(io, socket));

startMatcher(io);

server.listen(config.port, () => {
  log.info(`Signaling server listening on :${config.port}`);
  log.info(`Accepting clients from ${config.clientOrigin}`);
});

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => {
    log.info(`Received ${sig}, shutting down...`);
    io.close(() => server.close(() => process.exit(0)));
  });
}