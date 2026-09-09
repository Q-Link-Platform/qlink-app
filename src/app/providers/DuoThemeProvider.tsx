"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export interface DuoThemePreset {
  id: string;
  name: string;
  category: "Cyber" | "Harmonic" | "Solar" | "Minimal";
  harmonyType: "Complementary" | "Analogous" | "Split-Comp" | "Triadic";
  primary: string; // Hex
  secondary: string; // Hex
  description: string;
  badge: string;
}

export const DUO_THEME_PRESETS: DuoThemePreset[] = [
  {
    id: "quantum-default",
    name: "Quantum Cyan + Astral Violet",
    category: "Cyber",
    harmonyType: "Split-Comp",
    primary: "#22d3ee",
    secondary: "#8b5cf6",
    description: "The canonical Q-Link signature. High-energy electric contrast optimized for dark space.",
    badge: "Official Signature"
  },
  {
    id: "matrix-teal",
    name: "Neon Matrix + Deep Teal",
    category: "Harmonic",
    harmonyType: "Analogous",
    primary: "#10b981",
    secondary: "#06b6d4",
    description: "Cybernetic bio-luminescence. Analogous calm green-to-cyan gradient that reduces eye strain.",
    badge: "Analogous Flow"
  },
  {
    id: "supernova-amber",
    name: "Solar Gold + Crimson Flare",
    category: "Solar",
    harmonyType: "Analogous",
    primary: "#f59e0b",
    secondary: "#ef4444",
    description: "Radiant cosmic energy. Intense amber fusion transitioning into burning crimson.",
    badge: "Warm High-Energy"
  },
  {
    id: "synthwave-2077",
    name: "Hyper Magenta + Cobalt Blue",
    category: "Cyber",
    harmonyType: "Complementary",
    primary: "#ec4899",
    secondary: "#3b82f6",
    description: "80s retro-futurism. Punchy high-voltage neon pink paired with deep cobalt.",
    badge: "Complementary Pop"
  },
  {
    id: "hologram-lime",
    name: "Lime Pulse + Arctic Sky",
    category: "Cyber",
    harmonyType: "Analogous",
    primary: "#84cc16",
    secondary: "#38bdf8",
    description: "Cutting-edge UI aesthetic. Crisp high-luminance lime blending into clear sky blue.",
    badge: "Ultra-Crisp"
  },
  {
    id: "imperial-rose",
    name: "Deep Royal + Sunset Rose",
    category: "Harmonic",
    harmonyType: "Split-Comp",
    primary: "#9333ea",
    secondary: "#f43f5e",
    description: "Regal elegance meets cyberpunk. Rich velvet purple grounded by glowing rose.",
    badge: "Luxury Contrast"
  },
  {
    id: "ethereal-frost",
    name: "Glacial Mint + Lavender Mist",
    category: "Minimal",
    harmonyType: "Triadic",
    primary: "#2dd4bf",
    secondary: "#a78bfa",
    description: "Subtle sub-zero luminescence. Cool mint sheen with soft crystalline lavender.",
    badge: "Soothing Frost"
  },
  {
    id: "solar-flare",
    name: "Blood Orange + Cyber Gold",
    category: "Solar",
    harmonyType: "Analogous",
    primary: "#ea580c",
    secondary: "#eab308",
    description: "Stellar prominence plasma. Fiery molten orange bleeding into golden radiance.",
    badge: "Molten Radiance"
  }
];

export interface DuoThemeConfig {
  primary: string;
  secondary: string;
  presetId?: string | null;
}

interface DuoThemeContextType {
  primaryColor: string;
  secondaryColor: string;
  activePresetId: string | null;
  presets: DuoThemePreset[];
  setDuoColors: (primary: string, secondary: string) => void;
  applyPreset: (presetId: string) => void;
  generateRandomDuo: () => { primary: string; secondary: string; harmony: string };
  swapDuoColors: () => void;
  resetToDefault: () => void;
}

