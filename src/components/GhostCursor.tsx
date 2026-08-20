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
  maxWaitMs: number = 1500
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
      if (rect.width > 0 && rect.height > 0 && rect.top + rect.height > 0 && rect.left + rect.width > 0) {
        return {
          el,
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
      }
    }
    await new Promise((r) => setTimeout(r, 50));
  }

  // Fallback
  let fallbackEl: HTMLElement | null = null;
  if (targetId) fallbackEl = document.getElementById(targetId);
  else if (targetSelector) fallbackEl = document.querySelector(targetSelector) as HTMLElement;

  if (fallbackEl) {
    const rect = fallbackEl.getBoundingClientRect();
    return { el: fallbackEl, x: rect.left + rect.width / 2 || window.innerWidth / 2, y: rect.top + rect.height / 2 || window.innerHeight / 2 };
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
      // 1. Initial Spawn: Position mouse visibly near center-right (inside Q-AI area)
      const spawnX = Math.min(window.innerWidth - 180, window.innerWidth * 0.75);
      const spawnY = window.innerHeight * 0.45;
      
      this.listener({ x: spawnX, y: spawnY }, false, "Q-AI Initializing...");
      await new Promise((r) => setTimeout(r, 250));

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const delay = step.delayBefore ?? 200;
        if (delay > 0) {
          await new Promise((r) => setTimeout(r, delay));
        }

        // Wait for target button to be rendered and visible
        let targetX = step.customX ?? spawnX;
        let targetY = step.customY ?? spawnY;
        let targetEl: HTMLElement | null = null;

        if (step.targetId || step.targetSelector) {
          const res = await waitForVisibleElement(step.targetId, step.targetSelector, 1500);
          if (res) {
            targetX = res.x;
            targetY = res.y;
            targetEl = res.el;
          }
        }

        // 2. Smoothly Glide mouse cursor to the target button
        this.listener({ x: targetX, y: targetY }, false, step.actionName || "Moving...");
        const duration = step.duration ?? 500;
        await new Promise((r) => setTimeout(r, duration + 50));

        // 3. Hover Pause: Sits physically on top of the button so user sees it
        await new Promise((r) => setTimeout(r, 220));

        // 4. Physical Mouse Click Press (downwards haptic depression)
        this.listener({ x: targetX, y: targetY }, true, step.actionName || "Clicking");
        
        // Flash button visually
        if (targetEl) {
          targetEl.classList.add("ring-2", "ring-cyan-400", "ring-offset-2", "ring-offset-black", "scale-95");
          setTimeout(() => {
            targetEl?.classList.remove("ring-2", "ring-cyan-400", "ring-offset-2", "ring-offset-black", "scale-95");
          }, 300);
        }

        await new Promise((r) => setTimeout(r, 200));

        // 5. Execute action callback OR DOM click (Never both to prevent double-toggle bugs)
        if (step.onReach) {
          try {
            step.onReach();
          } catch (e) {
            console.error("[GhostCursor Action Error]:", e);
          }
        } else if (targetEl) {
          targetEl.click();
        }

        // 6. Release mouse click
        this.listener({ x: targetX, y: targetY }, false, step.actionName || "");
        await new Promise((r) => setTimeout(r, 180));
      }
    } finally {
      // 7. Completed -> Fade out smoothly and remove
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

  useEffect(() => {
    ghostCursorEngine.register((coords, clicking, label) => {
      setPos(coords);
      setIsClicking(clicking);
      setCurrentLabel(label);
    });

    return () => ghostCursorEngine.unregister();
  }, []);

  if (!pos) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[2147483647] overflow-hidden select-none">
      {/* Authentic High-Definition OS Mouse Arrow Pointer */}
      <div
        className="absolute transition-all ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          left: pos.x,
          top: pos.y,
          transitionDuration: "480ms",
          transform: isClicking ? "scale(0.88) translate(2px, 3px)" : "scale(1)",
          transformOrigin: "0 0",
        }}
      >
        {/* Solid Iconic White Mouse Pointer Arrow with Bold Shadow */}
        <div className="relative">
          <svg
            width="34"
            height="38"
            viewBox="0 0 28 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              filter: "drop-shadow(0px 4px 12px rgba(0, 0, 0, 0.95)) drop-shadow(0px 0px 8px rgba(6, 182, 212, 0.9))",
            }}
          >
            {/* Outer Bold Black/Cyan Border */}
            <path
              d="M2 2L11.5 29L16 18.5L26 14L2 2Z"
              fill="#020617"
              stroke="#06b6d4"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
            {/* Crisp Solid Snow White Inner Body */}
            <path
              d="M4.5 4.5L11.8 24.8L15.2 16.5L23.5 12.8L4.5 4.5Z"
              fill="#ffffff"
            />
          </svg>
        </div>

        {/* Floating High-Tech Action Label Pill */}
        {currentLabel && (
          <div className="absolute left-8 top-2 flex items-center gap-1.5 whitespace-nowrap rounded-full border border-cyan-400 bg-slate-950/95 px-3 py-1 text-[11px] font-bold text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.6)] backdrop-blur-2xl animate-in fade-in zoom-in-95">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-mono text-cyan-200">Q-AI</span>
            <span className="font-medium text-white border-l border-white/20 pl-1.5">
              {currentLabel}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
