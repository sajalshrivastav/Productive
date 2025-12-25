import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { socketService } from '../api/socket';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const parsedUser = JSON.parse(userInfo);
            setUser(parsedUser);
            socketService.connect(parsedUser._id);
        }
        setLoading(false);

        const handleUserUpdate = (updatedData) => {
            // If the update is just a partial object, merge it.
            setUser(prev => {
                const newUser = { ...prev, ...updatedData };
                localStorage.setItem('userInfo', JSON.stringify(newUser));
                return newUser;
            });
        };

        socketService.on('user_updated', handleUserUpdate);

        return () => {
            socketService.disconnect();
            // socketService.off('user_updated', handleUserUpdate);
        };
    }, []);


    const login = async (email, password) => {
        try {
            const { data } = await api.post('/users/login', { email, password });
            localStorage.setItem('userInfo', JSON.stringify(data));
            setUser(data);
            socketService.connect(data._id);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed',
            };
        }
    };

    const register = async (username, email, password) => {
        try {
            const { data } = await api.post('/users', { username, email, password });
            localStorage.setItem('userInfo', JSON.stringify(data));
            setUser(data);
            socketService.connect(data._id);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed',
            };
        }
    };


    const logout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
        socketService.disconnect();
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
