import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // ─── Verify token with backend on app load ───
    const checkAuth = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await api.get('/auth/profile');
            const profile = response.data.profile;
            setUser(profile);
            // Keep localStorage in sync
            localStorage.setItem('user', JSON.stringify(profile));
        } catch (error) {
            console.warn('Auth check failed:', error.message);
            // Token is invalid/expired — clear everything
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    // ─── Login ───
    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { user: userData, token } = response.data;

            if (!token || !userData) {
                throw new Error('Invalid server response');
            }

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            return userData;
        } catch (error) {
            // Re-throw with clean error message for the UI
            const message = error.response?.data?.message
                || (error.message.includes('Cannot connect') ? error.message : 'Login failed. Please try again.');
            throw { response: { data: { message } } };
        }
    };

    // ─── Register ───
    const register = async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            const { user: newUser, token } = response.data;

            if (!token || !newUser) {
                throw new Error('Invalid server response');
            }

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(newUser));
            setUser(newUser);
            return newUser;
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed. Please try again.';
            throw { response: { data: { message } } };
        }
    };

    // ─── Logout ───
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    // ─── Update Profile ───
    const updateProfile = async (data) => {
        await api.put('/auth/profile', data);
        const response = await api.get('/auth/profile');
        const updatedUser = response.data.profile;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
    };

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        isFarmer: user?.user_type === 'farmer',
        isBuyer: user?.user_type === 'buyer',
        isAdmin: user?.user_type === 'admin',
        login,
        register,
        logout,
        updateProfile,
        checkAuth
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
