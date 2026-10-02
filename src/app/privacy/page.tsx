import React from "react";
import { Metadata } from "next";
import PrivacyPageClient from "./PrivacyPageClient";

export const metadata: Metadata = {
  title: "Privacy & Protocol Charter | Q-Link Zero-Knowledge Network",
  description:
    "An exhaustive technical autopsy of Big Tech surveillance capitalism, corporate loopholes, and behavioral manipulation, contrasted with Q-Link's zero-knowledge cryptographic protocol, W3C browser sandbox containment, and mathematical user sovereignty.",
  openGraph: {
    title: "Privacy & Protocol Charter | Q-Link Zero-Knowledge Network",
    description:
      "The full architectural breakdown of surveillance telemetry loopholes vs. Q-Link's zero-knowledge client-side cryptography. Mathematical privacy over corporate promises.",
    type: "website",
    url: "https://q-link.chat/privacy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy & Protocol Charter | Q-Link Zero-Knowledge Network",
    description:
      "A technical autopsy of Big Tech surveillance capitalism and Q-Link's mathematical zero-knowledge protocol.",
  },
};

export default function PrivacyPage() {
  return <PrivacyPageClient />;
}
