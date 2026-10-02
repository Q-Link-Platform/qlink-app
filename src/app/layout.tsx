import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./providers/ThemeProvider";
import { DuoThemeProvider } from "./providers/DuoThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f172a",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://q-link-v3-0.vercel.app"),
  title: {
    default: "Q-Link | Next-Gen Quantum-Secure Communication Platform",
    template: "%s | Q-Link",
  },
  description:
    "Q-Link is an autonomous, zero-data-retention communication platform powered by Quantum IDs. Experience quantum-encrypted messaging, privacy-first social feeds, and decentralized identity.",
  keywords: [
    "Q-Link",
    "Quantum Link",
    "QLink",
    "Quantum ID",
    "encrypted chat",
    "zero data retention",
    "privacy social network",
    "decentralized communication",
    "ephemeral messaging",
    "next-gen messenger",
    "quantum privacy",
  ],
  authors: [{ name: "Q-Link Core Architecture" }],
  creator: "Q-Link Protocol",
  publisher: "Q-Link Network",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/logo-circular.png", type: "image/png", sizes: "200x200" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://q-link-v3-0.vercel.app",
    siteName: "Q-Link",
    title: "Q-Link | Next-Gen Quantum-Secure Communication Platform",
    description:
      "Autonomous zero-data-retention communication platform powered by Quantum IDs.",
    images: [
      {
        url: "/logo-viewer-ultra-hd.png",
        width: 1200,
        height: 630,
        alt: "Q-Link Quantum Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Q-Link | Next-Gen Quantum-Secure Communication Platform",
    description:
      "Autonomous zero-data-retention communication platform powered by Quantum IDs.",
    images: ["/logo-viewer-ultra-hd.png"],
    creator: "@QLinkOfficial",
    site: "@QLinkOfficial",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "9dcdd97ef40258b2",
  },
  other: {
    "google-site-verification": "9dcdd97ef40258b2",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
          <meta name="theme-color" content="#0f172a" />
          {/* Google Search Console Direct Site Verification */}
          <meta name="google-site-verification" content="9dcdd97ef40258b2" />
          <meta name="google-site-verification" content="google9dcdd97ef40258b2" />
          <meta name="google-site-verification" content="google9dcdd97ef40258b2.html" />
          {/* Structured Data: JSON-LD for Google Search Knowledge Graph */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@graph": [
                  {
                    "@type": "WebSite",
                    "@id": "https://q-link-v3-0.vercel.app/#website",
                    "url": "https://q-link-v3-0.vercel.app",
                    "name": "Q-Link",
                    "description": "Next-Gen Quantum-Secure Communication Platform",
                    "publisher": {
                      "@type": "Organization",
                      "name": "Q-Link Network",
                      "url": "https://q-link-v3-0.vercel.app",
                      "logo": "https://q-link-v3-0.vercel.app/logo-viewer-ultra-hd.png",
                      "sameAs": [
                        "https://x.com/QLinkOfficial",
                        "https://reddit.com/u/QLinkOfficial",
                        "https://github.com/rohiterrors-ship-it/Q-Link_v3.0"
                      ]
                    }
                  },
                  {
                    "@type": "SoftwareApplication",
                    "@id": "https://q-link-v3-0.vercel.app/#software",
                    "name": "Q-Link",
                    "applicationCategory": "CommunicationApplication",
                    "operatingSystem": "All",
                    "offers": {
                      "@type": "Offer",
                      "price": "0",
                      "priceCurrency": "USD"
                    },
                    "description": "Autonomous zero-data-retention communication platform powered by Quantum IDs."
                  }
                ]
              })
            }}
          />
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="alternate" type="text/plain" href="/llms.txt" title="LLMs.txt AI Reference" />
          <link rel="help" href="/about" title="About Q-Link & Features" />
          <link rel="sitemap" type="application/xml" href="/sitemap.xml" title="Sitemap" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Q-link Chat" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (typeof document !== 'undefined' && document.cookie) {
                  if (document.cookie.indexOf('ql_synth_reqs') !== -1) {
                    document.cookie = 'ql_synth_reqs=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                  }
                  if (document.cookie.indexOf('ql_auto_demo') !== -1) {
                    document.cookie = 'ql_auto_demo=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                  }
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-[100dvh] w-full overflow-hidden`}
        style={{
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          height: '100dvh',
          overflow: 'hidden',
        }}
      >
        <div className="relative h-[100dvh] w-full overflow-hidden flex flex-col">
          {/* Ambient background orbs - repositioned to avoid UI interference */}
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute inset-0" style={{ backgroundColor: 'var(--bg-primary)' }} />
            {/* Global Ambient Orbital Mesh Texture */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.08]"
              style={{
                backgroundImage: "url('/visuals/qlink-orbital-vision.jpg')",
                filter: "brightness(0.8) contrast(1.2)",
              }}
            />
            <div className="orb orb--cyan float-slow -left-32 top-1/2 h-72 w-72" />
            <div className="orb orb--violet pulse-soft right-[-120px] bottom-1/2 h-80 w-80" />
            <div className="orb orb--pink float-slow bottom-[-120px] left-1/2 h-64 w-64" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(148,163,253,0.08),transparent_70%),radial-gradient(circle_at_center,_rgba(45,212,191,0.06),transparent_70%)]" />
          </div>

          {/* Subtle grid overlay */}
          <div className="pointer-events-none absolute inset-0 -z-10 opacity-40 [background-image:linear-gradient(to_right,rgba(15,23,42,0.8)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.8)_1px,transparent_1px)],[background-size:80px_80px]" />

          <ThemeProvider>
            <DuoThemeProvider>
              {children}
            </DuoThemeProvider>
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}
