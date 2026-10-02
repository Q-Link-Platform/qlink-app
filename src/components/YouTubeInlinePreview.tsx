"use client";

import React, { useState, memo } from "react";

interface YouTubeInlinePreviewProps {
  videoId: string;
  isShort?: boolean;
  isMe?: boolean;
}

export const YouTubeInlinePreview = memo(function YouTubeInlinePreview({
  videoId,
  isShort = false,
  isMe = false,
}: YouTubeInlinePreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [thumbStage, setThumbStage] = useState<number>(0);

  // Native vertical thumbnail resolution hierarchy:
  // For Shorts:
  // 1. oar2.jpg: YouTube's official 1080x1920 vertical original aspect ratio thumbnail (100% full frame, zero black bars)
  // 2. maxresdefault.jpg: 1280x720 HD fallback
  // 3. hqdefault.jpg: 480x360 fallback
  // For Widescreen:
  // 1. maxresdefault.jpg: 1280x720 full 16:9 HD
  // 2. hqdefault.jpg: fallback
  const thumbnailUrl = isShort
    ? thumbStage === 0
      ? `https://i.ytimg.com/vi/${videoId}/oar2.jpg`
      : thumbStage === 1
      ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
      : `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
    : thumbStage === 0
    ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
    : `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  const handleThumbnailError = () => {
    setThumbStage((prev) => prev + 1);
  };

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
      className={`overflow-hidden rounded-2xl sm:rounded-3xl border shadow-2xl transition-all duration-300 ${
        isMe
          ? "border-white/20 bg-slate-950/80 shadow-black/60"
          : "border-white/15 bg-slate-950/80 shadow-black/60"
      }`}
      style={{
        width: isShort ? "min(360px, 88vw)" : "min(500px, 90vw)",
        maxWidth: "100%",
      }}
    >
      {/* Dynamic Aspect Ratio Container - 9:16 for Shorts / Reels, 16:9 for Widescreen */}
      <div
        className="relative w-full overflow-hidden bg-black select-none mx-auto flex items-center justify-center"
        style={{
          aspectRatio: isShort ? "9 / 16" : "16 / 9",
          width: "100%",
          maxHeight: isShort ? "min(640px, 75vh)" : "min(320px, 52vh)",
        }}
      >
        {!isPlaying ? (
          <div
            onClick={handlePlay}
            className="group absolute inset-0 h-full w-full cursor-pointer select-none"
            role="button"
            tabIndex={0}
            aria-label={isShort ? "Play YouTube Short inline" : "Play YouTube video inline"}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handlePlay();
              }
            }}
          >
            {/* Thumbnail Image - Strictly covers the entire aspect container */}
            <img
              src={thumbnailUrl}
              alt={isShort ? "YouTube Short Thumbnail" : "YouTube Video Thumbnail"}
              loading="lazy"
              onError={handleThumbnailError}
              className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
            />

            {/* Subtle Vignette Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30 group-hover:via-transparent transition-opacity" />

            {/* Center Optical Crystal Glass Play Button (Same as X) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/25 backdrop-blur-[1px] pointer-events-none transition-all duration-200 group-hover:bg-black/35">
              <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-black/45 hover:bg-black/65 border border-white/25 hover:border-white/45 backdrop-blur-xl text-white shadow-[0_4px_24px_rgba(0,0,0,0.6)] transition-all duration-200 group-hover:scale-105 active:scale-90">
                <svg
                  className="ml-0.5 h-4 w-4 sm:h-5 sm:w-5 fill-white"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>

            {/* Top Badge for Shorts */}
            {isShort && (
              <div className="absolute top-2.5 left-2.5 pointer-events-none z-10">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/65 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md border border-white/15 shadow-md">
                  <svg className="h-3.5 w-3.5 fill-white" viewBox="0 0 24 24">
                    <path d="M17.77 10.32l-1.2-.5L18 9.06a4.46 4.46 0 0 0 .5-2 4.4 4.4 0 0 0-4.4-4.4 4.54 4.54 0 0 0-2.8 1l-6 3.6a4.47 4.47 0 0 0-.5 7.14l1.2.5L5.4 15.6a4.46 4.46 0 0 0-.5 2 4.4 4.4 0 0 0 4.4 4.4 4.54 4.54 0 0 0 2.8-1l6-3.6a4.47 4.47 0 0 0 .67-7.08zM10 14.5v-5l4.5 2.5-4.5 2.5z" />
                  </svg>
                  <span>Shorts</span>
                </span>
              </div>
            )}

            {/* Bottom Info Pill */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] font-medium text-white/90 pointer-events-none">
              {!isShort && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/65 px-2.5 py-0.5 backdrop-blur-md border border-white/15">
                  <svg className="h-3.5 w-3.5 fill-white" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  <span>YouTube</span>
                </span>
              )}

              <span className="ml-auto rounded-full bg-black/65 px-2.5 py-0.5 text-[10px] text-white/85 backdrop-blur-md border border-white/15 group-hover:text-white transition">
                Tap to play
              </span>
            </div>
          </div>
        ) : (
          <div className="relative h-full w-full bg-black">
            {/* Close / Collapse Video Button */}
            <button
              type="button"
              onClick={handleClose}
              title="Close video"
              className="absolute top-2.5 right-2.5 z-30 flex items-center gap-1.5 rounded-full bg-black/65 px-2.5 py-1 text-[11px] font-medium text-white/90 backdrop-blur-xl border border-white/20 hover:bg-black/85 hover:border-white/40 hover:text-white transition-all duration-200 active:scale-95 shadow-xl"
            >
              <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Close</span>
            </button>

            {/* Circular Loading Animation Overlay */}
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

              {/* Spinner */}
              <div className="relative z-10 flex flex-col items-center justify-center">
                <div className="relative flex items-center justify-center">
                  <div className="absolute h-14 w-14 rounded-full bg-white/10 blur-xl animate-pulse" />
                  <svg
                    className="h-10 w-10 animate-spin text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]"
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
                      strokeWidth="3"
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
              src={
                isShort
                  ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&loop=1&playlist=${videoId}`
                  : `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`
              }
              title={isShort ? "YouTube Short player" : "YouTube video player"}
              className="h-full w-full border-0"
              style={{ width: "100%", height: "100%" }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onLoad={() => {
                setTimeout(() => setIsIframeLoaded(true), 400);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
});

export default YouTubeInlinePreview;
