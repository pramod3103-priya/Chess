import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: {
        'Content-Type': 'application/json'
    }
});

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
    const response = await api.post('/auth/login', credentials);
    return response.data;
};

export const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};

// Game APIs
export const createGame = async (gameData = {}) => {
    const response = await api.post('/games', gameData);
    return response.data;
};

export const joinGame = async (roomId) => {
    const response = await api.post(`/games/${roomId.toUpperCase()}/join`);
    return response.data;
};

export const getGame = async (roomId) => {
    const response = await api.get(`/games/${roomId.toUpperCase()}`);
    return response.data;
};

export const getGameHistory = async () => {
    const response = await api.get('/games/history');
    return response.data;
};

export const getProfile = async (username) => {
    const response = await api.get(`/users/${username}`);
    return response.data;
};

export default api;
