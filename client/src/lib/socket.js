import { io } from 'socket.io-client';

// const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://172.28.202.191:4000';
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';

export const socket = io(SERVER_URL, {
  transports: ['websocket'],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});