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

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const delay = step.delayBefore ?? 250;
      if (delay > 0) {
        await new Promise((r) => setTimeout(r, delay));
      }

      // Show and glide to target
      this.listener(step, false, true);

      const duration = step.duration ?? 600;
      await new Promise((r) => setTimeout(r, duration + 50));

      // Click ripple shockwave
      this.listener(step, true, true);
      await new Promise((r) => setTimeout(r, 200));

      // Execute action callback
      if (step.onReach) {
        try {
          step.onReach();
        } catch (e) {
          console.error("[GhostCursor Action Error]:", e);
        }
      }

      // Try DOM click if selector/id provided
      if (step.targetId) {
        const el = document.getElementById(step.targetId);
        if (el) el.click();
      } else if (step.targetSelector) {
        const el = document.querySelector(step.targetSelector) as HTMLElement;
        if (el) el.click();
      }

      this.listener(step, false, true);
      await new Promise((r) => setTimeout(r, 150));
    }

    // Sequence finished -> Fade out cursor
    await new Promise((r) => setTimeout(r, 300));
    if (this.listener) {
      this.listener(null, false, false);
    }
    this.isRunning = false;
  }
}

export const ghostCursorEngine = new GhostCursorEngine();

export default function GhostCursor() {
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: -100, y: -100 });
  const [isVisible, setIsVisible] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [currentLabel, setCurrentLabel] = useState<string>("");
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    ghostCursorEngine.register((step, clicking, visible) => {
      setIsVisible(visible);
      setIsClicking(clicking);

      if (!step || !visible) return;

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
        const newRipple = { id: Date.now() + Math.random(), x: targetX, y: targetY };
        setRipples((prev) => [...prev.slice(-4), newRipple]);
      }
    });

    return () => ghostCursorEngine.unregister();
  }, []);

  if (!isVisible && ripples.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[999999] overflow-hidden">
      {/* Click Ripples */}
      {ripples.map((r) => (
        <div
          key={r.id}
          className="absolute h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-cyan-400 bg-cyan-400/20 shadow-[0_0_20px_#22d3ee] animate-ping"
          style={{ left: r.x, top: r.y }}
        />
      ))}

      {/* Cyber Ghost Cursor Pointer */}
      {isVisible && (
        <div
          className="absolute transition-all ease-[cubic-bezier(0.25,1,0.5,1)]"
          style={{
            left: pos.x,
            top: pos.y,
            transitionDuration: "500ms",
            transform: isClicking ? "scale(0.82) translate(-2px, -2px)" : "scale(1)",
          }}
        >
          {/* Glowing Aura Ring */}
          <div className="absolute -inset-3 rounded-full bg-cyan-500/25 blur-md animate-pulse" />

          {/* Holographic Cursor Arrow SVG */}
          <svg
            className="relative h-7 w-7 drop-shadow-[0_0_12px_rgba(6,182,212,0.9)]"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 3L10.5 21L13.5 13.5L21 10.5L3 3Z"
              fill="#06b6d4"
              stroke="#ffffff"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>

          {/* Q-AI Agent Tag */}
          <div className="absolute left-6 top-1 flex items-center gap-1 whitespace-nowrap rounded-full border border-cyan-400/60 bg-slate-950/90 px-2 py-0.5 text-[9px] font-bold tracking-wider text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)] backdrop-blur-md animate-in fade-in zoom-in-95">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>Q-AI AGENT</span>
            {currentLabel && <span className="text-slate-400 font-normal">({currentLabel})</span>}
          </div>
        </div>
      )}
    </div>
  );
}
