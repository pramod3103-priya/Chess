import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { login as apiLogin, register as apiRegister } from '../services/api';
import { updateSocketAuth, disconnectSocket } from '../services/socket';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyAuth = async () => {
            const storedToken = localStorage.getItem('token');
            if (!storedToken) {
                setLoading(false);
                return;
            }
            try {
                const res = await api.get('/auth/me');
                setUser(res.data.user);
            } catch (err) {
                console.warn('[Auth] Invalid or expired token');
                localStorage.removeItem('token');
                setToken(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        verifyAuth();
    }, []);

    const login = async (identifier, password) => {
        const data = await apiLogin({ identifier, password });
        const { token: receivedToken, user: receivedUser } = data;
        localStorage.setItem('token', receivedToken);
        setToken(receivedToken);
        setUser(receivedUser);
        updateSocketAuth(receivedToken);
        return receivedUser;
    };

    const register = async (username, email, password) => {
        const data = await apiRegister({ username, email, password });
        const { token: receivedToken, user: receivedUser } = data;
        localStorage.setItem('token', receivedToken);
        setToken(receivedToken);
        setUser(receivedUser);
        updateSocketAuth(receivedToken);
        return receivedUser;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        disconnectSocket();
    };

    const refreshUser = async () => {
        try {
            const res = await api.get('/auth/me');
            setUser(res.data.user);
        } catch (e) {
            // ignore
        }
    };

    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            isAuthenticated,
            login,
            register,
            logout,
            refreshUser
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
