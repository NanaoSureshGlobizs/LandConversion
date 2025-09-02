'use client';

import { useDebug } from '@/context/DebugContext';
import { useEffect } from 'react';

interface ServerLogHandlerProps {
  logs: (string | undefined)[];
}

export function ServerLogHandler({ logs }: ServerLogHandlerProps) {
  const { addLog } = useDebug();

  useEffect(() => {
    for (const log of logs) {
      if (log) {
        addLog(log);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logs]); // We only want to run this when the logs from the server change

  return null; // This component renders nothing
}
