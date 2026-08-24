"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { usePerformance } from "@/app/providers/PerformanceProvider";
import { ThemeToggle } from "@/components/ThemeToggle";

function PerformanceSettingsCard({ isQuantum = true }: { isQuantum?: boolean }) {
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

export interface SettingsModalProps {
  showSettings: boolean;
  isSettingsAnimating: boolean;
  setShowSettings: (v: boolean) => void;
  setIsSettingsAnimating: (v: boolean) => void;
  settingsScreen: string;
  setSettingsScreen: (v: string) => void;
  settingsGlassTheme: "quantum" | "crystal";
  toggleSettingsGlassTheme: () => void;
  canUseDom: boolean;
  session: any;
  currentHandle?: string;
  emailVisibility: "public" | "private";
  setEmailVisibility: (v: "public" | "private") => void;
  desktopNotificationsEnabled: boolean;
  toggleDesktopNotifications: (enabled: boolean) => void;
  isPushEnabled: boolean;
  togglePushNotifications: (enabled: boolean) => void;
  isE2EEnabled: boolean;
  setIsE2EEnabled: (enabled: boolean) => void;
  showOnboarding: boolean;
  setShowOnboarding: (v: boolean) => void;
  setOnboardingStep: (v: number) => void;
  displayName: string;
  nameDraft: string;
  setNameDraft: (v: string) => void;
  bioDraft: string;
  setBioDraft: (v: string) => void;
  bioVisibility: "public" | "private";
  setBioVisibility: (v: "public" | "private") => void;
  age: number | null;
  setAge?: (v: number) => void;
  ageVisibility: "public" | "private";
  setAgeVisibility: (v: "public" | "private") => void;
  gender: string;
  setGender?: (v: string) => void;
  genderVisibility: "public" | "private";
  setGenderVisibility: (v: "public" | "private") => void;
  selectedInterests: string[];
  setSelectedInterests: (v: string[]) => void;
  interestsVisibility: "public" | "private";
  setInterestsVisibility: (v: "public" | "private") => void;
  showLogoutConfirm: boolean;
  setShowLogoutConfirm: (v: boolean) => void;
  handleSignOut: () => void;
  playSciFiSound?: (type: string) => void;
  setDisplayName?: (v: string | null) => void;
  manualStopAnimation?: boolean;
  setManualStopAnimation?: (v: boolean) => void;
  setIsAIArrowButtonVisible?: (v: boolean) => void;
  setShowAIHelpButton?: (v: boolean) => void;
}

export default function SettingsModal(props: SettingsModalProps) {
  const {
    showSettings,
    isSettingsAnimating,
    setShowSettings,
    setIsSettingsAnimating,
    settingsScreen,
    setSettingsScreen,
    settingsGlassTheme,
    toggleSettingsGlassTheme,
    canUseDom,
    session,
    currentHandle,
    emailVisibility,
    setEmailVisibility,
    desktopNotificationsEnabled,
    toggleDesktopNotifications,
    isPushEnabled,
    togglePushNotifications,
    isE2EEnabled,
    setIsE2EEnabled,
    showOnboarding,
    setShowOnboarding,
    setOnboardingStep,
    displayName,
    nameDraft,
    setNameDraft,
    bioDraft,
    setBioDraft,
    bioVisibility,
    setBioVisibility,
    age,
    setAge = () => {},
    ageVisibility,
    setAgeVisibility,
    gender,
    setGender = () => {},
    genderVisibility,
    setGenderVisibility,
    selectedInterests,
    setSelectedInterests,
    interestsVisibility,
    setInterestsVisibility,
    showLogoutConfirm,
    setShowLogoutConfirm,
    handleSignOut,
    manualStopAnimation = false,
    setManualStopAnimation,
    setIsAIArrowButtonVisible,
    setShowAIHelpButton,
    playSciFiSound = () => {},
    setDisplayName = () => {},
  } = props;

  const isElectron = typeof window !== "undefined" && Boolean((window as any).electronAPI);
  const [showAboutFeatures, setShowAboutFeatures] = useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);

  const handleSettingsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    if (cardRef.current) {
      // Direct CSS Variable interpolation (120FPS GPU scroll-driven layout)
      const progress = Math.min(1, Math.max(0, scrollTop / 160));
      cardRef.current.style.setProperty("--scroll-progress", progress.toString());
    }
  };

  const interestsCategories = [
    "Technology", "Artificial Intelligence", "Machine Learning", "Deep Learning",
    "Robotics", "Automation", "Software Development", "Web Development", "App Development",
    "Game Development", "Cybersecurity", "Ethical Hacking", "Cloud Computing", "DevOps",
    "Blockchain", "Web3", "Data Science", "Big Data", "UI/UX Design", "Product Management",
    "Open Source", "Competitive Programming", "Startups", "Venture Capital", "Finance",
    "Economics", "Marketing", "Content Creation", "Gaming", "Esports", "Anime", "Movies",
    "Music", "Podcasts", "Books", "Philosophy", "Psychology", "Fitness", "Health", "Sports"
  ];

  const toggleInterest = (interest: string) => {
    if (setSelectedInterests) {
      if (selectedInterests.includes(interest)) {
        setSelectedInterests(selectedInterests.filter((i: string) => i !== interest));
      } else {
        setSelectedInterests([...selectedInterests, interest]);
      }
    }
  };


  if (!showSettings && !isSettingsAnimating) return null;

  const modalContent = (
                      <div
                        className={`fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-xl px-4 ${showSettings ? (isSettingsAnimating ? 'settings-backdrop-enter' : '') : 'settings-backdrop-exit'
                          }`}
                        onMouseDown={() => {
                          if (showOnboarding) return;
                          setIsSettingsAnimating(true);
                          setTimeout(() => setShowSettings(false), 600);
                        }}
                      >
                        <div
                          className={`w-full max-w-[390px] max-h-[88vh] flex flex-col rounded-[32px] transition-all duration-300 ${
                            settingsGlassTheme === "quantum"
                              ? "border border-cyan-500/30 bg-gradient-to-b from-slate-900/60 via-slate-950/75 to-[#030712]/90 backdrop-blur-3xl p-5 text-[12px] text-white shadow-[0_0_50px_rgba(6,182,212,0.18),0_25px_70px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.4),inset_0_0_30px_rgba(6,182,212,0.08)] ring-1 ring-cyan-400/25"
                              : "border border-white/20 bg-gradient-to-b from-white/[0.12] via-slate-900/40 to-slate-950/60 backdrop-blur-3xl p-5 text-[12px] text-white shadow-[0_25px_70px_rgba(0,0,0,0.6),inset_0_1px_1.5px_rgba(255,255,255,0.4),inset_0_0_30px_rgba(255,255,255,0.03)] ring-1 ring-white/10"
                          } ${showSettings ? (isSettingsAnimating ? 'settings-modal-enter' : '') : 'settings-modal-exit'}`}
                          style={{
                            boxShadow: isSettingsAnimating
                              ? (settingsGlassTheme === "quantum" ? '0 0 70px rgba(6, 182, 212, 0.35), 0 30px 60px -12px rgba(0, 0, 0, 0.8)' : '0 0 60px rgba(255, 255, 255, 0.2), 0 30px 60px -12px rgba(0, 0, 0, 0.6)')
                              : (settingsGlassTheme === "quantum" ? '0 0 40px rgba(6, 182, 212, 0.15), 0 30px 60px -12px rgba(0, 0, 0, 0.8)' : '0 30px 60px -12px rgba(0, 0, 0, 0.6)')
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          {/* Navigation Header with Dual-Theme Glass Switcher */}
                          <div className={`shrink-0 space-y-2 pb-3 border-b transition-all duration-300 ${
                            settingsGlassTheme === "quantum" ? "border-cyan-500/20" : "border-white/[0.12]"
                          }`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <span className="relative flex h-2.5 w-2.5">
                                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                                    settingsGlassTheme === "quantum" ? "bg-cyan-400" : "bg-white"
                                  }`} />
                                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                                    settingsGlassTheme === "quantum" ? "bg-cyan-400 shadow-[0_0_10px_#22d3ee]" : "bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]"
                                  }`} />
                                </span>
                                <span className={`text-sm font-black tracking-[0.22em] uppercase transition-all duration-300 ${
                                  settingsGlassTheme === "quantum"
                                    ? "bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]"
                                    : "text-white drop-shadow-sm font-semibold tracking-tight"
                                }`}>
                                  Settings
                                </span>
                              </div>

                              {/* Action Buttons: Bespoke Animated Glass Aperture Switcher + Close */}
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={toggleSettingsGlassTheme}
                                  className={`group relative flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur-2xl transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 active:scale-90 ${
                                    settingsGlassTheme === "quantum"
                                      ? "border-cyan-400/40 bg-cyan-950/50 hover:bg-cyan-500/20 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4),inset_0_1px_1px_rgba(255,255,255,0.35)] ring-1 ring-cyan-400/25"
                                      : "border-white/25 bg-white/15 hover:bg-white/25 text-white shadow-[0_2px_12px_rgba(0,0,0,0.25),inset_0_1px_1.5px_rgba(255,255,255,0.5)] ring-1 ring-white/20"
                                  }`}
                                  title={settingsGlassTheme === "quantum" ? "Switch to Apple Crystal Glass" : "Switch to iOS 27 Quantum Glass"}
                                  aria-label="Toggle Spatial Glass Theme"
                                >
                                  {/* Ambient Shimmer Core */}
                                  <span className={`absolute inset-0 rounded-full opacity-40 blur-sm transition-all duration-500 group-hover:opacity-80 ${
                                    settingsGlassTheme === "quantum" ? "bg-cyan-400" : "bg-white"
                                  }`} />

                                  {/* Dynamic Refractive Aperture Glyph */}
                                  <div className={`relative z-10 transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                                    settingsGlassTheme === "quantum" ? "rotate-0 scale-100" : "rotate-180 scale-100"
                                  }`}>
                                    {settingsGlassTheme === "quantum" ? (
                                      /* Quantum Flux Core Glyph */
                                      <svg className="h-4 w-4 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <circle cx="12" cy="12" r="9" strokeWidth="1.5" strokeDasharray="3 2" className="animate-spin-slow opacity-80" />
                                        <polygon points="12 3 20 12 12 21 4 12" strokeWidth="1.5" strokeLinejoin="round" fill="currentColor" fillOpacity="0.15" />
                                        <circle cx="12" cy="12" r="2.5" fill="currentColor" />
                                      </svg>
                                    ) : (
                                      /* Apple Optical Crystal Lens Glyph */
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
                                    setIsSettingsAnimating(true);
                                    setTimeout(() => {
                                      setShowSettings(false);
                                      setSettingsScreen("main");
                                    }, 300);
                                  }}
                                  className={`relative inline-flex items-center justify-center gap-1.5 rounded-full border backdrop-blur-2xl px-3.5 py-1.5 text-[11px] font-semibold transition-all active:scale-95 ${
                                    settingsGlassTheme === "quantum"
                                      ? "border-cyan-400/30 bg-cyan-950/40 hover:bg-cyan-500/25 text-cyan-200 hover:text-white shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                                      : "border-white/20 bg-white/[0.12] hover:bg-white/[0.22] text-white shadow-[0_2px_10px_rgba(0,0,0,0.2)]"
                                  }`}
                                  aria-label="Close settings"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                  <span>Close</span>
                                </button>
                              </div>
                            </div>

                            {settingsScreen !== "main" && (
                              <div className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-900/30 px-3 py-2">
                                <button
                                  type="button"
                                  onClick={() => setSettingsScreen("main")}
                                  className="text-[11px] font-medium text-cyan-200 hover:text-cyan-100"
                                >
                                  Back
                                </button>
                                <span className="text-[10px] text-slate-400">
                                  {settingsScreen === "name"
                                    ? "Edit name"
                                    : settingsScreen === "age"
                                      ? "Edit age"
                                      : settingsScreen === "gender"
                                        ? "Edit gender"
                                        : settingsScreen === "bio"
                                          ? "Edit bio"
                                          : "Edit interests"}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Scrollable Content Body - Native GPU Scroll-Timeline (120FPS Zero-Lag) */}
                          <div onScroll={handleSettingsScroll} className="flex-1 overflow-y-auto pr-1 py-3 space-y-3 scrollbar-hide apple-smooth-scroll tech-giant-scroll-container oneui-scroll-timeline-container [transform:translateZ(0)]">
                            {/* Account Section */}
                            <div className={`space-y-3 rounded-2xl p-4 backdrop-blur-2xl transition-all duration-300 ${
                            settingsGlassTheme === "quantum"
                              ? "border border-cyan-500/20 bg-gradient-to-b from-cyan-950/20 via-slate-900/35 to-slate-950/50 shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.18),inset_0_0_18px_rgba(6,182,212,0.05)] hover:border-cyan-400/40 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)]"
                              : "border border-white/[0.14] bg-gradient-to-b from-white/[0.08] to-white/[0.03] shadow-[0_4px_24px_rgba(0,0,0,0.18),inset_0_1px_1px_rgba(255,255,255,0.25)] hover:border-white/30 hover:from-white/[0.10]"
                          }`}>
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-medium text-slate-200">Account</span>
                                <span className="text-[11px] text-slate-300">ID</span>
                              </div>
                              <p className="text-[11px] text-slate-200">
                                Quantum ID: @{currentHandle || (session as any)?.user?.handle || "not-set"}
                              </p>
                              <p>
                                <span className="text-slate-400">Email:</span>{" "}
                                <span className="text-slate-200">
                                  {emailVisibility === "public"
                                    ? ((session as any)?.user?.email || "no-email-linked")
                                    : "Hidden"}
                                </span>
                              </p>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] text-slate-500">Email visibility</span>
                                <div className="inline-flex h-8 items-center rounded-full border border-cyan-500/30 bg-black/50 backdrop-blur-2xl p-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
                                  <button
                                    type="button"
                                    onClick={() => setEmailVisibility("private")}
                                    className={
                                      "rounded-full px-2.5 py-1 text-[10px] font-medium transition " +
                                      (emailVisibility === "private"
                                        ? "bg-slate-200 text-slate-950"
                                        : "text-slate-300 hover:text-slate-100")
                                    }
                                  >
                                    Private
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEmailVisibility("public")}
                                    className={
                                      "rounded-full px-2.5 py-1 text-[10px] font-medium transition " +
                                      (emailVisibility === "public"
                                        ? "bg-cyan-500/80 text-slate-950"
                                        : "text-slate-300 hover:text-slate-100")
                                    }
                                  >
                                    Public
                                  </button>
                                </div>
                              </div>
                            </div>

                          {/* Theme Toggle Section */}
                          <div className={`space-y-3 rounded-2xl p-4 backdrop-blur-2xl transition-all duration-300 ${
                            settingsGlassTheme === "quantum"
                              ? "border border-cyan-500/20 bg-gradient-to-b from-cyan-950/20 via-slate-900/35 to-slate-950/50 shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.18),inset_0_0_18px_rgba(6,182,212,0.05)] hover:border-cyan-400/40 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)]"
                              : "border border-white/[0.14] bg-gradient-to-b from-white/[0.08] to-white/[0.03] shadow-[0_4px_24px_rgba(0,0,0,0.18),inset_0_1px_1px_rgba(255,255,255,0.25)] hover:border-white/30 hover:from-white/[0.10]"
                          }`}>
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-medium text-slate-200">Appearance</span>
                              <span className="text-[11px] text-slate-300">Theme</span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] text-slate-500">Dark / Light mode</span>
                              <ThemeToggle />
                            </div>
                          </div>

                          {/* AI Assistant & Floating Button Toggle Section */}
                          <div className={`space-y-3 rounded-2xl p-4 backdrop-blur-2xl transition-all duration-300 ${
                            settingsGlassTheme === "quantum"
                              ? "border border-cyan-500/20 bg-gradient-to-b from-cyan-950/20 via-slate-900/35 to-slate-950/50 shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.18),inset_0_0_18px_rgba(6,182,212,0.05)] hover:border-cyan-400/40 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)]"
                              : "border border-white/[0.14] bg-gradient-to-b from-white/[0.08] to-white/[0.03] shadow-[0_4px_24px_rgba(0,0,0,0.18),inset_0_1px_1px_rgba(255,255,255,0.25)] hover:border-white/30 hover:from-white/[0.10]"
                          }`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-medium text-slate-200">AI Assistant Trigger</span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-semibold text-cyan-300 border border-cyan-500/40">
                                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                  Floating Button
                                </span>
                              </div>
                              <span className="text-[10px] text-cyan-300/80 font-mono">Q-AI Engine</span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] text-slate-400">Show circular AI assistant button & animations</span>
                              <div className="inline-flex h-8 items-center rounded-full border border-cyan-500/30 bg-black/50 backdrop-blur-2xl p-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (setManualStopAnimation) {
                                      setManualStopAnimation(true);
                                    }
                                    if (typeof window !== "undefined") {
                                      localStorage.setItem("qlink_manual_stop_ai_animation", "true");
                                    }
                                    setIsAIArrowButtonVisible?.(false);
                                    setShowAIHelpButton?.(false);
                                  }}
                                  className={
                                    "rounded-full px-2.5 py-1 text-[10px] font-medium transition " +
                                    (manualStopAnimation
                                      ? "bg-slate-200 text-slate-950 shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                                      : "text-slate-300 hover:text-slate-100")
                                  }
                                >
                                  Off
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (setManualStopAnimation) {
                                      setManualStopAnimation(false);
                                    }
                                    if (typeof window !== "undefined") {
                                      localStorage.setItem("qlink_manual_stop_ai_animation", "false");
                                    }
                                    setIsAIArrowButtonVisible?.(true);
                                  }}
                                  className={
                                    "rounded-full px-2.5 py-1 text-[10px] font-medium transition " +
                                    (!manualStopAnimation
                                      ? "bg-cyan-500/80 text-slate-950 shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                                      : "text-slate-300 hover:text-slate-100")
                                  }
                                >
                                  On
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Hardware & GPU Performance Tier Section */}
                          <PerformanceSettingsCard isQuantum={settingsGlassTheme === 'quantum'} />

                          {/* Notifications Section — smart: Desktop vs PWA/Web */}
                          {isElectron ? (
                            /* ── ELECTRON DESKTOP: Native Windows Notifications Toggle ── */
                            <div className={`space-y-3 rounded-2xl p-4 backdrop-blur-2xl transition-all duration-300 ${
                            settingsGlassTheme === "quantum"
                              ? "border border-cyan-500/20 bg-gradient-to-b from-cyan-950/20 via-slate-900/35 to-slate-950/50 shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.18),inset_0_0_18px_rgba(6,182,212,0.05)] hover:border-cyan-400/40 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)]"
                              : "border border-white/[0.14] bg-gradient-to-b from-white/[0.08] to-white/[0.03] shadow-[0_4px_24px_rgba(0,0,0,0.18),inset_0_1px_1px_rgba(255,255,255,0.25)] hover:border-white/30 hover:from-white/[0.10]"
                          }`}>
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-medium text-slate-200">Desktop Notifications</span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-semibold text-blue-300 border border-blue-500/40">
                                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                  Native
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] text-slate-500">System alert toast on incoming message</span>
                                <div className="inline-flex h-8 items-center rounded-full border border-cyan-500/30 bg-black/50 backdrop-blur-2xl p-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
                                  <button
                                    type="button"
                                    onClick={() => toggleDesktopNotifications(false)}
                                    className={
                                      "rounded-full px-2.5 py-1 text-[10px] font-medium transition " +
                                      (!desktopNotificationsEnabled
                                        ? "bg-slate-200 text-slate-950 shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                                        : "text-slate-300 hover:text-slate-100")
                                    }
                                  >
                                    Off
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => toggleDesktopNotifications(true)}
                                    className={
                                      "rounded-full px-2.5 py-1 text-[10px] font-medium transition " +
                                      (desktopNotificationsEnabled
                                        ? "bg-cyan-500/80 text-slate-950 shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                                        : "text-slate-300 hover:text-slate-100")
                                    }
                                  >
                                    On
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* ── BROWSER / PWA: Web Push Notifications ── */
                            <div className={`space-y-3 rounded-2xl p-4 backdrop-blur-2xl transition-all duration-300 ${
                            settingsGlassTheme === "quantum"
                              ? "border border-cyan-500/20 bg-gradient-to-b from-cyan-950/20 via-slate-900/35 to-slate-950/50 shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.18),inset_0_0_18px_rgba(6,182,212,0.05)] hover:border-cyan-400/40 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)]"
                              : "border border-white/[0.14] bg-gradient-to-b from-white/[0.08] to-white/[0.03] shadow-[0_4px_24px_rgba(0,0,0,0.18),inset_0_1px_1px_rgba(255,255,255,0.25)] hover:border-white/30 hover:from-white/[0.10]"
                          }`}>
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-medium text-slate-200">PWA Notifications</span>
                                <span className="text-[11px] text-slate-300">Web Push 🔔</span>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] text-slate-500">Lock-screen chat alerts</span>
                                <div className="inline-flex h-8 items-center rounded-full border border-cyan-500/30 bg-black/50 backdrop-blur-2xl p-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
                                  <button
                                    type="button"
                                    onClick={() => togglePushNotifications(false)}
                                    className={
                                      "rounded-full px-2.5 py-1 text-[10px] font-medium transition " +
                                      (!isPushEnabled
                                        ? "bg-slate-200 text-slate-950 shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                                        : "text-slate-300 hover:text-slate-100")
                                    }
                                  >
                                    Off
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => togglePushNotifications(true)}
                                    className={
                                      "rounded-full px-2.5 py-1 text-[10px] font-medium transition " +
                                      (isPushEnabled
                                        ? "bg-cyan-500/80 text-slate-950 shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                                        : "text-slate-300 hover:text-slate-100")
                                    }
                                  >
                                    On
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* E2E Encryption Toggle Section */}
                          <div className={`space-y-3 rounded-2xl p-4 backdrop-blur-2xl transition-all duration-300 ${
                            settingsGlassTheme === "quantum"
                              ? "border border-cyan-500/20 bg-gradient-to-b from-cyan-950/20 via-slate-900/35 to-slate-950/50 shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.18),inset_0_0_18px_rgba(6,182,212,0.05)] hover:border-cyan-400/40 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)]"
                              : "border border-white/[0.14] bg-gradient-to-b from-white/[0.08] to-white/[0.03] shadow-[0_4px_24px_rgba(0,0,0,0.18),inset_0_1px_1px_rgba(255,255,255,0.25)] hover:border-white/30 hover:from-white/[0.10]"
                          }`}>
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-medium text-slate-200">E2E Encryption Shield</span>
                              <span className={`text-[11px] font-semibold transition ${isE2EEnabled ? "text-cyan-300" : "text-slate-400"}`}>
                                {isE2EEnabled ? "● Active" : "● Standard"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] text-slate-500">Standard mode is optimized for messaging performance</span>
                              <div className="inline-flex h-8 items-center rounded-full border border-cyan-500/30 bg-black/50 backdrop-blur-2xl p-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!isE2EEnabled) return;
                                    setIsE2EEnabled(false);
                                    playSciFiSound("off");
                                  }}
                                  className={
                                    "rounded-full px-2.5 py-1 text-[10px] font-medium transition " +
                                    (!isE2EEnabled
                                      ? "bg-slate-200 text-slate-950 shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                                      : "text-slate-300 hover:text-slate-100")
                                  }
                                >
                                  Off
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (isE2EEnabled) return;
                                    setIsE2EEnabled(true);
                                    playSciFiSound("on");
                                  }}
                                  className={
                                    "rounded-full px-2.5 py-1 text-[10px] font-medium transition " +
                                    (isE2EEnabled
                                      ? "bg-cyan-500/80 text-slate-950 shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                                      : "text-slate-300 hover:text-slate-100")
                                  }
                                >
                                  On
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className={`space-y-3 rounded-2xl p-4 backdrop-blur-2xl transition-all duration-300 ${
                            settingsGlassTheme === "quantum"
                              ? "border border-cyan-500/20 bg-gradient-to-b from-cyan-950/20 via-slate-900/35 to-slate-950/50 shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.18),inset_0_0_18px_rgba(6,182,212,0.05)] hover:border-cyan-400/40 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)]"
                              : "border border-white/[0.14] bg-gradient-to-b from-white/[0.08] to-white/[0.03] shadow-[0_4px_24px_rgba(0,0,0,0.18),inset_0_1px_1px_rgba(255,255,255,0.25)] hover:border-white/30 hover:from-white/[0.10]"
                          }`}>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                Profile
                              </span>
                              <span className="text-[10px] text-slate-500">Snapshot</span>
                            </div>
                            {settingsScreen === "main" && (
                              <div className="space-y-2">
                                <div
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => {
                                    setSettingsScreen("main");
                                    setShowOnboarding(true);
                                    setOnboardingStep(1);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key !== "Enter" && e.key !== " ") return;
                                    e.preventDefault();
                                    setSettingsScreen("main");
                                    setShowOnboarding(true);
                                    setOnboardingStep(1);
                                  }}
                                  className="flex w-full items-center justify-between rounded-xl border border-white/15 bg-white/[0.05] hover:bg-white/[0.09] backdrop-blur-xl px-3 py-2 text-left hover:border-white/30 transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                                >
                                  <span className="text-slate-300">Name</span>
                                  <span className="truncate text-slate-100">
                                    {displayName || nameDraft || (session as any)?.user?.name || "Not set"}
                                  </span>
                                </div>

                                <div
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => {
                                    setSettingsScreen("main");
                                    setShowOnboarding(true);
                                    setOnboardingStep(4);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key !== "Enter" && e.key !== " ") return;
                                    e.preventDefault();
                                    setSettingsScreen("main");
                                    setShowOnboarding(true);
                                    setOnboardingStep(4);
                                  }}
                                  className="flex w-full items-center justify-between rounded-xl border border-white/15 bg-white/[0.05] hover:bg-white/[0.09] backdrop-blur-xl px-3 py-2 text-left hover:border-white/30 transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                                >
                                  <span className="text-slate-300">Age</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-slate-100">
                                      {ageVisibility === "public" ? (age ?? "Not set") : "Hidden"}
                                    </span>
                                    <div
                                      className="inline-flex h-8 items-center rounded-full border border-cyan-500/30 bg-black/50 backdrop-blur-2xl p-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
                                      onMouseDown={(e) => e.stopPropagation()}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <button
                                        type="button"
                                        onClick={() => setAgeVisibility("private")}
                                        className={
                                          "rounded-full px-2 py-0.5 text-[10px] font-medium transition " +
                                          (ageVisibility === "private"
                                            ? "bg-slate-200 text-slate-950"
                                            : "text-slate-300 hover:text-slate-100")
                                        }
                                      >
                                        Private
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setAgeVisibility("public")}
                                        className={
                                          "rounded-full px-2 py-0.5 text-[10px] font-medium transition " +
                                          (ageVisibility === "public"
                                            ? "bg-cyan-500/80 text-slate-950"
                                            : "text-slate-300 hover:text-slate-100")
                                        }
                                      >
                                        Public
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                <div
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => {
                                    setSettingsScreen("main");
                                    setShowOnboarding(true);
                                    setOnboardingStep(5);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key !== "Enter" && e.key !== " ") return;
                                    e.preventDefault();
                                    setSettingsScreen("main");
                                    setShowOnboarding(true);
                                    setOnboardingStep(5);
                                  }}
                                  className="flex w-full items-center justify-between rounded-xl border border-white/15 bg-white/[0.05] hover:bg-white/[0.09] backdrop-blur-xl px-3 py-2 text-left hover:border-white/30 transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                                >
                                  <span className="text-slate-300">Gender</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-slate-100">
                                      {genderVisibility === "public" ? (gender || "Not set") : "Hidden"}
                                    </span>
                                    <div
                                      className="inline-flex h-8 items-center rounded-full border border-cyan-500/30 bg-black/50 backdrop-blur-2xl p-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
                                      onMouseDown={(e) => e.stopPropagation()}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <button
                                        type="button"
                                        onClick={() => setGenderVisibility("private")}
                                        className={
                                          "rounded-full px-2 py-0.5 text-[10px] font-medium transition " +
                                          (genderVisibility === "private"
                                            ? "bg-slate-200 text-slate-950"
                                            : "text-slate-300 hover:text-slate-100")
                                        }
                                      >
                                        Private
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setGenderVisibility("public")}
                                        className={
                                          "rounded-full px-2 py-0.5 text-[10px] font-medium transition " +
                                          (genderVisibility === "public"
                                            ? "bg-cyan-500/80 text-slate-950"
                                            : "text-slate-300 hover:text-slate-100")
                                        }
                                      >
                                        Public
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                <div
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => {
                                    setSettingsScreen("main");
                                    setShowOnboarding(true);
                                    setOnboardingStep(3);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key !== "Enter" && e.key !== " ") return;
                                    e.preventDefault();
                                    setSettingsScreen("main");
                                    setShowOnboarding(true);
                                    setOnboardingStep(3);
                                  }}
                                  className="flex w-full items-center justify-between rounded-xl border border-white/15 bg-white/[0.05] hover:bg-white/[0.09] backdrop-blur-xl px-3 py-2 text-left hover:border-white/30 transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                                >
                                  <span className="text-slate-300">Bio</span>
                                  <div className="flex items-center gap-2">
                                    <span className="truncate text-slate-100">
                                      {bioVisibility === "public" ? (bioDraft.trim() || "No bio added yet.") : "Hidden"}
                                    </span>
                                    <div
                                      className="inline-flex h-8 items-center rounded-full border border-cyan-500/30 bg-black/50 backdrop-blur-2xl p-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
                                      onMouseDown={(e) => e.stopPropagation()}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <button
                                        type="button"
                                        onClick={() => setBioVisibility("private")}
                                        className={
                                          "rounded-full px-2 py-0.5 text-[10px] font-medium transition " +
                                          (bioVisibility === "private"
                                            ? "bg-slate-200 text-slate-950"
                                            : "text-slate-300 hover:text-slate-100")
                                        }
                                      >
                                        Private
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setBioVisibility("public")}
                                        className={
                                          "rounded-full px-2 py-0.5 text-[10px] font-medium transition " +
                                          (bioVisibility === "public"
                                            ? "bg-cyan-500/80 text-slate-950"
                                            : "text-slate-300 hover:text-slate-100")
                                        }
                                      >
                                        Public
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                <div
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => {
                                    setSettingsScreen("main");
                                    setShowOnboarding(true);
                                    setOnboardingStep(2);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key !== "Enter" && e.key !== " ") return;
                                    e.preventDefault();
                                    setSettingsScreen("main");
                                    setShowOnboarding(true);
                                    setOnboardingStep(2);
                                  }}
                                  className="flex w-full items-center justify-between rounded-xl border border-white/15 bg-white/[0.05] hover:bg-white/[0.09] backdrop-blur-xl px-3 py-2 text-left hover:border-white/30 transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                                >
                                  <span className="text-slate-300">Interested fields</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-slate-100">
                                      {interestsVisibility === "public"
                                        ? (selectedInterests.length > 0
                                          ? `${selectedInterests.length} selected`
                                          : "None selected")
                                        : "Hidden"}
                                    </span>
                                    <div
                                      className="inline-flex h-8 items-center rounded-full border border-cyan-500/30 bg-black/50 backdrop-blur-2xl p-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
                                      onMouseDown={(e) => e.stopPropagation()}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <button
                                        type="button"
                                        onClick={() => setInterestsVisibility("private")}
                                        className={
                                          "rounded-full px-2 py-0.5 text-[10px] font-medium transition " +
                                          (interestsVisibility === "private"
                                            ? "bg-slate-200 text-slate-950"
                                            : "text-slate-300 hover:text-slate-100")
                                        }
                                      >
                                        Private
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setInterestsVisibility("public")}
                                        className={
                                          "rounded-full px-2 py-0.5 text-[10px] font-medium transition " +
                                          (interestsVisibility === "public"
                                            ? "bg-cyan-500/80 text-slate-950"
                                            : "text-slate-300 hover:text-slate-100")
                                        }
                                      >
                                        Public
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {settingsScreen === "name" && (
                              <div className="space-y-2">
                                <label className="block text-[10px] text-slate-400">Display name</label>
                                <input
                                  value={nameDraft}
                                  onChange={(e) => setNameDraft(e.target.value)}
                                  className="w-full rounded-xl border border-slate-700/70 bg-slate-950/60 px-3 py-2 text-[11px] text-slate-100 outline-none focus:border-cyan-400/60"
                                  placeholder="Your name"
                                />
                                <div className="flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDisplayName(nameDraft.trim() || null);
                                      setNameDraft(nameDraft.trim());
                                      setSettingsScreen("main");
                                    }}
                                    className="rounded-xl border border-cyan-400/50 bg-cyan-500/10 px-3 py-2 text-[11px] font-medium text-cyan-200 hover:bg-cyan-500/20"
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            )}

                            {settingsScreen === "age" && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] text-slate-400">Age</span>
                                  <span className="text-[11px] text-slate-100">{age ?? "Not set"}</span>
                                </div>
                                <input
                                  type="range"
                                  min={13}
                                  max={80}
                                  value={age ?? 21}
                                  onChange={(e) => setAge(Number(e.target.value))}
                                  className="w-full accent-cyan-400"
                                />
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] text-slate-500">Visibility</span>
                                  <div className="inline-flex h-8 items-center rounded-full border border-cyan-500/30 bg-black/50 backdrop-blur-2xl p-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
                                    <button
                                      type="button"
                                      onClick={() => setAgeVisibility("private")}
                                      className={
                                        "rounded-full px-2 py-0.5 text-[10px] font-medium transition " +
                                        (ageVisibility === "private"
                                          ? "bg-slate-200 text-slate-950"
                                          : "text-slate-300 hover:text-slate-100")
                                      }
                                    >
                                      Private
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setAgeVisibility("public")}
                                      className={
                                        "rounded-full px-2 py-0.5 text-[10px] font-medium transition " +
                                        (ageVisibility === "public"
                                          ? "bg-cyan-500/80 text-slate-950"
                                          : "text-slate-300 hover:text-slate-100")
                                      }
                                    >
                                      Public
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {settingsScreen === "gender" && (
                              <div className="space-y-2">
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setGender("male")}
                                    className={
                                      "flex-1 rounded-xl border px-3 py-2 text-[11px] font-medium transition " +
                                      (gender === "male"
                                        ? "border-cyan-400/70 bg-cyan-500/10 text-cyan-200"
                                        : "border-slate-700/70 bg-slate-950/50 text-slate-200 hover:border-cyan-400/40")
                                    }
                                  >
                                    Male
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setGender("female")}
                                    className={
                                      "flex-1 rounded-xl border px-3 py-2 text-[11px] font-medium transition " +
                                      (gender === "female"
                                        ? "border-cyan-400/70 bg-cyan-500/10 text-cyan-200"
                                        : "border-slate-700/70 bg-slate-950/50 text-slate-200 hover:border-cyan-400/40")
                                    }
                                  >
                                    Female
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setGender("other")}
                                    className={
                                      "flex-1 rounded-xl border px-3 py-2 text-[11px] font-medium transition " +
                                      (gender === "other"
                                        ? "border-cyan-400/70 bg-cyan-500/10 text-cyan-200"
                                        : "border-slate-700/70 bg-slate-950/50 text-slate-200 hover:border-cyan-400/40")
                                    }
                                  >
                                    Other
                                  </button>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] text-slate-500">Visibility</span>
                                  <div className="inline-flex h-8 items-center rounded-full border border-cyan-500/30 bg-black/50 backdrop-blur-2xl p-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
                                    <button
                                      type="button"
                                      onClick={() => setGenderVisibility("private")}
                                      className={
                                        "rounded-full px-2 py-0.5 text-[10px] font-medium transition " +
                                        (genderVisibility === "private"
                                          ? "bg-slate-200 text-slate-950"
                                          : "text-slate-300 hover:text-slate-100")
                                      }
                                    >
                                      Private
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setGenderVisibility("public")}
                                      className={
                                        "rounded-full px-2 py-0.5 text-[10px] font-medium transition " +
                                        (genderVisibility === "public"
                                          ? "bg-cyan-500/80 text-slate-950"
                                          : "text-slate-300 hover:text-slate-100")
                                      }
                                    >
                                      Public
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {settingsScreen === "bio" && (
                              <div className="space-y-2">
                                <label className="block text-[10px] text-slate-400">Bio</label>
                                <textarea
                                  value={bioDraft}
                                  onChange={(e) => setBioDraft(e.target.value)}
                                  rows={4}
                                  className="w-full rounded-xl border border-slate-700/70 bg-slate-950/60 px-3 py-2 text-[11px] text-slate-100 outline-none focus:border-cyan-400/60"
                                  placeholder="Write a short bio"
                                />
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] text-slate-500">Visibility</span>
                                  <div className="inline-flex h-8 items-center rounded-full border border-cyan-500/30 bg-black/50 backdrop-blur-2xl p-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
                                    <button
                                      type="button"
                                      onClick={() => setBioVisibility("private")}
                                      className={
                                        "rounded-full px-2 py-0.5 text-[10px] font-medium transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] will-change-transform " +
                                        (bioVisibility === "private"
                                          ? "bg-gradient-to-r from-slate-100 to-slate-300 text-slate-950 scale-105 shadow-lg shadow-slate-500/30 ring-2 ring-slate-400/50"
                                          : "text-slate-300 hover:text-slate-100 hover:scale-105 hover:bg-slate-800/50")
                                      }
                                    >
                                      Private
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setBioVisibility("public")}
                                      className={
                                        "rounded-full px-2 py-0.5 text-[10px] font-medium transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] will-change-transform " +
                                        (bioVisibility === "public"
                                          ? "bg-gradient-to-r from-cyan-400 to-cyan-600 text-slate-950 scale-105 shadow-lg shadow-cyan-500/40 ring-2 ring-cyan-400/50"
                                          : "text-slate-300 hover:text-cyan-200 hover:scale-105 hover:bg-cyan-950/30")
                                      }
                                    >
                                      Public
                                    </button>
                                  </div>
                                </div>
                                <div className="flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setBioDraft(bioDraft);
                                      setSettingsScreen("main");
                                    }}
                                    className="rounded-xl border border-cyan-400/50 bg-cyan-500/10 px-3 py-2 text-[11px] font-medium text-cyan-200 transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-cyan-500/20 hover:scale-102 hover:shadow-md hover:shadow-cyan-500/20 active:scale-98"
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            )}

                            {settingsScreen === "interests" && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] text-slate-400">Select your interests</span>
                                  <span className="text-[10px] text-slate-500">{selectedInterests.length} selected</span>
                                </div>
                                <div className="max-h-56 overflow-y-auto scrollbar-hide space-y-1">
                                  {interestsCategories.map((interest) => (
                                    <button
                                      type="button"
                                      key={interest}
                                      onClick={() => toggleInterest(interest)}
                                      className={
                                        "w-full text-left rounded-lg px-3 py-2 text-[11px] border transition " +
                                        (selectedInterests.includes(interest)
                                          ? "bg-cyan-500/10 text-cyan-200 border-cyan-400/40"
                                          : "bg-slate-950/40 text-slate-200 border-slate-800/60 hover:border-cyan-400/30")
                                      }
                                    >
                                      {interest}
                                    </button>
                                  ))}
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] text-slate-500">Visibility</span>
                                  <div className="inline-flex h-8 items-center rounded-full border border-cyan-500/30 bg-black/50 backdrop-blur-2xl p-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
                                    <button
                                      type="button"
                                      onClick={() => setInterestsVisibility("private")}
                                      className={
                                        "rounded-full px-2 py-0.5 text-[10px] font-medium transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] will-change-transform " +
                                        (interestsVisibility === "private"
                                          ? "bg-gradient-to-r from-slate-100 to-slate-300 text-slate-950 scale-105 shadow-lg shadow-slate-500/30 ring-2 ring-slate-400/50"
                                          : "text-slate-300 hover:text-slate-100 hover:scale-105 hover:bg-slate-800/50")
                                      }
                                    >
                                      Private
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setInterestsVisibility("public")}
                                      className={
                                        "rounded-full px-2 py-0.5 text-[10px] font-medium transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] will-change-transform " +
                                        (interestsVisibility === "public"
                                          ? "bg-gradient-to-r from-cyan-400 to-cyan-600 text-slate-950 scale-105 shadow-lg shadow-cyan-500/40 ring-2 ring-cyan-400/50"
                                          : "text-slate-300 hover:text-cyan-200 hover:scale-105 hover:bg-cyan-950/30")
                                      }
                                    >
                                      Public
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                            {/* {/* About Q-Link & Micro-Features Showcase Section - Samsung One UI 8.5 Smooth CSS Variable Scroll Interpolation */}
                            <div ref={cardRef} className="oneui-scroll-card-wrapper">
                              <div className="rounded-2xl border border-white/10 bg-slate-950/40 backdrop-blur-2xl p-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.36),inset_0_1px_1px_0_rgba(255,255,255,0.1)] ring-1 ring-white/5 space-y-3 transition-all duration-300 hover:border-cyan-400/30">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                      <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                                        <span className="text-white font-bold text-xs tracking-wider">QL</span>
                                      </div>
                                      <div>
                                        <h4 className="text-[12px] font-bold text-white flex items-center gap-1.5">
                                          Q-Link Platform
                                          <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                                            v3.0 Quantum
                                          </span>
                                        </h4>
                                        <p className="text-[10px] text-slate-400">
                                          Next-Gen Private Messaging &amp; Social Network
                                        </p>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setShowAboutFeatures(!showAboutFeatures)}
                                      className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                                    >
                                      {showAboutFeatures ? "Hide Details" : "View Features"}
                                    </button>
                                  </div>

                                  {/* Windows Desktop App Direct Link */}
                                  <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-2.5 flex items-center justify-between gap-2 transition-all duration-300 hover:border-cyan-400/40 hover:bg-cyan-950/30">
                                    <div className="min-w-0">
                                      <p className="text-[11px] font-semibold text-cyan-200">
                                        🖥️ Standalone Windows App (.exe)
                                      </p>
                                      <p className="text-[10px] text-slate-400 truncate">
                                        System Tray background mode &amp; zero-flicker alerts
                                      </p>
                                    </div>
                                    <a
                                      href="/downloads/Q-Link-Setup.exe"
                                      download="Q-Link-Setup.exe"
                                      className="shrink-0 rounded-lg bg-cyan-500 px-2.5 py-1 text-[10px] font-bold text-slate-950 hover:bg-cyan-400 transition-all shadow-[0_0_10px_rgba(6,182,212,0.3)] active:scale-95"
                                    >
                                      Download
                                    </a>
                                  </div>

                              {/* Micro-Features Grid */}
                              {showAboutFeatures && (
                                <div className="space-y-2.5 pt-2 border-t border-white/5 text-[10px] text-slate-300 animate-fade-in max-h-72 overflow-y-auto pr-1">
                                  {/* Category 1: Chat & Messaging */}
                                  <div className="space-y-1.5">
                                    <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">💬 Chat &amp; Messaging</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                      <div className="rounded-xl border border-white/5 bg-black/30 p-2">
                                        <p className="font-semibold text-cyan-300">⚡ Dynamic Recency Ranking</p>
                                        <p className="text-slate-400 text-[9px] leading-relaxed">Active and newly messaged chats instantly bubble to the top.</p>
                                      </div>
                                      <div className="rounded-xl border border-white/5 bg-black/30 p-2">
                                        <p className="font-semibold text-emerald-300">✓✓ Live Status Ticks</p>
                                        <p className="text-slate-400 text-[9px] leading-relaxed">Sent (1 tick), Delivered (2 grey), and Seen (2 glowing green).</p>
                                      </div>
                                      <div className="rounded-xl border border-white/5 bg-black/30 p-2">
                                        <p className="font-semibold text-sky-300">🎙️ Voice Memos</p>
                                        <p className="text-slate-400 text-[9px] leading-relaxed">One-tap audio recording with interactive waveform players.</p>
                                      </div>
                                      <div className="rounded-xl border border-white/5 bg-black/30 p-2">
                                        <p className="font-semibold text-purple-300">📍 Smart Scroll Memory</p>
                                        <p className="text-slate-400 text-[9px] leading-relaxed">Browses history without jumping, auto-snaps on new messages.</p>
                                      </div>
                                      <div className="rounded-xl border border-white/5 bg-black/30 p-2">
                                        <p className="font-semibold text-teal-300">⚡ Live Typing &amp; Presence</p>
                                        <p className="text-slate-400 text-[9px] leading-relaxed">Real-time online status dots and animated typing waves.</p>
                                      </div>
                                      <div className="rounded-xl border border-white/5 bg-black/30 p-2">
                                        <p className="font-semibold text-indigo-300">🔒 E2E Encrypted Chat</p>
                                        <p className="text-slate-400 text-[9px] leading-relaxed">Private direct messages with device-level protection.</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Category 2: Privacy & Storage */}
                                  <div className="space-y-1.5 pt-1 border-t border-white/5">
                                    <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">🛡️ Privacy &amp; Storage</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                      <div className="rounded-xl border border-white/5 bg-black/30 p-2">
                                        <p className="font-semibold text-amber-300">24-Hour Ephemeral Media</p>
                                        <p className="text-slate-400 text-[9px] leading-relaxed">Shared files &amp; photos self-delete after 24h to keep devices clean.</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Category 3: Emergency & Community */}
                                  <div className="space-y-1.5 pt-1 border-t border-white/5">
                                    <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">🚨 Emergency &amp; Community</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                      <div className="rounded-xl border border-white/5 bg-black/30 p-2">
                                        <p className="font-semibold text-rose-300">Q-BEACON Emergency Alert</p>
                                        <p className="text-slate-400 text-[9px] leading-relaxed">High-urgency siren chimes &amp; full-screen elevation for urgent alerts.</p>
                                      </div>
                                      <div className="rounded-xl border border-white/5 bg-black/30 p-2">
                                        <p className="font-semibold text-pink-300">Social Feed &amp; Reactions</p>
                                        <p className="text-slate-400 text-[9px] leading-relaxed">Community timeline with mentions (@), hashtags (#), and emojis.</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              </div>
                            </div>

                          {/* Fixed Footer */}
                          <div className="shrink-0 pt-3 border-t border-white/10 space-y-2">
                            <button
                              type="button"
                              onClick={() => {
                                setShowLogoutConfirm(true);
                              }}
                              className="w-full rounded-2xl border border-rose-500/40 bg-gradient-to-r from-rose-950/40 via-red-900/30 to-pink-950/40 hover:from-rose-600/30 hover:to-pink-600/30 backdrop-blur-2xl py-3 text-[12px] font-bold uppercase tracking-wider text-rose-300 hover:text-white shadow-[0_0_25px_rgba(244,63,94,0.2),inset_0_1px_1px_rgba(255,255,255,0.2)] active:scale-[0.98] transition-all"
                            >
                              Log out
                            </button>

                            <p className="text-center text-[10px] text-slate-400/80 font-medium">
                              Tap backdrop or Close button to exit
                            </p>
                          </div>
                        </div>

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
                                <p className="text-[11px] font-semibold text-slate-100">
                                  Log out of Quantum Chat?
                                </p>
                                <p className="text-[10px] text-slate-400">
                                  You will be signed out on this device. You can log back in anytime.
                                </p>
                              </div>

                              <div className="flex items-center justify-end gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => setShowLogoutConfirm(false)}
                                  className="rounded-xl border border-slate-600/70 bg-slate-900/80 px-3 py-2 text-[11px] font-medium text-slate-200 transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] hover:border-cyan-400/70 hover:text-cyan-200 hover:scale-102 hover:shadow-md hover:shadow-cyan-500/20 active:scale-98"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowLogoutConfirm(false);
                                    setShowSettings(false);
                                    handleSignOut();
                                  }}
                                  className="rounded-xl border border-rose-500/80 bg-rose-500/15 px-3 py-2 text-[11px] font-medium text-rose-100 transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-rose-500/25 hover:scale-102 hover:shadow-md hover:shadow-rose-500/20 active:scale-98"
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
