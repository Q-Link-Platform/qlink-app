"use client";

import React, { useEffect, useState } from "react";

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

// Helper to wait until a DOM element is truly rendered and has non-zero size
async function waitForVisibleElement(
  targetId?: string,
  targetSelector?: string,
  maxWaitMs: number = 1200
): Promise<{ el: HTMLElement; x: number; y: number } | null> {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitMs) {
    let el: HTMLElement | null = null;
    if (targetId) {
      el = document.getElementById(targetId);
    } else if (targetSelector) {
      el = document.querySelector(targetSelector) as HTMLElement;
    }

    if (el) {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0 && rect.top + rect.height > 0) {
        return {
          el,
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
      }
    }
    await new Promise((r) => setTimeout(r, 40));
  }

  // Fallback if element still hidden
  let fallbackEl: HTMLElement | null = null;
  if (targetId) fallbackEl = document.getElementById(targetId);
  else if (targetSelector) fallbackEl = document.querySelector(targetSelector) as HTMLElement;

  if (fallbackEl) {
    const rect = fallbackEl.getBoundingClientRect();
    return { el: fallbackEl, x: rect.left || window.innerWidth / 2, y: rect.top || window.innerHeight / 2 };
  }
  return null;
}

class GhostCursorEngine {
  private listener: ((coords: { x: number; y: number } | null, isClicking: boolean, label: string) => void) | null = null;
  private isRunning = false;

  public register(listener: (coords: { x: number; y: number } | null, isClicking: boolean, label: string) => void) {
    this.listener = listener;
  }

  public unregister() {
    this.listener = null;
  }

  public async runSequence(steps: CursorStep[]) {
    if (this.isRunning || !this.listener) return;
    this.isRunning = true;

    try {
      // Start near center / current focus if not already positioned
      let currentX = window.innerWidth * 0.65;
      let currentY = window.innerHeight * 0.45;

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const delay = step.delayBefore ?? 200;
        if (delay > 0) {
          await new Promise((r) => setTimeout(r, delay));
        }

        // Wait for element to become visible in DOM
        let targetX = step.customX ?? currentX;
        let targetY = step.customY ?? currentY;
        let targetEl: HTMLElement | null = null;

        if (step.targetId || step.targetSelector) {
          const res = await waitForVisibleElement(step.targetId, step.targetSelector, 1200);
          if (res) {
            targetX = res.x;
            targetY = res.y;
            targetEl = res.el;
          }
        }

        currentX = targetX;
        currentY = targetY;

        // 1. Move cursor to target position with smooth gliding
        this.listener({ x: targetX, y: targetY }, false, step.actionName || "");
        const duration = step.duration ?? 550;
        await new Promise((r) => setTimeout(r, duration + 60));

        // 2. Hover Pause: Let user's eyes see the mouse sitting on the button
        await new Promise((r) => setTimeout(r, 180));

        // 3. Trigger simulated physical click press
        this.listener({ x: targetX, y: targetY }, true, step.actionName || "");
        
        // Highlight element physically
        if (targetEl) {
          targetEl.classList.add("ring-2", "ring-cyan-400", "ring-offset-2", "ring-offset-black");
          setTimeout(() => {
            targetEl?.classList.remove("ring-2", "ring-cyan-400", "ring-offset-2", "ring-offset-black");
          }, 350);
        }

        await new Promise((r) => setTimeout(r, 180));

        // 4. Execute step callback / DOM click
        if (step.onReach) {
          try {
            step.onReach();
          } catch (e) {
            console.error("[GhostCursor Action Error]:", e);
          }
        }

        if (targetEl) {
          targetEl.click();
        }

        // 5. Release click press
        this.listener({ x: targetX, y: targetY }, false, step.actionName || "");
        await new Promise((r) => setTimeout(r, 150));
      }
    } finally {
      // Sequence completed -> Smoothly vanish
      await new Promise((r) => setTimeout(r, 350));
      if (this.listener) {
        this.listener(null, false, "");
      }
      this.isRunning = false;
    }
  }
}

export const ghostCursorEngine = new GhostCursorEngine();

export default function GhostCursor() {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [isClicking, setIsClicking] = useState(false);
  const [currentLabel, setCurrentLabel] = useState<string>("");
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    ghostCursorEngine.register((coords, clicking, label) => {
      setPos(coords);
      setIsClicking(clicking);
      setCurrentLabel(label);

      if (coords && clicking) {
        const rippleId = Date.now() + Math.random();
        const newRipple = { id: rippleId, x: coords.x, y: coords.y };
        setRipples((prev) => [...prev.slice(-3), newRipple]);

        setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== rippleId));
        }, 500);
      } else if (!coords) {
        setRipples([]);
      }
    });

    return () => ghostCursorEngine.unregister();
  }, []);

  if (!pos && ripples.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[99999999] overflow-hidden select-none">
      {/* Click Shockwave Ripples */}
      {ripples.map((r) => (
        <div
          key={r.id}
          className="absolute h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-cyan-400 bg-cyan-400/30 shadow-[0_0_25px_#22d3ee] animate-ping"
          style={{ left: r.x, top: r.y }}
        />
      ))}

      {/* Iconic OS Mouse Arrow Cursor Pointer */}
      {pos && (
        <div
          className="absolute transition-all ease-[cubic-bezier(0.18,0.9,0.28,1)]"
          style={{
            left: pos.x,
            top: pos.y,
            transitionDuration: "500ms",
            transform: isClicking ? "scale(0.88) translate(1px, 2px)" : "scale(1)",
            transformOrigin: "0 0",
          }}
        >
          {/* Iconic High-Visibility White & Cyan Mouse Arrow SVG Pointer */}
          <div className="relative">
            <svg
              width="30"
              height="34"
              viewBox="0 0 28 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] drop-shadow-[0_0_12px_rgba(34,211,238,0.9)]"
            >
              {/* Outer Bold Black/Cyan Border */}
              <path
                d="M2 2L11.5 29L16 18.5L26 14L2 2Z"
                fill="#030712"
                stroke="#06b6d4"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              {/* Crisp Pure White Inner Arrow Body */}
              <path
                d="M4.5 4.5L11.8 24.8L15.2 16.5L23.5 12.8L4.5 4.5Z"
                fill="#ffffff"
              />
            </svg>

            {/* Glowing Tip Radar Beacon */}
            <span className="absolute -top-1 -left-1 h-3 w-3 rounded-full bg-cyan-400/60 blur-xs animate-ping" />
          </div>

          {/* Floating High-Tech Q-AI Status Badge */}
          <div className="absolute left-7 top-1 flex items-center gap-1.5 whitespace-nowrap rounded-full border border-cyan-400/80 bg-slate-950/95 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.6)] backdrop-blur-xl animate-in fade-in zoom-in-95">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-mono text-[9px] text-cyan-200">Q-AI AGENT</span>
            {currentLabel && (
              <span className="font-medium text-slate-200 border-l border-white/20 pl-1.5 text-[9.5px]">
                {currentLabel}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
