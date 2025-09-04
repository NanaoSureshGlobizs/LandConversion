
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { checkAuth as checkAuthAction, logout as logoutAction } from '@/app/actions';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  role: string | null;
  access: string[];
  userId: string | null;
  login: (role: string, access: string[]) => void;
  logout: () => void;
  refetchAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [access, setAccess] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const verifyAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const authStatus = await checkAuthAction();
      setIsAuthenticated(authStatus.isAuthenticated);
      setRole(authStatus.role);
      setAccess(authStatus.access);
      setUserId(authStatus.userId);
    } catch (error) {
      console.error('Failed to check auth status', error);
      setIsAuthenticated(false);
      setRole(null);
      setAccess([]);
      setUserId(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    verifyAuth();
  }, [verifyAuth]);

  const login = (role: string, access: string[]) => {
    // This function is now primarily for client-side state updates after the server action
    // has set the cookies. We call verifyAuth to re-sync the state from cookies.
    verifyAuth();
  };
  
  const logout = async () => {
    await logoutAction();
    setIsAuthenticated(false);
    setRole(null);
    setAccess([]);
    setUserId(null);
  }

  const value = { isAuthenticated, isLoading, role, access, userId, login, logout, refetchAuth: verifyAuth };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
