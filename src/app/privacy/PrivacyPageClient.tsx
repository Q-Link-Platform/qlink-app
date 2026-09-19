"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";

interface SectionItem {
  id: string;
  num: string;
  title: string;
  category: "autopsy" | "loopholes" | "crypto" | "terms" | "legal";
  summary: string;
  content: React.ReactNode;
}

export default function PrivacyPageClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("section-1");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setShowScrollTop(e.currentTarget.scrollTop > 300);
  };

  const scrollToTop = () => {
    containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCopyLink = (id: string) => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/privacy#${id}`;
      navigator.clipboard.writeText(url).then(() => {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      });
    }
  };

  const sections: SectionItem[] = [
    {
      id: "section-1",
      num: "01",
      title: "The Surveillance Capitalism Autopsy: How Big Tech Spies & Manipulates",
      category: "autopsy",
      summary: "A forensic breakdown of keystroke logging, behavioral micro-telemetry, ultrasonic beacons, and unposted draft harvesting.",
      content: (
        <div className="space-y-6 text-slate-300 text-sm sm:text-base leading-relaxed">
          <p>
            Modern commercial surveillance is no longer about cookies or banner ads. It has evolved into a real-time neurological extraction apparatus pioneered by legacy tech giants (Meta, ByteDance, Google, X). To understand why Q-Link is engineered as a zero-knowledge Web App, one must first confront the clandestine telemetry vectors embedded in mainstream consumer platforms:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
            <div className="rounded-2xl border border-rose-500/30 bg-rose-950/10 p-4 sm:p-5">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm mb-2">
                <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                1.1 Keystroke Telemetry & Unposted Draft Harvesting
              </div>
              <p className="text-xs sm:text-sm text-slate-300">
                Mainstream platforms record text you type into input boxes <strong className="text-white">even if you never click Send or Post</strong> (academically documented as <em>"Self-Censorship Profiling"</em>). Every backspace, hesitance, and deleted draft is timestamped to evaluate emotional volatility, impulsivity, and vulnerability.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/10 p-4 sm:p-5">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-2">
                <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                1.2 Micro-Biometric & Motion Telemetry
              </div>
              <p className="text-xs sm:text-sm text-slate-300">
                Native apps poll your gyroscope, accelerometer, and touch pressure at up to 120Hz. Correlating scroll velocity and finger tremor allows neural networks to infer whether a user is fatigued, intoxicated, anxious, or depressive, timing targeted dopamine triggers accordingly.
              </p>
            </div>

            <div className="rounded-2xl border border-purple-500/30 bg-purple-950/10 p-4 sm:p-5">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-sm mb-2">
                <span className="flex h-2 w-2 rounded-full bg-purple-500 animate-ping" />
                1.3 Ultrasonic Cross-Device Audio Beacons (uBeacons)
              </div>
              <p className="text-xs sm:text-sm text-slate-300">
                Commercials and websites broadcast inaudible high-frequency acoustic signals (18kHz–22kHz). Native apps with background microphone permissions listen for these ultrasonic beacons to link your phone to household televisions and smart speakers without your awareness.
              </p>
            </div>

            <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/10 p-4 sm:p-5">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm mb-2">
                <span className="flex h-2 w-2 rounded-full bg-cyan-500 animate-ping" />
                1.4 Relational Shadow Profiling
              </div>
              <p className="text-xs sm:text-sm text-slate-300">
                When a user grants "Address Book Access", platforms harvest the contacts of <strong className="text-white">people who never signed up</strong>. Intersectional graph theory builds exhaustive shadow profiles for individuals who deliberately refused to register.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-4 sm:p-5">
            <h4 className="font-semibold text-white text-sm sm:text-base mb-2 flex items-center gap-2">
              <span className="text-cyan-400">⚡</span> The Q-Link Architectural Defense
            </h4>
            <p className="text-xs sm:text-sm text-slate-300">
              Q-Link operates strictly as a <strong className="text-cyan-300">W3C Sandboxed Web App</strong>. Web browsers physically prohibit websites from reading contacts, polling background accelerometers, listening to inaudible background audio, or accessing local disk files. Unposted draft state exists exclusively inside local component memory.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "section-2",
      num: "02",
      title: "Corporate Legal Loopholes & The Illusion of Consent",
      category: "loopholes",
      summary: "How corporate policies exploit Legitimate Interest, Data Clean Rooms, and unilateral TOS amendments to sell data legally.",
      content: (
        <div className="space-y-6 text-slate-300 text-sm sm:text-base leading-relaxed">
          <p>
            When a Silicon Valley corporation claims <em>"We never sell your personal data,"</em> they rely on sophisticated legal loopholes and contractual sleight of hand:
          </p>

          <div className="space-y-4 my-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 sm:p-5">
              <h4 className="font-bold text-white text-sm mb-1 flex items-center justify-between">
                <span>2.1 The "Legitimate Interest" Loophole (GDPR Article 6(1)(f))</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30">Loophole</span>
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 mt-2">
                Under EU regulations, data processing requires consent. However, corporations classify behavioral tracking and ad telemetry as "Legitimate Operations" or "Fraud Prevention," bypassing opt-in mandates and burying opt-outs behind convoluted multi-step menus.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 sm:p-5">
              <h4 className="font-bold text-white text-sm mb-1 flex items-center justify-between">
                <span>2.2 "Data Clean Rooms" & Pseudonymous Cashless Arbitrage</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30">Deception</span>
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 mt-2">
                Corporations technically do not exchange raw names for physical currency. Instead, they hash personal identifiers (<code className="text-cyan-300">SHA-256(email)</code>) and pool them into corporate "Data Clean Rooms" with brokers (LiveRamp, Acxiom). Advertisers bid on matched synthetic segments, achieving identical surveillance outcomes while technically circumventing the legal definition of a "data sale."
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 sm:p-5">
              <h4 className="font-bold text-white text-sm mb-1 flex items-center justify-between">
                <span>2.3 Forced Binding Arbitration & Class Action Waivers</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30">Disenfranchisement</span>
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 mt-2">
                Virtually all consumer tech agreements force users into confidential private arbitration, forbidding collective court lawsuits. When a company experiences a catastrophic data breach, individual arbitration costs make legal recourse economically impossible.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "section-3",
      num: "03",
      title: "Q-Link Cryptographic Architecture: Mathematical Immunity",
      category: "crypto",
      summary: "Client-side WebCrypto API execution, ephemeral ciphertext routing, and zero plaintext server visibility.",
      content: (
        <div className="space-y-6 text-slate-300 text-sm sm:text-base leading-relaxed">
          <p>
            Q-Link rejects corporate verbal promises. We replace corporate trust with mathematical impossibility. Our communication protocol is engineered so that even if Q-Link servers are seized or compromised, plaintext conversations cannot be reconstructed:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
            <div className="rounded-2xl border border-cyan-500/40 bg-slate-950/90 p-4 sm:p-5 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
              <div className="text-cyan-400 font-mono text-xs uppercase tracking-widest mb-1">Layer 1: Key Custody</div>
              <h4 className="font-bold text-white text-sm sm:text-base mb-2">WebCrypto API Sandbox</h4>
              <p className="text-xs text-slate-300">
                All cryptographic keys (Elliptic Curve ECDH / P-256 / AES-256-GCM) are minted strictly inside the user's browser runtime (<code className="text-cyan-300">window.crypto.subtle</code>). Private keys are held in hardware-isolated browser storage and are mathematically incapable of being transmitted to Q-Link infrastructure.
              </p>
            </div>

            <div className="rounded-2xl border border-cyan-500/40 bg-slate-950/90 p-4 sm:p-5 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
              <div className="text-cyan-400 font-mono text-xs uppercase tracking-widest mb-1">Layer 2: Wire Transit</div>
              <h4 className="font-bold text-white text-sm sm:text-base mb-2">Blind Ciphertext Pipe</h4>
              <p className="text-xs text-slate-300">
                Encryption completes before the network payload leaves the local machine. Q-Link relays and PostgreSQL databases act as blind ciphertext conduits; they record only encrypted byte streams and pseudonymous routing identifiers.
              </p>
            </div>

            <div className="rounded-2xl border border-cyan-500/40 bg-slate-950/90 p-4 sm:p-5 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
              <div className="text-cyan-400 font-mono text-xs uppercase tracking-widest mb-1">Layer 3: Delivery Acks</div>
              <h4 className="font-bold text-white text-sm sm:text-base mb-2">W3C WebPush Protocol</h4>
              <p className="text-xs text-slate-300">
                Push notifications utilize standardized W3C WebPush APIs via Service Workers. The notification payload contains no plaintext message preview, and the Service Worker immediately signals a hardware delivery acknowledgment (<code className="text-cyan-300">status: DELIVERED</code>) without running persistent background tracking daemons.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "section-4",
      num: "04",
      title: "Data Minimization: What We Store vs. What Is Impossible to Store",
      category: "crypto",
      summary: "Complete transparency into database schemas: pseudonymous handles, public keys, and cryptographic hashes.",
      content: (
        <div className="space-y-6 text-slate-300 text-sm sm:text-base leading-relaxed">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/10 p-5">
              <h4 className="font-bold text-emerald-400 text-sm sm:text-base mb-3 flex items-center gap-2">
                <span>✓</span> Exactly What Q-Link Infrastructure Stores
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong className="text-white">Quantum Handle & Display Name:</strong> User-chosen string identifier (<code className="text-cyan-300">@handle</code>).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong className="text-white">Public Cryptographic Key:</strong> Exportable public curve string (<code className="text-cyan-300">publicKeyString</code>) used by peers to encrypt outbound payloads.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong className="text-white">Encrypted Transit Buffer:</strong> Ciphertext payloads held in storage until delivery acknowledgment is received.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong className="text-white">Node Gamification Metrics:</strong> Public Aura percentage score, badges, and points allocation.</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-rose-500/30 bg-rose-950/10 p-5">
              <h4 className="font-bold text-rose-400 text-sm sm:text-base mb-3 flex items-center gap-2">
                <span>✕</span> What Q-Link CANNOT Physically Store or Harvest
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span><strong className="text-white">Private Cryptographic Keys:</strong> Never transmitted across the network under any circumstance.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span><strong className="text-white">Plaintext Message Contents:</strong> Servers possess zero decryption keys or backdoors.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span><strong className="text-white">Address Books / Contact Scraping:</strong> Impossible under browser security sandbox restrictions.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span><strong className="text-white">Physical GPS Geolocation:</strong> No location tracking APIs, cellular triangulation, or IP telemetry logs.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "section-5",
      num: "05",
      title: "Algorithmic Manipulation & Behavioral Profiling Immunity",
      category: "autopsy",
      summary: "Zero AI sentiment extraction, zero variable-ratio dopamine feed scheduling, and sovereign chronological feeds.",
      content: (
        <div className="space-y-6 text-slate-300 text-sm sm:text-base leading-relaxed">
          <p>
            Mainstream social platforms utilize artificial intelligence not to assist users, but to maximize session dwell time using Skinner-box psychological conditioning:
          </p>

          <div className="space-y-3 my-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <h5 className="font-bold text-white text-sm">5.1 Rejection of Variable-Ratio Reward Algorithms</h5>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Q-Link does not employ machine learning recommendation engines designed to hijack human dopamine pathways. The Global Directory displays items in transparent chronological or tier-authenticated order.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <h5 className="font-bold text-white text-sm">5.2 Zero Sentiment Analysis & Natural Language Processing</h5>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Because communication payloads are encrypted client-side with AES-256-GCM, our infrastructure is incapable of running Large Language Models (LLMs) or sentiment analysis algorithms over your private conversations.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "section-6",
      num: "06",
      title: "Terms of Protocol & Node Operator Etiquette",
      category: "terms",
      summary: "Decentralized communication rights, zero tolerance for exploitation, and Upstash rate limiting governance.",
      content: (
        <div className="space-y-6 text-slate-300 text-sm sm:text-base leading-relaxed">
          <div className="space-y-4 my-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <h5 className="font-bold text-white text-sm">6.1 Autonomous Identity Sovereignty</h5>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                You are solely responsible for safeguarding your browser session and cryptographic private key. Q-Link personnel will never request your private key, password, or security credentials. If you clear your browser storage without backup, your identity cannot be restored by administrators.
              </p>
            </div>

            <div className="rounded-xl border border-rose-500/30 bg-rose-950/10 p-4">
              <h5 className="font-bold text-rose-300 text-sm">6.2 Zero-Tolerance Prohibited Conduct</h5>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                The network strictly prohibits: (a) dissemination of Child Sexual Abuse Material (CSAM); (b) violent extremist terror mobilization; (c) distribution of malware, ransomware, or distributed denial of service (DDoS) command payloads; (d) automated credential harvesting or unauthorized scraping botnets. Violation results in immediate, permanent cryptographic node ban.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <h5 className="font-bold text-white text-sm">6.3 Distributed Rate-Limiting & Fair Use</h5>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                To prevent network exhaustion, Q-Link enforces cryptographic token-bucket rate limits governed by Upstash Redis clusters. High-frequency automated spamming or beacon abuse triggers automatic temporary throttling at the network edge.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "section-7",
      num: "07",
      title: "The 'Nuclear Purge' Protocol: The Absolute Right to Disappear",
      category: "terms",
      summary: "Atomic zero-retention cascading hard deletes. When you destroy your account, every byte is permanently wiped.",
      content: (
        <div className="space-y-6 text-slate-300 text-sm sm:text-base leading-relaxed">
          <p>
            Unlike traditional social media networks that maintain "soft-deleted" records in backup archives for 90 to 180 days, Q-Link implements the <strong className="text-cyan-300">Nuclear Purge Protocol</strong>:
          </p>

          <div className="rounded-2xl border border-cyan-500/40 bg-slate-950/90 p-5">
            <h4 className="font-bold text-white text-sm sm:text-base mb-2 flex items-center gap-2">
              <span className="text-cyan-400">⚡</span> 1-Click Complete Erasure Pipeline
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm text-slate-300">
              <li><strong className="text-white">Database Cascade:</strong> PostgreSQL triggers an atomic hard-delete cascade across all user records, sessions, push subscriptions, and message buffers.</li>
              <li><strong className="text-white">Media Expungement:</strong> Uploaded attachments and 24-hour ephemeral posts are immediately deleted from storage buckets.</li>
              <li><strong className="text-white">Local Sandbox Scrubber:</strong> The browser executes an automatic wipe of IndexedDB cryptographic keyrings and LocalStorage identifiers.</li>
            </ol>
            <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-400">
              Result: Zero residue. No shadow profiles, no archived metadata, no recovery backdoors.
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "section-8",
      num: "08",
      title: "Warrant Canary & Subpoena Mathematics",
      category: "legal",
      summary: "Mathematical impossibility of compliance with unlawful surveillance orders. Active warrant canary statement.",
      content: (
        <div className="space-y-6 text-slate-300 text-sm sm:text-base leading-relaxed">
          <div className="rounded-2xl border border-amber-500/30 bg-amber-950/10 p-5 my-4">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm mb-2">
              <span>🛡️</span> Official Cryptographic Warrant Canary
            </div>
            <p className="text-xs sm:text-sm text-slate-300">
              As of the current protocol epoch, Q-Link has received <strong className="text-white">ZERO (0)</strong> National Security Letters, secret FISA court orders, or governmental interception directives. Q-Link has never installed a master decryption key, law enforcement backdoor, or silent surveillance tap within its codebase.
            </p>
          </div>

          <p className="text-xs sm:text-sm text-slate-400">
            Because Q-Link operates on client-side zero-knowledge encryption, any legal subpoena compelling us to decrypt user communications will receive the only technically accurate response: <em className="text-slate-200">"We do not possess the cryptographic keys. Decryption is mathematically impossible."</em>
          </p>
        </div>
      ),
    },
    {
      id: "section-9",
      num: "09",
      title: "International Regulatory Compliance (GDPR & CCPA by Design)",
      category: "legal",
      summary: "Full structural compliance with European Union GDPR, California CCPA/CPRA, and international data frameworks.",
      content: (
        <div className="space-y-6 text-slate-300 text-sm sm:text-base leading-relaxed">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <h5 className="font-bold text-white text-sm mb-1">European Union GDPR (Regulation 2016/679)</h5>
              <ul className="text-xs text-slate-300 space-y-1 mt-2">
                <li>• <strong className="text-white">Art. 15 (Access):</strong> Full access to all raw stored records via ID Console.</li>
                <li>• <strong className="text-white">Art. 17 (Right to Erasure):</strong> Instantaneous hard-purge with zero delays.</li>
                <li>• <strong className="text-white">Art. 25 (Privacy by Design):</strong> Client-side cryptographic isolation by default.</li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <h5 className="font-bold text-white text-sm mb-1">California Consumer Privacy Act (CCPA / CPRA)</h5>
              <ul className="text-xs text-slate-300 space-y-1 mt-2">
                <li>• <strong className="text-white">Zero Sale of Data:</strong> No commercial transactions involving user telemetry.</li>
                <li>• <strong className="text-white">Zero Cross-Context Ads:</strong> No behavioral tracking or retargeting pixels.</li>
                <li>• <strong className="text-white">Non-Discrimination:</strong> Complete protocol functionality without paywalling privacy.</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "section-10",
      num: "10",
      title: "Open-Source Verification & Official Legal Coordinates",
      category: "legal",
      summary: "Cryptographic commit logging, reproducible web builds, and official legal contact channels.",
      content: (
        <div className="space-y-6 text-slate-300 text-sm sm:text-base leading-relaxed">
          <p>
            The ultimate test of a security architecture is transparent reproducibility. All platform updates, cryptographic handlers, and Service Worker scripts are tracked within authenticated public Git repositories.
          </p>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-3">
            <h5 className="font-bold text-white text-sm">Official Protocol Contact Coordinates:</h5>
            <div className="text-xs sm:text-sm font-mono text-cyan-300 space-y-1">
              <p>• Security & Vulnerability Disclosures: <a href="mailto:security@qlink.chat" className="underline hover:text-cyan-200">security@qlink.chat</a></p>
              <p>• Legal & Regulatory Affairs: <a href="mailto:legal@qlink.chat" className="underline hover:text-cyan-200">legal@qlink.chat</a></p>
              <p>• Official Network Status: <span className="text-emerald-400">All Nodes Operational (0 Telemetry Relays)</span></p>
            </div>
          </div>

          <p className="text-xs text-slate-500 font-mono">
            Document Version: Q-LINK-CHARTER-v3.0.4 • Cryptographically Validated • Last Re-anchored: September 2026
          </p>
        </div>
      ),
    },
  ];

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const q = searchQuery.toLowerCase();
    return sections.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q)
    );
  }, [searchQuery, sections]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="fixed inset-0 h-[100dvh] w-full overflow-y-auto overflow-x-hidden bg-slate-950 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200 font-sans scroll-smooth z-10 privacy-custom-scroll"
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(6, 182, 212, 0.6) rgba(15, 23, 42, 0.9)',
      }}
    >
      <style>{`
        .privacy-custom-scroll::-webkit-scrollbar {
          width: 10px;
        }
        .privacy-custom-scroll::-webkit-scrollbar-track {
          background: #060913;
        }
        .privacy-custom-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #0891b2 0%, #06b6d4 100%);
          border-radius: 9999px;
          border: 2px solid #060913;
        }
        .privacy-custom-scroll::-webkit-scrollbar-thumb:hover {
          background: #22d3ee;
        }
      `}</style>
      {/* Top Glass Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="group flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-cyan-400/80 hover:bg-cyan-500/10 hover:text-cyan-200 transition-all active:scale-95 shadow-sm"
            >
              <span className="transition group-hover:-translate-x-0.5">←</span>
              <span>Back to Console</span>
            </Link>
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900/60 border border-slate-800 text-[11px] font-mono text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>W3C Web App Sandbox Verified</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white hover:border-slate-700 transition"
              title="Print or export PDF charter"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Export PDF</span>
            </button>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-mono font-bold text-emerald-400">
              <span>ZERO-TELEMETRY</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Header Title Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-mono uppercase tracking-widest">
            <span>🛡️ Architectural Charter</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Privacy & Technical Sovereignty Protocol
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            An exhaustive technical autopsy of Big Tech surveillance capitalism, deceptive corporate legal loopholes, and behavioral manipulation — contrasted with Q-Link’s mathematical zero-knowledge web architecture.
          </p>

          {/* Quick Stat Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-left">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
              <div className="text-xl font-bold text-cyan-300">0 Phone Numbers</div>
              <div className="text-xs text-slate-400 mt-0.5">Eliminates SIM-swaps & carrier wiretaps</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
              <div className="text-xl font-bold text-emerald-300">0 Plaintext Bits</div>
              <div className="text-xs text-slate-400 mt-0.5">Client-side WebCrypto AES-256 encryption</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
              <div className="text-xl font-bold text-purple-300">0 Ad Trackers</div>
              <div className="text-xs text-slate-400 mt-0.5">W3C sandbox physically isolates hardware</div>
            </div>
          </div>
        </div>

        {/* Search / Filter Clause Bar */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clauses (e.g. keystrokes, biometrics, clean rooms, purge, arbitration)..."
              className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 pl-11 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 transition shadow-inner"
            />
            <svg
              className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-3 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-xs text-slate-400 mt-2 text-center">
              Found {filteredSections.length} matching clause(s) for &ldquo;{searchQuery}&rdquo;
            </p>
          )}
        </div>

        {/* Content Layout: Sticky Table of Contents + Full Articles */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Sticky Table of Contents */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-24 rounded-2xl border border-slate-800/80 bg-slate-950/70 p-5 backdrop-blur-md max-h-[calc(100vh-8rem)] overflow-y-auto custom-directory-scroll">
            <p className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 mb-3 font-semibold">
              Index of Protocol Clauses
            </p>
            <nav className="space-y-1">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  onClick={() => setActiveSection(s.id)}
                  className={`block rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                    activeSection === s.id
                      ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold"
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-slate-500">{s.num}</span>
                    <span className="truncate">{s.title}</span>
                  </div>
                </a>
              ))}
            </nav>
          </aside>

          {/* Clauses Feed */}
          <div className="lg:col-span-8 space-y-8">
            {filteredSections.map((sec) => (
              <article
                key={sec.id}
                id={sec.id}
                className="scroll-mt-24 rounded-3xl border border-slate-800/80 bg-slate-900/40 p-6 sm:p-8 backdrop-blur-sm transition-all hover:border-slate-700 shadow-xl"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 font-mono text-xs font-bold text-cyan-300">
                      {sec.num}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                      Clause {sec.num}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyLink(sec.id)}
                    className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-cyan-300 transition"
                    title="Copy direct section anchor link"
                  >
                    {copiedId === sec.id ? (
                      <span className="text-emerald-400 font-bold">✓ Copied</span>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <span>Share Link</span>
                      </>
                    )}
                  </button>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-snug">
                  {sec.title}
                </h2>
                <p className="text-xs sm:text-sm font-medium text-cyan-300/80 mb-6 italic">
                  {sec.summary}
                </p>

                <div className="pt-2 border-t border-slate-800/80">
                  {sec.content}
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/90 py-10 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-mono">
            Q-LINK ZERO-KNOWLEDGE DISTRIBUTED PROTOCOL • ALL CIPHERTEXT RESERVED
          </p>
          <p className="text-[11px] text-slate-600">
            No telemetry cookies were utilized in the rendering of this cryptographic charter.
          </p>
        </div>
      </footer>

      {/* Tech-Giant Floating Scroll to Top Action */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-cyan-400/50 bg-slate-900/90 text-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.45)] backdrop-blur-xl hover:bg-cyan-500/20 hover:text-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="Scroll to Top"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}
