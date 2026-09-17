/**
 * backoff.ts — Tech-Giant Standard Exponential Backoff & Retry Engine
 *
 * Implements decorrelated full-jitter backoff to eliminate thundering-herd problems
 * and provide ultra-resilient network operations.
 */

export interface RetryConfig {
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  jitter?: boolean;
  onRetry?: (attempt: number, delayMs: number, error: unknown) => void;
}

/**
 * Calculates exponential backoff delay with decorrelated full jitter.
 */
export function calculateBackoff(
  attempt: number,
  baseMs: number = 1000,
  maxMs: number = 20000,
  jitter: boolean = true
): number {
  const exp = Math.min(maxMs, baseMs * Math.pow(2, attempt));
  return jitter ? Math.floor(exp * (0.5 + Math.random() * 0.5)) : exp;
}

export const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Robust fetch wrapper with automatic exponential backoff retries.
 * Retries on network errors and HTTP 5xx server errors.
 * Never retries HTTP 4xx client errors (401, 403, 404, etc.).
 */
export async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  config: RetryConfig = {}
): Promise<Response> {
  const {
    maxRetries = 3,
    baseDelayMs = 800,
    maxDelayMs = 12000,
    jitter = true,
    onRetry,
  } = config;

  let lastError: unknown = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(input, init);

      // Success or Client error (4xx) — do not retry, return immediately
      if (response.ok || (response.status >= 400 && response.status < 500)) {
        return response;
      }

      // Server error (5xx) — retry with backoff
      if (attempt < maxRetries) {
        const delay = calculateBackoff(attempt, baseDelayMs, maxDelayMs, jitter);
        if (onRetry) onRetry(attempt + 1, delay, new Error(`HTTP ${response.status}`));
        await sleep(delay);
        continue;
      }

      return response;
    } catch (err: unknown) {
      lastError = err;

      // Aborted by user / component unmount — throw immediately
      if (err instanceof Error && err.name === "AbortError") {
        throw err;
      }

      if (attempt < maxRetries) {
        const delay = calculateBackoff(attempt, baseDelayMs, maxDelayMs, jitter);
        if (onRetry) onRetry(attempt + 1, delay, err);
        await sleep(delay);
        continue;
      }
    }
  }

  throw lastError || new Error("fetchWithRetry failed after all attempts");
}

export interface AdaptivePollerOptions {
  baseIntervalMs: number;
  maxIntervalMs?: number;
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
}

/**
 * Creates an intelligent adaptive poller that backs off on failures,
 * pauses when offline or when document is hidden, and wakes up immediately
 * when the app regains focus or connection.
 */
export function createAdaptivePoller(
  pollFn: () => Promise<boolean | void>,
  options: AdaptivePollerOptions
) {
  const {
    baseIntervalMs,
    maxIntervalMs = 20000,
    onSuccess,
    onError,
  } = options;

  let timerId: ReturnType<typeof setTimeout> | null = null;
  let attempt = 0;
  let isRunning = false;
  let isExecuting = false;

  const scheduleNext = (delayMs: number) => {
    if (!isRunning) return;
    if (timerId) clearTimeout(timerId);
    timerId = setTimeout(runCycle, delayMs);
  };

  const runCycle = async () => {
    if (!isRunning || isExecuting) return;

    const isHidden = typeof document !== "undefined" && document.hidden;
    const isOffline = typeof navigator !== "undefined" && !navigator.onLine;

    // Pause only if completely offline, checking back after 8s
    if (isOffline) {
      scheduleNext(8000);
      return;
    }

    isExecuting = true;
    try {
      const result = await pollFn();
      if (result === false) {
        // Handled failure
        attempt++;
        const nextDelay = calculateBackoff(attempt, baseIntervalMs, maxIntervalMs, true);
        scheduleNext(nextDelay);
      } else {
        // Success: reset backoff to base interval
        attempt = 0;
        if (onSuccess) onSuccess();
        // If hidden/backgrounded, poll at gentle interval (4.5s+) so background tabs never starve
        const nextDelay = isHidden ? Math.max(baseIntervalMs * 2.5, 4500) : baseIntervalMs;
        scheduleNext(nextDelay);
      }
    } catch (err) {
      attempt++;
      if (onError) onError(err);
      const nextDelay = calculateBackoff(attempt, baseIntervalMs, maxIntervalMs, true);
      scheduleNext(nextDelay);
    } finally {
      isExecuting = false;
    }
  };

  const handleVisibilityOrOnline = () => {
    if (!isRunning) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) return;

    // Reset backoff and execute cycle immediately on wake or refocus
    attempt = 0;
    if (timerId) clearTimeout(timerId);
    runCycle();
  };

  return {
    start() {
      if (isRunning) return;
      isRunning = true;
      attempt = 0;

      if (typeof document !== "undefined") {
        document.addEventListener("visibilitychange", handleVisibilityOrOnline);
      }
      if (typeof window !== "undefined") {
        window.addEventListener("online", handleVisibilityOrOnline);
        window.addEventListener("qlink:sync-messages", handleVisibilityOrOnline);
      }

      // Initial run
      runCycle();
    },

    stop() {
      isRunning = false;
      if (timerId) {
        clearTimeout(timerId);
        timerId = null;
      }
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibilityOrOnline);
      }
      if (typeof window !== "undefined") {
        window.removeEventListener("online", handleVisibilityOrOnline);
        window.removeEventListener("qlink:sync-messages", handleVisibilityOrOnline);
      }
    },

    /** Manually triggers an immediate poll cycle */
    kick() {
      handleVisibilityOrOnline();
    },
  };
}
