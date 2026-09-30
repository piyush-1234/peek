import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';

// If URL has ?test=1, remember this device as a test device
const url = new URL(window.location.href);
if (url.searchParams.get('test') === '1') {
  localStorage.setItem('peek_test_device', '1');
}

const isTestDevice = localStorage.getItem('peek_test_device') === '1';

export const socket = io(SERVER_URL, {
  transports: ['websocket'],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  auth: { testDevice: isTestDevice },
});