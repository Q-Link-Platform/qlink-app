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
  const [thumbnailError, setThumbnailError] = useState(false);

  // Use maxresdefault first, fallback to hqdefault
  const thumbnailUrl = thumbnailError
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  const youtubeWatchUrl = `https://www.youtube.com/watch?v=${videoId}`;

  return (
    <div
      className={`mt-2 w-full min-w-[280px] sm:min-w-[460px] max-w-[640px] lg:max-w-[720px] overflow-hidden rounded-2xl border shadow-2xl transition-all duration-300 ${
        isMe
          ? "border-blue-400/30 bg-slate-900/90 shadow-blue-950/30"
          : "border-slate-700/60 bg-slate-950/90 shadow-black/40"
      }`}
    >
      {/* 16:9 Aspect Ratio Video / Thumbnail Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
        {!isPlaying ? (
          <div
            onClick={() => setIsPlaying(true)}
            className="group relative h-full w-full cursor-pointer select-none"
            role="button"
            tabIndex={0}
            aria-label="Play YouTube video inline"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setIsPlaying(true);
              }
            }}
          >
            {/* Thumbnail Image */}
            <img
              src={thumbnailUrl}
              alt="YouTube Video Thumbnail"
              loading="lazy"
              onError={() => setThumbnailError(true)}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />

            {/* Subtle Vignette Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 group-hover:via-transparent transition-opacity" />

            {/* Center Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
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
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] font-medium text-white/90">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-0.5 backdrop-blur-md border border-white/10">
                <svg className="h-3.5 w-3.5 fill-red-500" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                <span>YouTube</span>
              </span>

              <span className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white/75 backdrop-blur-md border border-white/10 group-hover:text-white transition">
                Tap to play
              </span>
            </div>
          </div>
        ) : (
          <div className="relative h-full w-full">
            {/* Close / Collapse Video Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsPlaying(false);
              }}
              title="Close video"
              className="absolute top-2 right-2 z-20 flex items-center gap-1 rounded-full bg-black/75 px-2 py-0.5 text-[10px] font-semibold text-white/90 backdrop-blur-md border border-white/20 hover:bg-black hover:text-white transition active:scale-95 shadow-lg"
            >
              <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Close</span>
            </button>

            {/* Embedded In-Place Video Player */}
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`}
              title="YouTube inline video player"
              className="h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        )}
      </div>
    </div>
  );
});
