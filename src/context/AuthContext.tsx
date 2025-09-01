'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { checkAuth as checkAuthAction, logout as logoutAction } from '@/app/actions';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const authStatus = await checkAuthAction();
        setIsAuthenticated(authStatus);
      } catch (error) {
        console.error('Failed to check auth status', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    verifyAuth();
  }, []);

  const login = () => {
    setIsAuthenticated(true);
  };
  
  const logout = async () => {
    await logoutAction();
    setIsAuthenticated(false);
  }

  const value = { isAuthenticated, isLoading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
