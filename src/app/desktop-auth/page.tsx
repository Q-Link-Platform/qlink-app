"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";

export default function DesktopAuthPage() {
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");
  const [phase, setPhase] = useState("VERIFYING IDENTITY...");
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch NextAuth session directly to bypass SessionProvider context requirement
    fetch("/api/auth/session")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to reach auth session provider");
        return res.json();
      })
      .then((session) => {
        if (session && Object.keys(session).length > 0) {
          setStatus("authenticated");
        } else {
          setStatus("unauthenticated");
        }
      })
      .catch(() => {
        setStatus("unauthenticated");
      });
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      signIn(undefined, { callbackUrl: "/desktop-auth" });
      return;
    }

    if (status === "authenticated") {
      // Fetch raw encrypted JWE token
      setPhase("SYNCING QUANTUM DEEP LINK...");
      fetch("/api/auth/desktop-token")
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch session handshake");
          return res.json();
        })
        .then((data) => {
          if (data.token) {
            setToken(data.token);
            setPhase("REDIRECTING TO DESKTOP CLIENT...");
            // Execute protocol launch
            triggerDeepLink(data.token);
          } else {
            throw new Error("Handshake returned null payload");
          }
        })
        .catch((err) => {
          setError(err.message || "Quantum verification protocol failed");
        });
    }
  }, [status]);

  const triggerDeepLink = (jwtToken: string) => {
    const protocolUrl = `qlink://auth?token=${encodeURIComponent(jwtToken)}`;
    window.location.href = protocolUrl;
  };

  if (status === "loading" || (status === "authenticated" && !token && !error)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-slate-100 font-sans">
        <div className="relative flex items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-cyan-500/20 border-t-cyan-400"></div>
          <div className="absolute h-10 w-10 animate-ping rounded-full bg-cyan-400/10"></div>
        </div>
        <p className="mt-8 text-xs font-bold tracking-widest text-cyan-400 animate-pulse">
          {phase}
        </p>
        <p className="mt-2 text-[10px] text-slate-500">
          SECURE PROTOCOL ACTIVE
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-slate-100 px-6 text-center">
        <div className="rounded-full bg-red-500/10 p-3 border border-red-500/20">
          <span className="text-2xl">⚠️</span>
        </div>
        <h2 className="mt-4 text-sm font-bold text-red-400 tracking-wider">
          HANDSHAKE FAILURE
        </h2>
        <p className="mt-2 text-xs text-slate-400 max-w-sm leading-relaxed">
          {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 rounded-full bg-slate-900 border border-slate-700 px-4 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800"
        >
          Retry Handshake
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-slate-100 px-6 text-center">
      <div className="relative flex items-center justify-center">
        <div className="h-12 w-12 rounded-full bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center">
          <span className="text-cyan-400 animate-pulse text-lg">✓</span>
        </div>
      </div>
      
      <h2 className="mt-6 text-sm font-bold text-cyan-400 tracking-widest">
        IDENTITY VERIFIED
      </h2>
      <p className="mt-2 text-xs text-slate-300 max-w-sm leading-relaxed">
        We have verified your credentials. Redirecting back to the desktop application...
      </p>
      
      <div className="mt-8 flex flex-col items-center gap-4">
        <button
          onClick={() => token && triggerDeepLink(token)}
          className="rounded-full bg-cyan-500 px-6 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 shadow-lg shadow-cyan-500/20 transition-all"
        >
          Open Q-Link App Manually
        </button>
        
        <p className="text-[10px] text-slate-500">
          If your browser prompts you, check "Always allow" to complete automatic sync.
        </p>
      </div>
    </div>
  );
}
