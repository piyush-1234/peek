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

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: config.clientOrigin, credentials: true },
  pingInterval: 20000,
  pingTimeout: 25000,
});

io.on('connection', (socket) => registerHandlers(io, socket));

startMatcher(io);

server.listen(config.port, () => {
  log.info(`Signaling server listening on :${config.port}`);
  log.info(`Accepting clients from ${config.clientOrigin}`);
});

// Graceful shutdown
for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => {
    log.info(`Received ${sig}, shutting down...`);
    io.close(() => server.close(() => process.exit(0)));
  });
}