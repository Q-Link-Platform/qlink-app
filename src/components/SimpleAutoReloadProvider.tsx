'use client';

import React from 'react';
import { SimpleAutoReload } from '@/components/SimpleAutoReload';

// Simple Auto-Reload Provider for wrapping the entire app
export function SimpleAutoReloadProvider({ children }: { children: React.ReactNode }) {
  return (
    <SimpleAutoReload maxRetries={3} retryDelay={1000}>
      {children}
    </SimpleAutoReload>
  );
}
