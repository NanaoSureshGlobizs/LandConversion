
'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface DebugContextType {
  isDebugMode: boolean;
  setIsDebugMode: (value: boolean) => void;
  logs: string[];
  addLog: (log: string) => void;
  clearLogs: () => void;
}

const DebugContext = createContext<DebugContextType | undefined>(undefined);

export function DebugProvider({ children }: { children: ReactNode }) {
  const [isDebugMode, setIsDebugMode] = useState(process.env.NEXT_PUBLIC_DEBUG_MODE === 'true');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = useCallback((log: string) => {
    const newLog = `[${new Date().toLocaleTimeString()}] ${log}`;
    // Log to the browser console for easy access in dev tools, only in development
    if (isDebugMode && process.env.NODE_ENV === 'development') {
      console.log('API DEBUG:', newLog);
    }
    // Add to the state for the Debug Panel UI
    setLogs((prevLogs) => [...prevLogs, newLog]);
  }, [isDebugMode]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const value = {
    isDebugMode,
    setIsDebugMode,
    logs,
    addLog,
    clearLogs,
  };

  return <DebugContext.Provider value={value}>{children}</DebugContext.Provider>;
}

export function useDebug() {
  const context = useContext(DebugContext);
  if (context === undefined) {
    throw new Error('useDebug must be used within a DebugProvider');
  }
  return context;
}
