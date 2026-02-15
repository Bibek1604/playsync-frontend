import { io, Socket } from 'socket.io-client';
import { API_URL } from './constants'; // Ensure this points to your backend URL

let socket: Socket | null = null;

export const getSocket = (token?: string | null): Socket => {
    if (!socket && token) {
        socket = io(API_URL, {
            auth: {
                token, // Pass JWT token for authentication
            },
            transports: ['websocket'], // Prefer WebSocket
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socket.on('connect', () => {
            console.log('Socket connected:', socket?.id);
        });

        socket.on('connect_error', (err: Error) => {
            console.error('Socket connection error:', err);
        });

        socket.on('disconnect', (reason: string) => {
            console.log('Socket disconnected:', reason);
        });
    } else if (socket && token) {
        // Update auth token for future reconnections
        (socket.auth as { token: string }).token = token;

        if (!socket.connected) {
            socket.connect();
        }
    }

    return socket!;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
