"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

export interface QuantumChatImageLightboxProps {
  isOpen: boolean;
  imageUrl: string | null;
  imageName?: string | null;
  onClose: () => void;
}

export const QuantumChatImageLightbox: React.FC<QuantumChatImageLightboxProps> = ({
  isOpen,
  imageUrl,
  imageName,
  onClose,
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDownloading, setIsDownloading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const pinchStartDistRef = useRef<number | null>(null);
  const pinchStartScaleRef = useRef<number>(1);

  // Reset transform when opened or image changes
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setRotation(0);
      setIsDragging(false);
    }
  }, [isOpen, imageUrl]);

  // Zoom helpers
  const zoomIn = useCallback(() => {
    setScale((prev) => Math.min(Number((prev + 0.35).toFixed(2)), 5));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((prev) => {
      const next = Math.max(Number((prev - 0.35).toFixed(2)), 0.5);
      if (next <= 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  }, []);

  const rotateClockwise = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  // Double click to toggle zoom (1x <-> 2.5x)
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (scale > 1) {
      resetZoom();
    } else {
      setScale(2.5);
    }
  };

  // Mouse wheel zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isOpen) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 0.2 : -0.2;
      setScale((prev) => {
        const next = Math.min(Math.max(Number((prev + zoomFactor).toFixed(2)), 0.5), 5);
        if (next <= 1) setPosition({ x: 0, y: 0 });
        return next;
      });
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [isOpen]);

  // Mouse Drag / Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1 || e.button !== 0) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    e.preventDefault();
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Mobile Touch Gestures (Pinch to Zoom & One-Finger Pan)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinchStartDistRef.current = dist;
      pinchStartScaleRef.current = scale;
    } else if (e.touches.length === 1 && scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStartDistRef.current !== null) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = currentDist / pinchStartDistRef.current;
      const nextScale = Math.min(Math.max(Number((pinchStartScaleRef.current * ratio).toFixed(2)), 0.5), 5);
      setScale(nextScale);
      if (nextScale <= 1) setPosition({ x: 0, y: 0 });
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    pinchStartDistRef.current = null;
    setIsDragging(false);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "+" || e.key === "=") {
        zoomIn();
      } else if (e.key === "-" || e.key === "_") {
        zoomOut();
      } else if (e.key === "0" || e.key === "r" || e.key === "R") {
        resetZoom();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, zoomIn, zoomOut, resetZoom]);

  // Image Download Handler
  const handleDownload = async () => {
    if (!imageUrl) return;
    setIsDownloading(true);
    try {
      const filename = imageName || `qlink-image-${Date.now()}.jpg`;
      if (imageUrl.startsWith("data:") || imageUrl.startsWith("blob:")) {
        const link = document.createElement("a");
        link.href = imageUrl;
        link.download = filename;
        link.click();
      } else {
        const res = await fetch(imageUrl);
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(blobUrl);
      }
    } catch (err) {
      console.error("[Lightbox] Download failed:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen || !imageUrl) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[3000] flex flex-col items-center justify-center bg-black/90 backdrop-blur-2xl select-none animate-in fade-in duration-200 overflow-hidden"
      onClick={scale === 1 ? onClose : undefined}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in",
      }}
    >
      {/* Top Floating Optical Glass Controls */}
      <div
        className="absolute top-4 inset-x-4 z-50 flex items-center justify-between pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: Image Name & Status */}
        <div className="flex items-center gap-2 max-w-[45%] truncate rounded-full bg-slate-950/70 border border-white/15 px-3 py-1.5 backdrop-blur-xl shadow-lg">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
          <span className="truncate text-xs font-mono text-slate-200 tracking-tight">
            {imageName || "Quantum Image"}
          </span>
        </div>

        {/* Right: Actions (Close Button) */}
        <div className="flex items-center gap-2">
          <div className="relative group/lb flex items-center justify-center">
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950/80 border border-white/20 text-white/80 hover:text-white hover:bg-slate-800 transition active:scale-90 shadow-xl cursor-pointer"
              aria-label="Close image preview"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="pointer-events-none absolute top-full mt-2 right-0 z-50 opacity-0 group-hover/lb:opacity-100 group-hover/lb:translate-y-0.5 transition-all duration-150 ease-out whitespace-nowrap">
              <div className="rounded-full border border-white/15 bg-black/90 px-2.5 py-0.5 text-[9.5px] font-medium tracking-tight text-white/90 shadow-xl backdrop-blur-xl">
                Close (Esc)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Image Viewport */}
      <div
        className="relative w-full h-full flex items-center justify-center overflow-hidden p-4"
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
      >
        <img
          ref={imageRef}
          src={imageUrl}
          alt={imageName || "Full screen image"}
          draggable={false}
          className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl shadow-2xl transition-transform duration-75 ease-out pointer-events-auto"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
            transformOrigin: "center center",
          }}
        />
      </div>

      {/* Bottom Floating Apple Optical Crystal Toolbar */}
      <div
        className="absolute bottom-6 z-50 flex items-center gap-1.5 rounded-full border border-white/20 bg-slate-950/85 px-3 py-1.5 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.15)] pointer-events-auto animate-in slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Zoom Out Button */}
        <div className="relative group/lb flex items-center justify-center">
          <button
            type="button"
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-300 hover:text-white hover:bg-white/10 active:scale-90 disabled:opacity-30 transition cursor-pointer"
            aria-label="Zoom out"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
            </svg>
          </button>
          <div className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 opacity-0 group-hover/lb:opacity-100 group-hover/lb:-translate-y-0.5 transition-all duration-150 ease-out whitespace-nowrap">
            <div className="rounded-full border border-white/15 bg-black/90 px-2.5 py-0.5 text-[9.5px] font-medium tracking-tight text-white/90 shadow-xl backdrop-blur-xl">
              Zoom Out
            </div>
          </div>
        </div>

        {/* Current Zoom Percentage (Click to reset) */}
        <div className="relative group/lb flex items-center justify-center">
          <button
            type="button"
            onClick={resetZoom}
            className="px-2 py-1 rounded-full text-xs font-mono font-semibold text-cyan-300 hover:bg-cyan-500/10 transition active:scale-95 cursor-pointer"
            aria-label="Reset zoom"
          >
            {Math.round(scale * 100)}%
          </button>
          <div className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 opacity-0 group-hover/lb:opacity-100 group-hover/lb:-translate-y-0.5 transition-all duration-150 ease-out whitespace-nowrap">
            <div className="rounded-full border border-white/15 bg-black/90 px-2.5 py-0.5 text-[9.5px] font-medium tracking-tight text-white/90 shadow-xl backdrop-blur-xl">
              Reset Zoom
            </div>
          </div>
        </div>

        {/* Zoom In Button */}
        <div className="relative group/lb flex items-center justify-center">
          <button
            type="button"
            onClick={zoomIn}
            disabled={scale >= 5}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-300 hover:text-white hover:bg-white/10 active:scale-90 disabled:opacity-30 transition cursor-pointer"
            aria-label="Zoom in"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <div className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 opacity-0 group-hover/lb:opacity-100 group-hover/lb:-translate-y-0.5 transition-all duration-150 ease-out whitespace-nowrap">
            <div className="rounded-full border border-white/15 bg-black/90 px-2.5 py-0.5 text-[9.5px] font-medium tracking-tight text-white/90 shadow-xl backdrop-blur-xl">
              Zoom In
            </div>
          </div>
        </div>

        <span className="h-4 w-[1px] bg-white/20 mx-0.5" />

        {/* Rotate Button */}
        <div className="relative group/lb flex items-center justify-center">
          <button
            type="button"
            onClick={rotateClockwise}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-300 hover:text-white hover:bg-white/10 active:scale-90 transition cursor-pointer"
            aria-label="Rotate 90 degrees"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <div className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 opacity-0 group-hover/lb:opacity-100 group-hover/lb:-translate-y-0.5 transition-all duration-150 ease-out whitespace-nowrap">
            <div className="rounded-full border border-white/15 bg-black/90 px-2.5 py-0.5 text-[9.5px] font-medium tracking-tight text-white/90 shadow-xl backdrop-blur-xl">
              Rotate 90°
            </div>
          </div>
        </div>

        {/* Download / Save Button */}
        <div className="relative group/lb flex items-center justify-center">
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex h-8 w-8 items-center justify-center rounded-full text-cyan-300 hover:text-cyan-100 hover:bg-cyan-500/15 active:scale-90 disabled:opacity-50 transition cursor-pointer"
            aria-label="Save image"
          >
            {isDownloading ? (
              <svg className="h-4 w-4 animate-spin text-cyan-300" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            )}
          </button>
          <div className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 opacity-0 group-hover/lb:opacity-100 group-hover/lb:-translate-y-0.5 transition-all duration-150 ease-out whitespace-nowrap">
            <div className="rounded-full border border-cyan-500/30 bg-black/90 px-2.5 py-0.5 text-[9.5px] font-medium tracking-tight text-cyan-200 shadow-xl backdrop-blur-xl">
              {isDownloading ? "Saving…" : "Save Image"}
            </div>
          </div>
        </div>
      </div>

      {/* Helpful Hint on first zoom */}
      {scale > 1 && (
        <div className="absolute bottom-20 z-40 pointer-events-none rounded-full bg-black/60 border border-white/10 px-3 py-1 text-[11px] text-white/70 backdrop-blur-md animate-in fade-in duration-150">
          Drag to pan • Double-click or tap {Math.round(scale * 100)}% to reset
        </div>
      )}
    </div>
  );
};
export default QuantumChatImageLightbox;
