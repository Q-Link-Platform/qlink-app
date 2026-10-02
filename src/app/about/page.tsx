import React from "react";
import { Metadata } from "next";
import AboutPageClient from "./AboutPageClient";

export const metadata: Metadata = {
  title: "About Q-Link | Real-Time Messaging & Community Platform",
  description:
    "Learn about Q-Link v3.0, a fast, private messaging and social platform with dynamic contact ranking, live status ticks, 24-hour ephemeral media, Q-BEACON emergency alerts, and a standalone Windows desktop app.",
  openGraph: {
    title: "About Q-Link | Real-Time Messaging & Community Platform",
    description:
      "Learn about Q-Link v3.0, a fast, private messaging and social platform with dynamic contact ranking, live status ticks, 24-hour ephemeral media, Q-BEACON emergency alerts, and a standalone Windows desktop app.",
    type: "website",
    url: "https://q-link-v3-0.vercel.app/about",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Q-Link | Real-Time Messaging & Community Platform",
    description:
      "Learn about Q-Link v3.0, a fast, private messaging and social platform with dynamic contact ranking, live status ticks, 24-hour ephemeral media, Q-BEACON emergency alerts, and a standalone Windows desktop app.",
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
      "A fast, modern real-time messaging and social platform featuring dynamic contact ranking, live message status ticks, 24-hour ephemeral media, voice notes, and a native Windows desktop app.",
    "url": "https://q-link-v3-0.vercel.app/",
    "softwareVersion": "3.0",
    "featureList": [
      "Dynamic Recency Contact Ranking",
      "Real-Time Message Status Ticks (Sent, Delivered, Seen)",
      "Live Typing Waves and Online Presence Indicators",
      "24-Hour Ephemeral Media Self-Cleaning Storage",
      "Q-BEACON Priority Emergency Alert Protocol",
      "Inline Voice Memos with Waveform Audio Player",
      "Community Social Feed with Mentions and Hashtags",
      "Global User Directory with Aura Engagement Scores",
      "Verified Blue Tick and Founder Red Tick Badges",
      "Diamond and Sapphire VIP Profile Showcase Cards",
      "Standalone Windows Desktop Client (.exe) with System Tray Mode",
      "Hardware and GPU Performance Switcher (60fps Ultra vs Battery Saver)",
      "End-to-End Encryption Mode for Private Direct Chats"
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
