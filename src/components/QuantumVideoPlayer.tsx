"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { useFeedVideoManager } from "@/context/FeedVideoManager";

interface QuantumVideoPlayerProps {
  id?: string;
  src: string;
  className?: string;
  autoPlayMuted?: boolean;
  preload?: "none" | "metadata" | "auto";
  poster?: string;
  onExpandLightbox?: () => void;
}

export default function QuantumVideoPlayer({
  id: customId,
  src,
  className = "",
  autoPlayMuted = false,
  preload = "auto",
  poster,
  onExpandLightbox,
}: QuantumVideoPlayerProps) {
  const generatedId = useId();
  const videoId = customId || `${generatedId}-${src}`;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const hideControlsTimerRef = useRef<NodeJS.Timeout | null>(null);

  const feedManager = useFeedVideoManager();
  const isActiveInFeed = feedManager ? feedManager.activeVideoId === videoId : false;

  // Pre-warm DOM node attributes on mount for instant zero-latency start
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("preload", "auto");
  }, []);

  // Sync mute state with global feed mute state if manager is present
  useEffect(() => {
    if (feedManager) {
      setIsMuted(feedManager.isGlobalMuted);
    }
  }, [feedManager?.isGlobalMuted, feedManager]);

  // Register with FeedManager for X-style centering autoplay
  useEffect(() => {
    if (!feedManager || !containerRef.current) return;

    const playVideo = () => {
      const video = videoRef.current;
      if (!video) return;

      document.querySelectorAll("video, audio").forEach((el) => {
        if (el !== video) (el as HTMLMediaElement).pause();
      });

      if (isMuted) {
        video.muted = true;
        video.setAttribute("muted", "");
      }

      video
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch(() => {
          video.muted = true;
          video.setAttribute("muted", "");
          video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        });
    };

    const pauseVideo = () => {
      const video = videoRef.current;
      if (!video) return;
      video.pause();
      setIsPlaying(false);
    };

    const unregister = feedManager.registerVideo(
      videoId,
      containerRef.current,
      playVideo,
      pauseVideo
    );

    return () => {
      unregister();
    };
  }, [feedManager, videoId, isMuted]);

  // Trigger play/pause based on centering active status
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (feedManager) {
      if (isActiveInFeed) {
        document.querySelectorAll("video, audio").forEach((el) => {
          if (el !== video) (el as HTMLMediaElement).pause();
        });

        if (isMuted) {
          video.muted = true;
          video.setAttribute("muted", "");
          video.setAttribute("playsinline", "");
        } else {
          video.muted = false;
          video.volume = 1.0;
        }

        const promise = video.play();
        if (promise !== undefined) {
          promise
            .then(() => {
              setIsPlaying(true);
              setIsLoading(false);
            })
            .catch(() => {
              video.muted = true;
              video.setAttribute("muted", "");
              video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
            });
        }
      } else {
        video.pause();
      }
    }
  }, [isActiveInFeed, feedManager, isMuted]);

  // Mute & Volume DOM sync
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = isMuted;
    if (!isMuted) {
      video.volume = volume > 0 ? volume : 1.0;
    }
  }, [isMuted, volume]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
    if (isPlaying) {
      hideControlsTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.duration && isFinite(video.duration)) {
      setDuration(video.duration);
    }
    setIsLoading(false);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (feedManager) {
      feedManager.toggleGlobalMute();
    } else {
      const video = videoRef.current;
      if (!video) return;
      const nextMuted = !isMuted;
      video.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className={`group relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-slate-950 shadow-[0_0_25px_rgba(2,8,23,0.9)] select-none transition-all duration-300 w-full min-h-[380px] sm:min-h-[460px] md:min-h-[520px] max-h-[82vh] ${className}`}
    >
      {/* Native HTML5 Video Element with Native Controls & Centered Autoplay */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        preload={preload}
        controls
        autoPlay={autoPlayMuted}
        muted={isMuted}
        playsInline
        onPlay={() => {
          setIsPlaying(true);
          const video = videoRef.current;
          if (video && !isMuted) {
            video.volume = 1.0;
          }
        }}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onWaiting={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        className="block h-full w-full min-h-[380px] sm:min-h-[460px] md:min-h-[520px] max-h-[82vh] object-contain bg-black cursor-pointer"
        style={{ display: "block", width: "100%", height: "100%" }}
      />

      {/* X (Twitter) Style Floating Sound Toggle Overlay */}
      <button
        type="button"
        onClick={toggleMute}
        className="absolute bottom-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-slate-950/80 text-white backdrop-blur-md border border-cyan-500/40 hover:border-cyan-400 hover:scale-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,0,0,0.8)]"
        title={isMuted ? "Click to unmute sound" : "Click to mute sound"}
      >
        {isMuted ? (
          /* Muted Icon */
          <svg className="h-5 w-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        ) : (
          /* Sound Active / Unmuted Icon */
          <svg className="h-5 w-5 text-cyan-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        )}
      </button>

      {/* Loading Spinner Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-xs transition-opacity duration-200 pointer-events-none z-10">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20" />
            <div className="absolute inset-0 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin shadow-[0_0_15px_rgba(34,211,238,0.6)]" />
          </div>
          <span className="mt-3 text-xs font-semibold text-cyan-300 tracking-wider">
            QUANTUM STREAMING...
          </span>
        </div>
      )}
    </div>
  );
}
