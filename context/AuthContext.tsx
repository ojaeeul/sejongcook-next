'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    isAdmin: boolean;
    login: () => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    isAdmin: false,
    login: () => { },
    logout: () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Check localStorage on mount
        const adminToken = localStorage.getItem('adminToken');
        if (adminToken === 'sejong_admin_token') {
            setTimeout(() => {
                setIsAdmin(true);
            }, 0);
        }
    }, []);

    const login = () => {
        localStorage.setItem('adminToken', 'sejong_admin_token');
        setIsAdmin(true);
        // Dispatch event for other components to listen if needed (optional)
        window.dispatchEvent(new Event('auth-change'));
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        setIsAdmin(false);
        router.push('/');
        window.dispatchEvent(new Event('auth-change'));
    };

    return (
        <AuthContext.Provider value={{ isAdmin, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
