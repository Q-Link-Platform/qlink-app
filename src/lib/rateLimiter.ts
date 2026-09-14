/**
 * Production-Grade Sliding Window Rate Limiter
 * Provides DDoS/spam mitigation with auto memory-purging.
 */

interface RateLimitRecord {
  timestamps: number[];
}

class SlidingWindowRateLimiter {
  private store = new Map<string, RateLimitRecord>();
  private cleanupInterval: NodeJS.Timeout;

  constructor(private cleanupPeriodMs: number = 60_000) {
    // Auto-clean stale records every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), this.cleanupPeriodMs);
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  /**
   * Checks if an action is allowed for a given key within windowMs
   * @param key Unique key (e.g. userId or IP)
   * @param limit Max allowed requests within window
   * @param windowMs Time window in milliseconds
   */
  public check(key: string, limit: number, windowMs: number): {
    allowed: boolean;
    remaining: number;
    resetMs: number;
    total: number;
  } {
    const now = Date.now();
    const windowStart = now - windowMs;

    let record = this.store.get(key);
    if (!record) {
      record = { timestamps: [] };
      this.store.set(key, record);
    }

    // Filter out timestamps outside window
    record.timestamps = record.timestamps.filter((t) => t > windowStart);

    if (record.timestamps.length >= limit) {
      const oldestInWindow = record.timestamps[0];
      const resetMs = Math.max(0, oldestInWindow + windowMs - now);
      return {
        allowed: false,
        remaining: 0,
        resetMs,
        total: record.timestamps.length,
      };
    }

    record.timestamps.push(now);
    return {
      allowed: true,
      remaining: limit - record.timestamps.length,
      resetMs: windowMs,
      total: record.timestamps.length,
    };
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      // If no activity in last 5 minutes, delete key
      if (record.timestamps.length === 0 || now - record.timestamps[record.timestamps.length - 1] > 300_000) {
        this.store.delete(key);
      }
    }
  }
}

// Global singletons for Q-Link operations
export const postRateLimiter = new SlidingWindowRateLimiter();
export const engagementRateLimiter = new SlidingWindowRateLimiter();
