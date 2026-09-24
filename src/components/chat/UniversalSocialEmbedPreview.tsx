"use client";

import React, { useState, memo } from "react";
import { YouTubeInlinePreview } from "@/components/YouTubeInlinePreview";
import { XPostNativePreview } from "@/components/chat/XPostNativePreview";

export type SocialPlatform = "youtube" | "instagram" | "x" | "facebook";

export interface SocialEmbedInfo {
  platform: SocialPlatform;
  id: string;
  user?: string;
  isVertical: boolean;
  badgeLabel: string;
  originalUrl: string;
  embedUrl: string;
}

export function extractSocialMediaEmbedInfo(text: string): SocialEmbedInfo | null {
  if (!text) return null;

  // 1. YouTube Shorts
  const ytShortMatch = text.match(/(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/i);
  if (ytShortMatch) {
    return {
      platform: "youtube",
      id: ytShortMatch[1],
      isVertical: true,
      badgeLabel: "Shorts",
      originalUrl: ytShortMatch[0],
      embedUrl: `https://www.youtube.com/embed/${ytShortMatch[1]}?autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&loop=1&playlist=${ytShortMatch[1]}`,
    };
  }

  // 2. YouTube Standard
  const ytMatch = text.match(/(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  if (ytMatch) {
    return {
      platform: "youtube",
      id: ytMatch[1],
      isVertical: false,
      badgeLabel: "YouTube",
      originalUrl: ytMatch[0],
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`,
    };
  }

  // 3. Instagram Reels
  const instaReelMatch = text.match(/(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:reel|reels|share\/reel)\/([a-zA-Z0-9_-]+)/i);
  if (instaReelMatch) {
    return {
      platform: "instagram",
      id: instaReelMatch[1],
      isVertical: true,
      badgeLabel: "Instagram Reel",
      originalUrl: instaReelMatch[0],
      embedUrl: `https://www.instagram.com/reel/${instaReelMatch[1]}/embed`,
    };
  }

  // 4. Instagram Post
  const instaPostMatch = text.match(/(?:https?:\/\/)?(?:www\.)?(?:instagram\.com|instagr\.am)\/(?:p|tv)\/([a-zA-Z0-9_-]+)/i);
  if (instaPostMatch) {
    return {
      platform: "instagram",
      id: instaPostMatch[1],
      isVertical: false,
      badgeLabel: "Instagram",
      originalUrl: instaPostMatch[0],
      embedUrl: `https://www.instagram.com/p/${instaPostMatch[1]}/embed`,
    };
  }

  // 5. X (Twitter)
  const xMatch = text.match(/(?:https?:\/\/)?(?:www\.|mobile\.)?(?:twitter\.com|x\.com|fixupx\.com|vxtwitter\.com|fxtwitter\.com)\/([a-zA-Z0-9_]+)\/status\/(\d+)/i);
  if (xMatch) {
    return {
      platform: "x",
      id: xMatch[2],
      user: xMatch[1],
      isVertical: false,
      badgeLabel: "X",
      originalUrl: xMatch[0],
      embedUrl: `https://api.fxtwitter.com/${xMatch[1]}/status/${xMatch[2]}`,
    };
  }

  // 6. Facebook Reels
  const fbReelMatch = text.match(/(?:https?:\/\/)?(?:www\.|m\.|web\.)?facebook\.com\/(?:reel|reels|share\/r)\/([a-zA-Z0-9_-]+)/i);
  if (fbReelMatch) {
    return {
      platform: "facebook",
      id: fbReelMatch[1],
      isVertical: true,
      badgeLabel: "Facebook Reel",
      originalUrl: fbReelMatch[0],
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(`https://www.facebook.com/reel/${fbReelMatch[1]}`)}&show_text=0`,
    };
  }

  // 7. Facebook Video / Watch
  const fbWatchMatch = text.match(/(?:https?:\/\/)?(?:www\.|m\.|web\.)?(?:facebook\.com\/(?:watch\/?\?v=([a-zA-Z0-9_-]+)|[^/\s]+\/videos\/([a-zA-Z0-9_-]+)|share\/v\/([a-zA-Z0-9_-]+))|fb\.watch\/([a-zA-Z0-9_-]+))/i);
  if (fbWatchMatch) {
    const rawUrl = fbWatchMatch[0].startsWith("http") ? fbWatchMatch[0] : `https://${fbWatchMatch[0]}`;
    return {
      platform: "facebook",
      id: fbWatchMatch[1] || fbWatchMatch[2] || fbWatchMatch[3] || fbWatchMatch[4] || "video",
      isVertical: false,
      badgeLabel: "Facebook",
      originalUrl: fbWatchMatch[0],
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(rawUrl)}&show_text=0`,
    };
  }

  return null;
}

interface UniversalSocialEmbedPreviewProps {
  info: SocialEmbedInfo;
  isMe?: boolean;
}

export const UniversalSocialEmbedPreview = memo(function UniversalSocialEmbedPreview({
  info,
  isMe = false,
}: UniversalSocialEmbedPreviewProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  // 1. YouTube direct preview & player
  if (info.platform === "youtube") {
    return (
      <YouTubeInlinePreview
        videoId={info.id}
        isShort={info.isVertical}
        isMe={isMe}
      />
    );
  }

  // 2. X (Twitter) native direct video player & rich post preview
  if (info.platform === "x") {
    return (
      <XPostNativePreview
        userHandle={info.user || "i"}
        statusId={info.id}
        originalUrl={info.originalUrl}
        isMe={isMe}
      />
    );
  }

  const renderBadgeIcon = () => {
    switch (info.platform) {
      case "instagram":
        return (
          <div className="flex h-3.5 w-3.5 items-center justify-center rounded-[3px] bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white p-0.5 shadow-sm">
            <svg className="h-full w-full fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </div>
        );
      case "facebook":
        return (
          <svg className="h-3.5 w-3.5 fill-[#1877F2] drop-shadow-sm" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        );
      default:
        return null;
    }
  };

  // Determine sizing based on vertical reel vs card (Instagram / Facebook)
  const containerWidth = info.isVertical
    ? "min(320px, 82vw)"
    : "min(560px, 86vw)";

  const containerAspect = info.isVertical
    ? "9 / 16"
    : "16 / 9";

  const minHeight = info.isVertical ? "480px" : "315px";

  const cleanExternalUrl = info.originalUrl.startsWith("http")
    ? info.originalUrl
    : `https://${info.originalUrl}`;

  return (
    <div
      className={`mt-2 overflow-hidden rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-300 ${
        isMe
          ? "border-white/20 bg-slate-900/90 shadow-black/60"
          : "border-white/10 bg-slate-950/90 shadow-black/70"
      }`}
      style={{
        width: containerWidth,
        maxWidth: "100%",
      }}
    >
      {/* Top Optical Glass Header Bar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.04] px-3 py-2 backdrop-blur-md">
        <div className="flex items-center gap-1.5 min-w-0">
          {renderBadgeIcon()}
          <span className="text-[11px] font-medium tracking-tight text-white/90 truncate">
            {info.badgeLabel}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* External Link Direct Affordance */}
          <a
            href={cleanExternalUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={`Open in ${info.badgeLabel}`}
            className="flex items-center justify-center h-6 w-6 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/15 transition-all duration-200 active:scale-95"
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>

          {isOpen && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setIsLoaded(false);
              }}
              className="flex items-center gap-1 rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-medium text-white/70 hover:bg-white/15 hover:text-white transition-all duration-200 active:scale-95"
            >
              <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Close</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content / Player Area with Spotlight Illumination */}
      <div
        className="relative w-full overflow-hidden bg-black select-none"
        style={{
          aspectRatio: containerAspect,
          minHeight: isOpen ? minHeight : (info.isVertical ? "480px" : "220px"),
          width: "100%",
        }}
      >
        {!isOpen ? (
          <div
            onClick={() => setIsOpen(true)}
            className="group absolute inset-0 flex flex-col items-center justify-center p-4 cursor-pointer select-none bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-black text-center transition-all duration-300 hover:bg-slate-900/95"
            role="button"
            tabIndex={0}
            aria-label={`Open ${info.badgeLabel}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setIsOpen(true);
              }
            }}
          >
            {/* Ambient Optical Spotlight Glow */}
            <div className="relative flex items-center justify-center mb-3">
              <div
                className={`absolute h-16 w-16 rounded-full blur-2xl opacity-40 transition-opacity duration-300 group-hover:opacity-75 ${
                  info.platform === "instagram"
                    ? "bg-rose-500/50"
                    : info.platform === "facebook"
                    ? "bg-blue-500/50"
                    : "bg-cyan-500/40"
                }`}
              />

              {/* Sleek 36px Optical Crystal Disc */}
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.08] border border-white/20 text-white shadow-xl backdrop-blur-xl transition-all duration-200 group-hover:scale-105 group-hover:bg-white/[0.14] group-active:scale-95">
                <svg className="ml-0.5 h-4 w-4 fill-white" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>

            <p className="text-xs font-semibold tracking-tight text-white/90 group-hover:text-white transition-colors duration-200">
              {info.isVertical ? `Watch ${info.badgeLabel}` : `View on ${info.badgeLabel}`}
            </p>
            <p className="mt-1 text-[10px] text-white/40 truncate max-w-[85%] font-mono">
              {info.originalUrl.replace(/^https?:\/\//, "")}
            </p>

            <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/10 border border-white/15 px-3 py-1 text-[10px] font-medium text-white/90 backdrop-blur-md shadow-sm transition-all duration-200 group-hover:bg-white/20 group-hover:text-white group-active:scale-95">
              <span>Tap to preview</span>
            </span>
          </div>
        ) : (
          <div className="relative h-full w-full bg-black min-h-[300px]">
            {/* Loading Indicator */}
            {!isLoaded && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md">
                <div className="h-6 w-6 rounded-full border-2 border-white/20 border-t-white/90 animate-spin" />
                <span className="mt-2.5 text-[11px] font-medium tracking-tight text-white/60">
                  Loading {info.badgeLabel}…
                </span>
              </div>
            )}

            <iframe
              src={info.embedUrl}
              title={`${info.badgeLabel} embed`}
              className="h-full w-full border-0"
              style={{ width: "100%", height: "100%", minHeight: minHeight || (info.isVertical ? "500px" : "320px") }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              scrolling="no"
              onLoad={() => setIsLoaded(true)}
            />
          </div>
        )}
      </div>
    </div>
  );
});

export default UniversalSocialEmbedPreview;

