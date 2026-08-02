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
  handleStoreUpgrade: (tier?: "DIAMOND" | "SAPPHIRE") => Promise<void>;
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
  const [selectedTier, setSelectedTier] = React.useState<"DIAMOND" | "SAPPHIRE">("DIAMOND");

  if (!showStore) return null;

  const effectiveBlueTickStatus =
    localBlueTickOverride !== null
      ? localBlueTickOverride
      : (session?.user as any)?.blueTick || "NONE";

  const isDiamondSelected = selectedTier === "DIAMOND";
  const cost = isDiamondSelected ? 100 : 50;
  const isCurrentTierActive = effectiveBlueTickStatus === selectedTier;

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
            className={`glass-panel relative overflow-hidden rounded-3xl border bg-slate-950/95 p-6 md:p-8 ${
              isDiamondSelected
                ? "border-pink-500/30 shadow-[0_0_50px_rgba(236,72,153,0.25)]"
                : "border-blue-500/30 shadow-[0_0_50px_rgba(59,130,246,0.25)]"
            } ${!isStoreAnimating ? "console-modal-exit" : "console-modal-enter"}`}
            style={{
              willChange: "transform, opacity",
              transform: "translateZ(0)",
              backfaceVisibility: "hidden",
            }}
          >
            {/* Transaction notification popup */}
            {transactionNotification?.show && (() => {
              const isDowngradeTx =
                transactionNotification.amount === 0 &&
                transactionNotification.type === "debit";
              return (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[250] w-full max-w-[340px] px-4 pointer-events-auto">
                  <div
                    className={`relative flex items-center gap-3 rounded-2xl border backdrop-blur-xl p-2.5 shadow-[0_15px_40px_rgba(0,0,0,0.85)] animate-expand-container overflow-hidden max-w-[340px] w-full ${
                      isDowngradeTx
                        ? "border-fuchsia-500/40 bg-slate-950/85 shadow-[0_0_25px_rgba(240,46,170,0.25)]"
                        : "border-cyan-500/40 bg-slate-950/85 shadow-[0_0_25px_rgba(34,211,238,0.25)]"
                    }`}
                  >
                    <div className="flex-1 overflow-hidden min-w-0 pr-1">
                      <div className="w-[245px] flex items-center justify-between gap-3 text-left">
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] font-mono text-cyan-400">
                            {transactionNotification.title}
                          </span>
                          <p className="mt-0.5 text-[8.5px] text-slate-300 leading-tight">
                            {transactionNotification.message}
                          </p>
                        </div>
                        <div className="shrink-0 flex flex-col items-end justify-center px-2 py-0.5 rounded-lg border bg-cyan-950/20 border-cyan-500/20 text-cyan-300">
                          <span className="text-[10px] font-black tracking-wider font-mono">
                            -{transactionNotification.amount} QP
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Decorative Orbs */}
            <div className={`pointer-events-none absolute -left-20 -top-20 h-48 w-48 rounded-full blur-3xl ${
              isDiamondSelected
                ? "bg-gradient-to-br from-pink-500/40 via-purple-500/30 to-cyan-400/30"
                : "bg-gradient-to-br from-blue-400/40 via-indigo-500/30 to-cyan-400/30"
            }`} />

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
              className="absolute right-4 top-4 z-50 flex h-9 w-9 items-center justify-center rounded-full border border-slate-700/60 bg-slate-900/90 text-slate-300 shadow-md transition hover:scale-105 hover:border-pink-400/70 hover:bg-slate-800 active:scale-95"
              aria-label="Close Store"
            >
              ✕
            </button>

            {/* Tier Selector Tabs */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <button
                type="button"
                onClick={() => setSelectedTier("DIAMOND")}
                className={`relative px-5 py-2 rounded-2xl border text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                  isDiamondSelected
                    ? "border-pink-400 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 text-white shadow-[0_0_20px_rgba(236,72,153,0.4)] scale-105"
                    : "border-slate-800 bg-slate-900/50 text-slate-400 hover:text-slate-200"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  💎 Diamond VIP (100 QP)
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTier("SAPPHIRE")}
                className={`relative px-5 py-2 rounded-2xl border text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                  !isDiamondSelected
                    ? "border-sky-400 bg-gradient-to-r from-sky-500/20 via-blue-500/20 to-cyan-500/20 text-white shadow-[0_0_20px_rgba(56,189,248,0.4)] scale-105"
                    : "border-slate-800 bg-slate-900/50 text-slate-400 hover:text-slate-200"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  ✓ Sapphire VIP (50 QP)
                </span>
              </button>
            </div>

            <div className="relative flex flex-col md:flex-row gap-8 items-center">
              {/* Left: 3D Tilting Card Previewer */}
              <div className="w-full md:w-1/2 flex flex-col items-center justify-center">
                <p className={`text-[10px] font-bold uppercase tracking-[0.25em] mb-4 ${
                  isDiamondSelected ? "text-pink-400/90" : "text-blue-400/90"
                }`}>
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
                  className={`w-full max-w-[280px] rounded-3xl p-[1px] cursor-pointer relative overflow-hidden ${
                    isDiamondSelected
                      ? "founder-vip-diamond border border-pink-500/80 shadow-[0_0_30px_rgba(236,72,153,0.55)]"
                      : "founder-vip-sapphire founder-vip-sapphire-shine border border-sky-400/50 bg-gradient-to-br from-slate-950 via-sky-950/20 to-slate-950 shadow-[0_0_30px_rgba(56,189,248,0.5)]"
                  }`}
                >
                  {/* Dynamic background layers for Diamond Card */}
                  {isDiamondSelected && (
                    <>
                      <div className="founder-vip-diamond-bg-spectrum" />
                      <div className="founder-vip-diamond-glass-layer" />
                    </>
                  )}

                  {!isDiamondSelected && (
                    <div className="founder-vip-sapphire-line-full absolute inset-0 rounded-3xl" />
                  )}

                  {/* Shimmer Overlay */}
                  <div
                    className="absolute inset-0 z-10 rounded-3xl pointer-events-none"
                    style={{
                      background: `radial-gradient(circle 110px at ${cardShineX}% ${cardShineY}%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 80%)`,
                      mixBlendMode: "overlay",
                    }}
                  />

                  <div className={`relative z-10 rounded-3xl px-5 py-6 flex flex-col items-center text-center gap-4 isolation-isolate ${
                    isDiamondSelected ? "founder-vip-diamond-inner bg-transparent" : "founder-vip-sapphire-inner bg-slate-950/90"
                  }`}>
                    {/* Diamond VIP Badge tag on card */}
                    {isDiamondSelected && (
                      <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full border border-pink-400/60 bg-pink-500/20 text-[8px] font-black uppercase tracking-wider text-pink-200 shadow-[0_0_10px_rgba(236,72,153,0.5)]">
                        Diamond VIP
                      </div>
                    )}

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
                          className={`h-16 w-16 rounded-full border-2 object-cover bg-slate-900 shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all duration-200 relative z-20 ${
                            isDiamondSelected ? "border-pink-300" : "border-sky-400/60"
                          }`}
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-full border-2 border-pink-400/60 bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center text-2xl font-bold text-white shadow-[0_0_20px_rgba(236,72,153,0.4)]">
                          {((session?.user as any)?.handle?.[0] || "?").toUpperCase()}
                        </div>
                      );
                    })()}

                    {/* VIP Status Tick & Handles */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1.5">
                        <p className="text-sm font-bold text-white tracking-wide">
                          {(session?.user as any)?.name || "Quantum User"}
                        </p>
                        {/* Glowing VIP Tick */}
                        <span className={`flex h-4.5 w-4.5 items-center justify-center rounded-full text-[10px] font-bold shadow-md ${
                          isDiamondSelected
                            ? "bg-pink-500/25 border border-pink-400 text-pink-200 shadow-[0_0_10px_rgba(236,72,153,0.6)]"
                            : "bg-sky-500/20 border border-sky-400/80 text-sky-300 shadow-[0_0_10px_rgba(56,189,248,0.5)]"
                        }`}>
                          {isDiamondSelected ? "💎" : "✓"}
                        </span>
                      </div>
                      <p className={`text-xs font-semibold ${isDiamondSelected ? "text-pink-300" : "text-sky-300/85"}`}>
                        @{(session?.user as any)?.handle || "your_handle"}
                      </p>
                    </div>

                    {/* Info Dividers */}
                    <div className="w-full border-t border-white/10 pt-4 mt-1 flex justify-around">
                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-slate-400">
                          Aura
                        </p>
                        <p className={`text-xs font-bold ${isDiamondSelected ? "text-pink-300" : "text-sky-300"}`}>
                          {Math.floor(
                            ((session?.user as any)?.aura_percentage || 0) * (isDiamondSelected ? 2.0 : 1.5)
                          ) || (isDiamondSelected ? 200 : 150)}
                          %
                        </p>
                      </div>
                      <div className="border-l border-white/10 h-6" />
                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-slate-400">
                          Rank
                        </p>
                        <p className={`text-xs font-bold ${isDiamondSelected ? "text-purple-300" : "text-indigo-300"}`}>
                          {isDiamondSelected ? "#DIAMOND" : "#VIP"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-3 text-center max-w-[240px]">
                  Hover over card & move your mouse to explore the 3D hologram reflex.
                </p>
              </div>

              {/* Right: Store Details */}
              <div className="w-full md:w-1/2 flex flex-col justify-between">
                <div>
                  <span className={`rounded-full border px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] ${
                    isDiamondSelected
                      ? "border-pink-500/40 bg-pink-500/10 text-pink-300 shadow-[0_0_10px_rgba(236,72,153,0.3)]"
                      : "border-blue-500/40 bg-blue-500/10 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                  }`}>
                    {isDiamondSelected ? "Top Tier Identity" : "Quantum Upgrades"}
                  </span>
                  <h2 className={`mt-4 text-2xl font-bold uppercase tracking-wider bg-clip-text text-transparent ${
                    isDiamondSelected
                      ? "bg-gradient-to-r from-pink-300 via-purple-200 to-cyan-300 drop-shadow-[0_0_15px_rgba(236,72,153,0.4)]"
                      : "bg-gradient-to-r from-blue-300 via-sky-200 to-cyan-300 drop-shadow-[0_0_15px_rgba(56,189,248,0.4)]"
                  }`}>
                    {isDiamondSelected ? "Diamond VIP Card" : "Sapphire VIP Card"}
                  </h2>

                  <p className="mt-3 text-[11px] leading-relaxed text-slate-300">
                    {isDiamondSelected
                      ? "The ultimate status symbol on Q-Link. Features a vibrant spectrum rainbow rhombus mesh, sparkling glints, and double aura boost ranked directly below Elite Founders."
                      : "Upgrade your Q-Link identity permanently. Stand out from the crowd with a celestial deep-cobalt theme that shines on all directory screens and chat rooms."}
                  </p>

                  {/* Upgrade Features List */}
                  <div className="mt-6 space-y-3.5">
                    <div className="flex items-start gap-3">
                      <span className={`mt-0.5 flex h-4.5 w-4.5 flex-none items-center justify-center rounded-full text-[10px] font-bold border ${
                        isDiamondSelected
                          ? "bg-pink-500/20 border-pink-500/40 text-pink-300"
                          : "bg-blue-500/20 border-blue-500/30 text-blue-300"
                      }`}>
                        {isDiamondSelected ? "💎" : "✓"}
                      </span>
                      <div>
                        <p className="text-[11px] font-semibold text-slate-100">
                          {isDiamondSelected ? "Diamond Verification Badge" : "Sapphire Verification Badge"}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {isDiamondSelected ? "Glowing diamond badge & tick mark next to your name globally" : "Glowing cobalt tick mark next to your name globally"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <span className={`mt-0.5 flex h-4.5 w-4.5 flex-none items-center justify-center rounded-full text-[10px] font-bold border ${
                        isDiamondSelected
                          ? "bg-pink-500/20 border-pink-500/40 text-pink-300"
                          : "bg-blue-500/20 border-blue-500/30 text-blue-300"
                      }`}>
                        ✓
                      </span>
                      <div>
                        <p className="text-[11px] font-semibold text-slate-100">
                          Directory Rank Priority
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {isDiamondSelected ? "Pinned right below Elite Founder at #2 rank" : "Pinned permanently near the top of directory"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <span className={`mt-0.5 flex h-4.5 w-4.5 flex-none items-center justify-center rounded-full text-[10px] font-bold border ${
                        isDiamondSelected
                          ? "bg-pink-500/20 border-pink-500/40 text-pink-300"
                          : "bg-blue-500/20 border-blue-500/30 text-blue-300"
                      }`}>
                        ✓
                      </span>
                      <div>
                        <p className="text-[11px] font-semibold text-slate-100">
                          {isDiamondSelected ? "2.0x Aura Score Booster" : "1.5x Aura Score Booster"}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {isDiamondSelected ? "Double all connection & social engagement points dynamically" : "Multiply all connections and follower actions dynamically by 1.5x"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <span className={`mt-0.5 flex h-4.5 w-4.5 flex-none items-center justify-center rounded-full text-[10px] font-bold border ${
                        isDiamondSelected
                          ? "bg-pink-500/20 border-pink-500/40 text-pink-300"
                          : "bg-blue-500/20 border-blue-500/30 text-blue-300"
                      }`}>
                        ✓
                      </span>
                      <div>
                        <p className="text-[11px] font-semibold text-slate-100">
                          {isDiamondSelected ? "Spectrum Rainbow Rhombus Mesh" : "Premium Cobalt Aurora Glow"}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {isDiamondSelected ? "Vibrant prism facets with bright diagonal light sweep" : "Custom dynamic light shifts inside your card preview"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

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
                          Tier Value
                        </p>
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg font-bold text-slate-100">
                            {cost}
                          </span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${
                            isDiamondSelected ? "text-pink-400" : "text-blue-400"
                          }`}>
                            Quantum Points
                          </span>
                        </div>
                      </div>
                      <div className="h-8 w-px bg-slate-800/80 hidden sm:block" />
                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-slate-400">
                          Your Balance
                        </p>
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
                          onClick={() => handleStoreUpgrade(selectedTier)}
                          disabled={
                            isUpgradingStore ||
                            !!storeSuccessMsg ||
                            isCurrentTierActive
                          }
                          className={`relative overflow-hidden rounded-2xl border px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.15em] transition-all duration-300 active:scale-95 ${
                            isCurrentTierActive
                              ? "border-pink-500/60 bg-pink-500/20 text-pink-200 cursor-not-allowed shadow-[0_0_10px_rgba(236,72,153,0.2)]"
                              : isDiamondSelected
                              ? "border-pink-400/80 bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 text-white hover:border-pink-300 shadow-[0_0_30px_rgba(236,72,153,0.65)] disabled:opacity-50"
                              : "border-blue-400/80 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white hover:border-blue-300 shadow-[0_0_30px_rgba(56,189,248,0.65)] disabled:opacity-50"
                          }`}
                        >
                          {isUpgradingStore ? (
                            <span className="flex items-center justify-center gap-2">
                              <span className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
                              Processing...
                            </span>
                          ) : isCurrentTierActive ? (
                            "Active Tier! ✓"
                          ) : (
                            `Unlock ${isDiamondSelected ? "Diamond" : "Sapphire"} VIP`
                          )}
                        </button>

                        {effectiveBlueTickStatus !== "NONE" && (
                          <button
                            type="button"
                            onClick={() => setShowDowngradeModal(true)}
                            className="mt-2 text-[9px] font-extrabold uppercase tracking-[0.1em] text-red-500 hover:text-red-400 active:scale-95 transition-colors underline decoration-red-500/50 hover:decoration-red-400 decoration-2 underline-offset-2"
                          >
                            Reset Tier
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

