// Enhanced fetch with simple auto-retry for all API calls
export async function enhancedFetch(url: string, options?: RequestInit): Promise<Response> {
  const maxRetries = 3;
  const retryDelay = 1000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        cache: options?.cache || 'no-store'
      });
      
      if (response.ok) {
        return response;
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      console.log(`🔄 Fetch attempt ${attempt} failed: ${url}`, error);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  throw new Error('Max retries reached');
}

// Simple wrapper for all database operations
export async function withDbRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  const retryDelay = 1000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await operation();
      return result;
    } catch (error) {
      console.log(`🔄 DB attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  throw new Error('Max DB retries reached');
}
