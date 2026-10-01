import { addMember, createRoom, listOpenRooms } from './store.js';
import { log } from '../logger.js';

/**
 * Assign a socket to a group room.
 * Returns { room, isNew }.
 */
export function assignToRoom(socket, region, interests = []) {
  // Try open rooms first
  const open = listOpenRooms();
  for (const room of open) {
    if (room.region !== region) continue;
    if (room.members.length >= 4) continue;
    const updated = addMember(room.id, socket.id);
    if (updated) {
      log.info('Group: joined', { socketId: socket.id, roomId: room.id, size: updated.members.length });
      return { room: updated, isNew: false };
    }
  }

  // Create new room
  const room = createRoom(region, interests);
  addMember(room.id, socket.id);
  log.info('Group: created', { socketId: socket.id, roomId: room.id });
  return { room, isNew: true };
}