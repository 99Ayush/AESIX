import { io } from 'socket.io-client';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const socketUrl = apiUrl.replace(/\/api\/?$/, '');

export const realtimeSocket = io(socketUrl, {
  autoConnect: true,
  transports: ['websocket', 'polling'],
});

export function onDatabaseChange(listener) {
  realtimeSocket.on('database:change', listener);
  return () => realtimeSocket.off('database:change', listener);
}
