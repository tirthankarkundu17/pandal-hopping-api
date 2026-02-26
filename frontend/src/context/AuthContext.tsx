import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storage } from '../utils/storage';
import { authApi } from '../api/auth';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = await storage.getItemAsync('access_token');
            setIsAuthenticated(!!token);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        await authApi.login(email, password);
        setIsAuthenticated(true);
    };

    const register = async (name: string, email: string, password: string) => {
        await authApi.register(name, email, password);
        // After register, auto-login
        await authApi.login(email, password);
        setIsAuthenticated(true);
    };

    const logout = async () => {
        await authApi.logout();
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
