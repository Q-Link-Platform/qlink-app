"use client";

import React, { useEffect, useState, useRef } from "react";

export interface UndoSnackbarProps {
  visible: boolean;
  text?: string;
  durationMs?: number;
  onUndo: () => void;
  onDismiss: () => void;
}

/**
 * UndoSnackbar — Next-Gen Liquid Frosted Glass Soft-Delete Pill
 *
 * Provides a 5-second non-blocking countdown with instant Undo capability,
 * fluid spring animations, and specular light-catch borders.
 */
export const UndoSnackbar: React.FC<UndoSnackbarProps> = ({
  visible,
  text = "Message deleted",
  durationMs = 5000,
  onUndo,
  onDismiss,
}) => {
  const [isDismissing, setIsDismissing] = useState(false);
  const [progress, setProgress] = useState(1);
  const startTimeRef = useRef<number>(Date.now());
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!visible) {
      setIsDismissing(false);
      setProgress(1);
      return;
    }

    startTimeRef.current = Date.now();
    setIsDismissing(false);

    const updateTick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, 1 - elapsed / durationMs);
      setProgress(remaining);

      if (remaining > 0) {
        rafRef.current = requestAnimationFrame(updateTick);
      } else {
        // Countdown completed: start exit spring
        setIsDismissing(true);
        setTimeout(() => {
          onDismiss();
        }, 300);
      }
    };

    rafRef.current = requestAnimationFrame(updateTick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [visible, durationMs, onDismiss]);

  if (!visible) return null;

  const handleUndoClick = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setIsDismissing(true);
    setTimeout(() => {
      onUndo();
    }, 200);
  };

  const handleDismissClick = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setIsDismissing(true);
    setTimeout(() => {
      onDismiss();
    }, 200);
  };

  // Circular progress calculations (radius = 8, circumference ≈ 50.26)
  const radius = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div
      className={`undo-snackbar-container ${
        isDismissing ? "undo-snackbar-container--dismissing" : ""
      }`}
      role="status"
      aria-live="polite"
    >
      {/* Dynamic Countdown Ring */}
      <div className="relative flex items-center justify-center w-5 h-5 flex-shrink-0">
        <svg className="w-5 h-5 undo-progress-ring" viewBox="0 0 20 20">
          <circle
            cx="10"
            cy="10"
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="2"
          />
          <circle
            cx="10"
            cy="10"
            r={radius}
            fill="none"
            stroke="#22d3ee"
            strokeWidth="2"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-[stroke-dashoffset] duration-100 ease-linear"
          />
        </svg>
      </div>

      <span className="text-slate-200 tracking-wide">{text}</span>

      {/* Undo Button */}
      <button
        type="button"
        onClick={handleUndoClick}
        className="undo-btn-pill"
        title="Restore deleted message"
      >
        Undo
      </button>

      {/* Dismiss Button */}
      <button
        type="button"
        onClick={handleDismissClick}
        className="text-slate-400 hover:text-slate-200 transition-colors p-1 -mr-1"
        title="Dismiss"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};
