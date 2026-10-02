import { ProblemType } from './types';
import { ERROR_PATTERNS } from './config';

// Advanced error classification system
export class ErrorClassifier {
  static classifyError(error: Error | string): ProblemType {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'string' ? '' : error.stack || '';
    const fullErrorText = `${errorMessage} ${errorStack}`.toLowerCase();

    // Check each problem type with its patterns
    for (const [problemType, patterns] of Object.entries(ERROR_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(fullErrorText)) {
          return problemType as ProblemType;
        }
      }
    }

    // Default classification based on common indicators
    if (fullErrorText.includes('network') || fullErrorText.includes('fetch')) {
      return ProblemType.NETWORK_CONNECTIVITY;
    }
    
    if (fullErrorText.includes('render') || fullErrorText.includes('component')) {
      return ProblemType.BROWSER_UI_FAIL;
    }
    
    if (fullErrorText.includes('database') || fullErrorText.includes('connection')) {
      return ProblemType.DATABASE_LOADING;
    }

    return ProblemType.APP_INFRASTRUCTURE;
  }

  static getRecoveryStrategy(problemType: ProblemType): string {
    const strategies = {
      [ProblemType.DATABASE_LOADING]: 'reconnect_and_retry',
      [ProblemType.BROWSER_UI_FAIL]: 'force_rerender',
      [ProblemType.APP_INFRASTRUCTURE]: 'restart_services',
      [ProblemType.NETWORK_CONNECTIVITY]: 'reconnect_network',
      [ProblemType.SYSTEM_OVERLOAD]: 'reduce_load'
    };

    return strategies[problemType] || 'default_recovery';
  }

  static getRetryDelay(attempt: number, baseDelay: number, useExponential: boolean = true): number {
    if (!useExponential) {
      return baseDelay;
    }

    // Exponential backoff with jitter
    const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
    const jitter = Math.random() * 0.1 * exponentialDelay; // 10% jitter
    return Math.min(exponentialDelay + jitter, 30000); // Max 30 seconds
  }

  static shouldRetry(error: Error | string, attempt: number, maxRetries: number): boolean {
    if (attempt >= maxRetries) {
      return false;
    }

    const problemType = this.classifyError(error);
    
    // Some errors should not be retried
    const nonRetryableErrors = [
      /authentication/i,
      /authorization/i,
      /permission/i,
      /invalid/i,
      /malformed/i
    ];

    const errorMessage = typeof error === 'string' ? error : error.message;
    
    for (const pattern of nonRetryableErrors) {
      if (pattern.test(errorMessage.toLowerCase())) {
        return false;
      }
    }

    return true;
  }
}
