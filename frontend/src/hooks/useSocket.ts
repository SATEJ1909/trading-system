import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

const SOCKET_URL = 'http://localhost:4000';

interface UseSocketOptions {
    autoConnect?: boolean;
}

interface UseSocketReturn {
    socket: Socket | null;
    isConnected: boolean;
    connect: () => void;
    disconnect: () => void;
}

export function useSocket(options: UseSocketOptions = {}): UseSocketReturn {
    const { autoConnect = true } = options;
    const socketRef = useRef<Socket | null>(null);
    const { token } = useAuthStore();

    const connect = useCallback(() => {
        if (!token) {
            console.warn('[useSocket] No auth token available');
            return;
        }

        if (socketRef.current?.connected) {
            return;
        }

        // Disconnect existing socket if any
        if (socketRef.current) {
            socketRef.current.disconnect();
        }

        // Create new socket connection with JWT auth
        socketRef.current = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socketRef.current.on('connect', () => {
            console.log('[useSocket] Connected:', socketRef.current?.id);
        });

        socketRef.current.on('disconnect', (reason) => {
            console.log('[useSocket] Disconnected:', reason);
        });

        socketRef.current.on('connect_error', (error) => {
            console.error('[useSocket] Connection error:', error.message);
        });
    }, [token]);

    const disconnect = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
    }, []);

    // Auto-connect when token is available
    useEffect(() => {
        if (autoConnect && token) {
            connect();
        }

        return () => {
            disconnect();
        };
    }, [autoConnect, token, connect, disconnect]);

    return {
        socket: socketRef.current,
        isConnected: socketRef.current?.connected ?? false,
        connect,
        disconnect,
    };
}

// Singleton socket instance for use outside React components
let globalSocket: Socket | null = null;

export function getSocket(): Socket | null {
    return globalSocket;
}

export function initSocket(token: string): Socket {
    if (globalSocket?.connected) {
        return globalSocket;
    }

    if (globalSocket) {
        globalSocket.disconnect();
    }

    globalSocket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    });

    return globalSocket;
}

export function disconnectSocket(): void {
    if (globalSocket) {
        globalSocket.disconnect();
        globalSocket = null;
    }
}
