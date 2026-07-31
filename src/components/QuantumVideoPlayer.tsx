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
  preload = "metadata",
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
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const hideControlsTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync mute state & autoPlay to DOM node
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
      setHasError(false);
      setIsLoading(true);
      video
        .play()
        .then(() => {
          setIsLoading(false);
          setIsPlaying(true);
        })
        .catch((err) => {
          console.warn("[QuantumVideoPlayer] Play error:", err);
          setIsLoading(false);
          // Only show error overlay if play action physically failed
          if (video.error && video.error.code === 4) {
            setHasError(true);
            setErrorMessage("Unable to stream video. Tap to retry.");
          }
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
    setHasError(false);
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

  const retryPlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    setHasError(false);
    setIsLoading(true);
    video.load();
    video.play().then(() => {
      setIsLoading(false);
      setIsPlaying(true);
    }).catch(() => {
      setIsLoading(false);
      setIsPlaying(false);
    });
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
      className={`group relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-slate-950 shadow-[0_0_20px_rgba(2,8,23,0.8)] select-none transition-all duration-300 ${className}`}
    >
      {/* Native HTML5 Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        preload={preload}
        playsInline
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onWaiting={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onClick={handlePlayPause}
        className="block h-full w-full max-h-[75vh] object-contain bg-black cursor-pointer"
        style={{ display: "block", minHeight: 200 }}
      />

      {/* Loading Spinner Overlay */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-xs transition-opacity duration-200 pointer-events-none z-10">
          <div className="relative h-10 w-10">
            <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20" />
            <div className="absolute inset-0 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin shadow-[0_0_12px_rgba(34,211,238,0.5)]" />
          </div>
          <span className="mt-2 text-[10px] font-medium text-cyan-300 tracking-wider">
            QUANTUM STREAMING...
          </span>
        </div>
      )}

      {/* Error / Retry Overlay */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 p-4 text-center z-20">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 mb-2 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-xs font-semibold text-slate-200 max-w-[240px]">
            {errorMessage || "Unable to stream video. Tap to retry."}
          </p>
          <button
            type="button"
            onClick={retryPlayback}
            className="mt-3 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-sky-500 px-4 py-1.5 text-xs font-bold text-slate-950 shadow-[0_0_12px_rgba(34,211,238,0.5)] hover:scale-105 active:scale-95 transition-all"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retry Video
          </button>
        </div>
      )}

      {/* Center Big Play Button (shown when paused) */}
      {!isPlaying && !isLoading && !hasError && (
        <button
          type="button"
          onClick={handlePlayPause}
          className="absolute inset-0 m-auto flex h-14 w-14 items-center justify-center rounded-full border border-cyan-400/50 bg-slate-950/70 backdrop-blur-md text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:scale-110 active:scale-95 transition-all duration-200 z-10"
          aria-label="Play Video"
        >
          <svg className="h-7 w-7 translate-x-[2px] text-cyan-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      )}

      {/* Sleek Custom Control Bar */}
      <div
        className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent p-3 pt-6 flex flex-col gap-2 transition-opacity duration-300 z-20 ${
          showControls || !isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Glowing Progress Bar */}
        <div className="relative flex items-center h-3 group/timeline cursor-pointer">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="absolute inset-x-0 h-1.5 bg-slate-800/80 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.8)] rounded-full transition-all duration-75"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div
            className="absolute w-3.5 h-3.5 bg-cyan-300 rounded-full border border-white shadow-[0_0_8px_rgba(34,211,238,0.9)] z-20 -translate-x-1/2 group-hover/timeline:scale-125 transition-transform"
            style={{ left: `${progressPercent}%` }}
          />
        </div>

        {/* Bottom Control Buttons & Time */}
        <div className="flex items-center justify-between gap-3 text-slate-200">
          <div className="flex items-center gap-2">
            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={handlePlayPause}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900/80 border border-slate-700/60 text-cyan-300 hover:border-cyan-400/60 hover:bg-cyan-500/10 transition-all"
            >
              {isPlaying ? (
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg className="h-4 w-4 translate-x-[1px]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Mute & Volume Slider */}
            <div className="flex items-center gap-1.5 group/volume relative">
              <button
                type="button"
                onClick={toggleMute}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900/80 border border-slate-700/60 text-slate-300 hover:text-cyan-300 hover:border-cyan-400/60 transition-all"
              >
                {isMuted || volume === 0 ? (
                  <svg className="h-4 w-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-slate-800 rounded-full accent-cyan-400 cursor-pointer hidden group-hover/volume:block transition-all"
              />
            </div>

            {/* Time Stamp Display */}
            <div className="text-[11px] font-mono text-cyan-300/90 tracking-wide ml-1">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900/80 border border-slate-700/60 text-slate-300 hover:text-cyan-300 hover:border-cyan-400/60 transition-all"
            title="Fullscreen"
          >
            {isFullscreen ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9L4 4m0 0v5m0-5h5m6 0l5 5m0-5v5m0-5h-5m-6 11l-5 5m0 0v-5m0 5h5m6 0l5-5m0 5v-5m0 5h-5" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
