import { log } from '../logger.js';

const rooms = new Map();
let roomCounter = 0;

export const MAX_MEMBERS = 4;

export function createRoom(region, interests) {
  const roomId = `r${++roomCounter}_${Date.now().toString(36)}`;
  const room = {
    id: roomId,
    members: [],
    region,
    interests: interests || [],
    createdAt: Date.now(),
    state: 'open', // 'open' | 'full'
  };
  rooms.set(roomId, room);
  return room;
}

export function getRoom(roomId) {
  return rooms.get(roomId) || null;
}

export function listOpenRooms() {
  return Array.from(rooms.values()).filter((r) => r.state === 'open');
}

export function addMember(roomId, socketId) {
  const room = rooms.get(roomId);
  if (!room) return null;
  if (room.members.includes(socketId)) return room;
  if (room.members.length >= MAX_MEMBERS) return null;
  room.members.push(socketId);
  if (room.members.length >= MAX_MEMBERS) room.state = 'full';
  return room;
}

export function removeMember(roomId, socketId) {
  const room = rooms.get(roomId);
  if (!room) return null;
  room.members = room.members.filter((id) => id !== socketId);
  if (room.members.length === 0) {
    rooms.delete(roomId);
    return null;
  }
  if (room.state === 'full') room.state = 'open';
  return room;
}

export function findRoomForSocket(socketId) {
  for (const room of rooms.values()) {
    if (room.members.includes(socketId)) return room;
  }
  return null;
}

export function roomCount() {
  return rooms.size;
}