import React from "react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | Q-Link Protocol",
  description: "Official Terms of Service, User Agreement, and Privacy Protocol Charter for the Q-Link platform.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navigation Bar */}
      <div className="max-w-4xl mx-auto flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-300 transition"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Q-Link</span>
        </Link>

        <a
          href="/terms.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 px-3.5 py-1.5 text-xs font-semibold text-cyan-300 transition shadow-sm"
        >
          <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Open Official PDF</span>
        </a>
      </div>

      {/* Main Corporate Document Container */}
      <main className="max-w-4xl mx-auto bg-white text-slate-900 rounded-2xl shadow-2xl p-8 sm:p-12 border border-slate-200">
        {/* Document Header */}
        <header className="border-b border-slate-200 pb-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-slate-500 font-mono">
                Official Corporate Agreement
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight mt-1">
                Terms of Service &amp; Privacy Protocol
              </h1>
            </div>
            <div className="text-left sm:text-right font-mono text-xs text-slate-500 space-y-1">
              <p>DOC ID: <strong className="text-slate-800">QL-TOS-2026-V3</strong></p>
              <p>Effective: <strong className="text-slate-800">September 2026</strong></p>
              <p>Standard: <strong className="text-slate-800">Zero-Knowledge</strong></p>
            </div>
          </div>
        </header>

        {/* Preamble */}
        <section className="mb-8 text-sm leading-relaxed text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <p className="font-semibold text-slate-900 mb-1">Notice of Acceptance:</p>
          <p>
            Please read this Terms of Service &amp; Privacy Protocol Agreement carefully before accessing or authenticating into the Q-Link platform. By logging in, registering an account, or interacting with Q-Link nodes, you agree to be bound by the terms, operating covenants, and data policies described herein. If you do not accept these terms, you must discontinue platform use immediately.
          </p>
        </section>

        {/* Structured Sections */}
        <div className="space-y-8 text-sm leading-relaxed text-slate-800">
          {/* Section 1 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-950 pb-1 border-b border-slate-200">
              1. Acceptance of Terms &amp; Protocol Identity
            </h2>
            <p>
              Q-Link is a peer network and high-performance communication platform engineered around client-side zero-knowledge cryptography. Authentication options (Google OAuth, Microsoft Azure AD, GitHub, or Phone OTP) are provided strictly to issue an authenticated session and associate your sovereign Quantum Handle. Your login constitutes affirmative consent to these operating rules and protocol principles.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-950 pb-1 border-b border-slate-200">
              2. Cryptographic Architecture &amp; Data Privacy
            </h2>
            <p>
              Unlike legacy consumer networks that inspect and harvest user conversations, Q-Link enforces strict mathematical immunity through client-side cryptography:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
              <li>
                <strong className="text-slate-900">Client-Side Key Generation:</strong> All cryptographic key pairs (ECDH P-256 and AES-256-GCM) are minted strictly inside the user&apos;s browser runtime (W3C WebCrypto API). Private keys never touch Q-Link infrastructure.
              </li>
              <li>
                <strong className="text-slate-900">Zero Plaintext Storage:</strong> Communication payloads are encrypted on the sender&apos;s local device before transmission. Q-Link relays operate as blind conduits; our servers and databases cannot decipher your private conversations.
              </li>
              <li>
                <strong className="text-slate-900">Telemetry Immunity:</strong> We strictly prohibit background keystroke telemetry, unposted draft profiling, ultrasonic acoustic beacons, or relational address book harvesting. Unposted draft state exists solely within local browser memory.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-950 pb-1 border-b border-slate-200">
              3. Data Minimization: What Is Stored vs. What Is Impossible to Store
            </h2>
            <p>
              In full transparency and adherence to international privacy standards (GDPR Art. 5(1)(c) and CCPA / CPRA), our records are limited to the minimal viable metadata needed for real-time delivery:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
                <p className="font-bold text-emerald-800 mb-1">✓ Retained Records:</p>
                <p className="text-slate-700">User handle (@username), public display name, public encryption key, ephemeral ciphertext transit buffer, and gamification aura metrics.</p>
              </div>
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs">
                <p className="font-bold text-rose-800 mb-1">✕ Impossible to Retain:</p>
                <p className="text-slate-700">Plaintext message bodies, voice audio data, private keys, location telemetry, cross-site tracking cookies, and advertising identity tokens.</p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-950 pb-1 border-b border-slate-200">
              4. Permitted Use &amp; Community Standards
            </h2>
            <p>
              Users must respect network stability and the rights of other participants. Prohibited conduct results in immediate, non-negotiable cryptographic node revocation:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
              <li><strong className="text-slate-900">Safety Mandate:</strong> Zero tolerance for Child Sexual Abuse Material (CSAM), non-consensual imagery, terror mobilization, or credible threats of physical violence.</li>
              <li><strong className="text-slate-900">Network Integrity:</strong> Prohibition of distributed denial-of-service (DDoS) command relays, automated scraping botnets, credential harvesting, or exploitation of protocol APIs.</li>
              <li><strong className="text-slate-900">Rate Limiting:</strong> Upstash Redis token-bucket governors enforce protective traffic thresholds at the edge. High-frequency automated spam triggers automatic temporary throttling.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-950 pb-1 border-b border-slate-200">
              5. The &quot;Nuclear Purge&quot; Right to Absolute Deletion
            </h2>
            <p>
              Q-Link fully implements the Right to Erasure (GDPR Article 17). When you select &quot;Nuclear Purge&quot; or delete your profile from the ID Console, our database executes an atomic hard-delete cascade across all user records, push tokens, and transit buffers. No residual shadow profile or archived backup copy is retained.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-950 pb-1 border-b border-slate-200">
              6. Third-Party Embeds &amp; External Services
            </h2>
            <p>
              When you share social links (YouTube, X, Instagram, Facebook), Q-Link utilizes native players or secure embed previews. Third-party content providers operate under their respective privacy policies. Q-Link does not transmit your profile credentials or private keys to external content networks.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-950 pb-1 border-b border-slate-200">
              7. Warrant Canary &amp; Subpoena Mathematics
            </h2>
            <p>
              As of September 2026, Q-Link has received ZERO (0) National Security Letters, FISA court orders, or governmental interception directives. Because Q-Link does not possess user decryption keys, any subpoena compelling decryption receives the only technically truthful response: decryption is mathematically impossible.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-950 pb-1 border-b border-slate-200">
              8. Limitation of Liability &amp; Disclaimers
            </h2>
            <p>
              The Q-Link protocol is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind. You are solely responsible for safeguarding your device security and cryptographic credentials. Q-Link is not liable for data loss caused by unauthorized physical device access, browser cache wipes without backup, or network-level disruptions.
            </p>
          </section>

          {/* Section 9 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-950 pb-1 border-b border-slate-200">
              9. Corporate Coordinates &amp; Legal Contact
            </h2>
            <p>For legal notices, vulnerability disclosures, or regulatory inquiries, contact our compliance team:</p>
            <div className="font-mono text-xs bg-slate-100 p-3 rounded-lg border border-slate-200 space-y-1 mt-2">
              <p>• Legal &amp; Regulatory Affairs: <a href="mailto:legal@qlink.chat" className="text-cyan-700 underline font-semibold">legal@qlink.chat</a></p>
              <p>• Security Vulnerability Team: <a href="mailto:security@qlink.chat" className="text-cyan-700 underline font-semibold">security@qlink.chat</a></p>
              <p>• Network Infrastructure: Q-Link Systems Inc. • Global Communications Protocol</p>
            </div>
          </section>
        </div>

        {/* Document Footer */}
        <footer className="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-mono gap-2">
          <span>Official Corporate Document • Q-Link Protocol</span>
          <div className="flex items-center gap-3">
            <a href="/terms.pdf" target="_blank" rel="noopener noreferrer" className="text-cyan-700 underline font-semibold">Download PDF</a>
            <span>•</span>
            <Link href="/privacy" className="text-cyan-700 underline font-semibold">Interactive Privacy Charter</Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
