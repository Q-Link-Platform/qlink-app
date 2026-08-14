"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { usePerformance } from "@/app/providers/PerformanceProvider";

export interface SettingsModalProps {
  isOpen: boolean;
  isAnimating: boolean;
  onClose: () => void;
  user: any;
  showOnboarding?: boolean;
  setShowOnboarding?: (v: boolean) => void;
  setOnboardingStep?: (v: number) => void;
  // Push Notifications
  isPushEnabled: boolean;
  isSubscribingPush: boolean;
  handleTogglePushNotifications: () => Promise<void>;
  // E2E Encryption
  e2eEnabled: boolean;
  handleToggleE2E: (targetState: boolean) => Promise<void>;
  e2eToggleLoading: boolean;
  // Account Visibility
  activeAccountVisibility: "public" | "private";
  isUpdatingVisibility: boolean;
  handleToggleAccountVisibility: () => Promise<void>;
  // Appearance Theme
  activeTheme?: string;
  setActiveTheme?: (theme: string) => void;
  // Sign Out
  handleSignOut: () => void;
  // Profile Drafts & Visibilities
  nameDraft?: string;
  setNameDraft?: (v: string) => void;
  bioDraft?: string;
  setBioDraft?: (v: string) => void;
  bioVisibility?: "public" | "private";
  setBioVisibility?: (v: "public" | "private") => void;
  genderDraft?: string;
  setGenderDraft?: (v: string) => void;
  genderVisibility?: "public" | "private";
  setGenderVisibility?: (v: "public" | "private") => void;
  selectedInterests?: string[];
  setSelectedInterests?: (v: string[]) => void;
  interestsVisibility?: "public" | "private";
  setInterestsVisibility?: (v: "public" | "private") => void;
  handleSaveProfile?: () => Promise<void>;
  isSavingProfile?: boolean;
}

