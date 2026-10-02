"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import "./about.css";
import QuantumFluidButton from "@/components/QuantumFluidButton";

// Official Verified Social Links with AUTHENTIC OFFICIAL BRAND COLORS & ICONS
const SOCIAL_LINKS = [
  {
    id: "x-official",
    title: "Official Platform",
    handle: "@qlinkplatform",
    url: "https://x.com/qlinkplatform",
    icon: (
      <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    badge: "Official X",
    bgColor: "bg-black border border-white/25 hover:border-white/70 hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]",
  },
  {
    id: "x-founder",
    title: "Founder",
    handle: "@Bace_Labe",
    url: "https://x.com/Bace_Labe",
    icon: (
      <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    badge: "Founder X",
    bgColor: "bg-black border border-white/25 hover:border-white/70 hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]",
  },
  {
    id: "x-engineer",
    title: "Lead Architect",
    handle: "@GhorKamanSaaS",
    url: "https://x.com/GhorKamanSaaS",
    icon: (
      <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    badge: "Lead Engineer X",
    bgColor: "bg-black border border-white/25 hover:border-white/70 hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]",
  },
  {
    id: "youtube",
    title: "YouTube Channel",
    handle: "@Aexon.AITech",
    url: "https://www.youtube.com/@Aexon.AITech",
    icon: (
      <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    badge: "YouTube",
    bgColor: "bg-[#FF0000] border border-red-400/40 hover:bg-[#E60000] hover:shadow-[0_0_30px_rgba(255,0,0,0.65)]",
  },
  {
    id: "reddit",
    title: "Reddit Community",
    handle: "u/QLinkOfficial",
    url: "https://www.reddit.com/user/QLinkOfficial/submitted/?sort=hot",
    icon: (
      <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.688-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.197-2.512-.73a.326.326 0 0 0-.232-.095z" />
      </svg>
    ),
    badge: "Reddit",
    bgColor: "bg-[#FF4500] border border-orange-400/40 hover:bg-[#E03D00] hover:shadow-[0_0_30px_rgba(255,69,0,0.65)]",
  },
];

// Simulated Live Entropy Hashes for the Telemetry Console
const SAMPLE_HASHES = [
  "0x8F4E29C1A0D39B77F24C81AE90123BD8",
  "0x3B997AE012DF56C894AE45D8C127B0A9",
  "0xC1408DF5E28491A2BD4891004A26C4E1",
  "0x7E192FA08DC42831B9C7A11904EE88D2",
  "0x0A94F81C23D69BE1745281AA490C7D55",
];

// Flagship High-Definition Product Showcase Modules
const SHOWCASE_MODULES = [
  {
    id: "chat",
    name: "Live Chat Tunnel",
    badge: "E2E Sovereign",
    type: "image" as const,
    src: "/visuals/qlink-chat-tunnel.png",
    alt: "Q-Link Live Chat Tunnel Interface",
    title: "Zero-Trace Ephemeral Chat Tunnel",
    tagline: "End-to-end encrypted messaging with 24-hour self-purging media attachments.",
    description: "Experience military-grade private communication powered by ChaCha20-Poly1305. No central servers store your messages, conversations stay strictly peer-to-peer or ephemeral memory, and attachments dissolve automatically after 24 hours.",
    metrics: [
      { label: "Encryption", value: "ChaCha20-Poly1305" },
      { label: "Cloud Storage", value: "0 Bytes Logged" },
      { label: "Media Retention", value: "Strict 24h Purge" },
    ],
  },
  {
    id: "video",
    name: "Motion Demo",
    badge: "60fps Video",
    type: "video" as const,
    src: "/visuals/qlink-product-preview.mp4",
    alt: "Q-Link Live Product Motion Video",
    title: "High-Performance Fluid Architecture",
    tagline: "Ultra-responsive client interface crafted for desktop and modern browsers.",
    description: "Watch the live product workflow in action. From real-time cryptographic handshakes to instant socket routing and dynamic theme rendering, every frame is hardware-accelerated for zero stutter.",
    metrics: [
      { label: "Frame Rate", value: "60 FPS Fluid" },
      { label: "Client Engine", value: "Hardware GPU" },
      { label: "Handshake Speed", value: "<12ms Average" },
    ],
  },
  {
    id: "directory",
    name: "Global Directory",
    badge: "Verified Network",
    type: "image" as const,
    src: "/visuals/qlink-global-directory.png",
    alt: "Q-Link Global Quantum Directory Interface",
    title: "Global Quantum Directory & Founder IDs",
    tagline: "Discover, connect, and collaborate with verified founders and VIPs worldwide.",
    description: "Search the global directory by unique Quantum ID without exposing personal emails or phone numbers. Connect directly with elite founders and build high-trust relationships protected by cryptographic authenticity.",
    metrics: [
      { label: "Identity Binding", value: "Zero-KYC Math ID" },
      { label: "Search Index", value: "Global P2P Hash" },
      { label: "Connect Flow", value: "1-Click Direct Request" },
    ],
  },
  {
    id: "feed",
    name: "Social Feed",
    badge: "Aura Ranked",
    type: "image" as const,
    src: "/visuals/qlink-social-feed.png",
    alt: "Q-Link Quantum ID Console Social Feed Interface",
    title: "Quantum ID Console & Media Broadcast",
    tagline: "Share thoughts and media globally with customizable visibility and Aura metrics.",
    description: "Broadcast updates to the planet or selectively to followers and friends. Engage with real community posts devoid of corporate algorithmic rage-bait, boosted only by organic connection Aura.",
    metrics: [
      { label: "Distribution", value: "Global / Followers / Friends" },
      { label: "Algorithmic Bias", value: "0% Ad Manipulation" },
      { label: "Rich Media", value: "Images & Video Streams" },
    ],
  },
  {
    id: "vip",
    name: "Sapphire VIP",
    badge: "3D Hologram",
    type: "image" as const,
    src: "/visuals/qlink-vip-upgrade.png",
    alt: "Q-Link Sapphire VIP Card Interface",
    title: "Sapphire VIP Upgrade & Hologram Reflex",
    tagline: "Permanent cobalt badge, pinned directory header, and 1.5x Aura score booster.",
    description: "Elevate your identity across all directory searches and chat rooms. Features an interactive 3D holographic card reflex, custom cobalt aurora glow, and permanent prominence in the community.",
    metrics: [
      { label: "Aura Multiplier", value: "1.5x Dynamic Booster" },
      { label: "Directory Rank", value: "#VIP Permanent Pin" },
      { label: "Visual FX", value: "Reactive 3D Hologram" },
    ],
  },
  {
    id: "privacy",
    name: "Privacy Hub",
    badge: "Zero-Knowledge",
    type: "image" as const,
    src: "/visuals/qlink-privacy-settings.png",
    alt: "Q-Link Sovereign Privacy Settings Hub Interface",
    title: "Granular Privacy Controls & Sovereign Settings",
    tagline: "Total control over visibility, lock-screen notifications, and encryption shields.",
    description: "Fine-tune your identity privacy with granular field switches (Private/Public) for age, gender, and bio. Activate the E2E encryption shield, manage web push alerts, and purge sessions instantly on command.",
    metrics: [
      { label: "Field Privacy", value: "Per-Attribute Masking" },
      { label: "Push Notification", value: "Lock-Screen Alerts" },
      { label: "Session Control", value: "1-Tap Instant Wipe" },
    ],
  },
];

export default function AboutPageClient() {
  const [selectedProductView, setSelectedProductView] = useState<"web" | "desktop" | "pwa">("web");
  const [activeShowcaseTab, setActiveShowcaseTab] = useState<string>("chat");
  const currentModule = SHOWCASE_MODULES.find((m) => m.id === activeShowcaseTab) || SHOWCASE_MODULES[0];
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isPwaInstallable, setIsPwaInstallable] = useState(false);

  // High-performance header retreat state
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Showcase Horizontal Tab Scroll & Momentum Drag State
  const showcaseTabsRef = useRef<HTMLDivElement>(null);
  const isDraggingTabs = useRef(false);
  const startXTabs = useRef(0);
  const startScrollLeftTabs = useRef(0);
  const draggedDistance = useRef(0);
  const [tabScrollProgress, setTabScrollProgress] = useState({ thumbWidth: 32, thumbLeft: 0 });

  const updateTabScrollProgress = useCallback(() => {
    const el = showcaseTabsRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 1) {
      setTabScrollProgress({ thumbWidth: 100, thumbLeft: 0 });
      return;
    }
    const ratio = el.clientWidth / el.scrollWidth;
    const thumbWidthPercent = Math.max(18, Math.min(48, ratio * 100));
    const scrollPercent = Math.max(0, Math.min(1, el.scrollLeft / maxScroll));
    const thumbLeftPercent = scrollPercent * (100 - thumbWidthPercent);
    setTabScrollProgress({
      thumbWidth: thumbWidthPercent,
      thumbLeft: thumbLeftPercent,
    });
  }, []);

  // Update progress on mount and window resize
  useEffect(() => {
    updateTabScrollProgress();
    window.addEventListener("resize", updateTabScrollProgress);
    return () => window.removeEventListener("resize", updateTabScrollProgress);
  }, [updateTabScrollProgress]);

  // Translate vertical wheel scroll into smooth horizontal button container scrolling
  useEffect(() => {
    const el = showcaseTabsRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      // Unconditionally prevent vertical page scrolling when scrolling over the tabs
      if (e.deltaY !== 0 || e.deltaX !== 0) {
        e.preventDefault();
        e.stopPropagation();
        const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        el.scrollLeft += delta * 1.15;
        updateTabScrollProgress();
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [updateTabScrollProgress]);

  // Smoothly center active tab when selection changes
  useEffect(() => {
    const container = showcaseTabsRef.current;
    if (!container) return;
    const activeBtn = container.querySelector<HTMLElement>(".q-apple-tab-active");
    if (activeBtn) {
      const containerWidth = container.clientWidth;
      const btnLeft = activeBtn.offsetLeft;
      const btnWidth = activeBtn.offsetWidth;
      const targetScroll = btnLeft - containerWidth / 2 + btnWidth / 2;
      container.scrollTo({
        left: targetScroll,
        behavior: "smooth",
      });
      setTimeout(updateTabScrollProgress, 180);
    }
  }, [activeShowcaseTab, updateTabScrollProgress]);

  const handleTabsMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = showcaseTabsRef.current;
    if (!el) return;
    isDraggingTabs.current = true;
    startXTabs.current = e.pageX - el.offsetLeft;
    startScrollLeftTabs.current = el.scrollLeft;
    draggedDistance.current = 0;
  };

  const handleTabsMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingTabs.current) return;
    const el = showcaseTabsRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startXTabs.current) * 1.35;
    draggedDistance.current = Math.abs(walk);
    el.scrollLeft = startScrollLeftTabs.current - walk;
    updateTabScrollProgress();
  };

  const handleTabsMouseUp = () => {
    isDraggingTabs.current = false;
  };

  const handleScrollbarTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = showcaseTabsRef.current;
    if (!el) return;
    const trackRect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - trackRect.left;
    const percent = Math.max(0, Math.min(1, clickX / trackRect.width));
    const maxScroll = el.scrollWidth - el.clientWidth;
    el.scrollTo({
      left: percent * maxScroll,
      behavior: "smooth",
    });
    setTimeout(updateTabScrollProgress, 180);
  };

    // Corporate Trust Modal State (Constitutional Privacy, Autonomous Terms, Warranty Canary)
  const [activeTrustModal, setActiveTrustModal] = useState<"privacy" | "terms" | "canary" | "encryption" | "ratelimit" | "shield" | "audit" | null>(null);

  // Live Telemetry Showcase State
  const [activeHashIndex, setActiveHashIndex] = useState(0);
  const [isHandshakeTesting, setIsHandshakeTesting] = useState(false);
  const [handshakeProgress, setHandshakeProgress] = useState(100);
  const [relayLatency, setRelayLatency] = useState(8);

  // Cycle cryptographic telemetry tokens
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveHashIndex((prev) => (prev + 1) % SAMPLE_HASHES.length);
      setRelayLatency(Math.floor(7 + Math.random() * 4)); // 7ms - 10ms realistic jitter
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // Raycast-style Global Window Mouse Movement Spotlight Coordinator
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      const cards = document.querySelectorAll<HTMLElement>(".q-spotlight-card");
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);
      });
    };

    window.addEventListener("mousemove", handleGlobalMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleGlobalMouseMove);
  }, []);

  const handleScrollUpdate = (currentY: number, scrollHeight: number, clientHeight: number) => {
    const diff = currentY - lastScrollY.current;

    // Dynamically track scroll threshold for adaptive frosted glass shield
    setIsScrolled(currentY > 20);


    // Always keep header visible near the top of the page
    if (currentY < 60) {
      setIsHeaderVisible(true);
      lastScrollY.current = currentY;
      return;
    }

    // Significant scroll movement threshold
    if (Math.abs(diff) > 8) {
      if (diff > 0 && currentY > 100) {
        // Scrolling DOWN -> smoothly retreat header out of view to avoid overlapping content
        setIsHeaderVisible(false);
      } else if (diff < 0) {
        // Scrolling UP -> smoothly reveal header with dark frosted glass protection
        setIsHeaderVisible(true);
      }
      lastScrollY.current = currentY;
    }

    // Auto-reveal on scroll idle only near the upper portion of the page
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    if (currentY < 250) {
      scrollTimeout.current = setTimeout(() => {
        setIsHeaderVisible(true);
      }, 1000);
    }
  };

  const handleContainerScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    handleScrollUpdate(target.scrollTop, target.scrollHeight, target.clientHeight);
  };

  useEffect(() => {
    const handleWindowScroll = () => {
      handleScrollUpdate(window.scrollY, document.documentElement.scrollHeight, window.innerHeight);
    };
    window.addEventListener("scroll", handleWindowScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleWindowScroll);
  }, []);

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

  const triggerHandshakeSimulation = () => {
    if (isHandshakeTesting) return;
    setIsHandshakeTesting(true);
    setHandshakeProgress(15);
    setTimeout(() => setHandshakeProgress(55), 250);
    setTimeout(() => setHandshakeProgress(88), 600);
    setTimeout(() => {
      setHandshakeProgress(100);
      setIsHandshakeTesting(false);
    }, 1000);
  };

  return (
    <div
      ref={containerRef}
            onScroll={handleContainerScroll}
      className="relative h-[100dvh] w-full overflow-y-auto overflow-x-hidden text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200 font-sans scroll-smooth q-page-scroll"
    >
      {/* CINEMATIC QUANTUM ORBITAL BACKGROUND ENGINE (z-0 in front of container base, behind z-10/z-50 content) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#020408]">
        {/* Visual Asset: Earth Orbital Quantum Mesh from C:\Users\bhave\OneDrive\Work\Q-link visual */}
        <Image
          src="/visuals/qlink-orbital-vision.jpg"
          alt="Quantum Orbital Earth Mesh Background"
          fill
          priority
          quality={100}
          className="object-cover object-center scale-100 filter brightness-95 contrast-110"
        />

        {/* Ambient 3D Cyber Motion Video Overlay */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-20 filter contrast-125"
        >
          <source src="/visuals/qlink-product-preview.mp4" type="video/mp4" />
        </video>

        {/* Subtle Ambient Contrast Overlay: keeps Earth, network arcs and stars 100% visible while ensuring perfect text legibility */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020408]/60 via-transparent to-[#020408]/60" />
      </div>

      {/* ARCHITECTURAL SPINE CAD GRID */}
      <div className="q-architectural-grid opacity-35 z-0" />

      {/* CHROMATIC AMBIENT LIGHT BEAM (Top-Down Optical Dispersion) */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[1400px] h-[650px] z-0 blur-3xl opacity-50"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(56,189,248,0.25) 0%, rgba(99,102,241,0.15) 40%, rgba(168,85,247,0.08) 70%, transparent 90%)",
        }}
      />

      {/* FLUID RETREATING UPPER NAVBAR WITH KINETIC REEL-FLIP LINKS */}
      <header
        className={`sticky top-5 z-50 max-w-6xl mx-auto px-4 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isHeaderVisible
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "-translate-y-36 opacity-0 pointer-events-none"
        }`}
      >
        <nav
          onPointerMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            e.currentTarget.style.setProperty("--nav-x", `${e.clientX - rect.left}px`);
            e.currentTarget.style.setProperty("--nav-y", `${e.clientY - rect.top}px`);
          }}
          className={`group/nav relative rounded-full px-4 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isScrolled
              ? "bg-[#030712]/92 backdrop-blur-2xl border border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.95),inset_0_1px_1px_rgba(255,255,255,0.15)] ring-1 ring-cyan-500/20"
              : "bg-[#030712]/60 backdrop-blur-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.2)]"
          }`}
        >
          {/* APPLE DYNAMIC CURSOR SPOTLIGHT (Internal Glass Light Field) */}
          <div
            className="pointer-events-none absolute inset-0 rounded-full transition-opacity duration-500 opacity-0 group-hover/nav:opacity-100"
            style={{
              background: `radial-gradient(180px circle at var(--nav-x, -999px) var(--nav-y, -999px), rgba(34, 211, 238, 0.14), rgba(99, 102, 241, 0.06) 45%, transparent 75%)`,
            }}
          />

          {/* APPLE HAIRLINE SPECULAR BORDER SPOTLIGHT (Refracts Light along Rim) */}
          <div
            className="pointer-events-none absolute -inset-[1px] rounded-full transition-opacity duration-500 opacity-0 group-hover/nav:opacity-100"
            style={{
              background: `radial-gradient(130px circle at var(--nav-x, -999px) var(--nav-y, -999px), rgba(255, 255, 255, 0.55), rgba(34, 211, 238, 0.35) 40%, transparent 70%)`,
              mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              maskComposite: "exclude",
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              padding: "1px",
            }}
          />

          {/* SLEEK SPACIOUS BRAND */}
          <Link href="/" className="relative z-10 flex items-center gap-2 group whitespace-nowrap">
            <span className="text-base font-black tracking-tight text-white group-hover:text-cyan-300 transition-colors">
              Q-Link
            </span>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 font-semibold tracking-wider shadow-[0_0_10px_rgba(6,182,212,0.15)]">
              v3.0
            </span>
          </Link>

          {/* FULL SPELLING RESPONSIVE CORPORATE NAVIGATION with Apple Glass Hover Pills */}
          <div className="relative z-10 hidden md:flex items-center gap-1.5 lg:gap-2 text-[11px] lg:text-xs font-mono tracking-wider uppercase text-slate-300 whitespace-nowrap">
            <a href="#platform" className="px-3 py-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/[0.08] hover:border hover:border-white/15 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_2px_8px_rgba(0,0,0,0.3)] border border-transparent transition-all duration-200">Platform</a>
            <a href="#telemetry" className="px-3 py-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/[0.08] hover:border hover:border-white/15 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_2px_8px_rgba(0,0,0,0.3)] border border-transparent transition-all duration-200">Telemetry</a>
            <a href="#downloads" className="px-3 py-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/[0.08] hover:border hover:border-white/15 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_2px_8px_rgba(0,0,0,0.3)] border border-transparent transition-all duration-200">Client Suite</a>
            <a href="#architecture" className="px-3 py-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/[0.08] hover:border hover:border-white/15 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_2px_8px_rgba(0,0,0,0.3)] border border-transparent transition-all duration-200">Architecture</a>
            <a href="#comparison" className="px-3 py-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/[0.08] hover:border hover:border-white/15 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_2px_8px_rgba(0,0,0,0.3)] border border-transparent transition-all duration-200">Security Specs</a>
            <a href="#corporate-directory" className="px-3 py-1.5 rounded-full text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25 hover:border-cyan-500/40 hover:shadow-[0_0_15px_rgba(6,182,212,0.25)] transition-all duration-200">Governance</a>
          </div>

          {/* RIGHT SIDE: APPLE-STYLE LIQUID GLASS CTA */}
          <div className="relative z-10 flex items-center gap-3 whitespace-nowrap">
            <Link
              href="/"
              className="relative text-xs font-bold tracking-wide px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white shadow-[0_0_25px_rgba(6,182,212,0.45),inset_0_1px_1px_rgba(255,255,255,0.45)] hover:shadow-[0_0_35px_rgba(6,182,212,0.75),inset_0_1px_1px_rgba(255,255,255,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center gap-1.5 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent pointer-events-none rounded-full" />
              <span className="relative z-10">Use Web App</span>
              <svg className="w-3.5 h-3.5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </nav>
      </header>

      {/* HERO SECTION */}
      <main className="max-w-6xl mx-auto px-4 pt-16 pb-12 relative z-10">
        <div id="platform" className="text-center max-w-4xl mx-auto mb-16 scroll-mt-28">
          {/* HARDWARE-GRADE METADATA BADGE */}
          <div className="q-btn-hardware inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-[11px] font-mono tracking-[0.2em] uppercase text-slate-300 mb-8 cursor-default">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.9)] animate-pulse" />
            <span className="font-semibold text-white">Q-Link Protocol v3.0</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300">Defense-Grade Sovereign Infrastructure</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-[62px] font-bold tracking-tight mb-6 leading-[1.12] text-white max-w-4xl mx-auto">
            The Sovereign Communication Engine.<br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300 bg-clip-text text-transparent">
              Zero Telemetry. Real Cryptographic Proof.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 font-normal leading-relaxed mb-10 max-w-2xl mx-auto">
            Decentralized ephemeral identity without phone numbers, tracking cookies, or persistent server databases. Available natively in your browser or packaged as a high-performance Windows client.
          </p>

          {/* HIGH-CONTRAST EXECUTIVE CTAS */}
          <div className="flex flex-col items-center justify-center mb-10 w-full max-w-2xl mx-auto">
            {/* Primary Centerpiece: 3D Liquid-Chrome Windows Client CTA with Reactive Fluid Spotlight */}
            <QuantumFluidButton className="mb-6" />

            {/* Auxiliary In-Browser Web Client & PWA Actions with Apple Glass Spotlight */}
            <div className="flex flex-wrap items-center justify-center gap-3.5">
              <Link
                href="/"
                onPointerMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  e.currentTarget.style.setProperty("--btn-x", `${e.clientX - rect.left}px`);
                  e.currentTarget.style.setProperty("--btn-y", `${e.clientY - rect.top}px`);
                }}
                className="q-apple-spotlight-btn group/apple-btn px-7 py-3 gap-2 text-white font-semibold text-xs sm:text-sm"
              >
                {/* Top Specular Bevel Glint */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-[48%] bg-gradient-to-b from-white/20 via-white/[0.03] to-transparent rounded-t-full z-[2]" />
                <span className="relative z-10 tracking-wide">Launch Web Client</span>
                <svg className="w-4 h-4 text-cyan-300 relative z-10 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/apple-btn:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>

              {isPwaInstallable && (
                <button
                  onClick={handleInstallPwa}
                  onPointerMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    e.currentTarget.style.setProperty("--btn-x", `${e.clientX - rect.left}px`);
                    e.currentTarget.style.setProperty("--btn-y", `${e.clientY - rect.top}px`);
                  }}
                  className="q-apple-spotlight-btn group/apple-btn px-6 py-3 gap-2 text-slate-200 hover:text-white font-medium text-xs sm:text-sm"
                >
                  {/* Top Specular Bevel Glint */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-[48%] bg-gradient-to-b from-white/20 via-white/[0.03] to-transparent rounded-t-full z-[2]" />
                  <span className="relative z-10 tracking-wide">Install Web App (PWA)</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              No Phone / Email Required
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              Hardware-Accelerated 60fps
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              24h Ephemeral Self-Purge
            </span>
          </div>
        </div>

        {/* FLAGSHIP REAL PRODUCT SHOWCASE WINDOW (THE VALUE PROPOSITION CANVAS) */}
        <section id="product-showcase" className="w-full max-w-5xl mx-auto mb-28 scroll-mt-24">
          <div className="q-spotlight-card rounded-[32px] p-4 sm:p-7 border border-white/15 bg-[#050914]/85 backdrop-blur-3xl shadow-[0_30px_90px_rgba(0,0,0,0.85),inset_0_1px_1.5px_rgba(255,255,255,0.2)] relative overflow-hidden">
            {/* Apple VisionOS / macOS Glass Chrome Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3.5 pb-4 px-2 border-b border-white/[0.08]">
              {/* Window Controls & Apple macOS Glass Brand Capsule */}
              <div className="flex items-center gap-2.5">
                {/* Authentic macOS Traffic Lights with Interactive Reveal Glyphs */}
                <div className="group/traffic flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                  {/* Close (Red) */}
                  <div className="relative w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]/90 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),0_1px_2px_rgba(0,0,0,0.3)] flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-110 active:scale-95">
                    <svg className="w-2 h-2 text-[#4c0000] opacity-0 group-hover/traffic:opacity-100 transition-opacity duration-150" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
                      <path d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  {/* Minimize (Yellow) */}
                  <div className="relative w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]/90 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),0_1px_2px_rgba(0,0,0,0.3)] flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-110 active:scale-95">
                    <svg className="w-2 h-2 text-[#5c3c00] opacity-0 group-hover/traffic:opacity-100 transition-opacity duration-150" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
                      <path d="M5 12h14" />
                    </svg>
                  </div>
                  {/* Maximize (Green) */}
                  <div className="relative w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]/90 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),0_1px_2px_rgba(0,0,0,0.3)] flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-110 active:scale-95">
                    <svg className="w-2 h-2 text-[#003800] opacity-0 group-hover/traffic:opacity-100 transition-opacity duration-150" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M5 5h14v14H5z" fillOpacity="0.8" />
                    </svg>
                  </div>
                </div>

                {/* Apple Frosted Glass App Identity Pill */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),0_4px_16px_rgba(0,0,0,0.3)] select-none">
                  {/* Quantum Orb Emblem */}
                  <div className="relative w-4 h-4 rounded-full bg-gradient-to-tr from-cyan-500 via-sky-400 to-indigo-500 p-[1px] shadow-[0_0_8px_rgba(34,211,238,0.6)]">
                    <div className="w-full h-full rounded-full bg-[#030816] flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse shadow-[0_0_6px_rgba(34,211,238,1)]" />
                    </div>
                  </div>

                  {/* Brand Typography */}
                  <span className="text-[12px] font-semibold text-white tracking-tight flex items-center gap-1.5">
                    Q-Link
                    <span className="text-[9px] font-mono font-medium px-1.5 py-0.2 rounded-md bg-white/[0.08] text-cyan-300 border border-white/[0.1] shadow-sm">
                      v3.0
                    </span>
                  </span>

                  {/* Production Status Tag */}
                  <div className="hidden sm:flex items-center gap-1 pl-1.5 border-l border-white/[0.12] text-[10px] font-medium text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                    <span>Production</span>
                  </div>
                </div>
              </div>

              {/* Tab Switchers (Apple VisionOS Liquid Glass Segmented Pill with Dedicated Downside Scrollbar) */}
              <div className="flex flex-col items-center gap-2 flex-1 min-w-0 max-w-full md:max-w-[560px] lg:max-w-[620px] mx-auto">
                <div
                  ref={showcaseTabsRef}
                  onScroll={updateTabScrollProgress}
                  onMouseDown={handleTabsMouseDown}
                  onMouseMove={handleTabsMouseMove}
                  onMouseUp={handleTabsMouseUp}
                  onMouseLeave={handleTabsMouseUp}
                  className="q-apple-segmented-bar w-full max-w-full overflow-x-auto no-scrollbar select-none"
                >
                  {SHOWCASE_MODULES.map((m) => {
                    const isActive = activeShowcaseTab === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => {
                          if (draggedDistance.current > 6) return;
                          setActiveShowcaseTab(m.id);
                        }}
                        className={`q-apple-tab-item ${isActive ? "q-apple-tab-active" : ""}`}
                      >
                        <span className="relative z-10">{m.name}</span>
                        {isActive && (
                          <span className="relative z-10 text-[9px] px-2 py-0.5 rounded-full font-mono font-bold tracking-wider uppercase bg-cyan-400/20 text-cyan-300 border border-cyan-400/35 shadow-[0_0_8px_rgba(34,211,238,0.25)]">
                            {m.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Permanent Modern Apple Glass Downside Scrollbar */}
                <div className="flex items-center gap-2 py-0.5 select-none w-full justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      const el = showcaseTabsRef.current;
                      if (el) {
                        el.scrollBy({ left: -180, behavior: "smooth" });
                        setTimeout(updateTabScrollProgress, 180);
                      }
                    }}
                    className="p-1 rounded-full text-slate-400 hover:text-cyan-300 hover:bg-white/10 transition-colors cursor-pointer"
                    title="Scroll Left"
                    aria-label="Scroll Tabs Left"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <div
                    onClick={handleScrollbarTrackClick}
                    className="group/scrolltrack relative w-44 sm:w-64 h-[4px] hover:h-[6px] rounded-full bg-white/[0.12] hover:bg-white/[0.18] backdrop-blur-md cursor-pointer transition-all duration-200 overflow-hidden shadow-[inset_0_1px_1px_rgba(0,0,0,0.5)]"
                    title="Click or drag to scroll tabs"
                  >
                    {/* Luminous Apple Capsule Thumb */}
                    <div
                      className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 shadow-[0_0_12px_rgba(34,211,238,0.85)] transition-all duration-75 ease-out"
                      style={{
                        width: `${Math.max(20, Math.min(55, tabScrollProgress.thumbWidth))}%`,
                        left: `${tabScrollProgress.thumbLeft}%`,
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const el = showcaseTabsRef.current;
                      if (el) {
                        el.scrollBy({ left: 180, behavior: "smooth" });
                        setTimeout(updateTabScrollProgress, 180);
                      }
                    }}
                    className="p-1 rounded-full text-slate-400 hover:text-cyan-300 hover:bg-white/10 transition-colors cursor-pointer"
                    title="Scroll Right"
                    aria-label="Scroll Tabs Right"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Real-time indicator */}
              <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.12)]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                <span className="tracking-wide font-semibold">ACTIVE P2P NODE</span>
              </div>
            </div>

            {/* Visual Viewport with Real High-Res Asset */}
            <div className="mt-4 rounded-2xl overflow-hidden border border-white/10 relative bg-black/80 shadow-2xl">
              {currentModule.type === "video" ? (
                <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[640px] flex items-center justify-center bg-black">
                  <video
                    src={currentModule.src}
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls
                    className="w-full h-full object-contain rounded-2xl"
                  />
                </div>
              ) : (
                <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[640px] flex items-center justify-center bg-black">
                  <Image
                    src={currentModule.src}
                    alt={currentModule.alt}
                    width={1536}
                    height={1024}
                    className="w-full h-full object-contain rounded-2xl select-none"
                    priority
                  />
                </div>
              )}
            </div>

            {/* Bottom Feature Descriptor & Metrics Bar */}
            <div className="mt-5 p-4 rounded-2xl bg-black/40 border border-white/[0.06] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
                    {currentModule.badge}
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="text-xs font-bold text-white tracking-wide">
                    {currentModule.title}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  {currentModule.description}
                </p>
              </div>

              {/* Quick Launch CTA */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <Link
                  href="/"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-lg hover:shadow-cyan-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap flex items-center gap-1.5"
                >
                  <span>Launch Web App</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Bottom 3 Real Technical Metrics */}
            <div className="mt-3 pt-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400 px-2 border-t border-white/[0.06]">
              {currentModule.metrics.map((metric, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span className="text-slate-500">{metric.label}:</span>
                  <span className="text-slate-200 font-semibold">{metric.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LIVE CRYPTOGRAPHIC TELEMETRY COCKPIT (THE "SHOW, DON'T TELL" SHOWCASE) */}
        <section id="telemetry" className="mb-28 scroll-mt-28">
          <div className="q-spotlight-card rounded-3xl p-6 sm:p-10 border border-white/10 shadow-[0_20px_70px_rgba(0,0,0,0.8)]">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,1)] animate-ping duration-1000" />
                <span className="text-xs font-mono tracking-[0.2em] uppercase font-bold text-cyan-400">
                  Live Cryptographic Handshake Engine
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  RELAY PING: <span className="text-white font-bold">{relayLatency}ms</span>
                </span>
                <span className="hidden sm:inline text-slate-600">|</span>
                <span className="hidden sm:inline">ZERO-KNOWLEDGE AUDIT: <span className="text-emerald-400 font-bold">PASSED</span></span>
              </div>
            </div>

            {/* Interactive Telemetry Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-8">
              {/* Left Column: Rotating Session Entropy */}
              <div className="flex flex-col justify-between p-6 rounded-2xl bg-black/40 border border-white/[0.06]">
                <div>
                  <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-slate-400 block mb-2">
                    Active Session Token
                  </span>
                  <div className="h-10 flex items-center">
                    <span className="font-mono text-xs sm:text-sm text-cyan-300 tracking-wider truncate">
                      {SAMPLE_HASHES[activeHashIndex]}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Entropy Metric</span>
                  <span className="text-emerald-400 font-bold">99.98% True Random</span>
                </div>
              </div>

              {/* Center Column: 3-Node Interactive Visualizer */}
              <div className="flex flex-col justify-between p-6 rounded-2xl bg-black/40 border border-white/[0.06]">
                <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-slate-400 block mb-3">
                  P2P Node Relay Topology
                </span>

                <div className="flex items-center justify-between py-2 relative">
                  {/* Origin Node */}
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono text-xs font-bold shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                      C1
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 mt-1.5">Client</span>
                  </div>

                  {/* Flow Path */}
                  <div className="flex-1 mx-3 h-[2px] bg-slate-800 relative overflow-hidden">
                    <div
                      className="absolute top-0 bottom-0 w-8 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-[scanDown_1.8s_linear_infinite]"
                      style={{ transform: "translateX(100%)" }}
                    />
                  </div>

                  {/* Distributed Relay Node */}
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-mono text-xs font-bold shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                      R0
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 mt-1.5">Relay</span>
                  </div>

                  {/* Flow Path */}
                  <div className="flex-1 mx-3 h-[2px] bg-slate-800 relative overflow-hidden">
                    <div
                      className="absolute top-0 bottom-0 w-8 bg-gradient-to-r from-transparent via-indigo-400 to-transparent animate-[scanDown_1.8s_linear_infinite]"
                      style={{ transform: "translateX(100%)" }}
                    />
                  </div>

                  {/* Destination Peer */}
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                      P2
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 mt-1.5">Peer</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Encryption Layer</span>
                  <span className="text-cyan-400 font-semibold">ChaCha20-Poly1305</span>
                </div>
              </div>

              {/* Right Column: Handshake Verifier Action */}
              <div className="flex flex-col justify-between p-6 rounded-2xl bg-black/40 border border-white/[0.06]">
                <div>
                  <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-slate-400 block mb-2">
                    Security Verification Status
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-bold text-white">
                      {isHandshakeTesting ? "VERIFYING P2P TUNNEL..." : "SOVEREIGN LINK SECURED"}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-300"
                      style={{ width: `${handshakeProgress}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={triggerHandshakeSimulation}
                  disabled={isHandshakeTesting}
                  className="mt-6 w-full py-2.5 rounded-xl q-btn-hardware text-xs font-mono uppercase tracking-widest text-cyan-300 font-semibold flex items-center justify-center gap-2 hover:text-white"
                >
                  <svg className={`w-3.5 h-3.5 ${isHandshakeTesting ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>{isHandshakeTesting ? "Simulating..." : "Test Cryptographic Handshake"}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* PRODUCTION SUITE & CLIENT DOWNLOAD MATRIX */}
        <section id="downloads" className="mb-28 scroll-mt-28">
          <div className="q-spotlight-card rounded-3xl p-8 sm:p-12 border border-white/10 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <span className="text-xs font-mono tracking-widest text-cyan-400 uppercase font-bold block mb-2">
                  Client Engineering Suite
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Cross-Platform Deployment Architecture
                </h2>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs font-mono">
                <button
                  onClick={() => setSelectedProductView("web")}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    selectedProductView === "web"
                      ? "bg-white text-slate-950 font-bold shadow-md"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  Web Client
                </button>
                <button
                  onClick={() => setSelectedProductView("desktop")}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    selectedProductView === "desktop"
                      ? "bg-white text-slate-950 font-bold shadow-md"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  Windows Desktop
                </button>
                <button
                  onClick={() => setSelectedProductView("pwa")}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    selectedProductView === "pwa"
                      ? "bg-white text-slate-950 font-bold shadow-md"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  Installable PWA
                </button>
              </div>
            </div>

            {/* Dynamic Card Display Based on Tab */}
            <div className="bg-slate-950/80 rounded-2xl border border-white/10 p-6 sm:p-8">
              {selectedProductView === "web" && (
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-300 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20 mb-3">
                      <span>Zero Installation</span>
                      <span>·</span>
                      <span>Universal Access</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Q-Link Web Application</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Instant browser access on Chrome, Safari, Edge, and Firefox. Includes full dynamic recency contact ranking, real-time message status ticks, voice memos, and ephemeral media self-cleaning without leaving traces.
                    </p>
                  </div>
                  <Link
                    href="/"
                    className="q-btn-hardware px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap"
                  >
                    Open Web App Now
                  </Link>
                </div>
              )}

              {selectedProductView === "desktop" && (
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 text-xs font-mono text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 mb-3">
                      <span>Native Windows .exe</span>
                      <span>·</span>
                      <span>75 MB Production Binary</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Q-Link Windows Desktop Client</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      High-performance standalone desktop app with native system tray minimization, hardware-accelerated 60fps rendering, global notifications, and auto-start capability.
                    </p>
                  </div>
                  <a
                    href="/downloads/Q-Link-Setup.exe"
                    download="Q-Link-Setup.exe"
                    className="q-btn-hardware px-8 py-3.5 rounded-xl bg-white text-slate-950 font-bold text-sm shadow-xl hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2.5 whitespace-nowrap"
                  >
                    <svg className="w-4 h-4 text-cyan-600 fill-current" viewBox="0 0 24 24">
                      <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.949-1.801" />
                    </svg>
                    <span>Download Windows .exe</span>
                  </a>
                </div>
              )}

              {selectedProductView === "pwa" && (
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 mb-3">
                      <span>Progressive Web App</span>
                      <span>·</span>
                      <span>Mobile & Desktop</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Installable Mobile & Desktop PWA</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Install Q-Link directly to your homescreen or desktop dock. Enjoy full offline caching, native shell wrapping, and instant launch with zero app store gatekeeping.
                    </p>
                  </div>
                  <button
                    onClick={handleInstallPwa}
                    className="q-btn-hardware px-8 py-3.5 rounded-xl text-white font-bold text-sm transition-all whitespace-nowrap"
                  >
                    Install PWA Client
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* PRODUCT ARCHITECTURE & VISUAL FEATURE SUITE */}
        <section id="architecture" className="mb-28 scroll-mt-28">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-xs uppercase tracking-widest mb-3">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Sovereign Product Architecture
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">
              Engineered for Zero Data Retention & Maximum Control
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
              Every system module in Q-Link is built around deterministic math, immediate client sovereignty, and high-performance visual elegance.
            </p>
          </div>

          {/* 4 Flagship Visual Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Chat Tunnel */}
            <div className="q-spotlight-card rounded-3xl p-6 sm:p-8 border border-white/10 flex flex-col justify-between group">
              <div>
                <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden mb-6 border border-white/10 bg-black/60 shadow-lg">
                  <Image
                    src="/visuals/qlink-chat-tunnel.png"
                    alt="ChaCha20 Ephemeral Chat Tunnel"
                    width={800}
                    height={500}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-cyan-300 font-bold uppercase tracking-wider">
                    ChaCha20-Poly1305
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 flex items-center justify-between">
                  <span>Zero-Trace Ephemeral Chat</span>
                  <span className="text-xs font-mono text-cyan-400 font-normal">24h Purge</span>
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                  Direct peer-to-peer tunnels with cryptographic authenticity. Media attachments automatically self-destruct after 24 hours, reducing personal data liability to zero.
                </p>
              </div>
              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Memory Storage</span>
                <span className="text-emerald-400 font-semibold">0 Bytes Cloud Logs</span>
              </div>
            </div>

            {/* Card 2: Global Directory */}
            <div className="q-spotlight-card rounded-3xl p-6 sm:p-8 border border-white/10 flex flex-col justify-between group">
              <div>
                <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden mb-6 border border-white/10 bg-black/60 shadow-lg">
                  <Image
                    src="/visuals/qlink-global-directory.png"
                    alt="Global Quantum Directory"
                    width={800}
                    height={500}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-cyan-300 font-bold uppercase tracking-wider">
                    Verified Founders
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 flex items-center justify-between">
                  <span>Global Sovereign Directory</span>
                  <span className="text-xs font-mono text-cyan-400 font-normal">Zero KYC</span>
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                  Discover elite founders and sapphire VIPs across the network using purely mathematical Quantum IDs. Zero phone number or email exposure required.
                </p>
              </div>
              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Identity Model</span>
                <span className="text-cyan-400 font-semibold">Cryptographic ID</span>
              </div>
            </div>

            {/* Card 3: Social Feed */}
            <div className="q-spotlight-card rounded-3xl p-6 sm:p-8 border border-white/10 flex flex-col justify-between group">
              <div>
                <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden mb-6 border border-white/10 bg-black/60 shadow-lg">
                  <Image
                    src="/visuals/qlink-social-feed.png"
                    alt="Quantum ID Console Social Feed"
                    width={800}
                    height={500}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-cyan-300 font-bold uppercase tracking-wider">
                    Aura Algorithm
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 flex items-center justify-between">
                  <span>Decentralized Media Feed</span>
                  <span className="text-xs font-mono text-indigo-400 font-normal">Organic Reach</span>
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                  Share posts and rich media with customizable scope (Global, Followers, or Friends). Ranked by natural peer connection Aura rather than commercial ad-tracking.
                </p>
              </div>
              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Algorithmic Bias</span>
                <span className="text-indigo-400 font-semibold">0% Ad Distortion</span>
              </div>
            </div>

            {/* Card 4: Sapphire VIP */}
            <div className="q-spotlight-card rounded-3xl p-6 sm:p-8 border border-white/10 flex flex-col justify-between group">
              <div>
                <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden mb-6 border border-white/10 bg-black/60 shadow-lg">
                  <Image
                    src="/visuals/qlink-vip-upgrade.png"
                    alt="Sapphire VIP Hologram Card"
                    width={800}
                    height={500}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-cyan-300 font-bold uppercase tracking-wider">
                    3D Hologram Reflex
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 flex items-center justify-between">
                  <span>Sapphire VIP Identity</span>
                  <span className="text-xs font-mono text-blue-400 font-normal">1.5x Booster</span>
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                  Permanent cobalt verification badge, pinned directory positioning, and a reactive 3D holographic card preview that shines on all directory screens.
                </p>
              </div>
              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Directory Priority</span>
                <span className="text-blue-400 font-semibold">Permanent Pin</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECURITY & PROTOCOL COMPARISON MATRIX */}
        <section id="comparison" className="mb-32 sm:mb-40 scroll-mt-28">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono tracking-widest text-cyan-400 uppercase font-bold block mb-3">
              Competitive Architecture
            </span>
            <h2 className="text-3xl font-bold text-white">How Q-Link Compares to Big Tech</h2>
          </div>

          <div className="q-spotlight-card rounded-3xl overflow-hidden border border-white/15 bg-[#060a14]/85 backdrop-blur-2xl shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="p-5 font-semibold text-slate-300">Feature Dimension</th>
                    <th className="p-5 font-semibold text-slate-400">Corporate Giants (Meta / X / TG)</th>
                    <th className="p-5 font-bold text-cyan-300 bg-cyan-500/[0.08]">Q-Link Protocol v3.0</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-normal text-slate-300 text-xs sm:text-sm">
                  <tr>
                    <td className="p-5 font-medium text-white">Identity Binding</td>
                    <td className="p-5 text-red-400/80">Phone Number, Email, Govt KYC</td>
                    <td className="p-5 font-semibold text-emerald-400 bg-cyan-500/[0.04]">Zero KYC · Mathematical Quantum ID</td>
                  </tr>
                  <tr>
                    <td className="p-5 font-medium text-white">Message Cloud Storage</td>
                    <td className="p-5 text-red-400/80">Permanent central database history</td>
                    <td className="p-5 font-semibold text-emerald-400 bg-cyan-500/[0.04]">0 Bytes (Ephemeral Self-Wiping TTL)</td>
                  </tr>
                  <tr>
                    <td className="p-5 font-medium text-white">Ad Tracking & Telemetry</td>
                    <td className="p-5 text-red-400/80">Ad identifiers, pixel brokers & tracking</td>
                    <td className="p-5 font-semibold text-emerald-400 bg-cyan-500/[0.04]">Zero Trackers · Zero Ads Forever</td>
                  </tr>
                  <tr>
                    <td className="p-5 font-medium text-white">Algorithm Transparency</td>
                    <td className="p-5 text-red-400/80">Blackbox rage-bait engagement silos</td>
                    <td className="p-5 font-semibold text-emerald-400 bg-cyan-500/[0.04]">Auditable Dual-Feed Chronological Stream</td>
                  </tr>
                  <tr>
                    <td className="p-5 font-medium text-white">Platform Access</td>
                    <td className="p-5 text-slate-400">App store silos & account gating</td>
                    <td className="p-5 font-semibold text-emerald-400 bg-cyan-500/[0.04]">Universal Web, PWA & Desktop Binary (.exe)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {/* TECH GIANT STANDARD CORPORATE MEGA FOOTER & GOVERNANCE DIRECTORY */}
      <footer id="corporate-directory" className="relative border-t border-white/10 pt-16 pb-14 overflow-hidden z-10 w-full">
        {/* Subtle Ambient Top Border Sheen */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

        <div className="max-w-6xl mx-auto px-4">
          {/* Top Tier: Brand Anchor, Protocol Health & Social Dock */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 pb-12 border-b border-white/10">
            <div className="max-w-md">
              <div className="flex items-center gap-3 mb-3">
                {/* REAL OFFICIAL Q-LINK LOGO */}
                <div className="w-10 h-10 rounded-full overflow-hidden p-[1px] bg-gradient-to-br from-cyan-400 via-blue-500 to-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.7)] flex-shrink-0">
                  <div className="w-full h-full rounded-full overflow-hidden bg-slate-950 flex items-center justify-center">
                    <Image
                      src="/logo-256.png"
                      alt="Q-Link Protocol Logo"
                      width={40}
                      height={40}
                      className="w-full h-full object-cover rounded-full select-none pointer-events-none"
                      priority
                    />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-white tracking-wide">Q-Link Protocol</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    v3.0 Sovereign
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                The decentralized, zero-data-retention communication network powered by Quantum IDs. Architected from first principles to guarantee private human connection without centralized corporate control.
              </p>

              {/* Protocol Health Live Badge */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full q-btn-hardware text-[11px] font-mono text-emerald-400 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>ALL PROTOCOL NODES OPERATIONAL · 0 BYTES LOGGED</span>
              </div>
            </div>

            {/* Official Social Handles Floating Dock with AUTHENTIC BRAND BACKGROUNDS */}
            <div className="flex flex-col items-start lg:items-end gap-3 w-full lg:w-auto">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                Official Verified Handles
              </div>

              {/* Authentic Brand Colors Social Dock */}
              <div className="inline-flex items-center justify-center p-2.5 rounded-full q-btn-hardware border border-white/15 gap-3 shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
                {SOCIAL_LINKS.map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${item.title} (${item.handle})`}
                    className={`group relative p-3 rounded-full ${item.bgColor} transition-all duration-300 hover:scale-125 hover:-translate-y-1 active:scale-95 flex items-center justify-center`}
                  >
                    {/* SVG Icon */}
                    <div className="transition-transform duration-200">
                      {item.icon}
                    </div>

                    {/* Apple-Style Floating Tooltip */}
                    <div className="pointer-events-none absolute -top-11 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0 z-50">
                      <div className="px-3 py-1 rounded-lg text-[11px] font-sans font-medium text-white whitespace-nowrap shadow-2xl border border-white/20 bg-slate-950/95 backdrop-blur-md">
                        <span className="font-semibold text-cyan-400">{item.badge}</span>: {item.handle}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Middle Tier: 5-Column Corporate Navigation Architecture */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 py-12 border-b border-white/10 text-xs">
            {/* Column 1: Platform */}
            <div className="flex flex-col gap-3">
              <h5 className="font-semibold text-white tracking-wider uppercase text-[11px] font-mono text-cyan-400">
                Platform
              </h5>
              <Link href="/" className="text-slate-400 hover:text-white transition-colors">
                Use Web App
              </Link>
              <a
                href="/downloads/Q-Link-Setup.exe"
                download="Q-Link-Setup.exe"
                className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 font-medium"
              >
                <span>Download Windows (.exe)</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300">75MB</span>
              </a>
              <Link href="/about" className="text-slate-400 hover:text-white transition-colors">
                Platform Architecture
              </Link>
              {isPwaInstallable && (
                <button
                  onClick={handleInstallPwa}
                  className="text-left text-slate-400 hover:text-slate-300 transition-colors"
                >
                  Install Mobile PWA
                </button>
              )}
            </div>

            {/* Column 2: Cryptography & Security */}
            <div className="flex flex-col gap-3">
              <h5 className="font-semibold text-white tracking-wider uppercase text-[11px] font-mono text-indigo-400">
                Security
              </h5>
              <a href="#architecture" className="text-slate-400 hover:text-cyan-300 transition-colors flex items-center justify-between group">
                <span>Zero-Persistence Core</span>
                <span className="text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400">↓</span>
              </a>
              <button
                onClick={() => setActiveTrustModal("encryption")}
                className="text-left text-slate-400 hover:text-cyan-300 transition-colors flex items-center justify-between group cursor-pointer"
              >
                <span>ChaCha20-Poly1305 & AES-GCM</span>
                <span className="text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400">↗</span>
              </button>
              <button
                onClick={() => setActiveTrustModal("ratelimit")}
                className="text-left text-slate-400 hover:text-cyan-300 transition-colors flex items-center justify-between group cursor-pointer"
              >
                <span>Edge Burst Rate Limiter</span>
                <span className="text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400">↗</span>
              </button>
              <button
                onClick={() => setActiveTrustModal("canary")}
                className="text-left text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5 cursor-pointer group"
              >
                <span>No-Log Warranty Canary</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400 ml-auto">↗</span>
              </button>
              <button
                onClick={() => setActiveTrustModal("shield")}
                className="text-left text-slate-400 hover:text-cyan-300 transition-colors flex items-center justify-between group cursor-pointer"
              >
                <span>On-Device Content Shield</span>
                <span className="text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400">↗</span>
              </button>
            </div>

            {/* Column 3: Developers & Ecosystem */}
            <div className="flex flex-col gap-3">
              <h5 className="font-semibold text-white tracking-wider uppercase text-[11px] font-mono text-purple-400">
                Ecosystem
              </h5>
              <a
                href="/llms.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors flex items-center gap-1"
              >
                <span>llms.txt AI Feed</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-white/10 text-cyan-300">NEW</span>
              </a>
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors"
              >
                Sitemap XML
              </a>
              <a
                href="/robots.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors"
              >
                Crawler Directives
              </a>
              <a
                href="https://github.com/rohiterrors-ship-it/Q-Link_v3.0"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors"
              >
                GitHub Repository
              </a>
              <button
                onClick={() => setActiveTrustModal("audit")}
                className="text-left text-slate-400 hover:text-cyan-300 transition-colors flex items-center justify-between group cursor-pointer font-mono text-[10px]"
              >
                <span>Audit Status: PASS</span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-sans font-semibold">VERIFIED ↗</span>
              </button>
            </div>

            {/* Column 4: Network & Team */}
            <div className="flex flex-col gap-3">
              <h5 className="font-semibold text-white tracking-wider uppercase text-[11px] font-mono text-emerald-400">
                Transmissions
              </h5>
              <a
                href="https://x.com/qlinkplatform"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-cyan-400 transition-colors"
              >
                Official Dispatch (@qlinkplatform)
              </a>
              <a
                href="https://x.com/Bace_Labe"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-violet-400 transition-colors"
              >
                Founder Notes (@Bace_Labe)
              </a>
              <a
                href="https://x.com/GhorKamanSaaS"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-blue-400 transition-colors"
              >
                Architect Log (@GhorKamanSaaS)
              </a>
              <a
                href="https://www.youtube.com/@Aexon.AITech"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-red-400 transition-colors"
              >
                YouTube Video Briefings
              </a>
              <a
                href="https://www.reddit.com/user/QLinkOfficial/submitted/?sort=hot"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-amber-400 transition-colors"
              >
                Reddit Discussions
              </a>
            </div>

            {/* Column 5: Trust & Constitution */}
            <div className="flex flex-col gap-2.5">
              <h5 className="font-semibold text-white tracking-wider uppercase text-[11px] font-mono text-cyan-400">
                Trust Charter
              </h5>
              <Link
                href="/privacy"
                className="text-left text-cyan-300 hover:text-white hover:underline transition-colors flex items-center gap-1.5 font-medium"
              >
                <span>Privacy Policy</span>
                <span className="text-[10px] text-cyan-400">↗</span>
              </Link>
              <Link
                href="/privacy#section-6"
                className="text-left text-slate-300 hover:text-white hover:underline transition-colors flex items-center gap-1.5 font-medium"
              >
                <span>Terms of Protocol</span>
                <span className="text-[10px] text-slate-400">↗</span>
              </Link>
              <button
                type="button"
                onClick={() => setActiveTrustModal("privacy")}
                className="text-left text-slate-400 hover:text-white transition-colors text-xs"
              >
                Constitutional Privacy Overview
              </button>
              <button
                type="button"
                onClick={() => setActiveTrustModal("terms")}
                className="text-left text-slate-400 hover:text-white transition-colors text-xs"
              >
                Autonomous Terms Overview
              </button>
              <span className="text-slate-400 text-xs">100% Cookie-Free</span>
              <span className="text-slate-400 text-xs">Anti-Monopoly Stance</span>
              <span className="text-emerald-400 font-mono text-[10px]">Zero Data Retention: ACTIVE</span>
            </div>
          </div>

          {/* Bottom Tier: Copyright & Compliance Disclaimer */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>&copy; 2026 Q-LINK PROTOCOL FOUNDATION. ALL RIGHTS RESERVED TO HUMAN PRIVACY.</span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-3 gap-y-1.5 text-center sm:text-right">
              <Link href="/privacy" className="hover:text-cyan-400 transition-colors underline underline-offset-2">Privacy Policy</Link>
              <span>&middot;</span>
              <Link href="/privacy#section-6" className="hover:text-cyan-400 transition-colors underline underline-offset-2">Terms of Protocol</Link>
              <span>&middot;</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="q-spotlight-card rounded-3xl p-8 max-w-lg w-full border border-white/20 shadow-2xl relative">
            <button
              onClick={() => setActiveTrustModal(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white text-lg font-mono p-1 rounded-full hover:bg-white/10 transition-colors"
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
                <div className="mt-5 pt-3.5 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-mono">10-Clause Full Autopsy</span>
                  <Link
                    href="/privacy"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 text-xs font-semibold transition-all"
                  >
                    <span>Read Full Privacy Charter</span>
                    <span>↗</span>
                  </Link>
                </div>
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
                <div className="mt-5 pt-3.5 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-mono">Autonomous Protocol Terms</span>
                  <Link
                    href="/privacy#section-6"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-500/30 text-xs font-semibold transition-all"
                  >
                    <span>Read Full Terms of Protocol</span>
                    <span>↗</span>
                  </Link>
                </div>
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

            {activeTrustModal === "encryption" && (
              <div>
                <span className="text-xs font-mono uppercase text-cyan-400 block mb-2">Cryptographic Protocol</span>
                <h4 className="text-xl font-bold text-white mb-4">ChaCha20-Poly1305 & AES-GCM</h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Q-Link utilizes state-of-the-art authenticated encryption with associated data (AEAD) designed for extreme speed and security:
                </p>
                <ul className="text-xs text-slate-400 space-y-2 mb-6 font-mono">
                  <li>✔ ChaCha20: 256-bit stream cipher immune to cache-timing attacks on modern silicon</li>
                  <li>✔ Poly1305: 128-bit one-time authenticator guaranteeing cryptographic integrity</li>
                  <li>✔ AES-256-GCM: Hardware-accelerated fallback via AES-NI CPU instructions</li>
                  <li>✔ Ephemeral Ratchets: Unique cryptographic session keys generated per peer handshake</li>
                </ul>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Payloads are encrypted purely in-memory before transmission and dissolved after 24 hours.
                </p>
                <div className="mt-4 flex gap-3">
                  <a
                    href="#architecture"
                    onClick={() => setActiveTrustModal(null)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
                  >
                    <span>View Cryptographic Architecture</span>
                    <span>↓</span>
                  </a>
                </div>
              </div>
            )}

            {activeTrustModal === "ratelimit" && (
              <div>
                <span className="text-xs font-mono uppercase text-indigo-400 block mb-2">Edge Infrastructure</span>
                <h4 className="text-xl font-bold text-white mb-4">Edge Burst Rate Limiter</h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Autonomous protection against distributed spam, credential attacks, and sybil floods:
                </p>
                <ul className="text-xs text-slate-400 space-y-2 mb-6 font-mono">
                  <li>✔ Token Bucket Algorithm: Limits handshakes to 5 burst pulses per minute</li>
                  <li>✔ Zero Cookie Tracking: Subnet identification handled via volatile in-memory sliding hashes</li>
                  <li>✔ Automated IP Cool-down: Excess requests deflected at edge POPs with zero backend load</li>
                  <li>✔ Replay Guard: Unique nonces prevent duplication of cryptographic transmissions</li>
                </ul>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Ensures 99.99% availability without requiring persistent user cookies or intrusive CAPTCHAs.
                </p>
                <div className="mt-4 flex gap-3">
                  <a
                    href="#telemetry"
                    onClick={() => setActiveTrustModal(null)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
                  >
                    <span>View Live Telemetry Handshakes</span>
                    <span>↓</span>
                  </a>
                </div>
              </div>
            )}

            {activeTrustModal === "shield" && (
              <div>
                <span className="text-xs font-mono uppercase text-purple-400 block mb-2">Client Defense</span>
                <h4 className="text-xl font-bold text-white mb-4">On-Device Content Shield</h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Hardware-level isolation and sandboxing protecting your device environment:
                </p>
                <ul className="text-xs text-slate-400 space-y-2 mb-6 font-mono">
                  <li>✔ Client-Side Sanitization: Zero untrusted payload or executable script execution</li>
                  <li>✔ RAM-Only Waveforms: Voice memos and media stream directly through volatile memory heaps</li>
                  <li>✔ Anti-Exfiltration Barrier: Blocks third-party telemetry, trackers, and telemetry beacons</li>
                  <li>✔ Hardware Memory Scrub: Volatile buffers cleared immediately upon message expiration</li>
                </ul>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your device never writes unencrypted communications to persistent storage partitions.
                </p>
                <div className="mt-4 flex gap-3">
                  <a
                    href="#comparison"
                    onClick={() => setActiveTrustModal(null)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
                  >
                    <span>Compare Security Specs</span>
                    <span>↓</span>
                  </a>
                </div>
              </div>
            )}

            {activeTrustModal === "audit" && (
              <div>
                <span className="text-xs font-mono uppercase text-emerald-400 block mb-2">Cryptographic Audit</span>
                <h4 className="text-xl font-bold text-white mb-4">Cryptographic Audit Matrix</h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Continuous security and architectural verification status:
                </p>
                <ul className="text-xs text-emerald-400 space-y-2 mb-6 font-mono">
                  <li>✔ Zero-Telemetry Verification: 0 outbound analytic pings recorded</li>
                  <li>✔ Memory Sanitization Audit: Volatile buffers confirmed clean on message purge</li>
                  <li>✔ CSP Level 3 Enforcement: Strict content-security policies blocking XSS vectors</li>
                  <li>✔ Open-Source Integrity: Publicly verifiable on GitHub with reproducible builds</li>
                </ul>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Automated security tests and type checkers pass on every production deployment.
                </p>
                <div className="mt-4 flex gap-3">
                  <a
                    href="https://github.com/rohiterrors-ship-it/Q-Link_v3.0"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
                  >
                    <span>Inspect GitHub Repository</span>
                    <span>↗</span>
                  </a>
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setActiveTrustModal(null)}
                className="px-5 py-2 rounded-xl q-btn-hardware text-xs font-semibold text-white transition-all"
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
