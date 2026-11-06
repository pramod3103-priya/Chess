import { io } from 'socket.io-client';
import { Capacitor } from '@capacitor/core';

const getSocketUrl = () => {
    // 1. Explicit socket URL environment variable
    if (import.meta.env.VITE_SOCKET_URL) {
        return import.meta.env.VITE_SOCKET_URL.replace(/\/+$/, '');
    }

    // Native builds must connect to the deployed Socket.IO server, not capacitor://localhost.
    if (Capacitor.isNativePlatform()) {
        if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL.replace(/\\/+$/, '');
        if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL.replace(/\\/api\\/?$/, '').replace(/\\/+$/, '');
        return null;
    }

    // 2. Derive from API URL if provided (strip trailing /api)
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '').replace(/\/+$/, '');
    }

    // 3. Local network / LAN debugging
    if (typeof window !== 'undefined' && window.location.hostname && (
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.startsWith('192.168.') ||
        window.location.hostname.startsWith('10.') ||
        window.location.hostname.endsWith('.local')
    )) {
        return `http://${window.location.hostname}:5000`;
    }

    // 4. Fallback to same-origin if proxied
    if (typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('vercel.app')) {
        return window.location.origin;
    }

    // 5. Default development server
    return 'http://localhost:5000';
};

let socket = null;

export function getPlayerToken() {
    let token = localStorage.getItem('chess_player_token');
    if (!token) {
        token = 'pt_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
        localStorage.setItem('chess_player_token', token);
    }
    return token;
}

export function getSocket() {
    if (!socket) {
        const token = localStorage.getItem('token');
        const playerToken = getPlayerToken();
        const serverUrl = getSocketUrl();

        socket = io(serverUrl, {
            auth: {
                token: token || null,
                playerToken: playerToken
            },
            reconnection: true,
            reconnectionAttempts: 15,
            reconnectionDelay: 1000,
            transports: ['websocket', 'polling']
        });

        socket.on('connect', () => {
            console.log('[Socket.IO] Connected to server:', serverUrl, 'Socket ID:', socket.id);
        });

        socket.on('connect_error', (err) => {
            console.warn('[Socket.IO] Connection error:', err.message);
        });

        socket.on('disconnect', (reason) => {
            console.log('[Socket.IO] Disconnected:', reason);
        });
    }
    return socket;
}

export function updateSocketAuth(token) {
    if (socket) {
        socket.auth = {
            token,
            playerToken: getPlayerToken()
        };
        if (socket.connected) {
            socket.disconnect().connect();
        }
    }
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}
