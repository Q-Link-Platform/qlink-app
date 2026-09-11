/**
 * offlineCache — Tech-giant standard thin localStorage SWR cache.
 *
 * Pattern: Stale-While-Revalidate (SWR)
 *   1. Serve from cache instantly (0ms)
 *   2. Revalidate in background
 *   3. Update UI when fresh data arrives
 *
 * Zero external dependencies. SSR-safe.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
}

const isSSR = typeof window === "undefined";

function safeGet<T>(key: string): CacheEntry<T> | null {
  if (isSSR) return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as CacheEntry<T>;
  } catch {
    return null;
  }
}

function safeSet<T>(key: string, entry: CacheEntry<T>): void {
  if (isSSR) return;
  try {
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // localStorage quota exceeded — silently skip, cache is non-critical
  }
}

export const offlineCache = {
  /**
   * Write data to cache with a TTL (time-to-live in milliseconds).
   */
  set<T>(key: string, data: T, ttlMs: number): void {
    safeSet(key, { data, timestamp: Date.now(), ttlMs });
  },

  /**
   * Read from cache. Returns null if missing or expired.
   */
  get<T>(key: string): T | null {
    const entry = safeGet<T>(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > entry.ttlMs) {
      // Expired — remove silently
      try { localStorage.removeItem(key); } catch {}
      return null;
    }
    return entry.data;
  },

  /**
   * Returns the cached data even if stale (for offline fallback).
   * Returns null only if no entry exists at all.
   */
  getStale<T>(key: string): T | null {
    const entry = safeGet<T>(key);
    return entry ? entry.data : null;
  },

  /**
   * Returns a human-readable age string like "2m ago", "just now".
   */
  age(key: string): string {
    const entry = safeGet(key);
    if (!entry) return "";
    const diffMs = Date.now() - entry.timestamp;
    const secs = Math.floor(diffMs / 1000);
    if (secs < 60) return "just now";
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ago`;
  },

  /**
   * Returns true if the entry exists in cache (fresh or stale).
   */
  has(key: string): boolean {
    if (isSSR) return false;
    return localStorage.getItem(key) !== null;
  },

  /**
   * Invalidate a single cache entry.
   */
  invalidate(key: string): void {
    if (isSSR) return;
    try { localStorage.removeItem(key); } catch {}
  },
};

// Cache key constants
export const CACHE_KEYS = {
  DIRECTORY: "qc_cache_directory_v1",
  ID_POSTS: "qc_cache_id_posts_v1",
  DIR_POSTS: "qc_cache_dir_posts_v1",
} as const;

// TTL constants (milliseconds)
export const CACHE_TTL = {
  DIRECTORY: 30 * 60 * 1000,  // 30 minutes
  ID_POSTS: 5 * 60 * 1000,    //  5 minutes
  DIR_POSTS: 5 * 60 * 1000,   //  5 minutes
} as const;
