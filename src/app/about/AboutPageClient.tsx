"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import "./about.css";

export default function AboutPageClient() {
  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isPwaInstallable, setIsPwaInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsPwaInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    if (typeof window !== "undefined") {
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
      if (isStandalone) {
        setIsPwaInstallable(false);
      }
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setIsPwaInstallable(false);
      }
    } else {
      alert(
        "To install Q-Link as a Web App:\n\n" +
        "• Desktop (Chrome/Edge): Click the Install icon in the browser address bar.\n" +
        "• Mobile (Android/iOS): Tap the browser menu and select 'Add to Home Screen' or 'Install App'."
      );
    }
  };

  return (
    <div className="relative min-h-screen bg-[#060a0f] text-slate-100 overflow-x-hidden font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Subtle Top Ambient Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[280px] bg-gradient-to-b from-cyan-500/10 via-blue-600/5 to-transparent blur-3xl pointer-events-none" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#060a0f]/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.35)]">
            <span className="font-mono font-black text-slate-950 text-sm tracking-tight">Q</span>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wider text-white uppercase">Q-Link</h1>
            <p className="text-[9px] text-slate-400 font-mono tracking-wide uppercase">Version 3.0 Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/llms.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-cyan-300 transition-colors"
          >
            <span>AI Knowledge File</span>
            <span className="text-[10px] text-slate-500">↗</span>
          </a>
          <Link
            href="/"
            className="relative inline-flex items-center justify-center rounded-xl border border-cyan-500/40 bg-cyan-500/15 hover:bg-cyan-500/25 px-4 py-1.5 text-xs font-semibold text-cyan-200 transition-all duration-200 hover:shadow-[0_0_20px_rgba(6,182,212,0.25)]"
          >
            Launch Web App
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-20 relative z-30">
        
        {/* Hero Section */}
        <section className="text-center space-y-6 max-w-3xl mx-auto pt-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/30 px-4 py-1.5 text-xs font-medium text-cyan-300 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            Next-Gen Real-Time Messaging & Social Platform
          </div>
          
          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight text-white">
            Fast, Private & Modern Communication for Web & Desktop
          </h2>
          
          <p className="text-sm md:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
            Q-Link combines high-performance real-time messaging, smart contact ranking, self-cleaning media storage, and a native Windows desktop client with smooth glassmorphism aesthetics.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 text-xs font-bold tracking-wide shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all active:scale-95"
            >
              Launch Web App
            </Link>
            <a
              href="#downloads"
              className="px-6 py-3 rounded-xl border border-slate-700/80 bg-slate-900/60 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-all hover:border-slate-600 active:scale-95"
            >
              Download Windows Client (.exe)
            </a>
          </div>
        </section>

        {/* Download & Installation Section */}
        <section id="downloads" className="p-6 md:p-8 rounded-3xl border border-white/10 bg-slate-950/60 backdrop-blur-2xl max-w-5xl mx-auto space-y-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <div className="text-center md:text-left space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">Downloads & Platforms</h4>
            <p className="text-xl md:text-2xl font-bold text-white">Choose How You Connect</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Windows App Download */}
            <div className="p-5 rounded-2xl bg-slate-900/40 border border-white/5 flex flex-col justify-between space-y-4 hover:border-cyan-500/30 transition-all">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-cyan-400">
                  <span className="font-bold text-sm md:text-base">🖥️ Standalone Windows Desktop App</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Best for Windows 10 & 11 stations. Features high-performance native execution, Quantum Points (QP) sync, and instant taskbar notification badges.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <a
                  href="/downloads/Q-Link-Setup.exe"
                  download="Q-Link-Setup.exe"
                  className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Setup .exe
                </a>
                <p className="text-[10px] text-slate-500 text-center font-mono">Compatible with Windows 10 / 11 (64-bit)</p>
              </div>
            </div>

            {/* PWA App Download */}
            <div className="p-5 rounded-2xl bg-slate-900/40 border border-white/5 flex flex-col justify-between space-y-4 hover:border-cyan-500/30 transition-all">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-cyan-400">
                  <span className="font-bold text-sm md:text-base">📱 Progressive Web App (PWA)</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Install Q-Link directly on Android, iOS (Safari), macOS, Linux, or in any modern browser without downloading executable files.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleInstallPwa}
                  className="w-full py-2.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-200 text-xs font-bold tracking-wider flex items-center justify-center gap-2 transition-all"
                >
                  Install Web App Shortcut
                </button>
                <p className="text-[10px] text-slate-500 text-center font-mono">Works on Chrome, Safari, Edge, Firefox</p>
              </div>
            </div>
          </div>
        </section>

        {/* Complete Features Catalog (from llms.txt) */}
        <section id="features" className="space-y-8 max-w-5xl mx-auto">
          <div className="text-center space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-400 font-mono">Features Overview</h3>
            <p className="text-2xl md:text-3xl font-bold text-white">Everything Q-Link Offers</p>
            <p className="text-xs text-slate-400 max-w-xl mx-auto">
              A comprehensive breakdown of all features, privacy tools, and performance controls.
            </p>
          </div>

          <div className="space-y-6">
            {/* 1. Chat & Messaging */}
            <div className="p-6 rounded-2xl border border-white/10 bg-slate-950/40 backdrop-blur-xl space-y-4">
              <div className="flex items-center gap-2.5 border-b border-white/5 pb-3">
                <span className="text-lg">💬</span>
                <div>
                  <h4 className="text-sm font-bold text-white">Direct Messaging & Chat Ergonomics</h4>
                  <p className="text-xs text-slate-400">Fast, responsive messaging with real-time feedback</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
                  <p className="font-semibold text-cyan-300 text-xs">⚡ Dynamic Contact Ranking</p>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Active conversations and friends you recently messaged automatically bubble to the top of your list in real time.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
                  <p className="font-semibold text-emerald-300 text-xs">✓✓ Live Status Ticks</p>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Clear WhatsApp-style indicators: Sent (single tick), Delivered (double grey), and Seen (glowing double green).
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
                  <p className="font-semibold text-sky-300 text-xs">🎙️ Voice Memos & Waveform Player</p>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    One-tap high-clarity voice note recording with interactive waveform playback controls.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
                  <p className="font-semibold text-purple-300 text-xs">📜 Smart Scroll Memory</p>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Preserves your reading position when browsing older messages without jumping, and auto-snaps to new incoming messages.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
                  <p className="font-semibold text-teal-300 text-xs">🌊 Live Typing Waves & Online Dots</p>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Real-time visual typing waves and subtle green presence dots indicate when contacts are active.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
                  <p className="font-semibold text-indigo-300 text-xs">🔒 End-to-End Encryption Mode</p>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Private direct messaging toggle with client-side key protection for confidential conversations.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Privacy & Ephemeral Media */}
            <div className="p-6 rounded-2xl border border-white/10 bg-slate-950/40 backdrop-blur-xl space-y-4">
              <div className="flex items-center gap-2.5 border-b border-white/5 pb-3">
                <span className="text-lg">⏳</span>
                <div>
                  <h4 className="text-sm font-bold text-white">Privacy & Storage Cleanliness</h4>
                  <p className="text-xs text-slate-400">Lightweight device storage and user data protection</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
                  <p className="font-semibold text-amber-300 text-xs">24-Hour Ephemeral Media</p>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Shared photos and media attachments automatically clean up after 24 hours to prevent device bloat and protect privacy.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
                  <p className="font-semibold text-amber-300 text-xs">Zero Cloud Data Bloat</p>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Automatic background cleanup prevents cluttered server files and old attachment caches.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
                  <p className="font-semibold text-amber-300 text-xs">Granular Privacy Toggles</p>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Independently set your Email, Bio, Age, Gender, and Interests to Public or Private.
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Emergency & Social Discovery */}
            <div className="p-6 rounded-2xl border border-white/10 bg-slate-950/40 backdrop-blur-xl space-y-4">
              <div className="flex items-center gap-2.5 border-b border-white/5 pb-3">
                <span className="text-lg">🚨</span>
                <div>
                  <h4 className="text-sm font-bold text-white">Emergency Alerts & Community Discovery</h4>
                  <p className="text-xs text-slate-400">Critical notifications and social timeline</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
                  <p className="font-semibold text-rose-300 text-xs">Q-BEACON Priority Emergency Protocol</p>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    High-urgency emergency alert flash with distinct audible siren chimes and full-screen elevation for urgent situations.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
                  <p className="font-semibold text-pink-300 text-xs">Community Social Feed</p>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Post updates with formatted user mentions (@handle), hashtags (#topics), and rich emoji reactions.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
                  <p className="font-semibold text-blue-300 text-xs">Global Directory & Aura Ranks</p>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Search users by interest, discover friends, and view verified Blue Tick / Founder Red Tick badges.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
                  <p className="font-semibold text-fuchsia-300 text-xs">VIP Diamond & Sapphire Profile Cards</p>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Interactive digital cards with metallic sheens and looping canvas art for VIP members.
                  </p>
                </div>
              </div>
            </div>

            {/* 4. Desktop & Performance */}
            <div className="p-6 rounded-2xl border border-white/10 bg-slate-950/40 backdrop-blur-xl space-y-4">
              <div className="flex items-center gap-2.5 border-b border-white/5 pb-3">
                <span className="text-lg">⚡</span>
                <div>
                  <h4 className="text-sm font-bold text-white">Desktop Ecosystem & Performance</h4>
                  <p className="text-xs text-slate-400">Native Windows integration and hardware controls</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
                  <p className="font-semibold text-cyan-300 text-xs">💎 Quantum Points (QP) &amp; Aura Engine</p>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Earn QP points through genuine conversations and community activity to boost your global Aura % and unlock VIP perks.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
                  <p className="font-semibold text-emerald-300 text-xs">Hardware GPU Performance Control</p>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Switch between 60fps Ultra High Performance (full glassmorphism effects) and Battery Saver mode.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works (Clean User Guide) */}
        <section className="space-y-6 max-w-4xl mx-auto">
          <div className="text-center space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-400 font-mono">User Guide</h3>
            <p className="text-xl md:text-2xl font-bold text-white">Getting Started with Q-Link</p>
          </div>

          <div className="grid gap-4">
            <div className="p-5 rounded-2xl border border-white/5 bg-slate-950/40 space-y-1.5">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wide">01 // Quick Sign In & Handle Creation</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Sign in with your email to receive a secure One-Time Passcode (OTP), then choose your unique username handle (e.g., <code className="text-cyan-300">@username</code>).
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-white/5 bg-slate-950/40 space-y-1.5">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wide">02 // Connecting with Friends</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Use the search tab to find friends by their handle or interest tags. Send a connection request with an optional intro note. Once accepted, you can start chatting instantly.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-white/5 bg-slate-950/40 space-y-1.5">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wide">03 // Sending Messages & Voice Notes</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Send real-time text messages with delivery status ticks, record voice memos with the microphone button, or share photos with full-screen zoom and preview.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-white/5 bg-slate-950/40 space-y-1.5">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wide">04 // Message Deletion</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Right-click (or long-press on mobile) any message to delete it individually, or click &quot;Select&quot; to batch delete multiple messages at once.
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* Clean Modern Footer */}
      <footer className="border-t border-white/10 py-10 px-6 text-center space-y-3 bg-slate-950/40">
        <p className="text-xs text-slate-400 font-mono tracking-wide">
          Q-Link Platform &copy; {new Date().getFullYear()} — Built for Fast, Private Communication.
        </p>
        <div className="flex justify-center gap-6 text-xs font-medium text-slate-400">
          <Link href="/" className="hover:text-cyan-400 transition-colors">Launch App</Link>
          <span>•</span>
          <a href="/llms.txt" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">llms.txt</a>
          <span>•</span>
          <a href="https://github.com/rohiterrors-ship-it/Q-Link_v3.0" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">GitHub</a>
        </div>
      </footer>

    </div>
  );
}
