import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

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

        socket = io(SOCKET_SERVER_URL, {
            auth: {
                token: token || null,
                playerToken: playerToken
            },
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            transports: ['websocket', 'polling']
        });

        socket.on('connect', () => {
            console.log('[Socket.IO] Connected to server:', SOCKET_SERVER_URL, 'Socket ID:', socket.id);
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
