"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface NetworkStatus {
  isOnline: boolean;
  wasRecentlyOffline: boolean;
  reconnectedAt: Date | null;
  offlineDuration: number;
}

/**
 * useNetworkStatus — Tech-giant standard reactive network status hook.
 * - Debounced 300ms (avoids flicker on flaky connections)
 * - Tracks "recently reconnected" window (2500ms) for "Back online" UX
 * - Counts offline duration in seconds for ambient bar display
 * - SSR-safe
 */
export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof window !== "undefined" ? navigator.onLine : true
  );
  const [wasRecentlyOffline, setWasRecentlyOffline] = useState(false);
  const [reconnectedAt, setReconnectedAt] = useState<Date | null>(null);
  const [offlineDuration, setOfflineDuration] = useState(0);

  const offlineSince = useRef<Date | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const durationTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const recentOfflineTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearDebounce = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
  }, []);

  const startDurationTick = useCallback(() => {
    if (durationTimer.current) clearInterval(durationTimer.current);
    durationTimer.current = setInterval(() => {
      if (offlineSince.current) {
        const secs = Math.floor((Date.now() - offlineSince.current.getTime()) / 1000);
        setOfflineDuration(secs);
      }
    }, 1000);
  }, []);

  const stopDurationTick = useCallback(() => {
    if (durationTimer.current) { clearInterval(durationTimer.current); durationTimer.current = null; }
    setOfflineDuration(0);
    offlineSince.current = null;
  }, []);

  useEffect(() => {
    const handleOffline = () => {
      clearDebounce();
      debounceTimer.current = setTimeout(() => {
        offlineSince.current = new Date();
        setIsOnline(false);
        setWasRecentlyOffline(false);
        setReconnectedAt(null);
        startDurationTick();
      }, 300);
    };

    const handleOnline = () => {
      clearDebounce();
      debounceTimer.current = setTimeout(() => {
        stopDurationTick();
        setIsOnline(true);
        setReconnectedAt(new Date());
        setWasRecentlyOffline(true);
        if (recentOfflineTimer.current) clearTimeout(recentOfflineTimer.current);
        recentOfflineTimer.current = setTimeout(() => {
          setWasRecentlyOffline(false);
          setReconnectedAt(null);
        }, 2500);
      }, 300);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    if (!navigator.onLine) {
      offlineSince.current = new Date();
      setIsOnline(false);
      startDurationTick();
    }

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      clearDebounce();
      stopDurationTick();
      if (recentOfflineTimer.current) clearTimeout(recentOfflineTimer.current);
    };
  }, [clearDebounce, startDurationTick, stopDurationTick]);

  return { isOnline, wasRecentlyOffline, reconnectedAt, offlineDuration };
}
