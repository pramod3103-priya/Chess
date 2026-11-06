import axios from 'axios';

export const getBaseUrl = () => {
    // 1. Explicit production or custom environment variable
    if (import.meta.env.VITE_API_URL) {
        const url = import.meta.env.VITE_API_URL.replace(/\/+$/, '');
        return url.endsWith('/api') ? url : `${url}/api`;
    }

    // 2. Local network / LAN debugging (localhost, 127.0.0.1, or local IP)
    if (typeof window !== 'undefined' && window.location.hostname && (
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.startsWith('192.168.') ||
        window.location.hostname.startsWith('10.') ||
        window.location.hostname.endsWith('.local')
    )) {
        return `http://${window.location.hostname}:5000/api`;
    }

    // 3. Same-origin fallback if behind reverse proxy
    if (typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('vercel.app')) {
        return `${window.location.origin}/api`;
    }

    // 4. Default development fallback
    return 'http://localhost:5000/api';
};

const api = axios.create({
    baseURL: getBaseUrl(),
    timeout: 12000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Format network and API errors into actionable user-friendly messages
export const formatApiError = (err) => {
    if (!err) return 'An unexpected error occurred.';
    
    if (err.response?.data?.message) {
        return err.response.data.message;
    }
    
    if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        const isVercel = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');
        if (isVercel && !import.meta.env.VITE_API_URL) {
            return 'Cannot reach backend server. Please configure VITE_API_URL in your Vercel Project Settings to point to your live multiplayer server.';
        }
        return 'Cannot connect to game server. Please check your internet connection or verify the backend server is running.';
    }

    if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        return 'Connection to server timed out. Please try again.';
    }

    return err.message || 'Failed to communicate with server.';
};

// Attach Authorization Bearer token if present
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Authentication APIs
export const login = async (credentials) => {
    try {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    } catch (err) {
        throw new Error(formatApiError(err));
    }
};

export const register = async (userData) => {
    try {
        const response = await api.post('/auth/register', userData);
        return response.data;
    } catch (err) {
        throw new Error(formatApiError(err));
    }
};

// Game APIs
export const createGame = async (gameData = {}) => {
    try {
        const response = await api.post('/games', gameData);
        return response.data;
    } catch (err) {
        throw new Error(formatApiError(err));
    }
};

export const joinGame = async (roomId) => {
    try {
        const response = await api.post(`/games/${roomId.toUpperCase()}/join`);
        return response.data;
    } catch (err) {
        throw new Error(formatApiError(err));
    }
};

export const getGame = async (roomId) => {
    try {
        const response = await api.get(`/games/${roomId.toUpperCase()}`);
        return response.data;
    } catch (err) {
        throw new Error(formatApiError(err));
    }
};

export const getGameHistory = async () => {
    try {
        const response = await api.get('/games/history');
        return response.data;
    } catch (err) {
        throw new Error(formatApiError(err));
    }
};

export const getProfile = async (username) => {
    try {
        const response = await api.get(`/users/${username}`);
        return response.data;
    } catch (err) {
        throw new Error(formatApiError(err));
    }
};

export default api;
