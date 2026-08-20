"use client";

import React, { useEffect, useState, useRef } from "react";

export interface CursorStep {
  targetSelector?: string;
  targetId?: string;
  customX?: number;
  customY?: number;
  delayBefore?: number;
  duration?: number;
  actionName?: string;
  onReach?: () => void;
}

class GhostCursorEngine {
  private listener: ((step: CursorStep | null, isClicking: boolean, isVisible: boolean) => void) | null = null;
  private isRunning = false;

  public register(listener: (step: CursorStep | null, isClicking: boolean, isVisible: boolean) => void) {
    this.listener = listener;
  }

  public unregister() {
    this.listener = null;
  }

  public async runSequence(steps: CursorStep[]) {
    if (this.isRunning || !this.listener) return;
    this.isRunning = true;

    try {
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const delay = step.delayBefore ?? 200;
        if (delay > 0) {
          await new Promise((r) => setTimeout(r, delay));
        }

        // 1. Move cursor to target
        this.listener(step, false, true);

        const duration = step.duration ?? 500;
        await new Promise((r) => setTimeout(r, duration + 30));

        // 2. Trigger click shockwave ripple & press animation
        this.listener(step, true, true);
        await new Promise((r) => setTimeout(r, 220));

        // 3. Execute action callback
        if (step.onReach) {
          try {
            step.onReach();
          } catch (e) {
            console.error("[GhostCursor Action Error]:", e);
          }
        }

        // 4. Try native DOM element click if target exists
        if (step.targetId) {
          const el = document.getElementById(step.targetId);
          if (el) el.click();
        } else if (step.targetSelector) {
          const el = document.querySelector(step.targetSelector) as HTMLElement;
          if (el) el.click();
        }

        // 5. Release click press
        this.listener(step, false, true);
        await new Promise((r) => setTimeout(r, 120));
      }
    } finally {
      // 6. Complete and clean up immediately
      await new Promise((r) => setTimeout(r, 250));
      if (this.listener) {
        this.listener(null, false, false);
      }
      this.isRunning = false;
    }
  }
}

export const ghostCursorEngine = new GhostCursorEngine();

export default function GhostCursor() {
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: -200, y: -200 });
  const [isVisible, setIsVisible] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [currentLabel, setCurrentLabel] = useState<string>("");
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    ghostCursorEngine.register((step, clicking, visible) => {
      setIsVisible(visible);
      setIsClicking(clicking);

      if (!visible) {
        // Complete cleanup when not visible
        setRipples([]);
        setCurrentLabel("");
        return;
      }

      if (!step) return;

      let targetX = step.customX ?? window.innerWidth / 2;
      let targetY = step.customY ?? window.innerHeight / 2;

      let targetEl: HTMLElement | null = null;
      if (step.targetId) {
        targetEl = document.getElementById(step.targetId);
      } else if (step.targetSelector) {
        targetEl = document.querySelector(step.targetSelector) as HTMLElement;
      }

      if (targetEl) {
        const rect = targetEl.getBoundingClientRect();
        targetX = rect.left + rect.width / 2;
        targetY = rect.top + rect.height / 2;
      }

      setPos({ x: targetX, y: targetY });
      if (step.actionName) {
        setCurrentLabel(step.actionName);
      }

      if (clicking) {
        const rippleId = Date.now() + Math.random();
        const newRipple = { id: rippleId, x: targetX, y: targetY };
        setRipples((prev) => [...prev.slice(-3), newRipple]);

        // Auto-expire individual ripple after 500ms
        setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== rippleId));
        }, 500);
      }
    });

    return () => ghostCursorEngine.unregister();
  }, []);

  // When inactive and no lingering ripples, render nothing
  if (!isVisible && ripples.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999999] overflow-hidden select-none">
      {/* Click Shockwave Ripples */}
      {ripples.map((r) => (
        <div
          key={r.id}
          className="absolute h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-cyan-400 bg-cyan-400/25 shadow-[0_0_20px_#22d3ee] animate-ping"
          style={{ left: r.x, top: r.y }}
        />
      ))}

      {/* Cyber Ghost Mouse Cursor Pointer */}
      {isVisible && (
        <div
          className="absolute transition-all ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            left: pos.x,
            top: pos.y,
            transitionDuration: "450ms",
            transform: isClicking ? "scale(0.85) translate(1px, 1px)" : "scale(1)",
          }}
        >
          {/* Subtle Ambient Laser Glow */}
          <div className="absolute -inset-2.5 rounded-full bg-cyan-400/20 blur-sm animate-pulse" />

          {/* Authentic High-Precision OS Mouse Arrow Pointer */}
          <svg
            className="relative h-6 w-6 drop-shadow-[0_2px_10px_rgba(6,182,212,0.85)] filter"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Dark Outer Shadow Layer */}
            <path
              d="M3 2L10.5 20.5L13.8 13.8L20.5 10.5L3 2Z"
              fill="#080e1a"
            />
            {/* Sleek Cyan Border Layer */}
            <path
              d="M3.5 3L10.2 19.3L13.3 13.3L19.3 10.2L3.5 3Z"
              fill="#06b6d4"
            />
            {/* Crisp White Inner Arrow Body */}
            <path
              d="M4.5 4.5L9.6 17.5L12.2 12.5L17.5 9.6L4.5 4.5Z"
              fill="#ffffff"
            />
          </svg>

          {/* High-Tech Q-AI Holographic Badge */}
          <div className="absolute left-6 top-1 flex items-center gap-1.5 whitespace-nowrap rounded-full border border-cyan-400/70 bg-slate-950/95 px-2.5 py-0.5 text-[9.5px] font-bold tracking-wide text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.5)] backdrop-blur-xl animate-in fade-in zoom-in-95">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-mono">Q-AI</span>
            {currentLabel && (
              <span className="font-normal text-slate-300/90 border-l border-white/15 pl-1.5">
                {currentLabel}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
