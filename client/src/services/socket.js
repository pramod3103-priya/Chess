import { io } from 'socket.io-client';

const getSocketUrl = () => {
    if (typeof window !== 'undefined' && window.location.hostname && window.location.hostname !== 'localhost') {
        return `http://${window.location.hostname}:5000`;
    }
    return import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
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
