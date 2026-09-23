"use client";

import React, { useState, useEffect, useRef, memo } from "react";

interface XPostMediaVideo {
  url: string;
  thumbnail_url?: string;
  width?: number;
  height?: number;
  duration?: number;
}

interface XPostMediaPhoto {
  url: string;
  width?: number;
  height?: number;
}

interface XTweetData {
  id: string;
  url: string;
  text: string;
  author: {
    name: string;
    screen_name: string;
    avatar_url: string;
  };
  likes?: number;
  retweets?: number;
  views?: number;
  media?: {
    videos?: XPostMediaVideo[];
    photos?: XPostMediaPhoto[];
  };
}

interface XPostNativePreviewProps {
  userHandle: string;
  statusId: string;
  originalUrl: string;
  isMe?: boolean;
  onClose?: () => void;
}

export const XPostNativePreview = memo(function XPostNativePreview({
  userHandle,
  statusId,
  originalUrl,
  isMe = false,
  onClose,
}: XPostNativePreviewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tweet, setTweet] = useState<XTweetData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(false);

    const fetchTweet = async () => {
      try {
        const handle = userHandle && userHandle !== "i" ? userHandle : "i";
        const res = await fetch(`https://api.fxtwitter.com/${handle}/status/${statusId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.code === 200 && data.tweet && isMounted) {
          setTweet(data.tweet);
        } else {
          throw new Error("Invalid response");
        }
      } catch (err) {
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTweet();

    return () => {
      isMounted = false;
    };
  }, [userHandle, statusId]);

  const handlePlayClick = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const primaryVideo = tweet?.media?.videos?.[0];
  const isVertical = Boolean(
    primaryVideo && primaryVideo.height && primaryVideo.width && primaryVideo.height > primaryVideo.width
  );

  const containerWidth = isVertical
    ? "min(320px, 85vw)"
    : primaryVideo
    ? "min(520px, 92vw)"
    : "min(460px, 90vw)";

  // Format tweet text to highlight links
  const renderFormattedText = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(https?:\/\/[^\s]+|#[\w\d_-]+|@[\w\d_]+)/g);
    return parts.map((part, index) => {
      if (part.startsWith("http://") || part.startsWith("https://")) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-cyan-400 hover:underline break-all"
          >
            {part.replace(/^https?:\/\//, "")}
          </a>
        );
      }
      if (part.startsWith("@") || part.startsWith("#")) {
        return (
          <span key={index} className="text-sky-400 font-medium">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div
      className={`mt-2 overflow-hidden rounded-2xl border shadow-2xl transition-all duration-300 ${
        isMe
          ? "border-sky-500/30 bg-slate-950/95 text-slate-100"
          : "border-slate-800 bg-slate-950/95 text-slate-100"
      }`}
      style={{
        width: containerWidth,
        maxWidth: "100%",
      }}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 bg-slate-900/60 backdrop-blur-md">
        <div className="flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5 fill-white" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <span className="text-[11px] font-semibold tracking-wide text-white/90">X</span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 rounded-full bg-white/5 hover:bg-white/15 px-2 py-0.5 text-[10px] font-medium text-slate-300 transition"
            title="Open on X"
          >
            <span>Open</span>
            <svg className="h-2.5 w-2.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1 rounded-full bg-white/10 hover:bg-white/20 px-2 py-0.5 text-[10px] font-medium text-slate-300 transition"
            >
              <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Close</span>
            </button>
          )}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="p-3.5 space-y-3 animate-pulse">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-full bg-slate-800" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3 w-28 rounded bg-slate-800" />
              <div className="h-2.5 w-20 rounded bg-slate-850" />
            </div>
          </div>
          <div className="space-y-1.5 pt-1">
            <div className="h-3 w-full rounded bg-slate-800" />
            <div className="h-3 w-4/5 rounded bg-slate-800" />
          </div>
          <div className="h-44 w-full rounded-xl bg-slate-800/80" />
        </div>
      )}

      {/* Fallback / Error State */}
      {!loading && (error || !tweet) && (
        <div className="p-4 text-center select-none bg-slate-950/70">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 mb-2">
            <svg className="h-5 w-5 fill-white" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </div>
          <p className="text-xs font-medium text-slate-200">Post on X</p>
          <p className="mt-0.5 text-[11px] text-slate-400 font-mono truncate max-w-full">
            {originalUrl.replace(/^https?:\/\//, "")}
          </p>
          <a
            href={originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 px-3.5 py-1 text-xs font-medium text-cyan-200 transition"
          >
            <span>View Post on X</span>
            <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )}

      {/* Loaded Tweet Content */}
      {!loading && tweet && (
        <div className="p-3 sm:p-3.5 space-y-2.5">
          {/* Author Header */}
          <div className="flex items-center gap-2.5">
            {tweet.author?.avatar_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={tweet.author.avatar_url}
                alt={tweet.author.name || "Author"}
                className="h-9 w-9 rounded-full object-cover border border-white/10 shrink-0"
                loading="lazy"
              />
            )}
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-xs font-semibold text-slate-100 hover:underline">
                {tweet.author?.name}
              </p>
              <p className="truncate text-[11px] text-slate-400">
                @{tweet.author?.screen_name}
              </p>
            </div>
          </div>

          {/* Tweet Text */}
          {tweet.text && (
            <p className="text-[12px] sm:text-[13px] leading-relaxed text-slate-200 select-text whitespace-pre-wrap">
              {renderFormattedText(tweet.text)}
            </p>
          )}

          {/* Video Player */}
          {primaryVideo && (
            <div
              className="relative overflow-hidden rounded-xl bg-black border border-white/10 group"
              style={{
                aspectRatio: isVertical ? "9 / 16" : "16 / 9",
                width: "100%",
              }}
            >
              <video
                ref={videoRef}
                src={primaryVideo.url}
                poster={primaryVideo.thumbnail_url}
                controls
                playsInline
                preload="metadata"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="h-full w-full object-contain bg-black"
              />

              {/* Custom Play Button Overlay before play */}
              {!isPlaying && (
                <div
                  onClick={handlePlayClick}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-[2px] cursor-pointer transition group-hover:bg-black/20"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/90 text-slate-950 shadow-xl shadow-cyan-500/30 transition-transform duration-200 group-hover:scale-110">
                    <svg className="ml-1 h-6 w-6 fill-current" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>

                  {primaryVideo.duration && (
                    <span className="mt-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white/90">
                      {formatDuration(primaryVideo.duration)}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Photo Gallery (if photos without video) */}
          {!primaryVideo && tweet.media?.photos && tweet.media.photos.length > 0 && (
            <div
              className={`overflow-hidden rounded-xl border border-white/10 ${
                tweet.media.photos.length > 1 ? "grid grid-cols-2 gap-1" : ""
              }`}
            >
              {tweet.media.photos.map((photo, i) => (
                <a
                  key={i}
                  href={photo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="block relative overflow-hidden group bg-black/40"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={`Photo ${i + 1}`}
                    className="w-full h-auto max-h-[360px] object-cover transition duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </a>
              ))}
            </div>
          )}

          {/* Footer Metrics */}
          <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px] text-slate-400">
            <div className="flex items-center gap-3">
              {typeof tweet.views === "number" && (
                <span className="flex items-center gap-1">
                  <svg className="h-3 w-3 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {tweet.views.toLocaleString()}
                </span>
              )}
              {typeof tweet.likes === "number" && tweet.likes > 0 && (
                <span className="flex items-center gap-1">
                  <svg className="h-3 w-3 text-rose-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  {tweet.likes.toLocaleString()}
                </span>
              )}
            </div>

            <a
              href={originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-cyan-400 hover:underline font-medium"
            >
              View on X
            </a>
          </div>
        </div>
      )}
    </div>
  );
});

export default XPostNativePreview;
