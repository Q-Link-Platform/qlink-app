"use client";

import React, { useState, useRef, useEffect } from "react";

interface QuantumVideoPlayerProps {
  src: string;
  className?: string;
  autoPlayMuted?: boolean;
  preload?: "none" | "metadata" | "auto";
  poster?: string;
}

export default function QuantumVideoPlayer({
  src,
  className = "",
  autoPlayMuted = false,
  preload = "auto",
  poster,
}: QuantumVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(autoPlayMuted);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const hideControlsTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Mute & AutoPlay sync on DOM node
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = isMuted;
    if (autoPlayMuted) {
      video.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, [autoPlayMuted, isMuted, src]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
    if (isPlaying) {
      hideControlsTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  };

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      document.querySelectorAll("video, audio").forEach((el) => {
        if (el !== video) (el as HTMLMediaElement).pause();
      });
      video
        .play()
        .then(() => {
          setIsLoading(false);
          setIsPlaying(true);
        })
        .catch((err) => {
          console.warn("[QuantumVideoPlayer] Play error:", err);
          setIsLoading(false);
          setIsPlaying(false);
        });
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

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const targetTime = parseFloat(e.target.value);
    video.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const val = parseFloat(e.target.value);
    setVolume(val);
    video.volume = val;
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const newMuted = !isMuted;
    video.muted = newMuted;
    setIsMuted(newMuted);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch((err) => console.error("Fullscreen failed:", err));
    } else {
      document.exitFullscreen().catch((err) => console.error("Exit fullscreen failed:", err));
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className={`group relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-slate-950 shadow-[0_0_25px_rgba(2,8,23,0.9)] select-none transition-all duration-300 w-full min-h-[380px] sm:min-h-[460px] md:min-h-[520px] max-h-[82vh] ${className}`}
    >
      {/* Native HTML5 Video Element with Full Native Controls & Large Viewport */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        preload="auto"
        controls
        autoPlay={autoPlayMuted}
        muted={isMuted}
        playsInline
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onWaiting={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        className="block h-full w-full min-h-[380px] sm:min-h-[460px] md:min-h-[520px] max-h-[82vh] object-contain bg-black"
        style={{ display: "block", width: "100%", height: "100%" }}
      />

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
