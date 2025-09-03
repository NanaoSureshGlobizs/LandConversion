
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { checkAuth as checkAuthAction, logout as logoutAction } from '@/app/actions';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  role: string | null;
  access: string[];
  login: () => void;
  logout: () => void;
  refetchAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [access, setAccess] = useState<string[]>([]);

  const verifyAuth = async () => {
    setIsLoading(true);
    try {
      const authStatus = await checkAuthAction();
      setIsAuthenticated(authStatus.isAuthenticated);
      setRole(authStatus.role);
      setAccess(authStatus.access);
    } catch (error) {
      console.error('Failed to check auth status', error);
      setIsAuthenticated(false);
      setRole(null);
      setAccess([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    verifyAuth();
  }, []);

  const login = () => {
    // Re-verify auth from cookies to get role and access rights
    verifyAuth();
  };
  
  const logout = async () => {
    await logoutAction();
    setIsAuthenticated(false);
    setRole(null);
    setAccess([]);
  }

  const value = { isAuthenticated, isLoading, role, access, login, logout, refetchAuth: verifyAuth };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
