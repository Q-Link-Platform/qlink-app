'use client';

import { useEffect, useState } from 'react';

// Simple API Auto-Retry Hook
export function useSimpleAutoRetry() {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const maxRetries = 3;
  const retryDelay = 1000;

  const executeWithRetry = async <T>(
    apiCall: () => Promise<T>,
    options?: {
      maxRetries?: number;
      retryDelay?: number;
      silent?: boolean;
    }
  ): Promise<T | null> => {
    const max = options?.maxRetries || maxRetries;
    const delay = options?.retryDelay || retryDelay;
    const silent = options?.silent || false;

    for (let attempt = 1; attempt <= max; attempt++) {
      try {
        setIsRetrying(true);
        setRetryCount(attempt);
        
        const result = await apiCall();
        
        // Success - reset retry state
        setRetryCount(0);
        setIsRetrying(false);
        
        if (!silent) {
          console.log(`✅ API Success on attempt ${attempt}`);
        }
        
        return result;
      } catch (error) {
        console.log(`❌ API Attempt ${attempt} failed:`, error);
        
        if (attempt === max) {
          // Max retries reached
          setIsRetrying(false);
          setRetryCount(0);
          
          if (!silent) {
            console.log('❌ API: Max retries reached');
          }
          
          return null;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    return null;
  };

  const retry = async <T>(apiCall: () => Promise<T>): Promise<T | null> => {
    return executeWithRetry(apiCall, { silent: true });
  };

  return {
    executeWithRetry,
    retry,
    retryCount,
    isRetrying
  };
}
