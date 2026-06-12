export function emitRealtime(event, payload, rooms = []) {
  const io = global.mobilityIO;
  if (!io) return;

  if (!rooms.length) {
    io.emit(event, payload);
    return;
  }

  rooms.forEach((room) => io.to(room).emit(event, payload));
}
