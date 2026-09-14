"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import "./about.css";

// Official Verified Social Links (Logo Icons Only)
const SOCIAL_LINKS = [
  {
    id: "x-official",
    title: "Official Platform",
    handle: "@qlinkplatform",
    url: "https://x.com/qlinkplatform",
    icon: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    badge: "Official X",
    accent: "hover:text-cyan-400 hover:border-cyan-500/40 hover:shadow-[0_0_25px_rgba(6,182,212,0.3)]",
  },
  {
    id: "x-founder",
    title: "Founder",
    handle: "@Bace_Labe",
    url: "https://x.com/Bace_Labe",
    icon: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    badge: "Founder X",
    accent: "hover:text-violet-400 hover:border-violet-500/40 hover:shadow-[0_0_25px_rgba(139,92,246,0.3)]",
  },
  {
    id: "x-engineer",
    title: "Lead Architect",
    handle: "@GhorKamanSaaS",
    url: "https://x.com/GhorKamanSaaS",
    icon: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    badge: "Lead Engineer X",
    accent: "hover:text-blue-400 hover:border-blue-500/40 hover:shadow-[0_0_25px_rgba(59,130,246,0.3)]",
  },
  {
    id: "youtube",
    title: "Tech Briefings",
    handle: "@Aexon.AITech",
    url: "https://www.youtube.com/@Aexon.AITech",
    icon: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    badge: "YouTube",
    accent: "hover:text-red-400 hover:border-red-500/40 hover:shadow-[0_0_25px_rgba(239,68,68,0.3)]",
  },
  {
    id: "reddit",
    title: "Community Submissions",
    handle: "u/QLinkOfficial",
    url: "https://www.reddit.com/user/QLinkOfficial/submitted/?sort=hot",
    icon: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.56 12 8 12.56 8 13.25c0 .688.56 1.25 1.25 1.25.688 0 1.25-.562 1.25-1.25 0-.69-.562-1.25-1.25-1.25zm5.5 0c-.69 0-1.25.56-1.25 1.25 0 .688.56 1.25 1.25 1.25.688 0 1.25-.562 1.25-1.25 0-.69-.562-1.25-1.25-1.25zm-5.465 4.417a.364.364 0 0 0-.047.514 3.52 3.52 0 0 0 2.762 1.257c1.191 0 2.257-.533 2.762-1.257a.364.364 0 0 0-.047-.514.364.364 0 0 0-.514.047c-.387.555-1.238.96-2.201.96-.964 0-1.815-.405-2.202-.96a.364.364 0 0 0-.513-.047z" />
      </svg>
    ),
    badge: "Reddit",
    accent: "hover:text-amber-400 hover:border-amber-500/40 hover:shadow-[0_0_25px_rgba(245,158,11,0.3)]",
  },
];

