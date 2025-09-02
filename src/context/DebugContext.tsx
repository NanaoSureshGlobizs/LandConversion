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
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = useCallback((log: string) => {
    setLogs((prevLogs) => [...prevLogs, `[${new Date().toLocaleTimeString()}] ${log}`]);
  }, []);

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
