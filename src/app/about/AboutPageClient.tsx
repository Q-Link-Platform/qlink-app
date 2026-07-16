"use client";

import React, { useState, useEffect, useRef } from "react";
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
        "To install Q-Link as a PWA Web App:\n\n" +
        "• On desktop (Chrome/Edge): Click the Install icon in the browser address bar.\n" +
        "• On mobile (Android/iOS): Tap the browser menu and select 'Add to Home screen' or 'Install app'."
      );
    }
  };

  // Stats Telemetry Simulation
  const [activeNodes, setActiveNodes] = useState(254);
  const [txRate, setTxRate] = useState(4.2);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNodes((prev) => prev + (Math.random() > 0.5 ? 1 : -1));
      setTxRate((prev) => parseFloat((prev + (Math.random() > 0.5 ? 0.15 : -0.15)).toFixed(2)));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#060a0f] text-slate-100 overflow-x-hidden font-sans cyber-grid scanlines">
      
      {/* Decorative Top Ambient Light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[300px] bg-gradient-to-b from-cyan-500/10 via-transparent to-transparent pointer-events-none filter blur-3xl z-10" />

      {/* Cyberpunk Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-cyan-500/10 bg-[#060a0f]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-cyan-400 to-sky-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
            <span className="font-mono font-black text-slate-950 text-sm tracking-tighter">Q</span>
          </div>
          <div>
            <h1 className="text-sm font-black tracking-[0.2em] text-cyan-400 uppercase font-mono">Q-Link</h1>
            <p className="text-[8px] text-slate-500 font-mono tracking-widest uppercase">Secure Console v3.0</p>
          </div>
        </div>

        <Link
          href="/"
          className="relative inline-flex items-center justify-center rounded-xl border border-cyan-500/40 bg-cyan-950/20 px-4 py-2 text-xs font-bold text-cyan-400 tracking-wider hover:bg-cyan-500/10 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all duration-300"
        >
          Launch Web App
        </Link>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-24 relative z-30">
        
        {/* Hero Section */}
        <section className="text-center space-y-6 max-w-3xl mx-auto pt-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/20 px-3 py-1 text-[9px] font-bold text-cyan-400 tracking-widest uppercase font-mono cyber-glow-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            SECURE LINK ESTABLISHED // NODES: {activeNodes}
          </div>
          
          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-b from-slate-100 to-slate-400">
            Cryptographically Private Messaging for the <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-400 glow-text">Quantum Age</span>
          </h2>
          
          <p className="text-xs md:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            Q-Link protects your communications with local, client-side cryptographic key derivation. No servers can read your messages. No traces left behind.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/"
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 text-xs font-bold tracking-wider hover:opacity-95 hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] active:scale-95 transition-all duration-200"
            >
              Launch Web App
            </Link>
            <a
              href="#downloads"
              className="px-6 py-3 rounded-2xl border border-slate-800 bg-slate-950/50 text-xs font-bold text-slate-300 tracking-wider hover:border-cyan-500/30 hover:text-cyan-400 transition-all duration-200"
            >
              Download Client
            </a>
          </div>
        </section>

        {/* Download & Installation Console */}
        <section id="downloads" className="cyber-panel p-6 md:p-8 max-w-5xl mx-auto space-y-6 border-cyan-500/10 bg-slate-950/30 scroll-mt-24">
          <div className="text-center md:text-left space-y-1">
            <h4 className="text-sm md:text-base font-black uppercase tracking-wider text-cyan-400 font-mono">Terminal Downloads</h4>
            <p className="text-2xl md:text-3xl font-black text-slate-100">Get the Q-Link Client</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Windows App Download */}
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-900 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-cyan-400">
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Windows 10 Logo */}
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M0 3.449L9.75 2.1v9.45H0V3.449zM0 12.45h9.75v9.45L0 20.551v-8.102zM10.95 1.95L24 0v11.55H10.95V1.95zM10.95 12.45H24v11.55l-13.05-1.95v-9.6z"/>
                    </svg>
                    {/* Windows 11 Logo */}
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="0" y="0" width="11" height="11" rx="0.5" />
                      <rect x="13" y="0" width="11" height="11" rx="0.5" />
                      <rect x="0" y="13" width="11" height="11" rx="0.5" />
                      <rect x="13" y="13" width="11" height="11" rx="0.5" />
                    </svg>
                  </div>
                  <span className="font-bold text-sm md:text-base font-mono uppercase tracking-wider">Windows Desktop App</span>
                </div>
                <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
                  Enjoy native Windows Toast Notifications, Close-to-Tray background execution, automatic deep-link protocol unlocking, and superior performance.
                </p>
              </div>

              <div className="space-y-3">
                <a
                  href="/downloads/Q-Link-Setup.exe"
                  download="Q-Link-Setup.exe"
                  className="w-full py-2.5 rounded-xl bg-cyan-500 text-slate-950 text-sm font-bold tracking-wider hover:opacity-90 transition duration-200 inline-flex items-center justify-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Setup .exe
                </a>

                {/* Compatibility Info */}
                <div className="text-xs font-mono text-slate-400 bg-slate-950/80 p-3.5 rounded-xl border border-slate-900 leading-relaxed">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-bold mb-1 uppercase tracking-wider text-[10px] md:text-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    System Compatibility
                  </div>
                  • <strong>Architecture:</strong> x64 (64-bit Windows) Natively supported.
                  <br />
                  • <strong>OS Version:</strong> Windows 10 & Windows 11 (fully verified).
                  <br />
                  • <span className="text-amber-500/85">x86 Compatibility:</span> 32-bit (x86) systems are not natively compatible; please use the PWA Web App version instead.
                </div>
              </div>
            </div>

            {/* PWA App Download */}
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-900 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-cyan-400">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="font-bold text-sm md:text-base font-mono uppercase tracking-wider">Progressive Web App (PWA)</span>
                </div>
                <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
                  Install Q-Link directly on your Android, iOS, macOS, Linux, or 32-bit Windows system via your browser. Full offline loading and lightweight footprints.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleInstallPwa}
                  className={`w-full py-2.5 rounded-xl text-sm font-bold tracking-wider transition duration-200 inline-flex items-center justify-center gap-2 ${
                    isPwaInstallable
                      ? "bg-slate-100 text-slate-950 hover:bg-slate-200"
                      : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200"
                  }`}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {isPwaInstallable ? "Install PWA Web App" : "PWA Ready in Browser"}
                </button>

                {/* Compatibility Info */}
                <div className="text-xs font-mono text-slate-400 bg-slate-950/80 p-3.5 rounded-xl border border-slate-900 leading-relaxed">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1 uppercase tracking-wider text-[10px] md:text-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Cross-Platform Support
                  </div>
                  • <strong>Mobile:</strong> Android & iOS (Chrome/Safari &apos;Add to Home Screen&apos;).
                  <br />
                  • <strong>Desktop:</strong> macOS, Linux, and 32-bit (x86) Windows systems.
                  <br />
                  • <strong>Engine:</strong> Compatible with all major engines (Chromium, WebKit, Gecko).
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Feature Grid Section */}
        <section className="space-y-12">
          <div className="text-center space-y-2">
            <h3 className="text-xs font-black uppercase tracking-[0.25em] text-cyan-500 font-mono">System Blueprint</h3>
            <p className="text-lg font-bold text-slate-100">Secure Protocol Layers</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Card 1: E2E Encryption */}
            <div className="cyber-panel p-6 flex flex-col justify-between entrance-card-1 min-h-[220px]">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h4 className="text-sm font-bold text-slate-100">Client-Side E2E Key derivation</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Keys are generated inside your browser using a shared secret passphrase. Text is encrypted into ciphertext locally. The server databases only store randomized hash strings, preventing administrative eavesdropping.
                </p>
              </div>
              <div className="text-[9px] font-mono text-cyan-500/80 pt-4 uppercase tracking-wider flex items-center gap-2">
                <span>Status: Enforced</span>
                <span className="h-1 w-1 rounded-full bg-cyan-500" />
                <span>AES-GCM-256 Bit</span>
              </div>
            </div>

            {/* Card 2: Zero Trace */}
            <div className="cyber-panel p-6 flex flex-col justify-between entrance-card-2 min-h-[220px]">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h4 className="text-sm font-bold text-slate-100">Zero-Trace Physical Purging</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Deleting a message triggers a complete database cascade and sends API calls to clean up the Supabase storage buckets. There are no cached orphans, no log remnants, and no hidden duplicate cloud backups.
                </p>
              </div>
              <div className="text-[9px] font-mono text-cyan-500/80 pt-4 uppercase tracking-wider flex items-center gap-2">
                <span>Storage: Supabase CDN</span>
                <span className="h-1 w-1 rounded-full bg-cyan-500" />
                <span>Permanent Erasure</span>
              </div>
            </div>

            {/* Card 3: Context Ops */}
            <div className="cyber-panel p-6 flex flex-col justify-between entrance-card-3 min-h-[220px]">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                </div>
                <h4 className="text-sm font-bold text-slate-100">Tactile Contextual Control</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Bespoke right-click systems on desktop and hold gestures on mobile trigger glassmorphic context overlays. Smoothly toggle multi-selection workflows to batch delete messages from the screen.
                </p>
              </div>
              <div className="text-[9px] font-mono text-cyan-500/80 pt-4 uppercase tracking-wider flex items-center gap-2">
                <span>UI: Glassmorphism</span>
                <span className="h-1 w-1 rounded-full bg-cyan-500" />
                <span>Multi-Select API v2.0</span>
              </div>
            </div>

            {/* Card 4: Audio Suite */}
            <div className="cyber-panel p-6 flex flex-col justify-between entrance-card-4 min-h-[220px]">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <h4 className="text-sm font-bold text-slate-100">Integrated Audio & Image suite</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Record and transmit voice notes locally with customized player interfaces. Send pictures using the integrated, client-side canvas cropper to frame, resize, and edit photos directly before uploading.
                </p>
              </div>
              <div className="text-[9px] font-mono text-cyan-500/80 pt-4 uppercase tracking-wider flex items-center gap-2">
                <span>Audio: OPUS Codec</span>
                <span className="h-1 w-1 rounded-full bg-cyan-500" />
                <span>In-app Canvas Editor</span>
              </div>
            </div>

          </div>
        </section>

        {/* E2E Cryptographic Architecture Diagram & Info */}
        <section id="architecture" className="space-y-8 scroll-mt-24">
          <div className="text-center space-y-2">
            <h3 className="text-xs font-black uppercase tracking-[0.25em] text-cyan-500 font-mono">Security Architecture</h3>
            <p className="text-lg font-bold text-slate-100">Zero-Trust Cryptographic Flow</p>
            <p className="text-[10px] text-slate-400 font-mono uppercase">How Q-Link protects your data from transit to storage</p>
          </div>

          <div className="cyber-panel p-6 md:p-8 space-y-6 max-w-4xl mx-auto border-cyan-500/10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch text-center">
              
              <div className="space-y-3 p-5 rounded-2xl bg-slate-950/40 border border-slate-900 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-mono text-cyan-400 font-black tracking-wider uppercase block mb-2">1. Local Encryption (Sender)</span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    A local key is derived client-side from your secret passphrase. Plaintext messages are encrypted using the WebCrypto API (AES-GCM-256) inside the browser before transport.
                  </p>
                </div>
                <div className="text-[10px] font-mono text-emerald-400 bg-emerald-950/20 py-1.5 rounded-lg border border-emerald-500/20 uppercase tracking-widest mt-4">
                  🔒 Local Ciphertext
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950/20 border border-slate-900/50">
                <div className="h-10 w-10 rounded-full bg-cyan-950/50 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-2">
                  <svg className="h-5 w-5 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Zero-Knowledge Transit</span>
                <p className="text-[10px] text-slate-500 mt-1 max-w-[200px] leading-normal">
                  Only randomized hash strings are sent over HTTPS to the database. No raw payload or keys are ever uploaded.
                </p>
              </div>

              <div className="space-y-3 p-5 rounded-2xl bg-slate-950/40 border border-slate-900 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-mono text-cyan-400 font-black tracking-wider uppercase block mb-2">2. Local Decryption (Recipient)</span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    The peer retrieves the ciphertext from the stream and decrypts it locally inside their browser window using the matching secret key.
                  </p>
                </div>
                <div className="text-[10px] font-mono text-cyan-400 bg-cyan-950/20 py-1.5 rounded-lg border border-cyan-500/20 uppercase tracking-widest mt-4">
                  🔓 Decrypted Locally
                </div>
              </div>

            </div>

            <div className="border-t border-slate-900 pt-4 text-center">
              <p className="text-[10px] text-slate-500 font-mono leading-relaxed max-w-2xl mx-auto uppercase">
                SECURITY COMPLIANCE: ZERO TRACE POLICY. NO PLAINTEXT MESSAGES OR PASSWORDS ARE EVER SENT, STORED, OR READ BY SERVER ADMINISTRATORS OR DATABASE CONTROLLERS.
              </p>
            </div>
          </div>
        </section>

        {/* Core Operations Reference Manual (AIO Documentation Card) */}
        <section className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center space-y-2">
            <h3 className="text-xs font-black uppercase tracking-[0.25em] text-cyan-500 font-mono">Operations Manual</h3>
            <p className="text-lg font-bold text-slate-100">Step-by-Step Operations Reference</p>
            <p className="text-[10px] text-slate-400 font-mono uppercase">Full protocol guide for human users and indexable AI entities</p>
          </div>

          <div className="grid gap-6">
            {/* Step 1 */}
            <div className="cyber-panel p-6 border-slate-800/85 bg-slate-950/40">
              <h4 className="text-xs font-black uppercase font-mono text-cyan-400 mb-2">01 // Node Initialization (Identity & Setup)</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                To join the network, nodes enter their verified email on the login terminal. The system transmits a secure **One-Time Passcode (OTP)** to authenticate the user session. Once validated, users establish a unique global handle (e.g. `@Rohit_7779`) which acts as their global cryptographic routing address on the Q-Link network.
              </p>
            </div>

            {/* Step 2 */}
            <div className="cyber-panel p-6 border-slate-800/85 bg-slate-950/40">
              <h4 className="text-xs font-black uppercase font-mono text-cyan-400 mb-2">02 // Cryptographic Key Derivation (E2E Shield)</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                E2E Encryption Shield can be toggled in **Settings** (click the gear/Settings pill in the sidebar header). When activated, you enter a secret passphrase. The browser uses local client-side key derivation to encrypt message text. When sending a message, it is converted to cipher blocks *before* hitting the Postgres database, ensuring absolute transport-level privacy.
              </p>
            </div>

            {/* Step 3 */}
            <div className="cyber-panel p-6 border-slate-800/85 bg-slate-950/40">
              <h4 className="text-xs font-black uppercase font-mono text-cyan-400 mb-2">03 // Node Link Exchange (Connection Requests)</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                To open a channel with another node, click **"Quantum Link Console"** in the sidebar. Search for the peer's handle (e.g. `@Rohit_7779`). Select the appropriate relationship category (Friend, Colleague, Boss, Mentor, etc.) and write an optional request note. The connection request is sent, and the peer must approve the request from their incoming feed before active messaging is authorized.
              </p>
            </div>

            {/* Step 4 */}
            <div className="cyber-panel p-6 border-slate-800/85 bg-slate-950/40">
              <h4 className="text-xs font-black uppercase font-mono text-cyan-400 mb-2">04 // Message Transmission & Media Suite</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Inside an active chat session, nodes can send E2E encrypted text, upload media documents, or record audio notes inline. 
                <br />
                • <strong>Voice Notes:</strong> Click the microphone icon to record. An OPUS audio clip is generated and transmitted inline with a custom glassy waveform player.
                <br />
                • <strong>Canvas Image Editor:</strong> Drag and drop images or select a photo, then use the built-in cropping widget to adjust, rotate, and frame images before uploading them to the Supabase content buckets.
              </p>
            </div>

            {/* Step 5 */}
            <div className="cyber-panel p-6 border-slate-800/85 bg-slate-950/40">
              <h4 className="text-xs font-black uppercase font-mono text-cyan-400 mb-2">05 // Zero-Trace Data Stream Deletion (Purging)</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                To delete messages with zero leftovers:
                <br />
                • <strong>Single Message:</strong> Right-click (or long-press) a bubble and select <strong>"Delete"</strong>. This permanently purges the Postgres row and issues Supabase API calls to delete the attachment file binaries.
                <br />
                • <strong>Batch Deletion:</strong> Click <strong>"Select"</strong> in the message context menu (or hold-press the bubble) to enter selection mode. Click multiple message nodes, then click <strong>"Delete Selected"</strong> on the floating control console. The selected nodes are batch-purged instantly from both local memory and the server without asking for confirmation.
                <br />
                • <strong>Automatic Sync:</strong> Deletion updates sync to the peer's screen within 3 seconds, removing the messages from their view instantly.
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* Cyberpunk Footer */}
      <footer className="border-t border-slate-900 py-12 px-6 text-center space-y-4 bg-slate-950/20">
        <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">
          Q-Link Secure Communication Protocol // © {new Date().getFullYear()}
        </p>
        <div className="flex justify-center gap-6 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
          <Link href="/" className="hover:text-cyan-400 transition-colors">Launch App</Link>
          <span>·</span>
          <a href="https://github.com/rohiterrors-ship-it/Q-Link_v3.0" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">GitHub</a>
        </div>
      </footer>

    </div>
  );
}
