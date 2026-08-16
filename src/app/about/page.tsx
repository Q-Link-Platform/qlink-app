import React from "react";
import { Metadata } from "next";
import AboutPageClient from "./AboutPageClient";

export const metadata: Metadata = {
  title: "Q-Link | Secure E2E Encrypted Chat Protocol & Features Catalog",
  description:
    "Explore Q-Link v3.0, the next-gen quantum communication platform featuring dynamic contact ranking, live status ticks, Q-BEACON emergency alerts, 24-hour ephemeral media, smart chat scroll, voice memos, and native Windows desktop app.",
  openGraph: {
    title: "Q-Link | Secure E2E Encrypted Chat Protocol & Features Catalog",
    description:
      "Explore Q-Link v3.0, the next-gen quantum communication platform featuring dynamic contact ranking, live status ticks, Q-BEACON emergency alerts, 24-hour ephemeral media, smart chat scroll, voice memos, and native Windows desktop app.",
    type: "website",
    url: "https://q-link-v3-0.vercel.app/about",
  },
  twitter: {
    card: "summary_large_image",
    title: "Q-Link | Secure E2E Encrypted Chat Protocol & Features Catalog",
    description:
      "Explore Q-Link v3.0, the next-gen quantum communication platform featuring dynamic contact ranking, live status ticks, Q-BEACON emergency alerts, 24-hour ephemeral media, smart chat scroll, voice memos, and native Windows desktop app.",
  },
};

export default function AboutPage() {
  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Q-Link",
    "operatingSystem": "Windows, macOS, Linux, Android, iOS",
    "applicationCategory": "CommunicationApplication",
    "description":
      "An ultra-secure, glassmorphic chat and social platform featuring dynamic contact ranking, live status ticks, 24-hour ephemeral media, Q-BEACON emergency alerts, voice memos, and native Windows desktop app.",
    "url": "https://q-link-v3-0.vercel.app/",
    "softwareVersion": "3.0",
    "featureList": [
      "Dynamic Recency Contact Ranking Engine",
      "Triple-State Message Delivery Ticks (Sent, Delivered, Seen)",
      "Real-Time Typing Waveform & Online Presence Dots",
      "Smart Chat Scroll Memory & Auto-Snapping",
      "24-Hour Ephemeral Media Self-Cleaning Storage",
      "Q-BEACON Priority Emergency Alert Protocol with Siren Chime",
      "Inline Voice Memos with Interactive Waveform Player",
      "Community Social Feed with Mentions (@) and Hashtags (#)",
      "Global User Directory with Aura Percentage Leaderboard",
      "Verified Blue Tick and Founder Red Tick Badges",
      "Diamond 10 and Sapphire 10 VIP Interactive Profile Cards",
      "Standalone Windows Desktop App (.exe) with System Tray Background Mode",
      "Hardware & GPU Performance Switcher (60fps Ultra vs Battery Saver)",
      "Client-Side End-to-End Cryptography Shield",
      "Ambient Smart AI Assistant Companion"
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />
      <AboutPageClient />
    </>
  );
}