const STORAGE_KEY = "qlink_duo_theme_config";
const DEFAULT_PRIMARY = "#22d3ee";
const DEFAULT_SECONDARY = "#8b5cf6";

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace("#", "");
  if (clean.length === 3) {
    clean = clean.split("").map((c) => c + c).join("");
  }
  const intVal = parseInt(clean, 16);
  if (isNaN(intVal) || clean.length !== 6) {
    return { r: 34, g: 211, b: 238 };
  }
  return {
    r: (intVal >> 16) & 255,
    g: (intVal >> 8) & 255,
    b: intVal & 255,
  };
}

function applyDuoThemeCssVariables(primary: string, secondary: string) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  const pRgb = hexToRgb(primary);
  const sRgb = hexToRgb(secondary);

  // Dynamic Duo-Tone Custom Properties
  root.style.setProperty("--duo-primary", primary);
  root.style.setProperty("--duo-primary-rgb", `${pRgb.r}, ${pRgb.g}, ${pRgb.b}`);
  root.style.setProperty("--duo-secondary", secondary);
  root.style.setProperty("--duo-secondary-rgb", `${sRgb.r}, ${sRgb.g}, ${sRgb.b}`);
  root.style.setProperty("--duo-gradient", `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`);
  root.style.setProperty(
    "--duo-glow",
    `0 0 16px rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.45), 0 0 32px rgba(${sRgb.r}, ${sRgb.g}, ${sRgb.b}, 0.25)`
  );

  // Harmonize existing core accent tokens so existing badges and buttons adopt the theme
  root.style.setProperty("--accent-cyan", primary);
  root.style.setProperty("--accent-cyan-light", primary);
  root.style.setProperty("--accent-violet", secondary);
  root.style.setProperty("--shadow-cyan", `rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.3)`);
  root.style.setProperty("--shadow-violet", `rgba(${sRgb.r}, ${sRgb.g}, ${sRgb.b}, 0.3)`);
  root.style.setProperty("--border-primary", `rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.35)`);
  root.style.setProperty("--orb-cyan", `rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.16)`);
  root.style.setProperty("--orb-violet", `rgba(${sRgb.r}, ${sRgb.g}, ${sRgb.b}, 0.16)`);
}

const DuoThemeContext = createContext<DuoThemeContextType | undefined>(undefined);

