"use client";

import React, { useState } from "react";
import { useDuoTheme, DUO_THEME_PRESETS, DuoThemePreset } from "@/app/providers/DuoThemeProvider";

const QUICK_COLORS = [
  { name: "Cyan", hex: "#22d3ee" },
  { name: "Sky", hex: "#38bdf8" },
  { name: "Cobalt", hex: "#3b82f6" },
  { name: "Violet", hex: "#8b5cf6" },
  { name: "Purple", hex: "#a855f7" },
  { name: "Magenta", hex: "#ec4899" },
  { name: "Rose", hex: "#f43f5e" },
  { name: "Crimson", hex: "#ef4444" },
  { name: "Orange", hex: "#f97316" },
  { name: "Amber", hex: "#f59e0b" },
  { name: "Gold", hex: "#eab308" },
  { name: "Lime", hex: "#84cc16" },
  { name: "Emerald", hex: "#10b981" },
  { name: "Teal", hex: "#06b6d4" },
];

export default function DuoThemeStudio({ isQuantum = true }: { isQuantum?: boolean }) {
  const {
    primaryColor,
    secondaryColor,
    activePresetId,
    applyPreset,
    setDuoColors,
    generateRandomDuo,
    swapDuoColors,
    resetToDefault,
  } = useDuoTheme();

  const [activeTab, setActiveTab] = useState<"presets" | "custom" | "guide">("presets");
  const [randomNotice, setRandomNotice] = useState<string | null>(null);

  const handleRandomize = () => {
    const res = generateRandomDuo();
    setRandomNotice(`Generated ${res.harmony}!`);
    setTimeout(() => setRandomNotice(null), 2500);
  };

  return (
    <div className="space-y-4 text-slate-100">
      {/* Top Studio Header & Live Preview */}
      <div
        className={`relative overflow-hidden rounded-2xl p-4 transition-all duration-300 border ${
          isQuantum
            ? "border-cyan-500/30 bg-gradient-to-b from-cyan-950/30 via-slate-900/50 to-slate-950/70 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
            : "border-white/15 bg-white/[0.06] shadow-xl"
        }`}
        style={{
          boxShadow: `0 0 35px rgba(var(--duo-primary-rgb, 34, 211, 238), 0.15), 0 0 50px rgba(var(--duo-secondary-rgb, 139, 92, 246), 0.10)`,
        }}
      >
        {/* Dynamic Dual-Color Ambient Glow */}
        <div
          className="pointer-events-none absolute -top-12 -left-12 h-32 w-32 rounded-full blur-3xl opacity-40 transition-colors duration-500"
          style={{ backgroundColor: primaryColor }}
        />
        <div
          className="pointer-events-none absolute -bottom-12 -right-12 h-32 w-32 rounded-full blur-3xl opacity-30 transition-colors duration-500"
          style={{ backgroundColor: secondaryColor }}
        />

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/20 bg-black/40 text-sm shadow-inner">
                🎨
              </span>
              <div>
                <h3 className="text-sm font-bold tracking-wide text-white flex items-center gap-2">
                  Quantum Duo-Tone Studio
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-white border shadow-sm"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor}40, ${secondaryColor}40)`,
                      borderColor: `${primaryColor}80`,
                    }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full animate-pulse"
                      style={{ backgroundColor: primaryColor }}
                    />
                    Live Active
                  </span>
                </h3>
                <p className="text-[10.5px] text-slate-400">
                  Select or craft two combining colors to transform all buttons, glows, and badges.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={resetToDefault}
                className="rounded-full border border-slate-700/80 bg-slate-900/60 px-2.5 py-1 text-[10.5px] font-medium text-slate-300 hover:border-cyan-400/60 hover:text-white transition-all shadow-sm active:scale-95"
                title="Reset to Quantum Cyan & Astral Violet"
              >
                ↺ Reset
              </button>
            </div>
          </div>

          {/* Interactive Live Preview Sandbox */}
          <div
            className="rounded-xl p-3 border border-white/10 bg-black/40 backdrop-blur-md space-y-2.5 shadow-inner"
            style={{
              borderColor: `${primaryColor}35`,
            }}
          >
            <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-widest font-mono">
              <span>Live Palette Feedback</span>
              <span className="font-semibold text-white/90">
                {primaryColor.toUpperCase()} + {secondaryColor.toUpperCase()}
              </span>
            </div>

            {/* Preview Elements Row */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-0.5">
              {/* Button Preview */}
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-semibold text-white shadow-lg transition-all transform hover:scale-105 active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                  boxShadow: `0 0 16px ${primaryColor}66, 0 0 24px ${secondaryColor}40`,
                }}
              >
                <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                Duo Glow Button
              </button>

              {/* Tag / Badge Preview */}
              <div
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold border"
                style={{
                  backgroundColor: `${primaryColor}15`,
                  borderColor: `${primaryColor}60`,
                  color: primaryColor,
                  boxShadow: `0 0 10px ${primaryColor}20`,
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                Primary Pill
              </div>

              {/* Secondary Tag */}
              <div
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold border"
                style={{
                  backgroundColor: `${secondaryColor}15`,
                  borderColor: `${secondaryColor}60`,
                  color: secondaryColor,
                  boxShadow: `0 0 10px ${secondaryColor}20`,
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: secondaryColor }} />
                Secondary Pill
              </div>

              {/* Gradient Text Preview */}
              <span
                className="text-xs font-black tracking-wider uppercase bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                }}
              >
                Quantum Duo Engine
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mode Selector Tabs (Presets / Custom Palette / Color Guide) */}
      <div className="grid grid-cols-3 gap-1 rounded-xl bg-black/40 border border-slate-800/80 p-1 backdrop-blur-md shadow-inner text-center">
        <button
          type="button"
          onClick={() => setActiveTab("presets")}
          className={`rounded-lg py-1.5 text-xs font-semibold transition-all ${
            activeTab === "presets"
              ? "bg-slate-800 text-cyan-300 shadow-md border border-cyan-400/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Curated Presets ({DUO_THEME_PRESETS.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("custom")}
          className={`rounded-lg py-1.5 text-xs font-semibold transition-all ${
            activeTab === "custom"
              ? "bg-slate-800 text-cyan-300 shadow-md border border-cyan-400/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Custom Builder & Shuffle
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("guide")}
          className={`rounded-lg py-1.5 text-xs font-semibold transition-all ${
            activeTab === "guide"
              ? "bg-slate-800 text-cyan-300 shadow-md border border-cyan-400/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Matching Guide 💡
        </button>
      </div>

      {/* TAB 1: CURATED PRESETS */}
      {activeTab === "presets" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {DUO_THEME_PRESETS.map((preset) => {
            const isSelected =
              primaryColor.toLowerCase() === preset.primary.toLowerCase() &&
              secondaryColor.toLowerCase() === preset.secondary.toLowerCase();

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.id)}
                className={`relative flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-200 group hover:scale-[1.01] active:scale-[0.99] ${
                  isSelected
                    ? "border-cyan-400/80 bg-slate-900/90 shadow-[0_0_20px_rgba(6,182,212,0.25)]"
                    : "border-slate-800/80 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-900/50"
                }`}
              >
                {/* Visual Swatch Badges */}
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="flex items-center gap-1.5">
                    {/* Dual Swatch Circles overlapping */}
                    <div className="relative flex items-center h-6 w-10">
                      <span
                        className="absolute left-0 h-5 w-5 rounded-full border border-white/40 shadow-md"
                        style={{ backgroundColor: preset.primary }}
                      />
                      <span
                        className="absolute left-3.5 h-5 w-5 rounded-full border border-white/40 shadow-md"
                        style={{ backgroundColor: preset.secondary }}
                      />
                    </div>
                    <span className="text-xs font-bold text-white group-hover:text-cyan-200 transition-colors">
                      {preset.name}
                    </span>
                  </div>

                  {isSelected && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-400 text-slate-950 text-[11px] font-bold shadow-sm">
                      ✓
                    </span>
                  )}
                </div>

                <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2">
                  {preset.description}
                </p>

                <div className="mt-2.5 flex items-center justify-between w-full text-[9.5px]">
                  <span
                    className="px-2 py-0.5 rounded-md font-semibold border"
                    style={{
                      background: `linear-gradient(90deg, ${preset.primary}20, ${preset.secondary}20)`,
                      borderColor: `${preset.primary}40`,
                      color: preset.primary,
                    }}
                  >
                    {preset.badge}
                  </span>
                  <span className="font-mono text-slate-500 uppercase">
                    {preset.primary} · {preset.secondary}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* TAB 2: CUSTOM COLOR BUILDER & SMART RANDOMIZER */}
      {activeTab === "custom" && (
        <div className="space-y-4">
          {/* Action Row: Randomize & Swap */}
          <div className="flex items-center justify-between flex-wrap gap-2 p-3 rounded-xl border border-slate-800 bg-slate-950/60">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRandomize}
                className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/50 bg-gradient-to-r from-cyan-500/20 to-violet-500/20 px-3 py-1.5 text-xs font-bold text-cyan-200 hover:border-cyan-300 hover:text-white transition-all shadow-md active:scale-95"
              >
                🎲 Smart Random Duo
              </button>
              <button
                type="button"
                onClick={swapDuoColors}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900/80 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:border-slate-500 hover:text-white transition-all active:scale-95"
                title="Swap Primary and Secondary roles"
              >
                ⇄ Swap Roles
              </button>
            </div>

            {randomNotice && (
              <span className="text-[11px] font-bold text-cyan-300 animate-pulse">
                ✨ {randomNotice}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Primary Color Picker */}
            <div className="space-y-2.5 rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 shadow-inner">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="h-5 w-5 rounded-full border border-white/50 shadow-md inline-block"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <span className="text-xs font-bold text-white">Primary Accent</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    {primaryColor}
                  </span>
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setDuoColors(e.target.value, secondaryColor)}
                    className="h-6 w-6 rounded cursor-pointer border-0 bg-transparent"
                    title="Choose custom Primary Color"
                  />
                </div>
              </div>

              <p className="text-[10px] text-slate-400">
                Dominant color for primary button glow, status rings, and high-impact borders.
              </p>

              {/* Quick Swatches */}
              <div className="grid grid-cols-7 gap-1.5 pt-1">
                {QUICK_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setDuoColors(c.hex, secondaryColor)}
                    className={`h-6 w-full rounded-md border transition-all ${
                      primaryColor.toLowerCase() === c.hex.toLowerCase()
                        ? "scale-110 border-white shadow-[0_0_8px_#fff]"
                        : "border-transparent opacity-80 hover:opacity-100 hover:scale-105"
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Secondary Color Picker */}
            <div className="space-y-2.5 rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 shadow-inner">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="h-5 w-5 rounded-full border border-white/50 shadow-md inline-block"
                    style={{ backgroundColor: secondaryColor }}
                  />
                  <span className="text-xs font-bold text-white">Secondary Accent</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    {secondaryColor}
                  </span>
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setDuoColors(primaryColor, e.target.value)}
                    className="h-6 w-6 rounded cursor-pointer border-0 bg-transparent"
                    title="Choose custom Secondary Color"
                  />
                </div>
              </div>

              <p className="text-[10px] text-slate-400">
                Harmonic partner color for dual-gradient tails, ambient backdrops, and secondary pills.
              </p>

              {/* Quick Swatches */}
              <div className="grid grid-cols-7 gap-1.5 pt-1">
                {QUICK_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setDuoColors(primaryColor, c.hex)}
                    className={`h-6 w-full rounded-md border transition-all ${
                      secondaryColor.toLowerCase() === c.hex.toLowerCase()
                        ? "scale-110 border-white shadow-[0_0_8px_#fff]"
                        : "border-transparent opacity-80 hover:opacity-100 hover:scale-105"
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COLOR HARMONY & MATCHING GUIDE */}
      {activeTab === "guide" && (
        <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4 leading-relaxed">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
            <span className="text-base">💡</span>
            <h4 className="text-xs font-bold text-cyan-200 uppercase tracking-wider">
              The 3 Golden Rules of Combining Colors
            </h4>
          </div>

          <div className="space-y-3 text-[11px] text-slate-300">
            <div className="rounded-lg bg-slate-900/60 p-2.5 border border-slate-800">
              <span className="font-bold text-cyan-400 block mb-0.5">
                1. Analogous Flow (Neighbors on Color Wheel)
              </span>
              <p className="text-slate-400">
                Pairing neighboring hues (e.g. <strong>Cyan + Sky Blue</strong> or <strong>Amber + Orange</strong>)
                produces a cohesive, ultra-soothing futuristic look that never causes eye strain during long chat sessions.
              </p>
            </div>

            <div className="rounded-lg bg-slate-900/60 p-2.5 border border-slate-800">
              <span className="font-bold text-fuchsia-400 block mb-0.5">
                2. Complementary Pop (Opposites on Color Wheel)
              </span>
              <p className="text-slate-400">
                Pairing opposite hues (e.g. <strong>Neon Magenta + Cobalt Blue</strong> or <strong>Cyan + Electric Violet</strong>)
                generates maximum visual pop and high-voltage energy, making buttons and active states stand out crisply.
              </p>
            </div>

            <div className="rounded-lg bg-slate-900/60 p-2.5 border border-slate-800">
              <span className="font-bold text-amber-400 block mb-0.5">
                3. Luminance Balance on Dark & OLED Backgrounds
              </span>
              <p className="text-slate-400">
                For the best sci-fi aesthetic, choose one high-luminance color (like Cyan, Lime, or Gold) as your
                <strong> Primary Accent</strong>, and a slightly richer, deeper hue (like Violet, Teal, or Rose) as your
                <strong> Secondary Accent</strong>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