export default function AboutPageClient() {
  // Interactive Simulator State
  const [quantumSeed, setQuantumSeed] = useState("Q-8F92-A41D-99C1");
  const [shredState, setShredState] = useState<"idle" | "shredding" | "shredded">("idle");
  const [copied, setCopied] = useState(false);

  // Corporate Trust Modals State
  const [activeTrustModal, setActiveTrustModal] = useState<"privacy" | "terms" | "canary" | null>(null);

  // PWA Install Prompt
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isPwaInstallable, setIsPwaInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsPwaInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsPwaInstallable(false);
      }
      setDeferredPrompt(null);
    }
  };

  const generateNewQuantumKey = () => {
    const chars = "0123456789ABCDEF";
    const segment = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    const newKey = `Q-${segment()}-${segment()}-${segment()}`;
    setQuantumSeed(newKey);
    setShredState("idle");
    setCopied(false);
  };

  const handleShred = () => {
    setShredState("shredding");
    setTimeout(() => {
      setQuantumSeed("0000-0000-0000-WIPED");
      setShredState("shredded");
    }, 450);
  };

  const copyKey = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(quantumSeed);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#070A13] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden font-sans">
      {/* Liquid Ambient Gaussian Mesh */}
      <div className="ambient-glow-cyan top-[-150px] left-[10%] animate-[floatSlow_12s_infinite_ease-in-out]" />
      <div className="ambient-glow-violet top-[30%] right-[5%] animate-[floatSlow_15s_infinite_ease-in-out]" />
      <div className="ambient-glow-emerald bottom-[25%] left-[20%] animate-[floatSlow_18s_infinite_ease-in-out]" />

      {/* Subtle Matrix Micro-Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:32px_32px] -z-10" />

      {/* Floating Apple-Style Frosted Navbar */}
      <header className="sticky top-6 z-50 max-w-6xl mx-auto px-4">
        <nav className="apple-glass-nav rounded-full px-5 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 p-[1px] shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center text-xs font-black tracking-tighter text-cyan-400 group-hover:scale-105 transition-transform">
                Q
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-wide text-white flex items-center gap-1.5">
                Q-Link <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">v3.0</span>
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-300">
            <a href="#vision" className="hover:text-white transition-colors">Vision</a>
            <a href="#architecture" className="hover:text-white transition-colors">Architecture</a>
            <a href="#simulator" className="hover:text-white transition-colors">Key Simulator</a>
            <a href="#comparison" className="hover:text-white transition-colors">Benchmark</a>
            <a href="#network-directory" className="hover:text-cyan-400 transition-colors">Corporate Directory</a>
          </div>

          <div className="flex items-center gap-3">
            {isPwaInstallable && (
              <button
                onClick={handleInstallPwa}
                className="hidden sm:flex text-xs font-medium px-3.5 py-1.5 rounded-full apple-glass-pill hover:bg-white/10 text-slate-200 transition-colors"
              >
                Install Client
              </button>
            )}
            <Link
              href="/"
              className="sheen-beam text-xs font-semibold px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Launch App
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 pt-20 pb-20">
        <div id="vision" className="text-center max-w-3xl mx-auto mb-20 scroll-mt-28">
          {/* Frosted Status Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full apple-glass-pill text-xs font-mono text-cyan-300 mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="w-2 h-2 rounded-full bg-emerald-400 -ml-4" />
            <span>ZERO-KNOWLEDGE ARCHITECTURE // 0 BYTES PERSISTED</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.08] luxury-text-silver">
            The Architecture of <br className="hidden sm:block" />
            <span className="luxury-text-cyan">Pure Human Privacy.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 font-normal leading-relaxed mb-10">
            Surveillance capitalism transformed communication into continuous biometric and behavioural harvesting.
            <strong className="text-slate-200 font-medium"> Q-Link</strong> re-engineers human connection: no phone numbers, no emails, no profiling algorithms, and zero server message persistence.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/"
              className="sheen-beam px-7 py-3.5 rounded-full bg-white text-slate-950 font-semibold text-sm shadow-[0_10px_30px_rgba(255,255,255,0.25)] hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <span>Enter Autonomous Network</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>

            <a
              href="#simulator"
              className="px-6 py-3.5 rounded-full apple-glass-pill hover:bg-white/[0.08] text-slate-200 text-sm font-medium transition-all"
            >
              Test Quantum Simulator
            </a>
          </div>
        </div>

        {/* Apple Keynote Metric Highlights */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-24">
          <div className="apple-glass-card rounded-2xl p-6 text-center">
            <div className="text-3xl sm:text-4xl font-black text-white font-mono mb-1">0 Bytes</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Central Data Storage</div>
          </div>
          <div className="apple-glass-card rounded-2xl p-6 text-center">
            <div className="text-3xl sm:text-4xl font-black text-cyan-400 font-mono mb-1">0 KYC</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">No Phone / No Email</div>
          </div>
          <div className="apple-glass-card rounded-2xl p-6 text-center">
            <div className="text-3xl sm:text-4xl font-black text-indigo-400 font-mono mb-1">&lt;15ms</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Real-Time Peer Pulse</div>
          </div>
          <div className="apple-glass-card rounded-2xl p-6 text-center">
            <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono mb-1">100%</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Client-Side Autonomy</div>
          </div>
        </div>

        {/* Section: Architectural Bento Grid */}
        <section id="architecture" className="mb-28 scroll-mt-28">
          <div className="text-center mb-14">
            <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-2">Foundation Blueprint</h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Engineered to Outlast Big Tech</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento 1: Large Span */}
            <div className="apple-glass-card md:col-span-2 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between">
              <div className="mb-6">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h4 className="text-2xl font-bold text-white mb-2">Quantum ID Cryptographic Identity</h4>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                  Traditional social apps register you by your SIM card or email, allowing advertisers and intelligence agencies to map your social graph. In Q-Link, your presence is derived from a randomized localized seed. No SMS verification, no password reset backdoors, zero attack surface.
                </p>
              </div>

              <div className="apple-glass-pill rounded-xl p-4 font-mono text-xs text-slate-300 flex items-center justify-between">
                <span className="text-slate-500">SEED:</span>
                <span className="text-cyan-300">0x7F...9A4E // AES-GCM + LOCAL KEYRING</span>
                <span className="text-emerald-400 font-semibold">VERIFIED</span>
              </div>
            </div>

            {/* Bento 2: Ephemeral Stream */}
            <div className="apple-glass-card rounded-3xl p-8 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Zero-Persistence TTL</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Every pulse, voice note, and media attachment carries an irreversible Time-To-Live. Once expired, bytes are mathematically overwritten and wiped from memory caches.
                </p>
              </div>
              <div className="mt-6 text-xs text-slate-500 font-mono">
                CLEANUP_CADENCE: REAL-TIME SWEEP
              </div>
            </div>

            {/* Bento 3: Dual-Mode Algorithmic Freedom */}
            <div className="apple-glass-card rounded-3xl p-8 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Dual-Stream Discovery</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Toggle seamlessly between the organic chronological peer network and the mathematically weighted &apos;For You&apos; EdgeRank decay formula—free from political censorship or ad boosters.
                </p>
              </div>
              <div className="mt-6 text-xs text-slate-500 font-mono">
                ALGO_SOURCE: AUDITABLE LOCAL LOGIC
              </div>
            </div>

            {/* Bento 4: Edge-Node Shield */}
            <div className="apple-glass-card md:col-span-2 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between">
              <div className="mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h4 className="text-2xl font-bold text-white mb-2">Edge-Level Anti-Abuse & Rate Limiting</h4>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                  Unlike corporate platforms that read every word of your private messages to flag &apos;violations&apos;, Q-Link applies sliding-window burst limiters and zero-leakage client-side filters. Spam is blocked without surrendering message privacy.
                </p>
              </div>

              <div className="apple-glass-pill rounded-xl p-4 font-mono text-xs text-slate-300 flex items-center justify-between">
                <span className="text-slate-500">SHIELD:</span>
                <span className="text-emerald-300">SLIDING-WINDOW 5/MIN BURST GUARD</span>
                <span className="text-cyan-400">ACTIVE</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Interactive Quantum Key Simulator */}
        <section id="simulator" className="mb-28 scroll-mt-28">
          <div className="apple-glass-card rounded-3xl p-8 sm:p-12 border border-white/10 relative overflow-hidden">
            <div className="max-w-2xl mb-8">
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-2 block">Live Interactive Test</span>
              <h3 className="text-3xl font-bold text-white mb-3">Cryptographic Key Simulator</h3>
              <p className="text-sm text-slate-400">
                Experience how your device creates, signs, and incinerates ephemeral credentials without sending a single byte to a central database.
              </p>
            </div>

            <div className="bg-slate-950/80 rounded-2xl border border-white/10 p-6 font-mono mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
                <div className="text-xs text-slate-500">ACTIVE QUANTUM SEED:</div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {shredState === "shredded" ? "SHREDDED" : "ENCRYPTED"}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    CLIENT MEMORY ONLY
                  </span>
                </div>
              </div>

              <div className="py-6 flex items-center justify-between gap-4 flex-wrap">
                <div className={`text-xl sm:text-2xl tracking-wider transition-all duration-300 ${shredState === "shredded" ? "text-red-400 line-through opacity-50" : "text-cyan-300 font-bold"}`}>
                  {quantumSeed}
                </div>
                <button
                  onClick={copyKey}
                  disabled={shredState === "shredded"}
                  className="px-3.5 py-1.5 rounded-lg apple-glass-pill text-xs font-sans text-slate-300 hover:text-white transition-colors"
                >
                  {copied ? "Copied!" : "Copy Seed"}
                </button>
              </div>

              <div className="text-[11px] text-slate-500 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
                <span>HASH ALGORITHM: SHA-256 / CURVE25519</span>
                <span>PERSISTENCE RISK: 0.00%</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={generateNewQuantumKey}
                className="px-5 py-2.5 rounded-xl apple-glass-pill hover:bg-white/10 text-xs font-semibold text-white transition-all"
              >
                Generate Fresh Seed
              </button>
              <button
                onClick={handleShred}
                disabled={shredState === "shredded"}
                className="px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-300 text-xs font-semibold transition-all disabled:opacity-40"
              >
                Instant Cryptographic Shred
              </button>
            </div>
          </div>
        </section>

        {/* Section: Tech Giant Benchmark Comparison */}
        <section id="comparison" className="mb-20 scroll-mt-28">
          <div className="text-center mb-14">
            <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-2">Transparent Standard</h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">The Privacy Paradigm Shift</h3>
          </div>

          <div className="apple-glass-card rounded-3xl overflow-hidden border border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="p-5 font-semibold text-slate-300">Feature Dimension</th>
                    <th className="p-5 font-semibold text-slate-400">Corporate Giants (Meta / X / TG)</th>
                    <th className="p-5 font-bold text-cyan-300 bg-cyan-500/[0.06]">Q-Link Protocol v3.0</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-normal text-slate-300">
                  <tr>
                    <td className="p-5 font-medium text-white">Identity Binding</td>
                    <td className="p-5 text-red-400/80">Phone Number, Email, Govt KYC</td>
                    <td className="p-5 font-semibold text-emerald-400 bg-cyan-500/[0.04]">Zero KYC • Mathematical Quantum ID</td>
                  </tr>
                  <tr>
                    <td className="p-5 font-medium text-white">Message Cloud Storage</td>
                    <td className="p-5 text-red-400/80">Permanent central database history</td>
                    <td className="p-5 font-semibold text-emerald-400 bg-cyan-500/[0.04]">0 Bytes (Ephemeral Self-Wiping TTL)</td>
                  </tr>
                  <tr>
                    <td className="p-5 font-medium text-white">Ad Tracking & Telemetry</td>
                    <td className="p-5 text-red-400/80">Ad identifiers, pixel brokers & tracking</td>
                    <td className="p-5 font-semibold text-emerald-400 bg-cyan-500/[0.04]">Zero Trackers • Zero Ads Forever</td>
                  </tr>
                  <tr>
                    <td className="p-5 font-medium text-white">Algorithm Transparency</td>
                    <td className="p-5 text-red-400/80">Blackbox rage-bait engagement silos</td>
                    <td className="p-5 font-semibold text-emerald-400 bg-cyan-500/[0.04]">Auditable Dual-Feed Chronological Stream</td>
                  </tr>
                  <tr>
                    <td className="p-5 font-medium text-white">Platform Access</td>
                    <td className="p-5 text-slate-400">App store silos & account gating</td>
                    <td className="p-5 font-semibold text-emerald-400 bg-cyan-500/[0.04]">Universal Web, PWA & Desktop Binary</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {/* TECH GIANT STANDARD CORPORATE MEGA FOOTER */}
      <footer id="network-directory" className="relative border-t border-white/10 bg-[#050811]/90 backdrop-blur-2xl pt-16 pb-12 overflow-hidden">
        {/* Subtle Ambient Top Border Sheen */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />

        <div className="max-w-6xl mx-auto px-4">
          {/* Top Tier: Brand Anchor, Protocol Health & Social Dock */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 pb-12 border-b border-white/10">
            <div className="max-w-md">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 p-[1px] shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                  <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center text-sm font-black text-cyan-400">
                    Q
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-white tracking-wide">Q-Link Protocol</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">v3.0 Sovereign</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                The decentralized, zero-data-retention communication network powered by Quantum IDs. Architected from first principles to guarantee private human connection without centralized corporate control.
              </p>
              
              {/* Protocol Health Live Badge */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full apple-glass-pill text-[11px] font-mono text-emerald-400 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>ALL PROTOCOL NODES OPERATIONAL • 0 BYTES LOGGED</span>
              </div>
            </div>

            {/* Official Social Handles Floating Dock (Logo Icons Only) */}
            <div className="flex flex-col items-start lg:items-end gap-3 w-full lg:w-auto">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                Official Verified Handles
              </div>
              
              {/* Apple-Style Glass Dock (Logo Icons Only) */}
              <div className="inline-flex items-center justify-center p-2.5 rounded-full apple-glass-dock border border-white/15 gap-3 shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
                {SOCIAL_LINKS.map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${item.title} (${item.handle})`}
                    className={`group relative p-3 rounded-full bg-white/[0.04] border border-white/10 text-slate-300 ${item.accent} transition-all duration-300 hover:scale-125 hover:-translate-y-1 active:scale-95`}
                  >
                    {/* SVG Icon */}
                    <div className="transition-transform duration-200">
                      {item.icon}
                    </div>

                    {/* Apple-Style Floating Tooltip */}
                    <div className="pointer-events-none absolute -top-11 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0 z-50">
                      <div className="apple-glass-pill px-3 py-1 rounded-lg text-[11px] font-sans font-medium text-white whitespace-nowrap shadow-2xl border border-white/20 bg-slate-950/90">
                        <span className="text-cyan-400 font-semibold">{item.badge}</span>: {item.handle}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Middle Tier: 5-Column Corporate Navigation Architecture */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 py-12 border-b border-white/10 text-xs">
            {/* Column 1: Product & Terminal */}
            <div className="flex flex-col gap-3">
              <h5 className="font-semibold text-white tracking-wider uppercase text-[11px] font-mono text-cyan-400">Platform</h5>
              <Link href="/" className="text-slate-400 hover:text-white transition-colors">Web Terminal</Link>
              <a href="#simulator" className="text-slate-400 hover:text-white transition-colors">Quantum ID Engine</a>
              <Link href="/about" className="text-slate-400 hover:text-white transition-colors">Platform Architecture</Link>
              {isPwaInstallable && (
                <button onClick={handleInstallPwa} className="text-left text-cyan-400 hover:text-cyan-300 transition-colors">Install Native PWA</button>
              )}
              <span className="text-slate-500 font-mono text-[10px]">Windows Binary (.exe)</span>
            </div>

            {/* Column 2: Cryptography & Security */}
            <div className="flex flex-col gap-3">
              <h5 className="font-semibold text-white tracking-wider uppercase text-[11px] font-mono text-indigo-400">Security</h5>
              <a href="#architecture" className="text-slate-400 hover:text-white transition-colors">Zero-Persistence Core</a>
              <span className="text-slate-400">Curve25519 & AES-GCM</span>
              <span className="text-slate-400">Edge Burst Rate Limiter</span>
              <button onClick={() => setActiveTrustModal("canary")} className="text-left text-slate-400 hover:text-cyan-400 transition-colors">No-Log Warranty Canary</button>
              <span className="text-slate-400">On-Device Content Shield</span>
            </div>

            {/* Column 3: Developers & Ecosystem */}
            <div className="flex flex-col gap-3">
              <h5 className="font-semibold text-white tracking-wider uppercase text-[11px] font-mono text-purple-400">Ecosystem</h5>
              <a href="/llms.txt" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors flex items-center gap-1">
                <span>llms.txt AI Feed</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-white/10 text-cyan-300">NEW</span>
              </a>
              <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">Sitemap XML</a>
              <a href="/robots.txt" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">Crawler Directives</a>
              <a href="https://github.com/rohiterrors-ship-it/Q-Link_v3.0" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">GitHub Repository</a>
              <span className="text-slate-500 font-mono text-[10px]">Audit Status: PASS</span>
            </div>

            {/* Column 4: Network & Team */}
            <div className="flex flex-col gap-3">
              <h5 className="font-semibold text-white tracking-wider uppercase text-[11px] font-mono text-emerald-400">Transmissions</h5>
              <a href="https://x.com/qlinkplatform" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-cyan-400 transition-colors">Official Dispatch (@qlinkplatform)</a>
              <a href="https://x.com/Bace_Labe" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-violet-400 transition-colors">Founder Notes (@Bace_Labe)</a>
              <a href="https://x.com/GhorKamanSaaS" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-400 transition-colors">Architect Log (@GhorKamanSaaS)</a>
              <a href="https://www.youtube.com/@Aexon.AITech" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-red-400 transition-colors">YouTube Video Briefings</a>
              <a href="https://www.reddit.com/user/QLinkOfficial/submitted/?sort=hot" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-amber-400 transition-colors">Reddit Discussions</a>
            </div>

            {/* Column 5: Trust & Constitution */}
            <div className="flex flex-col gap-3">
              <h5 className="font-semibold text-white tracking-wider uppercase text-[11px] font-mono text-rose-400">Trust Charter</h5>
              <button onClick={() => setActiveTrustModal("privacy")} className="text-left text-slate-400 hover:text-white transition-colors">Constitutional Privacy</button>
              <button onClick={() => setActiveTrustModal("terms")} className="text-left text-slate-400 hover:text-white transition-colors">Autonomous Terms</button>
              <span className="text-slate-400">100% Cookie-Free</span>
              <span className="text-slate-400">Anti-Monopoly Stance</span>
              <span className="text-emerald-400 font-mono text-[10px]">Zero Data Retention: ACTIVE</span>
            </div>
          </div>

          {/* Bottom Tier: Copyright & Compliance Disclaimer */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>&copy; 2026 Q-LINK PROTOCOL FOUNDATION. ALL RIGHTS RESERVED TO HUMAN PRIVACY.</span>
            </div>

            <div className="flex items-center gap-4 text-center sm:text-right">
              <span>ZERO TRACKING</span>
              <span>•</span>
              <span>ZERO TELEMETRY</span>
              <span>•</span>
              <span>PURE MATHEMATICS</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Interactive Corporate Trust Modals (Privacy / Terms / Canary) */}
      {activeTrustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="apple-glass-card rounded-3xl p-8 max-w-lg w-full border border-white/20 shadow-2xl relative">
            <button
              onClick={() => setActiveTrustModal(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white text-lg font-mono p-1 rounded-full hover:bg-white/10"
              aria-label="Close modal"
            >
              ✕
            </button>

            {activeTrustModal === "privacy" && (
              <div>
                <span className="text-xs font-mono uppercase text-cyan-400 block mb-2">Fundamental Trust Charter</span>
                <h4 className="text-xl font-bold text-white mb-4">Constitutional Privacy Guarantee</h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Q-Link operates on a strict zero-knowledge paradigm. We do not ask for, collect, store, or sell:
                </p>
                <ul className="text-xs text-slate-400 space-y-2 mb-6 font-mono">
                  <li>• Phone numbers or SMS verification codes</li>
                  <li>• Email addresses or identity credentials</li>
                  <li>• IP logs, location data, or device fingerprints</li>
                  <li>• Permanent chat logs or media caches</li>
                </ul>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your cryptographic seed is the sole decider of your identity. Once messages expire their Time-To-Live (TTL), they are permanently incinerated.
                </p>
              </div>
            )}

            {activeTrustModal === "terms" && (
              <div>
                <span className="text-xs font-mono uppercase text-indigo-400 block mb-2">Platform Protocol</span>
                <h4 className="text-xl font-bold text-white mb-4">Terms of Autonomous Use</h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  By using Q-Link, you interact directly with a decentralized communication stream. You agree to:
                </p>
                <ul className="text-xs text-slate-400 space-y-2 mb-6 font-mono">
                  <li>• Maintain custody of your localized Quantum ID</li>
                  <li>• Respect local rate limits (5 pulses/min burst guard)</li>
                  <li>• Acknowledge zero server backups (lost keys cannot be recovered)</li>
                </ul>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The protocol is autonomous. There are no corporate admins with backdoor access to private conversations.
                </p>
              </div>
            )}

            {activeTrustModal === "canary" && (
              <div>
                <span className="text-xs font-mono uppercase text-emerald-400 block mb-2">Transparency Audit</span>
                <h4 className="text-xl font-bold text-white mb-4">No-Log Warranty Canary</h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  As of September 2026, Q-Link Protocol confirms:
                </p>
                <ul className="text-xs text-emerald-400 space-y-2 mb-6 font-mono">
                  <li>✔ Zero government subpoenas or warrants served</li>
                  <li>✔ Zero user data surrendered (none exists to surrender)</li>
                  <li>✔ Zero encryption keys or backdoors provided to any entity</li>
                  <li>✔ Zero permanent database clusters storing messages</li>
                </ul>
                <p className="text-xs text-slate-400 leading-relaxed">
                  This canary is cryptographically affirmed by the system architecture.
                </p>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setActiveTrustModal(null)}
                className="px-5 py-2 rounded-xl apple-glass-pill hover:bg-white/10 text-xs font-semibold text-white transition-all"
              >
                Close Charter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