export function PerformanceSettingsCard({ isQuantum = true }: { isQuantum?: boolean }) {
  const { perfMode, resolvedPerfMode, setPerfMode } = usePerformance();

  const handleSelect = (mode: "high" | "low" | "auto") => {
    setPerfMode(mode);
  };

  return (
    <div
      className={`space-y-3 rounded-2xl p-4 transition-all duration-300 ${
        isQuantum
          ? "border border-cyan-500/25 bg-gradient-to-b from-cyan-950/25 via-slate-900/40 to-slate-950/60 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.2),inset_0_0_20px_rgba(6,182,212,0.06)] hover:border-cyan-400/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]"
          : "border border-white/[0.15] bg-gradient-to-b from-white/[0.09] to-white/[0.03] backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.3)] hover:border-white/30 hover:from-white/[0.12]"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full border ${
              isQuantum
                ? "bg-cyan-400/15 border-cyan-400/40 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                : "bg-white/10 border-white/25"
            }`}
          >
            <svg
              className={`h-3.5 w-3.5 ${isQuantum ? "text-cyan-300" : "text-white"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-[12px] font-bold tracking-wide text-slate-100">Hardware & GPU Tier</span>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase border backdrop-blur-xl ${
            resolvedPerfMode === "low"
              ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.25)]"
              : isQuantum
              ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
              : "bg-white/15 text-white border-white/30 shadow-[0_0_10px_rgba(255,255,255,0.2)]"
          }`}
        >
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${
              resolvedPerfMode === "low" ? "bg-amber-400" : isQuantum ? "bg-cyan-400" : "bg-white"
            } animate-pulse`}
          />
          {resolvedPerfMode === "low" ? "4GB Low Spec" : "8GB+ Ultra"}
        </span>
      </div>

      <p className={`text-[11px] leading-relaxed ${isQuantum ? "text-cyan-100/60" : "text-white/55"}`}>
        Tune animation shaders & GPU frame rendering for your device RAM.
      </p>

      {/* Segmented Control */}
      <div
        className={`grid grid-cols-3 gap-1.5 rounded-xl p-1.5 shadow-inner ${
          isQuantum
            ? "border border-cyan-500/30 bg-black/50 backdrop-blur-2xl shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)]"
            : "border border-white/[0.12] bg-black/30 backdrop-blur-xl"
        }`}
      >
        <button
          type="button"
          onClick={() => handleSelect("high")}
          className={`flex flex-col items-center justify-center rounded-lg py-2 px-1 text-[11px] font-bold transition-all duration-300 ${
            perfMode === "high"
              ? isQuantum
                ? "bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-slate-950 shadow-[0_0_18px_rgba(6,182,212,0.6)] scale-[1.03]"
                : "bg-gradient-to-r from-cyan-400 to-sky-400 text-slate-950 shadow-[0_2px_12px_rgba(34,211,238,0.45)] font-semibold scale-[1.02]"
              : isQuantum
              ? "text-slate-400 hover:text-cyan-200 hover:bg-cyan-500/10"
              : "text-white/50 hover:text-white/90 hover:bg-white/[0.06]"
          }`}
        >
          <span className="flex items-center gap-1">🚀 8GB+</span>
          <span className="text-[9px] opacity-90 font-medium">High FPS</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelect("low")}
          className={`flex flex-col items-center justify-center rounded-lg py-2 px-1 text-[11px] font-bold transition-all duration-300 ${
            perfMode === "low"
              ? "bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-[0_0_18px_rgba(251,191,36,0.6)] scale-[1.03]"
              : isQuantum
              ? "text-slate-400 hover:text-amber-200 hover:bg-amber-500/10"
              : "text-white/50 hover:text-white/90 hover:bg-white/[0.06]"
          }`}
        >
          <span className="flex items-center gap-1">⚡ 4GB</span>
          <span className="text-[9px] opacity-90 font-medium">Zero Lag</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelect("auto")}
          className={`flex flex-col items-center justify-center rounded-lg py-2 px-1 text-[11px] font-bold transition-all duration-300 ${
            perfMode === "auto"
              ? isQuantum
                ? "bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 text-white shadow-[0_0_18px_rgba(139,92,246,0.6)] border border-violet-400/40 scale-[1.03]"
                : "bg-white/25 text-white border border-white/25 shadow-[0_2px_12px_rgba(0,0,0,0.3)] backdrop-blur-xl font-semibold scale-[1.02]"
              : isQuantum
              ? "text-slate-400 hover:text-violet-200 hover:bg-violet-500/10"
              : "text-white/50 hover:text-white/90 hover:bg-white/[0.06]"
          }`}
        >
          <span className="flex items-center gap-1">🤖 Auto</span>
          <span className="text-[9px] opacity-90 font-medium">Smart RAM</span>
        </button>
      </div>
    </div>
  );
}

export default function SettingsModal({
  isOpen,
  isAnimating,
  onClose,
  user,
  showOnboarding = false,
  setShowOnboarding,
  setOnboardingStep,
  isPushEnabled,
  isSubscribingPush,
  handleTogglePushNotifications,
  e2eEnabled,
  handleToggleE2E,
  e2eToggleLoading,
  activeAccountVisibility,
  isUpdatingVisibility,
  handleToggleAccountVisibility,
  activeTheme = "cyberpunk",
  setActiveTheme,
  handleSignOut,
  nameDraft = "",
  setNameDraft,
  bioDraft = "",
  setBioDraft,
  bioVisibility = "private",
  setBioVisibility,
  genderDraft = "not_specified",
  setGenderDraft,
  genderVisibility = "private",
  setGenderVisibility,
  selectedInterests = [],
  setSelectedInterests,
  interestsVisibility = "private",
  setInterestsVisibility,
  handleSaveProfile,
  isSavingProfile = false,
}: SettingsModalProps) {
  const [canUseDom, setCanUseDom] = useState(false);
  const [settingsScreen, setSettingsScreen] = useState<string>("main");
  const [settingsGlassTheme, setSettingsGlassTheme] = useState<"quantum" | "crystal">("quantum");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    setCanUseDom(true);
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("qlink_settings_glass_theme");
      if (saved === "crystal" || saved === "quantum") {
        setSettingsGlassTheme(saved);
      }
    }
  }, []);

  if (!isOpen && !isAnimating) return null;

  const toggleSettingsGlassTheme = () => {
    const next = settingsGlassTheme === "quantum" ? "crystal" : "quantum";
    setSettingsGlassTheme(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("qlink_settings_glass_theme", next);
    }
  };

  const isQuantum = settingsGlassTheme === "quantum";

  const modalContent = (
    <div
      className={`fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-xl px-4 ${
        isOpen ? (isAnimating ? "settings-backdrop-enter" : "") : "settings-backdrop-exit"
      }`}
      onMouseDown={() => {
        if (showOnboarding) return;
        onClose();
      }}
    >
      <div
        className={`w-full max-w-[390px] max-h-[88vh] flex flex-col rounded-[32px] transition-all duration-300 ${
          isQuantum
            ? "border border-cyan-500/30 bg-gradient-to-b from-slate-900/60 via-slate-950/75 to-[#030712]/90 backdrop-blur-3xl p-5 text-[12px] text-white shadow-[0_0_50px_rgba(6,182,212,0.18),0_25px_70px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.4),inset_0_0_30px_rgba(6,182,212,0.08)] ring-1 ring-cyan-400/25"
            : "border border-white/20 bg-gradient-to-b from-white/[0.12] via-slate-900/40 to-slate-950/60 backdrop-blur-3xl p-5 text-[12px] text-white shadow-[0_25px_70px_rgba(0,0,0,0.6),inset_0_1px_1.5px_rgba(255,255,255,0.4),inset_0_0_30px_rgba(255,255,255,0.03)] ring-1 ring-white/10"
        } ${isOpen ? (isAnimating ? "settings-modal-enter" : "") : "settings-modal-exit"}`}
        style={{
          boxShadow: isAnimating
            ? isQuantum
              ? "0 0 70px rgba(6, 182, 212, 0.35), 0 30px 60px -12px rgba(0, 0, 0, 0.8)"
              : "0 0 60px rgba(255, 255, 255, 0.2), 0 30px 60px -12px rgba(0, 0, 0, 0.6)"
            : isQuantum
            ? "0 0 40px rgba(6, 182, 212, 0.15), 0 30px 60px -12px rgba(0, 0, 0, 0.8)"
            : "0 30px 60px -12px rgba(0, 0, 0, 0.6)",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Navigation Header with Dual-Theme Glass Switcher */}
        <div
          className={`shrink-0 space-y-2 pb-3 border-b transition-all duration-300 ${
            isQuantum ? "border-cyan-500/20" : "border-white/[0.12]"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isQuantum ? "bg-cyan-400" : "bg-white"
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    isQuantum ? "bg-cyan-400 shadow-[0_0_10px_#22d3ee]" : "bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]"
                  }`}
                />
              </span>
              <span
                className={`text-sm font-black tracking-[0.22em] uppercase transition-all duration-300 ${
                  isQuantum
                    ? "bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]"
                    : "text-white drop-shadow-sm font-semibold tracking-tight"
                }`}
              >
                Settings
              </span>
            </div>

            {/* Action Buttons: Bespoke Animated Glass Aperture Switcher + Close */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleSettingsGlassTheme}
                className={`group relative flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur-2xl transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 active:scale-90 ${
                  isQuantum
                    ? "border-cyan-400/40 bg-cyan-950/50 hover:bg-cyan-500/20 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4),inset_0_1px_1px_rgba(255,255,255,0.35)] ring-1 ring-cyan-400/25"
                    : "border-white/25 bg-white/15 hover:bg-white/25 text-white shadow-[0_2px_12px_rgba(0,0,0,0.25),inset_0_1px_1.5px_rgba(255,255,255,0.5)] ring-1 ring-white/20"
                }`}
                title={isQuantum ? "Switch to Apple Crystal Glass" : "Switch to iOS 27 Quantum Glass"}
                aria-label="Toggle Spatial Glass Theme"
              >
                {/* Ambient Shimmer Core */}
                <span
                  className={`absolute inset-0 rounded-full opacity-40 blur-sm transition-all duration-500 group-hover:opacity-80 ${
                    isQuantum ? "bg-cyan-400" : "bg-white"
                  }`}
                />

                {/* Dynamic Refractive Aperture Glyph */}
                <div
                  className={`relative z-10 transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                    isQuantum ? "rotate-0 scale-100" : "rotate-180 scale-100"
                  }`}
                >
                  {isQuantum ? (
                    <svg className="h-4 w-4 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="9" strokeWidth="1.5" strokeDasharray="3 2" className="animate-spin-slow opacity-80" />
                      <polygon points="12 3 20 12 12 21 4 12" strokeWidth="1.5" strokeLinejoin="round" fill="currentColor" fillOpacity="0.15" />
                      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4 drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="9" strokeWidth="1.5" strokeOpacity="0.5" />
                      <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.75" />
                      <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.9" />
                    </svg>
                  )}
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  setSettingsScreen("main");
                }}
                className={`relative inline-flex items-center justify-center gap-1.5 rounded-full border backdrop-blur-2xl px-3.5 py-1.5 text-[11px] font-semibold transition-all active:scale-95 ${
                  isQuantum
                    ? "border-cyan-400/30 bg-cyan-950/40 hover:bg-cyan-500/25 text-cyan-200 hover:text-white shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                    : "border-white/20 bg-white/[0.12] hover:bg-white/[0.22] text-white shadow-[0_2px_10px_rgba(0,0,0,0.2)]"
                }`}
                aria-label="Close settings"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Close</span>
              </button>
            </div>
          </div>

          {settingsScreen !== "main" && (
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-xl px-3 py-2">
              <button
                type="button"
                onClick={() => setSettingsScreen("main")}
                className="text-[11px] font-medium text-cyan-200 hover:text-cyan-100 flex items-center gap-1"
              >
                <span>&larr;</span>
                <span>Back</span>
              </button>
              <span className="text-[11px] font-semibold text-slate-100 uppercase tracking-wide">
                {settingsScreen}
              </span>
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-3.5 py-3 pr-1 text-slate-200">
          {/* 1. Account Section */}
          <div
            className={`space-y-3 rounded-2xl p-4 backdrop-blur-2xl transition-all duration-300 ${
              isQuantum
                ? "border border-cyan-500/20 bg-gradient-to-b from-cyan-950/20 via-slate-900/35 to-slate-950/50 shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.18),inset_0_0_18px_rgba(6,182,212,0.05)] hover:border-cyan-400/40 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)]"
                : "border border-white/[0.14] bg-gradient-to-b from-white/[0.08] to-white/[0.03] shadow-[0_4px_24px_rgba(0,0,0,0.18),inset_0_1px_1px_rgba(255,255,255,0.25)] hover:border-white/30 hover:from-white/[0.10]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-100 tracking-wide">Account</span>
              <span className="text-[10px] text-cyan-300 font-mono">
                @{user?.userHandle || user?.name || "anonymous"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-300">Account visibility</span>
              <button
                type="button"
                disabled={isUpdatingVisibility}
                onClick={handleToggleAccountVisibility}
                className="inline-flex h-8 items-center rounded-full border border-cyan-500/30 bg-black/50 backdrop-blur-2xl p-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
              >
                <span
                  className={
                    "rounded-full px-2.5 py-0.5 text-[10px] font-medium transition " +
                    (activeAccountVisibility === "private"
                      ? "bg-slate-200 text-slate-950 font-semibold shadow-sm"
                      : "text-slate-400 hover:text-slate-200")
                  }
                >
                  Private
                </span>
                <span
                  className={
                    "rounded-full px-2.5 py-0.5 text-[10px] font-medium transition " +
                    (activeAccountVisibility === "public"
                      ? "bg-gradient-to-r from-cyan-400 to-sky-400 text-slate-950 font-semibold shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                      : "text-slate-400 hover:text-slate-200")
                  }
                >
                  Public
                </span>
              </button>
            </div>
          </div>

          {/* 2. Hardware & GPU Tier */}
          <PerformanceSettingsCard isQuantum={isQuantum} />

          {/* 3. PWA Push Notifications */}
          <div
            className={`space-y-3 rounded-2xl p-4 backdrop-blur-2xl transition-all duration-300 ${
              isQuantum
                ? "border border-cyan-500/20 bg-gradient-to-b from-cyan-950/20 via-slate-900/35 to-slate-950/50 shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.18),inset_0_0_18px_rgba(6,182,212,0.05)] hover:border-cyan-400/40 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)]"
                : "border border-white/[0.14] bg-gradient-to-b from-white/[0.08] to-white/[0.03] shadow-[0_4px_24px_rgba(0,0,0,0.18),inset_0_1px_1px_rgba(255,255,255,0.25)] hover:border-white/30 hover:from-white/[0.10]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-100 tracking-wide">PWA Notifications</span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold border ${
                  isPushEnabled
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : "bg-slate-700/40 text-slate-300 border-slate-600/60"
                }`}
              >
                {isPushEnabled ? "Active" : "Disabled"}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Receive background quantum delivery signals & instant offline chat alerts.
            </p>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-400">Device push status</span>
              <button
                type="button"
                disabled={isSubscribingPush}
                onClick={handleTogglePushNotifications}
                className="inline-flex h-8 items-center rounded-full border border-cyan-500/30 bg-black/50 backdrop-blur-2xl p-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
              >
                <span
                  className={
                    "rounded-full px-2.5 py-0.5 text-[10px] font-medium transition " +
                    (!isPushEnabled ? "bg-slate-200 text-slate-950 font-semibold" : "text-slate-400 hover:text-slate-200")
                  }
                >
                  Off
                </span>
                <span
                  className={
                    "rounded-full px-2.5 py-0.5 text-[10px] font-medium transition " +
                    (isPushEnabled
                      ? "bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-semibold shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                      : "text-slate-400 hover:text-slate-200")
                  }
                >
                  On
                </span>
              </button>
            </div>
          </div>

          {/* 4. E2E Encryption Shield */}
          <div
            className={`space-y-3 rounded-2xl p-4 backdrop-blur-2xl transition-all duration-300 ${
              isQuantum
                ? "border border-cyan-500/20 bg-gradient-to-b from-cyan-950/20 via-slate-900/35 to-slate-950/50 shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.18),inset_0_0_18px_rgba(6,182,212,0.05)] hover:border-cyan-400/40 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)]"
                : "border border-white/[0.14] bg-gradient-to-b from-white/[0.08] to-white/[0.03] shadow-[0_4px_24px_rgba(0,0,0,0.18),inset_0_1px_1px_rgba(255,255,255,0.25)] hover:border-white/30 hover:from-white/[0.10]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-100 tracking-wide">E2E Encryption Shield</span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold border ${
                  e2eEnabled
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                }`}
              >
                {e2eEnabled ? "Quantum AES-GCM" : "Disabled"}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-400">Vault status</span>
              <button
                type="button"
                disabled={e2eToggleLoading}
                onClick={() => handleToggleE2E(!e2eEnabled)}
                className="inline-flex h-8 items-center rounded-full border border-cyan-500/30 bg-black/50 backdrop-blur-2xl p-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
              >
                <span
                  className={
                    "rounded-full px-2.5 py-0.5 text-[10px] font-medium transition " +
                    (!e2eEnabled ? "bg-slate-200 text-slate-950 font-semibold" : "text-slate-400 hover:text-slate-200")
                  }
                >
                  Off
                </span>
                <span
                  className={
                    "rounded-full px-2.5 py-0.5 text-[10px] font-medium transition " +
                    (e2eEnabled
                      ? "bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-semibold shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                      : "text-slate-400 hover:text-slate-200")
                  }
                >
                  On
                </span>
              </button>
            </div>
          </div>

          {/* 5. Profile Snapshot */}
          <div
            className={`space-y-3 rounded-2xl p-4 backdrop-blur-2xl transition-all duration-300 ${
              isQuantum
                ? "border border-cyan-500/20 bg-gradient-to-b from-cyan-950/20 via-slate-900/35 to-slate-950/50 shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.18),inset_0_0_18px_rgba(6,182,212,0.05)] hover:border-cyan-400/40 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)]"
                : "border border-white/[0.14] bg-gradient-to-b from-white/[0.08] to-white/[0.03] shadow-[0_4px_24px_rgba(0,0,0,0.18),inset_0_1px_1px_rgba(255,255,255,0.25)] hover:border-white/30 hover:from-white/[0.10]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-100 tracking-wide">Profile Information</span>
              {setShowOnboarding && setOnboardingStep && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setShowOnboarding(true);
                    setOnboardingStep(0);
                  }}
                  className="text-[10px] font-semibold text-cyan-300 hover:text-cyan-200 transition"
                >
                  Edit Profile &rarr;
                </button>
              )}
            </div>
            <div className="space-y-2 pt-1 text-[11px]">
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
                <span className="text-slate-400">Display Name</span>
                <span className="text-slate-100 font-medium">{nameDraft || user?.name || "Not set"}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
                <span className="text-slate-400">Gender</span>
                <span className="text-slate-100 capitalize">
                  {genderDraft === "prefer_not_to_say" ? "Prefer not to say" : genderDraft || "Not specified"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
                <span className="text-slate-400">Interests</span>
                <span className="text-slate-100">
                  {selectedInterests.length > 0 ? `${selectedInterests.length} selected` : "None"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer: Log out */}
        <div className="shrink-0 pt-3 border-t border-white/10 space-y-2">
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full rounded-2xl border border-rose-500/40 bg-gradient-to-r from-rose-950/40 via-red-900/30 to-pink-950/40 hover:from-rose-600/30 hover:to-pink-600/30 backdrop-blur-2xl py-3 text-[12px] font-bold uppercase tracking-wider text-rose-300 hover:text-white shadow-[0_0_25px_rgba(244,63,94,0.2),inset_0_1px_1px_rgba(255,255,255,0.2)] active:scale-[0.98] transition-all"
          >
            Log out
          </button>
          <p className="text-center text-[10px] text-slate-400/80 font-medium">Tap backdrop or Close button to exit</p>
        </div>
      </div>

      {/* Log out Confirmation Modal */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/60 px-4"
          onMouseDown={() => setShowLogoutConfirm(false)}
        >
          <div
            className="w-full max-w-sm space-y-3 rounded-3xl border border-white/15 bg-slate-950/60 backdrop-blur-2xl px-5 py-5 text-[11px] text-slate-100 shadow-[0_8px_32px_0_rgba(0,0,0,0.6),inset_0_1px_1px_0_rgba(255,255,255,0.15)] ring-1 ring-white/10"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-slate-100">Log out of Quantum Chat?</p>
              <p className="text-[10px] text-slate-400">
                You will be signed out on this device. You can log back in anytime.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="rounded-xl border border-slate-600/70 bg-slate-900/80 px-3 py-2 text-[11px] font-medium text-slate-200 hover:border-cyan-400/70 hover:text-cyan-200 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  onClose();
                  handleSignOut();
                }}
                className="rounded-xl border border-rose-500/80 bg-rose-500/15 px-3 py-2 text-[11px] font-medium text-rose-100 hover:bg-rose-500/25 transition"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return canUseDom ? createPortal(modalContent, document.body) : null;
}
