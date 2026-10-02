'use client';

import { useEffect } from 'react';
import { useSimpleAutoRetry } from '@/hooks/useSimpleAutoRetry';

// Simple Auto-Retry Wrapper for API calls
export function withSimpleAutoRetry<T extends any[], R>(
  apiFunction: (...args: T) => Promise<R>,
  options?: {
    maxRetries?: number;
    retryDelay?: number;
    silent?: boolean;
  }
) {
  return function EnhancedApiFunction(...args: T): Promise<R | null> {
    const { executeWithRetry } = useSimpleAutoRetry();
    
    return executeWithRetry(
      () => apiFunction(...args),
      options
    );
  };
}

// Simple wrapper for fetch API calls
export async function simpleFetchWithRetry(
  url: string,
  options?: RequestInit & { maxRetries?: number; retryDelay?: number; silent?: boolean }
): Promise<Response | null> {
  const maxRetries = options?.maxRetries || 3;
  const retryDelay = options?.retryDelay || 1000;
  const silent = options?.silent || false;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      if (!silent) {
        console.log(`✅ Fetch Success on attempt ${attempt}: ${url}`);
      }
      
      return response;
    } catch (error) {
      console.log(`❌ Fetch Attempt ${attempt} failed: ${url}`, error);
      
      if (attempt === maxRetries) {
        if (!silent) {
          console.log(`❌ Fetch: Max retries reached for ${url}`);
        }
        return null;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  return null;
}

// Simple wrapper for database operations
export async function simpleDbOperationWithRetry<T>(
  dbOperation: () => Promise<T>,
  options?: { maxRetries?: number; retryDelay?: number; silent?: boolean }
): Promise<T | null> {
  const maxRetries = options?.maxRetries || 3;
  const retryDelay = options?.retryDelay || 1000;
  const silent = options?.silent || false;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await dbOperation();
      
      if (!silent) {
        console.log(`✅ DB Operation Success on attempt ${attempt}`);
      }
      
      return result;
    } catch (error) {
      console.log(`❌ DB Operation Attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        if (!silent) {
          console.log('❌ DB Operation: Max retries reached');
        }
        return null;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  return null;
}