export function DuoThemeProvider({ children }: { children: React.ReactNode }) {
  const [primaryColor, setPrimaryColor] = useState<string>(DEFAULT_PRIMARY);
  const [secondaryColor, setSecondaryColor] = useState<string>(DEFAULT_SECONDARY);
  const [activePresetId, setActivePresetId] = useState<string | null>("quantum-default");
  const [mounted, setMounted] = useState<boolean>(false);

  // Load configuration from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: DuoThemeConfig = JSON.parse(saved);
        if (parsed.primary && parsed.secondary) {
          setPrimaryColor(parsed.primary);
          setSecondaryColor(parsed.secondary);
          setActivePresetId(parsed.presetId || null);
          applyDuoThemeCssVariables(parsed.primary, parsed.secondary);
        }
      } else {
        applyDuoThemeCssVariables(DEFAULT_PRIMARY, DEFAULT_SECONDARY);
      }
    } catch {
      applyDuoThemeCssVariables(DEFAULT_PRIMARY, DEFAULT_SECONDARY);
    }
    setMounted(true);
  }, []);

  const persistConfig = useCallback((primary: string, secondary: string, presetId: string | null) => {
    try {
      const config: DuoThemeConfig = { primary, secondary, presetId };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {}
  }, []);

  const setDuoColors = useCallback((primary: string, secondary: string) => {
    setPrimaryColor(primary);
    setSecondaryColor(secondary);

    // Detect if matches any known preset
    const match = DUO_THEME_PRESETS.find(
      (p) => p.primary.toLowerCase() === primary.toLowerCase() && p.secondary.toLowerCase() === secondary.toLowerCase()
    );
    const newPresetId = match ? match.id : null;
    setActivePresetId(newPresetId);

    applyDuoThemeCssVariables(primary, secondary);
    persistConfig(primary, secondary, newPresetId);
  }, [persistConfig]);

  const applyPreset = useCallback((presetId: string) => {
    const preset = DUO_THEME_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setPrimaryColor(preset.primary);
    setSecondaryColor(preset.secondary);
    setActivePresetId(preset.id);
    applyDuoThemeCssVariables(preset.primary, preset.secondary);
    persistConfig(preset.primary, preset.secondary, preset.id);
  }, [persistConfig]);

  const swapDuoColors = useCallback(() => {
    setDuoColors(secondaryColor, primaryColor);
  }, [primaryColor, secondaryColor, setDuoColors]);

  const resetToDefault = useCallback(() => {
    applyPreset("quantum-default");
  }, [applyPreset]);

  // Smart Algorithmic Random Duo Generator with Guaranteed Color Harmony
  const generateRandomDuo = useCallback(() => {
    // Curated high-aesthetic color pool (HSL hue degrees)
    const HUES = [
      { name: "Cyan", hue: 187, hex: "#06b6d4" },
      { name: "Electric Sky", hue: 199, hex: "#0284c7" },
      { name: "Royal Blue", hue: 221, hex: "#2563eb" },
      { name: "Violet", hue: 262, hex: "#7c3aed" },
      { name: "Fuchsia", hue: 292, hex: "#c026d3" },
      { name: "Neon Pink", hue: 330, hex: "#db2777" },
      { name: "Crimson", hue: 347, hex: "#e11d48" },
      { name: "Amber Gold", hue: 38, hex: "#d97706" },
      { name: "Neon Lime", hue: 84, hex: "#65a30d" },
      { name: "Emerald", hue: 142, hex: "#059669" },
      { name: "Aquamarine", hue: 168, hex: "#0d9488" },
    ];

    const pick1 = HUES[Math.floor(Math.random() * HUES.length)];
    // Choose harmony rule: 0: Complementary (180deg), 1: Analogous (40deg), 2: Triadic (120deg)
    const rule = Math.floor(Math.random() * 3);
    let targetHueOffset = 180;
    let harmonyLabel = "Complementary";

    if (rule === 1) {
      targetHueOffset = Math.random() > 0.5 ? 40 : -40;
      harmonyLabel = "Analogous Flow";
    } else if (rule === 2) {
      targetHueOffset = Math.random() > 0.5 ? 120 : -120;
      harmonyLabel = "Triadic Glow";
    } else {
      harmonyLabel = "Complementary Pop";
    }

    const targetHue = (pick1.hue + targetHueOffset + 360) % 360;
    let bestPick = HUES[0];
    let minDiff = 999;
    for (const cand of HUES) {
      if (cand.name === pick1.name) continue;
      const diff = Math.abs(cand.hue - targetHue);
      const circularDiff = Math.min(diff, 360 - diff);
      if (circularDiff < minDiff) {
        minDiff = circularDiff;
        bestPick = cand;
      }
    }

    setDuoColors(pick1.hex, bestPick.hex);
    return { primary: pick1.hex, secondary: bestPick.hex, harmony: harmonyLabel };
  }, [setDuoColors]);

  return (
    <DuoThemeContext.Provider
      value={{
        primaryColor,
        secondaryColor,
        activePresetId,
        presets: DUO_THEME_PRESETS,
        setDuoColors,
        applyPreset,
        generateRandomDuo,
        swapDuoColors,
        resetToDefault,
      }}
    >
      {children}
    </DuoThemeContext.Provider>
  );
}

export function useDuoTheme() {
  const context = useContext(DuoThemeContext);
  if (!context) {
    throw new Error("useDuoTheme must be used within a DuoThemeProvider");
  }
  return context;
}
