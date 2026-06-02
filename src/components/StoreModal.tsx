"use client";

import React from "react";
import { createPortal } from "react-dom";

interface StoreModalProps {
  showStore: boolean;
  isStoreAnimating: boolean;
  setIsStoreAnimating: (val: boolean) => void;
  setShowStore: (val: boolean) => void;
  cardRotateX: number;
  cardRotateY: number;
  cardShineX: number;
  cardShineY: number;
  handleCardMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleCardMouseLeave: () => void;
  session: any;
  profilePicUrl: string | null;
  avatarLoadError: boolean;
  setAvatarLoadError: (val: boolean) => void;
  isAvatarHovered: boolean;
  setIsAvatarHovered: (val: boolean) => void;
  setAvatarViewerImageUrl: (val: string | null) => void;
  showPointsGuide: boolean;
  setShowPointsGuide: (val: boolean) => void;
  copiedInviteLink: boolean;
  setCopiedInviteLink: (val: boolean) => void;
  transactionNotification: any;
  localBlueTickOverride: string | null;
  localPointsOverride: number | null;
  isUpgradingStore: boolean;
  handleStoreUpgrade: () => Promise<void>;
  showDowngradeModal: boolean;
  setShowDowngradeModal: (val: boolean) => void;
  isDowngrading: boolean;
  handleStoreDowngrade: () => Promise<void>;
  storeError: string | null;
  setStoreError: (val: string | null) => void;
  storeSuccessMsg: string | null;
  setStoreSuccessMsg: (val: string | null) => void;
  canUseDom: boolean;
}

