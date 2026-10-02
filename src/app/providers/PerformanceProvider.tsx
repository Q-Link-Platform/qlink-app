"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type PerfMode = "high" | "low" | "auto";

interface PerformanceContextType {
  perfMode: PerfMode;
  resolvedPerfMode: "high" | "low";
  setPerfMode: (mode: PerfMode) => void;
  isLowSpec: boolean;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

const STORAGE_KEY = "qlink_perf_mode";

function detectHardwareMode(): "high" | "low" {
  if (typeof window === "undefined") return "high";
  
  // Check deviceMemory (GB of RAM) if available
  const ram = (navigator as any).deviceMemory;
  if (typeof ram === "number" && ram < 8) {
    return "low";
  }

  // Check CPU hardware concurrency (logical cores)
  const cores = navigator.hardwareConcurrency;
  if (typeof cores === "number" && cores < 4) {
    return "low";
  }

  return "high";
}

export function PerformanceProvider({ children }: { children: React.ReactNode }) {
  const [perfMode, setPerfModeState] = useState<PerfMode>("auto");
  const [resolvedPerfMode, setResolvedPerfMode] = useState<"high" | "low">("high");
  const [mounted, setMounted] = useState(false);

  // Initialize performance mode from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as PerfMode | null;
      if (stored && (stored === "high" || stored === "low" || stored === "auto")) {
        setPerfModeState(stored);
      }
    } catch {
      // ignore localStorage errors
    }
    setMounted(true);
  }, []);

  // Recalculate resolved mode whenever perfMode or mounted changes
  useEffect(() => {
    if (!mounted) return;

    const resolved = perfMode === "auto" ? detectHardwareMode() : perfMode;
    setResolvedPerfMode(resolved);

    const root = document.documentElement;
    if (resolved === "low") {
      root.classList.add("perf-low");
    } else {
      root.classList.remove("perf-low");
    }
  }, [perfMode, mounted]);

  const setPerfMode = useCallback((newMode: PerfMode) => {
    try {
      localStorage.setItem(STORAGE_KEY, newMode);
    } catch {
      // ignore
    }
    setPerfModeState(newMode);
  }, []);

  return (
    <PerformanceContext.Provider
      value={{
        perfMode,
        resolvedPerfMode,
        setPerfMode,
        isLowSpec: resolvedPerfMode === "low",
      }}
    >
      {children}
    </PerformanceContext.Provider>
  );
}

export function usePerformance() {
  const context = useContext(PerformanceContext);
  if (!context) {
    // Fallback safe defaults if used outside provider
    return {
      perfMode: "auto" as PerfMode,
      resolvedPerfMode: "high" as const,
      setPerfMode: () => {},
      isLowSpec: false,
    };
  }
  return context;
}
