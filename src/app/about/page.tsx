import React from "react";
import { Metadata } from "next";
import AboutPageClient from "./AboutPageClient";

export const metadata: Metadata = {
  title: "Q-Link | Secure E2E Encrypted Chat Protocol",
  description:
    "Explore Q-Link, the decentralized communication terminal utilizing client-side E2E cryptography, zero-trace storage purging, and modern HUD UI controls.",
  openGraph: {
    title: "Q-Link | Secure E2E Encrypted Chat Protocol",
    description:
      "Explore Q-Link, the decentralized communication terminal utilizing client-side E2E cryptography, zero-trace storage purging, and modern HUD UI controls.",
    type: "website",
    url: "https://q-link-v3-0.vercel.app/about",
  },
  twitter: {
    card: "summary_large_image",
    title: "Q-Link | Secure E2E Encrypted Chat Protocol",
    description:
      "Explore Q-Link, the decentralized communication terminal utilizing client-side E2E cryptography, zero-trace storage purging, and modern HUD UI controls.",
  },
};

export default function AboutPage() {
  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Q-Link",
    "operatingSystem": "All",
    "applicationCategory": "CommunicationApplication",
    "description":
      "An ultra-secure, glassmorphic chat application utilizing client-side E2E encryption, instant media streaming, and secure batch message deletion.",
    "url": "https://q-link-v3-0.vercel.app/",
    "softwareVersion": "3.0",
    "featureList": [
      "Client-side End-to-End Cryptography",
      "No-Trace Physical Storage Purging",
      "Desktop Context Menu & Mobile Long-press UI",
      "Batch Multi-Selection operations",
      "Inline Voice Notes & Canvas Image Editor"
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
