"use client";

import React, { useState, memo } from "react";

interface YouTubeInlinePreviewProps {
  videoId: string;
  isMe?: boolean;
}

export const YouTubeInlinePreview = memo(function YouTubeInlinePreview({
  videoId,
  isMe = false,
}: YouTubeInlinePreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);

  // Use maxresdefault first, fallback to hqdefault
  const thumbnailUrl = thumbnailError
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  const handlePlay = () => {
    setIsPlaying(true);
    setIsIframeLoaded(false);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(false);
    setIsIframeLoaded(false);
  };

  return (
    <div
      className={`mt-2 w-full overflow-hidden rounded-2xl border shadow-2xl transition-all duration-300 ${
        isMe
          ? "border-blue-400/40 bg-slate-900/95 shadow-blue-950/40"
          : "border-slate-700/70 bg-slate-950/95 shadow-black/50"
      }`}
      style={{
        width: "min(775px, 85vw)",
        maxWidth: "100%",
      }}
    >
      {/* 16:9 Aspect Ratio Container - Clean, Edge-to-Edge Thumbnail & Player */}
      <div
        className="relative w-full overflow-hidden bg-black select-none"
        style={{
          aspectRatio: "16 / 9",
          width: "100%",
        }}
      >
        {!isPlaying ? (
          <div
            onClick={handlePlay}
            className="group absolute inset-0 h-full w-full cursor-pointer select-none"
            role="button"
            tabIndex={0}
            aria-label="Play YouTube video inline"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handlePlay();
              }
            }}
          >
            {/* Thumbnail Image - Strictly covers the entire 16:9 box */}
            <img
              src={thumbnailUrl}
              alt="YouTube Video Thumbnail"
              loading="lazy"
              onError={() => setThumbnailError(true)}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />

            {/* Subtle Vignette Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30 group-hover:via-transparent transition-opacity" />

            {/* Center Play Button */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-red-600/90 text-white shadow-[0_0_24px_rgba(220,38,38,0.7)] backdrop-blur-md transition-all duration-300 group-hover:scale-115 group-hover:bg-red-600 group-active:scale-95">
                <svg
                  className="ml-1 h-6 w-6 fill-current text-white"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>

            {/* Bottom Info Pill */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] font-medium text-white/90 pointer-events-none">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/65 px-2.5 py-0.5 backdrop-blur-md border border-white/10">
                <svg className="h-3.5 w-3.5 fill-red-500" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                <span>YouTube</span>
              </span>

              <span className="rounded-full bg-black/65 px-2 py-0.5 text-[10px] text-white/80 backdrop-blur-md border border-white/10 group-hover:text-white transition">
                Tap to play
              </span>
            </div>
          </div>
        ) : (
          <div className="relative h-full w-full bg-black">
            {/* Close / Collapse Video Button (always visible on top) */}
            <button
              type="button"
              onClick={handleClose}
              title="Close video"
              className="absolute top-2.5 right-2.5 z-30 flex items-center gap-1.5 rounded-full bg-black/80 px-2.5 py-1 text-[11px] font-semibold text-white/90 backdrop-blur-md border border-white/20 hover:bg-black hover:text-white transition active:scale-95 shadow-xl"
            >
              <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Close</span>
            </button>

            {/* Circular Loading Animation Overlay - Shown until iframe is loaded */}
            <div
              className={`absolute inset-0 z-20 flex flex-col items-center justify-center bg-black transition-opacity duration-500 ease-out ${
                isIframeLoaded ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
            >
              {/* Blurred Ambient Thumbnail Background */}
              <img
                src={thumbnailUrl}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover opacity-25 filter blur-md scale-105"
              />
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

              {/* Rotating Circular Spinner & Pulse Glow */}
              <div className="relative z-10 flex flex-col items-center justify-center">
                <div className="relative flex items-center justify-center">
                  {/* Subtle Red Ambient Glow */}
                  <div className="absolute h-16 w-16 rounded-full bg-red-600/30 blur-xl animate-pulse" />

                  {/* Rotating Circular Spinner SVG */}
                  <svg
                    className="h-12 w-12 animate-spin text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.8)]"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-20"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3.5"
                    />
                    <path
                      className="opacity-90"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </div>

                <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-white/90 tracking-wide drop-shadow-md">
                  <span>Loading video</span>
                  <span className="inline-flex tracking-widest animate-pulse">...</span>
                </div>
              </div>
            </div>

            {/* Embedded In-Place Video Player */}
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`}
              title="YouTube inline video player"
              className="h-full w-full border-0"
              style={{ width: "100%", height: "100%" }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onLoad={() => {
                // Short buffer to let YouTube iframe finish first frame paint
                setTimeout(() => setIsIframeLoaded(true), 400);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
});