function getHighResProfilePic(url: string | null | undefined): string {
  if (!url) return "";
  let highResUrl = url;
  if (highResUrl.includes("googleusercontent.com")) {
    // Dynamically request high-res profile pictures from Google
    highResUrl = highResUrl.replace(/=s\d+(-[a-zA-Z0-9_-]+)?$/, "=s512-c");
    highResUrl = highResUrl.replace(/\/s\d+(-[a-zA-Z0-9_-]+)?\//, "/s512-c/");
  }
  return highResUrl;
}

export default function StoreModal({
  showStore,
  isStoreAnimating,
  setIsStoreAnimating,
  setShowStore,
  cardRotateX,
  cardRotateY,
  cardShineX,
  cardShineY,
  handleCardMouseMove,
  handleCardMouseLeave,
  session,
  profilePicUrl,
  avatarLoadError,
  setAvatarLoadError,
  isAvatarHovered,
  setIsAvatarHovered,
  setAvatarViewerImageUrl,
  showPointsGuide,
  setShowPointsGuide,
  copiedInviteLink,
  setCopiedInviteLink,
  transactionNotification,
  localBlueTickOverride,
  localPointsOverride,
  isUpgradingStore,
  handleStoreUpgrade,
  showDowngradeModal,
  setShowDowngradeModal,
  isDowngrading,
  handleStoreDowngrade,
  storeError,
  setStoreError,
  storeSuccessMsg,
  setStoreSuccessMsg,
  canUseDom,
}: StoreModalProps) {
  if (!showStore) return null;

  const effectiveBlueTickStatus =
    localBlueTickOverride !== null
      ? localBlueTickOverride
      : (session?.user as any)?.blueTick || "NONE";

  return canUseDom ? (
    createPortal(
      <div
        className={`fixed inset-0 z-[2100] flex items-center justify-center bg-black/85 backdrop-blur-md ${
          !isStoreAnimating ? "console-backdrop-exit" : "console-backdrop-enter"
        }`}
        style={{ willChange: "opacity", transform: "translateZ(0)" }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full max-w-4xl mx-4">
          <div
            className={`glass-panel relative overflow-hidden rounded-3xl border border-blue-500/30 bg-slate-950/95 p-6 md:p-8 shadow-[0_0_50px_rgba(59,130,246,0.25)] ${
              !isStoreAnimating ? "console-modal-exit" : "console-modal-enter"
            }`}
            style={{
              willChange: "transform, opacity",
              transform: "translateZ(0)",
              backfaceVisibility: "hidden",
            }}
          >
            {transactionNotification?.show && (() => {
              const isDowngradeTx =
                transactionNotification.amount === 0 &&
                transactionNotification.type === "debit";
              return (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[250] w-full max-w-[340px] px-4 pointer-events-auto">
                  <style
                    dangerouslySetInnerHTML={{
                      __html: `
                    @keyframes expandContainer {
                      0% { max-width: 48px; opacity: 0; }
                      10% { max-width: 48px; opacity: 1; }
                      25% { max-width: 48px; opacity: 1; }
                      40% { max-width: 340px; opacity: 1; }
                      85% { max-width: 340px; opacity: 1; }
                      100% { max-width: 48px; opacity: 0; }
                    }
                    @keyframes qLogoAnimation {
                      0% { transform: scale(0) rotate(0deg); opacity: 0; }
                      12% { transform: scale(0) rotate(0deg); opacity: 0; }
                      22% { transform: scale(1) rotate(0deg); opacity: 1; }
                      25% { transform: scale(1) rotate(0deg); opacity: 1; }
                      40% { transform: scale(1) rotate(360deg); opacity: 1; }
                      85% { transform: scale(1) rotate(360deg); opacity: 1; }
                      100% { transform: scale(0) rotate(0deg); opacity: 0; }
                    }
                    @keyframes tyreScale {
                      0% { transform: scale(0); opacity: 0; }
                      10% { transform: scale(1); opacity: 1; }
                      85% { transform: scale(1); opacity: 1; }
                      100% { transform: scale(0); opacity: 0; }
                    }
                    @keyframes translateWheel {
                      0% { transform: translateX(-20px); }
                      10% { transform: translateX(0); }
                      25% { transform: translateX(0); }
                      40% { transform: translateX(0); }
                      85% { transform: translateX(0); }
                      100% { transform: translateX(-20px); }
                    }
                    .animate-expand-container {
                      animation: expandContainer 3.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    }
                    .animate-translate-wheel {
                      animation: translateWheel 3.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    }
                    .animate-tyre-scale {
                      animation: tyreScale 3.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    }
                    .animate-q-logo {
                      animation: qLogoAnimation 3.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    }
                    @keyframes shrinkWidth {
                      from { width: 100%; }
                      to { width: 0%; }
                    }
                    .animate-shrink-width {
                      animation: shrinkWidth 3.5s linear forwards;
                    }
                  `,
                    }}
                  />
                  <div
                    className={`relative flex items-center gap-3 rounded-2xl border backdrop-blur-xl p-2.5 shadow-[0_15px_40px_rgba(0,0,0,0.85)] animate-expand-container overflow-hidden max-w-[340px] w-full ${
                      isDowngradeTx
                        ? "border-fuchsia-500/40 bg-slate-950/85 shadow-[0_0_25px_rgba(240,46,170,0.25)]"
                        : "border-cyan-500/40 bg-slate-950/85 shadow-[0_0_25px_rgba(34,211,238,0.25)]"
                    }`}
                  >
                    {/* Animated Corner Tech Borders */}
                    <div
                      className={`absolute top-0 left-0 w-2 h-2 border-t-[1.5px] border-l-[1.5px] ${
                        isDowngradeTx ? "border-fuchsia-400" : "border-cyan-400"
                      }`}
                    />
                    <div
                      className={`absolute top-0 right-0 w-2 h-2 border-t-[1.5px] border-r-[1.5px] ${
                        isDowngradeTx ? "border-fuchsia-400" : "border-cyan-400"
                      }`}
                    />

                    {/* Scanline Effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none opacity-20" />

                    {/* Cyber Tyre Wheel (rolling in/out) */}
                    <div className="relative shrink-0 w-8.5 h-8.5 flex items-center justify-center animate-translate-wheel z-20">
                      {/* Tyre Container (handles scaling/opacity timeline) */}
                      <div className="absolute inset-0 animate-tyre-scale">
                        {/* Outer Spinning Cyber Tyre (already spinning on appear!) */}
                        <div
                          className={`absolute inset-0 rounded-full border-[2px] border-dashed animate-[spin_2.5s_linear_infinite] ${
                            isDowngradeTx
                              ? "border-fuchsia-400/80 bg-fuchsia-500/5"
                              : "border-cyan-400/80 bg-cyan-500/5"
                          }`}
                        />

                        {/* Inner Tech Ring (spinning infinitely reverse!) */}
                        <div
                          className={`absolute inset-[3px] rounded-full border border-dotted animate-[spin_4s_linear_infinite_reverse] ${
                            isDowngradeTx
                              ? "border-fuchsia-300/60"
                              : "border-cyan-300/60"
                          }`}
                        />
                      </div>

                      {/* Central Q logo (appears chronologically, rotates during roll-forward) */}
                      <div
                        className={`relative z-10 font-black text-sm tracking-wider font-mono select-none animate-q-logo drop-shadow-[0_0_5px_rgba(34,211,238,0.6)] ${
                          isDowngradeTx
                            ? "text-fuchsia-400 drop-shadow-[0_0_5px_rgba(240,46,170,0.6)]"
                            : "text-cyan-400"
                        }`}
                      >
                        Q
                      </div>
                    </div>

                    {/* Content Mask (revealing text) */}
                    <div className="flex-1 overflow-hidden min-w-0 pr-1">
                      <div className="w-[245px] flex items-center justify-between gap-3 text-left">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2">
                            <span
                              className={`text-[9px] font-black uppercase tracking-[0.2em] font-mono ${
                                isDowngradeTx
                                  ? "text-fuchsia-400"
                                  : "text-cyan-400"
                              }`}
                            >
                              {transactionNotification.title}
                            </span>
                            <span className="text-[6px] font-mono text-slate-500 uppercase tracking-widest shrink-0">
                              {transactionNotification.txHash}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[8.5px] text-slate-300 leading-tight">
                            {transactionNotification.message}
                          </p>
                        </div>

                        {/* Value */}
                        <div
                          className={`shrink-0 flex flex-col items-end justify-center px-2 py-0.5 rounded-lg border ${
                            isDowngradeTx
                              ? "bg-fuchsia-950/20 border-fuchsia-500/20 text-fuchsia-300 shadow-[0_0_8px_rgba(240,46,170,0.15)]"
                              : "bg-cyan-950/20 border-cyan-500/20 text-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.15)]"
                          }`}
                        >
                          <span className="text-[5px] font-bold uppercase tracking-widest text-slate-400 block leading-none">
                            Quantum
                          </span>
                          <span className="text-[10px] font-black tracking-wider font-mono mt-0.5 leading-none">
                            {isDowngradeTx
                              ? "RESET"
                              : `${
                                  transactionNotification.type === "credit"
                                    ? "+"
                                    : "-"
                                }${transactionNotification.amount} QP`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress */}
                    <div
                      className={`absolute bottom-0 inset-x-0 h-[2.5px] rounded-b-2xl animate-shrink-width ${
                        isDowngradeTx
                          ? "bg-fuchsia-500 shadow-[0_0_8px_rgba(240,46,170,0.6)]"
                          : "bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.6)]"
                      }`}
                    />
                  </div>
                </div>
              );
            })()}
            {/* Decorative Glowing Orbs */}
            <div className="pointer-events-none absolute -left-20 -top-20 h-48 w-48 rounded-full bg-gradient-to-br from-blue-400/40 via-indigo-500/30 to-cyan-400/30 blur-3xl" />
            <div className="pointer-events-none absolute -right-24 bottom-[-4rem] h-56 w-56 rounded-full bg-gradient-to-tr from-cyan-400/30 via-indigo-500/30 to-blue-500/40 blur-3xl" />

            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                setIsStoreAnimating(false);
                setTimeout(() => {
                  setShowStore(false);
                  setStoreError(null);
                  setStoreSuccessMsg(null);
                }, 350);
              }}
              className="absolute right-4 top-4 z-50 flex h-9 w-9 items-center justify-center rounded-full border border-slate-700/60 bg-slate-900/90 text-slate-300 shadow-md transition hover:scale-105 hover:border-blue-400/70 hover:bg-slate-800 hover:text-blue-200 active:scale-95"
              aria-label="Close Store"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <div className="relative flex flex-col md:flex-row gap-8 items-center">
              {/* Left: 3D Tilting Card Previewer */}
              <div className="w-full md:w-1/2 flex flex-col items-center justify-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-400/90 mb-4">
                  Live Hologram Preview
                </p>

                {/* Interactive Tilt Anchor */}
                <div
                  onMouseMove={handleCardMouseMove}
                  onMouseLeave={handleCardMouseLeave}
                  style={{
                    transform: `perspective(1000px) rotateX(${cardRotateX}deg) rotateY(${cardRotateY}deg) scale3d(1.02, 1.02, 1.02)`,
                    transition: "transform 0.1s ease-out",
                    willChange: "transform",
                  }}
                  className="founder-vip-sapphire founder-vip-sapphire-shine w-full max-w-[280px] rounded-3xl border border-sky-400/50 bg-gradient-to-br from-slate-950 via-sky-950/20 to-slate-950 p-[1px] shadow-[0_0_30px_rgba(56,189,248,0.5)] cursor-pointer"
                >
                  {/* Shimmer Overlay using real-time coordinates */}
                  <div
                    className="absolute inset-0 z-10 rounded-3xl pointer-events-none"
                    style={{
                      background: `radial-gradient(circle 110px at ${cardShineX}% ${cardShineY}%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 80%)`,
                      mixBlendMode: "overlay",
                    }}
                  />

                  {/* Dedicated resolution-perfect slide sweeper */}
                  <div className="founder-vip-sapphire-line-full absolute inset-0 rounded-3xl"></div>

                  {/* Dedicated absolute floating click portal & hover synchronizer for Avatar */}
                  {(() => {
                    const imageSrc = profilePicUrl || session?.user?.image;
                    const hasValidImage =
                      imageSrc &&
                      typeof imageSrc === "string" &&
                      imageSrc !== "null" &&
                      imageSrc !== "undefined" &&
                      imageSrc.trim() !== "" &&
                      !avatarLoadError;

                    return hasValidImage ? (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setAvatarViewerImageUrl(imageSrc);
                        }}
                        onMouseEnter={() => setIsAvatarHovered(true)}
                        onMouseLeave={() => setIsAvatarHovered(false)}
                        className="absolute top-6 left-1/2 -translate-x-1/2 h-16 w-16 rounded-full z-30 cursor-zoom-in pointer-events-auto"
                        title="Click to view full profile picture"
                      />
                    ) : null;
                  })()}

                  <div className="founder-vip-sapphire-inner relative z-10 rounded-3xl bg-slate-950/90 px-5 py-6 flex flex-col items-center text-center gap-4 isolation-isolate">
                    {/* User Avatar Preview */}
                    {(() => {
                      const imageSrc = profilePicUrl || session?.user?.image;
                      const hasValidImage =
                        imageSrc &&
                        typeof imageSrc === "string" &&
                        imageSrc !== "null" &&
                        imageSrc !== "undefined" &&
                        imageSrc.trim() !== "" &&
                        !avatarLoadError;

                      return hasValidImage ? (
                        <img
                          src={getHighResProfilePic(imageSrc)}
                          alt="Avatar"
                          referrerPolicy="no-referrer"
                          onError={() => setAvatarLoadError(true)}
                          className={`h-16 w-16 rounded-full border-2 object-cover bg-slate-900 shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all duration-200 relative z-20 pointer-events-none ${
                            isAvatarHovered
                              ? "scale-110 border-sky-300 shadow-[0_0_25px_rgba(56,189,248,0.55)]"
                              : "border-sky-400/60 scale-100"
                          }`}
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-full border-2 border-sky-400/60 bg-gradient-to-br from-sky-500/20 to-indigo-500/20 flex items-center justify-center text-2xl font-bold text-white shadow-[0_0_20px_rgba(56,189,248,0.3)] pointer-events-auto">
                          {((session?.user as any)?.handle?.[0] || "?").toUpperCase()}
                        </div>
                      );
                    })()}

                    {/* VIP Status Tick & Handles */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1.5">
                        <p className="text-sm font-bold text-sky-100 tracking-wide">
                          {(session?.user as any)?.name || "Quantum User"}
                        </p>
                        {/* Glowing Sapphire Tick */}
                        <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-sky-500/20 border border-sky-400/80 text-[10px] font-bold text-sky-300 shadow-[0_0_10px_rgba(56,189,248,0.5)]">
                          ✓
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-sky-300/85">
                        @{(session?.user as any)?.handle || "your_handle"}
                      </p>
                    </div>

                    {/* Info Dividers */}
                    <div className="w-full border-t border-sky-500/20 pt-4 mt-1 flex justify-around">
                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-slate-400">
                          Aura
                        </p>
                        <p className="text-xs font-bold text-sky-300">
                          {Math.floor(
                            ((session?.user as any)?.aura_percentage || 0) * 1.5
                          ) || 150}
                          %
                        </p>
                      </div>
                      <div className="border-l border-sky-500/20 h-6" />
                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-slate-400">
                          Rank
                        </p>
                        <p className="text-xs font-bold text-indigo-300">
                          #VIP
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-3 text-center max-w-[240px]">
                  Hover over card & move your mouse to explore the 3D hologram
                  reflex.
                </p>
              </div>

              {/* Right: Store Details */}
              <div className="w-full md:w-1/2 flex flex-col justify-between">
                {showPointsGuide ? (
                  <div className="pt-7 md:pt-4">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.3)] animate-pulse">
                        Quantum Points Codex
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowPointsGuide(false)}
                        className="text-[10px] uppercase font-bold tracking-wider text-slate-400 hover:text-slate-200 transition"
                      >
                        ← Back to Upgrade
                      </button>
                    </div>
                    <h2 className="mt-4 text-2xl font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                      How to Earn Points
                    </h2>

                    <p className="mt-3 text-[11px] leading-relaxed text-slate-300">
                      Quantum Points are earned through active contribution and
                      social growth. Amass points to unlock premium identities
                      across the network.
                    </p>

                    <div className="mt-5 space-y-4">
                      {/* Invite Card */}
                      <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/20 to-slate-900/60 p-3.5 shadow-[0_4px_20px_rgba(6,182,212,0.15)]">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-bold text-cyan-300 border border-cyan-500/30">
                            🔗
                          </span>
                          <p className="text-[11px] font-bold text-slate-100 uppercase tracking-wide">
                            Invite Friends & Earn Big
                          </p>
                        </div>
                        <p className="mt-2 text-[10px] leading-relaxed text-slate-300">
                          Every friend who joins Q-Link using your link awards
                          you **+10 Points**.
                        </p>
                        <p className="mt-1 text-[10px] font-semibold text-cyan-300/90 leading-relaxed">
                          💡 Bring in just{" "}
                          <strong className="text-white text-xs font-extrabold">
                            5 friends
                          </strong>{" "}
                          to instantly secure the{" "}
                          <strong className="text-white text-xs font-extrabold">
                            50 points
                          </strong>{" "}
                          needed for this Sapphire VIP Upgrade!
                        </p>

                        {/* Share Section */}
                        <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-950/80 p-2 border border-slate-800/80">
                          <input
                            type="text"
                            readOnly
                            value={
                              typeof window !== "undefined"
                                ? `${window.location.origin}/?ref=${
                                    (session?.user as any)?.handle || "user"
                                  }`
                                : `https://qlink.com/?ref=${
                                    (session?.user as any)?.handle || "user"
                                  }`
                            }
                            className="w-full bg-transparent text-[9px] text-slate-400 focus:outline-none select-all font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const link =
                                typeof window !== "undefined"
                                  ? `${window.location.origin}/?ref=${
                                      (session?.user as any)?.handle || "user"
                                    }`
                                  : `https://qlink.com/?ref=${
                                      (session?.user as any)?.handle || "user"
                                    }`;
                              navigator.clipboard.writeText(link);
                              setCopiedInviteLink(true);
                              setTimeout(() => setCopiedInviteLink(false), 2000);
                            }}
                            className="flex-none rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[9px] uppercase tracking-wider px-2.5 py-1.5 transition active:scale-95 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                          >
                            {copiedInviteLink ? "Copied! ✓" : "Copy"}
                          </button>
                        </div>
                      </div>

                      {/* Social Engagement */}
                      <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-3.5">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-300 border border-indigo-500/30">
                            💬
                          </span>
                          <p className="text-[11px] font-bold text-slate-100 uppercase tracking-wide">
                            Social Contribution Rules
                          </p>
                        </div>
                        <div className="mt-2.5 grid grid-cols-3 gap-2.5">
                          <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-2 text-center">
                            <p className="text-[14px] font-extrabold text-blue-300">
                              +1
                            </p>
                            <p className="text-[8px] uppercase tracking-wider text-slate-400 mt-0.5">
                              Per Like
                            </p>
                          </div>
                          <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-2 text-center">
                            <p className="text-[14px] font-extrabold text-cyan-300">
                              +2
                            </p>
                            <p className="text-[8px] uppercase tracking-wider text-slate-400 mt-0.5">
                              Per Comment
                            </p>
                          </div>
                          <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-2 text-center">
                            <p className="text-[14px] font-extrabold text-indigo-300">
                              +3
                            </p>
                            <p className="text-[8px] uppercase tracking-wider text-slate-400 mt-0.5">
                              Per Follower
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <span className="rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                      Quantum Upgrades
                    </span>
                    <h2 className="mt-4 text-2xl font-bold uppercase tracking-wider bg-gradient-to-r from-blue-300 via-sky-200 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(56,189,248,0.4)]">
                      Sapphire VIP Card
                    </h2>

                    <p className="mt-3 text-[11px] leading-relaxed text-slate-300">
                      Upgrade your Q-Link identity permanently. Stand out from
                      the crowd with a celestial deep-cobalt theme that shines
                      on all directory screens and chat rooms.
                    </p>

                    {/* Upgrade Features List */}
                    <div className="mt-6 space-y-3.5">
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-4.5 w-4.5 flex-none items-center justify-center rounded-full bg-blue-500/20 text-[10px] font-bold text-blue-300 border border-blue-500/30">
                          ✓
                        </span>
                        <div>
                          <p className="text-[11px] font-semibold text-slate-100">
                            Sapphire Verification Badge
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Glowing cobalt tick mark next to your name
                            globally.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-4.5 w-4.5 flex-none items-center justify-center rounded-full bg-blue-500/20 text-[10px] font-bold text-blue-300 border border-blue-500/30">
                          ✓
                        </span>
                        <div>
                          <p className="text-[11px] font-semibold text-slate-100">
                            Pin to Directory Header
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Positioned permanently at the top of the All
                            Quantum IDs list.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-4.5 w-4.5 flex-none items-center justify-center rounded-full bg-blue-500/20 text-[10px] font-bold text-blue-300 border border-blue-500/30">
                          ✓
                        </span>
                        <div>
                          <p className="text-[11px] font-semibold text-slate-100">
                            1.5x Aura Score Booster
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Multiply all connections and follower actions
                            dynamically by 1.5x.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-4.5 w-4.5 flex-none items-center justify-center rounded-full bg-blue-500/20 text-[10px] font-bold text-blue-300 border border-blue-500/30">
                          ✓
                        </span>
                        <div>
                          <p className="text-[11px] font-semibold text-slate-100">
                            Premium Cobalt Aurora Glow
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Custom dynamic light shifts inside your card
                            preview.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Store Controls */}
                <div className="mt-8 border-t border-slate-800/80 pt-6">
                  {storeError && (
                    <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-[10px] text-red-200">
                      Error: {storeError}
                    </div>
                  )}

                  {storeSuccessMsg && (
                    <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-[10px] text-emerald-200 animate-pulse">
                      🎉 {storeSuccessMsg} Syncing with the network...
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-slate-400">
                          Celestial Value
                        </p>
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg font-bold text-slate-100">
                            50
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                            Quantum Points
                          </span>
                        </div>
                      </div>
                      <div className="h-8 w-px bg-slate-800/80 hidden sm:block" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-[9px] uppercase tracking-wider text-slate-400">
                            Your Balance
                          </p>
                          <button
                            type="button"
                            onClick={() => setShowPointsGuide(!showPointsGuide)}
                            className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-slate-800 hover:bg-cyan-500/20 text-[9px] font-bold text-slate-300 hover:text-cyan-300 transition-colors border border-slate-700/60 hover:border-cyan-500/30 active:scale-95"
                            title="How to earn Quantum Points?"
                          >
                            ?
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg font-bold text-slate-100">
                            {localPointsOverride !== null
                              ? localPointsOverride
                              : (session?.user as any)?.points || 0}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Quantum Points
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 justify-end">
                      <div className="flex flex-col items-center">
                        <button
                          type="button"
                          onClick={handleStoreUpgrade}
                          disabled={
                            isUpgradingStore ||
                            !!storeSuccessMsg ||
                            effectiveBlueTickStatus === "SAPPHIRE"
                          }
                          className={`relative overflow-hidden rounded-2xl border px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.15em] shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all duration-300 active:scale-95 ${
                            effectiveBlueTickStatus === "SAPPHIRE"
                              ? "border-sky-500/60 bg-sky-500/20 text-sky-200 cursor-not-allowed shadow-[0_0_10px_rgba(56,189,248,0.2)]"
                              : "border-blue-400/80 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white hover:border-blue-300 hover:shadow-[0_0_30px_rgba(56,189,248,0.65)] disabled:opacity-50 disabled:cursor-not-allowed"
                          }`}
                        >
                          {isUpgradingStore ? (
                            <span className="flex items-center justify-center gap-2">
                              <span className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
                              Processing...
                            </span>
                          ) : effectiveBlueTickStatus === "SAPPHIRE" ? (
                            "Upgraded! ✓"
                          ) : (
                            "Upgrade Account"
                          )}
                        </button>

                        {effectiveBlueTickStatus === "SAPPHIRE" && (
                          <button
                            type="button"
                            onClick={() => setShowDowngradeModal(true)}
                            className="mt-2 text-[9px] font-extrabold uppercase tracking-[0.1em] text-red-500 hover:text-red-400 active:scale-95 transition-colors underline decoration-red-500/50 hover:decoration-red-400 decoration-2 underline-offset-2"
                          >
                            Downgrade Account
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body
    )
  ) : null;
}
