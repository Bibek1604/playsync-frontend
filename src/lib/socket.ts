import { io, Socket } from 'socket.io-client';
import { API_URL } from './constants';

let socket: Socket | null = null;

/**
 * Get or create a socket connection with proper cleanup
 * Prevents multiple connections and memory leaks
 */
export const getSocket = (token?: string | null): Socket => {
    // If no token, don't create socket
    if (!token) {
        if (socket) {
            disconnectSocket();
        }
        throw new Error('Authentication token required for socket connection');
    }

    // Create new socket if doesn't exist
    if (!socket) {
        console.log('🔌 Creating new socket connection');
        socket = io(API_URL, {
            auth: {
                token,
            },
            transports: ['websocket', 'polling'], // Try WebSocket first, fallback to polling
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
        });

        socket.on('connect', () => {
            console.log('✅ Socket connected:', socket?.id);
        });

        socket.on('connect_error', (err: Error) => {
            console.error('❌ Socket connection error:', err.message);
        });

        socket.on('disconnect', (reason: string) => {
            console.log('🔌 Socket disconnected:', reason);
            
            // Auto-reconnect if server initiated disconnect
            if (reason === 'io server disconnect') {
                socket?.connect();
            }
        });

        socket.on('error', (error: Error) => {
            console.error('❌ Socket error:', error);
        });
    } else {
        // Socket exists - check if token changed
        const currentToken = (socket.auth as { token?: string }).token;
        
        if (currentToken !== token) {
            console.log('🔄 Token changed - reconnecting socket');
            
            // Remove all listeners to prevent duplicates
            socket.removeAllListeners();
            
            // Update auth token
            socket.auth = { token };
            
            // Disconnect and reconnect with new token
            if (socket.connected) {
                socket.disconnect();
            }
            
            // Re-add essential listeners
            socket.on('connect', () => {
                console.log('✅ Socket reconnected:', socket?.id);
            });

            socket.on('connect_error', (err: Error) => {
                console.error('❌ Socket connection error:', err.message);
            });

            socket.on('disconnect', (reason: string) => {
                console.log('🔌 Socket disconnected:', reason);
            });
            
            socket.connect();
        } else if (!socket.connected) {
            // Same token but disconnected - reconnect
            console.log('🔄 Socket disconnected - reconnecting');
            socket.connect();
        }
    }

    return socket;
};

/**
 * Disconnect and cleanup socket connection
 * Call this on logout or app unmount
 */
export const disconnectSocket = (): void => {
    if (socket) {
        console.log('🔌 Disconnecting socket');
        socket.removeAllListeners();
        socket.disconnect();
        socket = null;
    }
};

/**
 * Check if socket is connected
 */
export const isSocketConnected = (): boolean => {
    return socket?.connected ?? false;
};

