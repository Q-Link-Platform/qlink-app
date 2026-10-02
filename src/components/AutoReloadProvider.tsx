'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AutoReloadManager } from '@/lib/auto-reload/auto-reload-manager';
import { ProblemType, RecoveryStatus } from '@/lib/auto-reload/types';

interface AutoReloadContextType {
  manager: AutoReloadManager | null;
  isEnabled: boolean;
  status: RecoveryStatus;
  currentProblem: ProblemType | null;
  metrics: any;
  enable: () => void;
  disable: () => void;
  forceRecovery: (error: Error | string) => Promise<boolean>;
}

const AutoReloadContext = createContext<AutoReloadContextType | null>(null);

export function AutoReloadProvider({ children }: { children: React.ReactNode }) {
  const [manager, setManager] = useState<AutoReloadManager | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [status, setStatus] = useState<RecoveryStatus>(RecoveryStatus.DETECTING);
  const [currentProblem, setCurrentProblem] = useState<ProblemType | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const managerRef = useRef<AutoReloadManager | null>(null);

  useEffect(() => {
    // Initialize auto-reload manager
    const autoReloadManager = new AutoReloadManager({
      maxRetries: 5,
      retryDelay: 1000,
      exponentialBackoff: true,
      maxBackoffTime: 30000,
      healthCheckInterval: 5000,
      enableNotifications: true,
      enableLogging: true
    });

    managerRef.current = autoReloadManager;
    setManager(autoReloadManager);

    // Subscribe to recovery events
    autoReloadManager.onRecovery((problem, recoveryStatus) => {
      setStatus(recoveryStatus);
      setCurrentProblem(problem);
      setMetrics(autoReloadManager.getState().metrics);
    });

    // Start monitoring
    autoReloadManager.start();
    setIsEnabled(true);

    // Setup global error handler
    const handleError = (event: ErrorEvent) => {
      console.log('🔍 Global error caught:', event.error);
      autoReloadManager.handleError(event.error);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.log('🔍 Unhandled rejection caught:', event.reason);
      autoReloadManager.handleError(event.reason);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      // Cleanup
      autoReloadManager.stop();
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const enable = () => {
    if (managerRef.current) {
      managerRef.current.start();
      setIsEnabled(true);
    }
  };

  const disable = () => {
    if (managerRef.current) {
      managerRef.current.stop();
      setIsEnabled(false);
    }
  };

  const forceRecovery = async (error: Error | string): Promise<boolean> => {
    if (managerRef.current) {
      return await managerRef.current.handleError(error);
    }
    return false;
  };

  const contextValue: AutoReloadContextType = {
    manager,
    isEnabled,
    status,
    currentProblem,
    metrics,
    enable,
    disable,
    forceRecovery
  };

  return (
    <AutoReloadContext.Provider value={contextValue}>
      {children}
    </AutoReloadContext.Provider>
  );
}

export function useAutoReload() {
  const context = useContext(AutoReloadContext);
  if (!context) {
    throw new Error('useAutoReload must be used within AutoReloadProvider');
  }
  return context;
}
