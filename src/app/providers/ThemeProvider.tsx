"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

type Theme = "dark" | "black" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "dark" | "black";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isChanging: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "qlink-theme";

function getSystemTheme(): "dark" | "black" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "dark";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "black">("dark");
  const [isChanging, setIsChanging] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored) {
      setThemeState(stored);
    }
    setMounted(true);
  }, []);

  // Update resolved theme when theme changes
  useEffect(() => {
    if (!mounted) return;
    
    const resolved = theme === "system" ? getSystemTheme() : theme;
    setResolvedTheme(resolved);
    
    // Apply to document
    const root = document.documentElement;
    root.classList.remove("dark", "black");
    root.classList.add(resolved);
    
    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        "content",
        resolved === "black" ? "#000000" : "#0f172a"
      );
    }
  }, [theme, mounted]);

  // Listen to system theme changes
  useEffect(() => {
    if (typeof window === "undefined" || theme !== "system") return;
    
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      setResolvedTheme(mediaQuery.matches ? "dark" : "dark");
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setIsChanging(true);
    localStorage.setItem(STORAGE_KEY, newTheme);
    setThemeState(newTheme);
    
    // Smooth transition complete
    setTimeout(() => setIsChanging(false), 600);
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === "dark" ? "black" : "dark";
    setTheme(newTheme);
  }, [resolvedTheme, setTheme]);

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
        isChanging,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
