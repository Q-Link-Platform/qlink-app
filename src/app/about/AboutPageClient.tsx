"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import "./about.css";

interface MockMessage {
  id: string;
  sender: "me" | "peer";
  content: string;
  isEncrypted: boolean;
  time: string;
  attachments?: { name: string; type: string }[];
}

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

  // Simulator State
  const [mockMessages, setMockMessages] = useState<MockMessage[]>([
    {
      id: "mock-1",
      sender: "peer",
      content: "Hey, did you secure the node keys?",
      isEncrypted: true,
      time: "11:24 AM",
    },
    {
      id: "mock-2",
      sender: "me",
      content: "Yes, client-side E2E is active. Let me send the Elon Musk wealth telemetry data.",
      isEncrypted: true,
      time: "11:25 AM",
    },
    {
      id: "mock-3",
      sender: "me",
      content: "[FILE attachment] elon_musk_wealth_telemetry.pdf",
      isEncrypted: true,
      time: "11:25 AM",
      attachments: [{ name: "elon_musk_wealth_telemetry.pdf", type: "file" }],
    },
    {
      id: "mock-4",
      sender: "peer",
      content: "Got it. Clean up the thread when done.",
      isEncrypted: true,
      time: "11:26 AM",
    },
  ]);

  const [simSelectionMode, setSimSelectionMode] = useState(false);
  const [simSelectedIds, setSimSelectedIds] = useState<Set<string>>(new Set());
  const [simContextMenu, setSimContextMenu] = useState<{
    x: number;
    y: number;
    messageId: string;
    isMe: boolean;
    content: string;
  } | null>(null);

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

  // Sim handlers
  const handleToggleSelect = (messageId: string) => {
    setSimSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(messageId)) {
        next.delete(messageId);
      } else {
        next.add(messageId);
      }
      return next;
    });
  };

  const handleSimClick = (messageId: string) => {
    if (simSelectionMode) {
      handleToggleSelect(messageId);
    }
  };

  const handleSimContextMenu = (
    e: React.MouseEvent,
    msg: MockMessage
  ) => {
    e.preventDefault();
    setSimContextMenu({
      x: e.clientX,
      y: e.clientY,
      messageId: msg.id,
      isMe: msg.sender === "me",
      content: msg.content,
    });
  };

  const handleCopyText = (text: string) => {
    const cleanText = text.replace(/^\[(FILE|VIDEO) attachment\]\s*/i, "");
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(cleanText);
    }
    setSimContextMenu(null);
  };

  const handleDeleteSingle = (messageId: string) => {
    setMockMessages((prev) => prev.filter((m) => m.id !== messageId));
    setSimContextMenu(null);
  };

  const handleDeleteSelected = () => {
    setMockMessages((prev) => prev.filter((m) => !simSelectedIds.has(m.id)));
    setSimSelectedIds(new Set());
    setSimSelectionMode(false);
  };

  const handleSelectAll = () => {
    setSimSelectedIds(new Set(mockMessages.map((m) => m.id)));
  };

  // Close context menu on global click
  useEffect(() => {
    const handleClose = () => setSimContextMenu(null);
    window.addEventListener("click", handleClose);
    return () => window.removeEventListener("click", handleClose);
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
            <p className="text-[8px] text-slate-500 font-mono tracking-widest uppercase">Protocol Terminal v3.0</p>
          </div>
        </div>

        <Link
          href="/"
          className="relative inline-flex items-center justify-center rounded-xl border border-cyan-500/40 bg-cyan-950/20 px-4 py-2 text-xs font-bold text-cyan-400 tracking-wider hover:bg-cyan-500/10 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all duration-300"
        >
          Enter Terminal
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
              Start Encrypted Chat
            </Link>
            <a
              href="#sandbox"
              className="px-6 py-3 rounded-2xl border border-slate-800 bg-slate-950/50 text-xs font-bold text-slate-300 tracking-wider hover:border-cyan-500/30 hover:text-cyan-400 transition-all duration-200"
            >
              Try Sandbox Simulator
            </a>
          </div>
        </section>

        {/* Download & Installation Console */}
        <section className="cyber-panel p-6 md:p-8 max-w-5xl mx-auto space-y-6 border-cyan-500/10 bg-slate-950/30">
          <div className="text-center md:text-left space-y-1">
            <h4 className="text-sm md:text-base font-black uppercase tracking-wider text-cyan-400 font-mono">Terminal Downloads</h4>
            <p className="text-2xl md:text-3xl font-black text-slate-100">Get the Q-Link Client</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Windows App Download */}
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-900 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-cyan-400">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="2" y="2" width="9.5" height="9.5" rx="0.5" />
                    <rect x="12.5" y="2" width="9.5" height="9.5" rx="0.5" />
                    <rect x="2" y="12.5" width="9.5" height="9.5" rx="0.5" />
                    <rect x="12.5" y="12.5" width="9.5" height="9.5" rx="0.5" />
                  </svg>
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

        {/* Live Sandbox Interactive Chat Simulator */}
        <section id="sandbox" className="space-y-8 scroll-mt-24">
          <div className="text-center space-y-2">
            <h3 className="text-xs font-black uppercase tracking-[0.25em] text-cyan-500 font-mono">Interactive Module</h3>
            <p className="text-lg font-bold text-slate-100">Interactive Chat Sandbox</p>
            <p className="text-[10px] text-slate-400 font-mono uppercase">Right-click or long-press messages to open options</p>
          </div>

          <div className="relative max-w-xl mx-auto rounded-3xl border border-cyan-500/25 bg-[#070e14]/90 p-4 md:p-6 shadow-[0_0_50px_rgba(6,182,212,0.15)] backdrop-blur-md">
            
            {/* Header Telemetry inside simulator */}
            <div className="border-b border-slate-800 pb-3 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.7)]" />
                <span className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">Secure Node Connection</span>
              </div>
              <div className="text-[9px] text-slate-500 font-mono tracking-wider">
                NODE_RATE: {txRate} kb/s
              </div>
            </div>

            {/* Message Thread container inside simulator */}
            <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar min-h-[220px]">
              {mockMessages.map((msg) => {
                const isMe = msg.sender === "me";
                const isSelected = simSelectedIds.has(msg.id);

                return (
                  <div
                    key={msg.id}
                    className="flex items-center w-full transition-all duration-300 ease-out"
                  >
                    {/* Checkbox */}
                    <div
                      className="flex items-center justify-center transition-all duration-300 ease-out overflow-hidden"
                      style={{
                        width: simSelectionMode ? "28px" : "0px",
                        opacity: simSelectionMode ? 1 : 0,
                        marginRight: simSelectionMode ? "8px" : "0px",
                      }}
                    >
                      <div
                        onClick={() => handleToggleSelect(msg.id)}
                        className={`h-4 w-4 rounded-full border flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 ${
                          isSelected
                            ? "border-cyan-400 bg-cyan-400 text-slate-950 shadow-[0_0_10px_#22d3ee]"
                            : "border-slate-700 bg-slate-950/40 hover:border-cyan-500/50"
                        }`}
                      >
                        {isSelected && (
                          <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Chat Bubble container */}
                    <div className={`flex-1 flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div
                        onContextMenu={(e) => handleSimContextMenu(e, msg)}
                        onClick={() => handleSimClick(msg.id)}
                        style={{ WebkitTouchCallout: "none" }}
                        className={
                          isMe
                            ? `max-w-[80%] rounded-2xl rounded-br-sm bg-gradient-to-r from-cyan-400/90 to-sky-500/90 px-3 py-2 text-slate-950 shadow-[0_0_12px_rgba(56,189,248,0.4)] select-none cursor-pointer transition-all duration-200 ${
                                isSelected ? "ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950 scale-[0.98]" : ""
                              }`
                            : `max-w-[80%] rounded-2xl rounded-bl-sm bg-slate-900 px-3 py-2 text-slate-100 shadow-sm border border-slate-800 select-none cursor-pointer transition-all duration-200 ${
                                isSelected ? "ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950 scale-[0.98]" : ""
                              }`
                        }
                      >
                        <p className="text-xs break-words font-sans leading-relaxed">
                          {msg.isEncrypted && <span className="mr-1">🔒</span>}
                          {msg.content.replace(/^\[FILE attachment\]\s*/i, "")}
                        </p>

                        {msg.attachments && (
                          <div className="mt-2 flex items-center justify-between gap-2 rounded-xl border border-slate-700/60 bg-slate-950/75 px-2 py-1.5 text-[10px] text-slate-300">
                            <span className="truncate">{msg.attachments[0].name}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                alert("Mock download activated for simulator.");
                              }}
                              className="text-cyan-400 hover:text-cyan-200 transition-colors"
                            >
                              Download
                            </button>
                          </div>
                        )}

                        <span
                          className={`block text-[8px] text-right mt-1 font-mono uppercase ${
                            isMe ? "text-slate-900/60" : "text-slate-500"
                          }`}
                        >
                          {msg.time}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {mockMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-xs text-slate-500 font-mono uppercase">Simulation database empty</p>
                  <button
                    type="button"
                    onClick={() => {
                      setMockMessages([
                        {
                          id: "mock-1",
                          sender: "peer",
                          content: "Hey, did you secure the node keys?",
                          isEncrypted: true,
                          time: "11:24 AM",
                        },
                        {
                          id: "mock-2",
                          sender: "me",
                          content: "Yes, client-side E2E is active. Let me send the Elon Musk wealth telemetry data.",
                          isEncrypted: true,
                          time: "11:25 AM",
                        },
                        {
                          id: "mock-3",
                          sender: "me",
                          content: "[FILE attachment] elon_musk_wealth_telemetry.pdf",
                          isEncrypted: true,
                          time: "11:25 AM",
                          attachments: [{ name: "elon_musk_wealth_telemetry.pdf", type: "file" }],
                        },
                        {
                          id: "mock-4",
                          sender: "peer",
                          content: "Got it. Clean up the thread when done.",
                          isEncrypted: true,
                          time: "11:26 AM",
                        },
                      ]);
                    }}
                    className="mt-3 text-[10px] text-cyan-400 hover:underline uppercase font-bold font-mono"
                  >
                    Reset Simulator
                  </button>
                </div>
              )}
            </div>

            {/* Input simulator area */}
            <div className="mt-4 border-t border-slate-800 pt-3 relative">
              
              {/* Simulator selection control bar */}
              {simSelectionMode && (
                <div className="absolute bottom-[calc(100%+8px)] left-0 right-0 z-[50] rounded-2xl border border-cyan-500/40 bg-[#060a0f]/95 p-3 text-[11px] text-slate-200 shadow-[0_0_20px_rgba(6,182,212,0.3)] backdrop-blur-md transition-all duration-300 animate-slide-up flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-2 px-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
                    <span className="text-xs font-bold text-slate-200 font-sans tracking-wide">
                      {simSelectedIds.size} message{simSelectedIds.size !== 1 ? "s" : ""} selected
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="px-3 py-1 rounded-xl border border-slate-800 bg-slate-900/40 text-[9px] font-bold text-slate-300 uppercase tracking-wider transition hover:border-cyan-500/30 hover:text-cyan-400"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteSelected}
                      disabled={simSelectedIds.size === 0}
                      className="px-3 py-1 rounded-xl border border-rose-500/25 bg-rose-500/5 text-[9px] font-bold text-rose-400 uppercase tracking-wider transition hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300 disabled:opacity-20 disabled:pointer-events-none"
                    >
                      Delete Selected
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSimSelectionMode(false);
                        setSimSelectedIds(new Set());
                      }}
                      className="px-3 py-1 rounded-xl border border-slate-800 bg-slate-900/40 text-[9px] font-bold text-slate-400 uppercase tracking-wider transition hover:border-slate-700 hover:text-slate-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Fake message input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type simulated messages..."
                  disabled
                  className="flex-1 rounded-2xl border border-slate-800 bg-slate-900/40 px-4 py-2.5 text-xs text-slate-500 placeholder-slate-600 focus:outline-none cursor-not-allowed"
                />
                <button
                  type="button"
                  disabled
                  className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-600 cursor-not-allowed"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Mock Context Menu */}
            {simContextMenu && (
              <div
                style={{
                  position: "fixed",
                  top: simContextMenu.y - 10,
                  left: simContextMenu.x,
                  transform: "translate(-50%, -100%)",
                  zIndex: 9999,
                }}
                className="animate-fade-in min-w-[150px] overflow-hidden rounded-2xl border border-cyan-500/30 bg-[#060a0f]/95 p-1.5 shadow-[0_0_20px_rgba(6,182,212,0.25)] backdrop-blur-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="border-b border-slate-800 px-2.5 py-1 text-[8px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                  Message Ops
                </div>
                <div className="mt-1 space-y-0.5">
                  <button
                    type="button"
                    onClick={() => handleCopyText(simContextMenu.content)}
                    className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs font-semibold text-slate-300 hover:bg-slate-800/80 hover:text-cyan-300"
                  >
                    <span>Copy Text</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSimSelectionMode(true);
                      setSimSelectedIds(new Set([simContextMenu.messageId]));
                      setSimContextMenu(null);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs font-semibold text-slate-300 hover:bg-slate-800/80 hover:text-cyan-300"
                  >
                    <span>Select</span>
                  </button>
                  {simContextMenu.isMe ? (
                    <button
                      type="button"
                      onClick={() => handleDeleteSingle(simContextMenu.messageId)}
                      className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300"
                    >
                      <span>Delete</span>
                    </button>
                  ) : (
                    <div className="px-2.5 py-1.5 text-[9px] italic text-slate-600 font-mono">
                      Read Only
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </section>

        {/* Schema network telemetry section */}
        <section className="cyber-panel p-6 md:p-8 space-y-6 max-w-3xl mx-auto border-cyan-500/10">
          <div className="space-y-1">
            <h4 className="text-xs font-black uppercase tracking-wider text-cyan-400 font-mono">Cryptographic Flow</h4>
            <p className="text-sm font-bold text-slate-100">Zero-Trust Node Architecture</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center text-center">
            
            <div className="space-y-2 p-4 rounded-2xl bg-slate-950/40 border border-slate-900">
              <span className="text-[10px] font-mono text-cyan-400 font-black">NODE A // SENDER</span>
              <p className="text-[10px] text-slate-400">Generates passphrase keys locally. Encrypts message payload using WebCrypto API.</p>
              <div className="text-[9px] font-mono text-emerald-400 bg-emerald-950/10 py-1 rounded border border-emerald-500/10">
                🔒 CIPHERTEXT READY
              </div>
            </div>

            <div className="flex flex-col items-center justify-center py-2">
              <svg className="h-6 w-6 text-cyan-500 animate-pulse hidden md:block" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
              <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest mt-1">Transmitting...</span>
            </div>

            <div className="space-y-2 p-4 rounded-2xl bg-slate-950/40 border border-slate-900">
              <span className="text-[10px] font-mono text-cyan-400 font-black">NODE B // RECIPIENT</span>
              <p className="text-[10px] text-slate-400">Receives encrypted payload and decrypts using identical local secret key.</p>
              <div className="text-[9px] font-mono text-cyan-400 bg-cyan-950/10 py-1 rounded border border-cyan-500/10">
                🔓 DECRYPTED LOCAL
              </div>
            </div>

          </div>

          <p className="text-[10px] text-slate-500 font-mono text-center leading-relaxed">
            SYSTEM TELEMETRY SUMMARY: NO CLEAR TEXT MESSAGE PAYLOAD EVER ENTERS THE DATA STREAM TRANSIT PIPELINE. SECURED BY END-TO-END CRYPTOGRAPHIC EXCHANGE.
          </p>
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
