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

interface Point {
  x: number;
  y: number;
}

// Biological Flash & Hogan (1985) Minimum-Jerk polynomial: s(tau) = 10*tau^3 - 15*tau^4 + 6*tau^5
function minimumJerk(tau: number): number {
  const t = Math.max(0, Math.min(1, tau));
  return t * t * t * (10 + t * (-15 + 6 * t));
}

// Cubic Bézier calculation
function cubicBezier(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;

  return {
    x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
    y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y,
  };
}

// Helper to wait until a DOM element is truly rendered, visible, and stable
async function waitForVisibleElement(
  targetId?: string,
  targetSelector?: string,
  maxWaitMs: number = 3000
): Promise<{ el: HTMLElement; x: number; y: number } | null> {
  const startTime = Date.now();
  let lastRect: DOMRect | null = null;
  let stableCount = 0;

  while (Date.now() - startTime < maxWaitMs) {
    let el: HTMLElement | null = null;
    if (targetId) {
      el = document.getElementById(targetId);
    } else if (targetSelector) {
      el = document.querySelector(targetSelector) as HTMLElement;
    }

    if (el) {
      const rect = el.getBoundingClientRect();
      const isVisible =
        rect.width > 0 &&
        rect.height > 0 &&
        rect.top + rect.height > 0 &&
        rect.left + rect.width > 0 &&
        window.getComputedStyle(el).display !== "none" &&
        window.getComputedStyle(el).visibility !== "hidden";

      if (isVisible) {
        // Check coordinate stability across animation frames
        if (lastRect && Math.abs(rect.left - lastRect.left) < 1.5 && Math.abs(rect.top - lastRect.top) < 1.5) {
          stableCount++;
          if (stableCount >= 2) {
            return {
              el,
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2,
            };
          }
        } else {
          stableCount = 0;
        }
        lastRect = rect;
      }
    }
    await new Promise((r) => setTimeout(r, 60));
  }

  // Fallback if still rendering
  let fallbackEl: HTMLElement | null = null;
  if (targetId) fallbackEl = document.getElementById(targetId);
  else if (targetSelector) fallbackEl = document.querySelector(targetSelector) as HTMLElement;

  if (fallbackEl) {
    const rect = fallbackEl.getBoundingClientRect();
    if (rect.width > 0) {
      return {
        el: fallbackEl,
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    }
  }
  return null;
}

export interface CursorState {
  x: number;
  y: number;
  isClicking: boolean;
  label: string;
  isVisible: boolean;
  rippleTrigger: number;
}

class GhostCursorEngine {
  private listener: ((state: CursorState) => void) | null = null;
  private isRunning = false;
  private currentCoords: Point = { x: 0, y: 0 };
  private activeRafId: number | null = null;

  public register(listener: (state: CursorState) => void) {
    this.listener = listener;
  }

  public unregister() {
    this.listener = null;
    if (this.activeRafId) {
      cancelAnimationFrame(this.activeRafId);
      this.activeRafId = null;
    }
  }

  public getCurrentCoords(): Point {
    return this.currentCoords;
  }

  /**
   * Biomechanical Trajectory Interpolation:
   * Moves the cursor from P0 to P3 along an unpredictable, organic curved Bézier path
   * with minimum-jerk acceleration/deceleration, physiological micro-jitter, and overshoot correction.
   */
  private moveBiomechanical(
    start: Point,
    getTargetPoint: () => Point,
    durationMs: number,
    label: string
  ): Promise<void> {
    return new Promise((resolve) => {
      const startTime = performance.now();
      const initialTarget = getTargetPoint();

      const dx = initialTarget.x - start.x;
      const dy = initialTarget.y - start.y;
      const dist = Math.hypot(dx, dy);

      // Stochastic lateral curvature perpendicular to motion vector (simulating human forearm pivot)
      const nx = dist > 0 ? -dy / dist : 0;
      const ny = dist > 0 ? dx / dist : 0;

      // Randomize curve direction and amplitude organically
      const curveDir = Math.random() > 0.5 ? 1 : -1;
      const arcIntensity = Math.min(130, Math.max(35, dist * 0.24));
      const p1Offset = curveDir * arcIntensity * (0.8 + Math.random() * 0.4);
      const p2Offset = curveDir * arcIntensity * (0.4 + Math.random() * 0.3);

      // Overshoot waypoint along movement vector
      const overshootDistance = Math.min(8, Math.max(3, dist * 0.018));
      const ux = dist > 0 ? dx / dist : 0;
      const uy = dist > 0 ? dy / dist : 0;

      // Biological tremor frequencies (8-11 Hz)
      const tremorFreq = 0.009 + Math.random() * 0.004;

      const step = (now: number) => {
        const elapsed = now - startTime;
        const rawProgress = Math.min(1, elapsed / durationMs);

        // Dynamically track target element in real-time if layout shifted
        const liveTarget = getTargetPoint();
        const liveDx = liveTarget.x - start.x;
        const liveDy = liveTarget.y - start.y;
        const liveDist = Math.hypot(liveDx, liveDy);
        const liveUx = liveDist > 0 ? liveDx / liveDist : 0;
        const liveUy = liveDist > 0 ? liveDy / liveDist : 0;

        const p0 = start;
        const p1: Point = {
          x: start.x + liveDx * 0.28 + nx * p1Offset,
          y: start.y + liveDy * 0.28 + ny * p1Offset,
        };
        const p2: Point = {
          x: start.x + liveDx * 0.72 + nx * p2Offset,
          y: start.y + liveDy * 0.72 + ny * p2Offset,
        };
        const pOvershoot: Point = {
          x: liveTarget.x + liveUx * overshootDistance,
          y: liveTarget.y + liveUy * overshootDistance,
        };

        let currentPos: Point;

        // Phase 1 (0 -> 0.86): Ballistic Bézier travel to overshoot point with minimum-jerk easing
        if (rawProgress < 0.86) {
          const tSub = rawProgress / 0.86;
          const s = minimumJerk(tSub);
          currentPos = cubicBezier(p0, p1, p2, pOvershoot, s);
        } else {
          // Phase 2 (0.86 -> 1.0): Corrective micro-submovement snapping into exact target center
          const tSub = (rawProgress - 0.86) / 0.14;
          // Cubic ease-out
          const easeOut = 1 - Math.pow(1 - tSub, 3);
          currentPos = {
            x: pOvershoot.x + (liveTarget.x - pOvershoot.x) * easeOut,
            y: pOvershoot.y + (liveTarget.y - pOvershoot.y) * easeOut,
          };
        }

        // Biological hand tremor / micro-jitter (1-1.5px perpendicular vibration)
        if (rawProgress < 0.96) {
          const jitterAmp = Math.sin(rawProgress * Math.PI) * 1.2;
          const jitter = Math.sin(now * tremorFreq) * jitterAmp;
          currentPos.x += nx * jitter;
          currentPos.y += ny * jitter;
        }

        this.currentCoords = currentPos;

        if (this.listener) {
          this.listener({
            x: currentPos.x,
            y: currentPos.y,
            isClicking: false,
            label,
            isVisible: true,
            rippleTrigger: 0,
          });
        }

        if (rawProgress < 1) {
          this.activeRafId = requestAnimationFrame(step);
        } else {
          this.activeRafId = null;
          resolve();
        }
      };

      this.activeRafId = requestAnimationFrame(step);
    });
  }

  public async runSequence(steps: CursorStep[]) {
    if (this.isRunning || !this.listener) return;
    this.isRunning = true;

    try {
      // 1. Initial Spawn: Position mouse visibly near center-right (near Q-AI trigger zone)
      const spawnX = Math.min(window.innerWidth - 160, Math.max(120, window.innerWidth * 0.72));
      const spawnY = Math.min(window.innerHeight - 180, Math.max(120, window.innerHeight * 0.46));
      this.currentCoords = { x: spawnX, y: spawnY };

      this.listener({
        x: spawnX,
        y: spawnY,
        isClicking: false,
        label: "Q-AI Autonomous Controller",
        isVisible: true,
        rippleTrigger: 0,
      });

      // Majestic initial entrance pause so the user notices the glowing blue cursor
      await new Promise((r) => setTimeout(r, 380));

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const delay = step.delayBefore ?? 200;
        if (delay > 0) {
          await new Promise((r) => setTimeout(r, delay));
        }

        // Wait for target element to be mounted, visible, and settled in DOM
        let targetEl: HTMLElement | null = null;
        let getTargetPoint = (): Point => ({
          x: step.customX ?? this.currentCoords.x,
          y: step.customY ?? this.currentCoords.y,
        });

        if (step.targetId || step.targetSelector) {
          const res = await waitForVisibleElement(step.targetId, step.targetSelector, 3000);
          if (res) {
            targetEl = res.el;
            // Scroll target into view gently if outside viewport
            const rect = targetEl.getBoundingClientRect();
            if (rect.top < 60 || rect.bottom > window.innerHeight - 60) {
              targetEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
              await new Promise((r) => setTimeout(r, 220));
            }
            // Dynamic closure to always query live coordinates even if screen resizes/animates
            getTargetPoint = () => {
              if (targetEl && targetEl.isConnected) {
                const r = targetEl.getBoundingClientRect();
                return {
                  x: r.left + r.width / 2,
                  y: r.top + r.height / 2,
                };
              }
              return { x: res.x, y: res.y };
            };
          }
        }

        const startPt = { ...this.currentCoords };
        const endPt = getTargetPoint();
        const travelDist = Math.hypot(endPt.x - startPt.x, endPt.y - startPt.y);

        // Deliberate, majestic cinematic duration (750ms - 1100ms)
        // Scaled to let the user visually witness the human curved motion
        const moveDuration =
          step.duration ??
          Math.max(750, Math.min(1100, Math.round(520 + Math.sqrt(travelDist) * 26)));

        // 2. Glide cursor along unpredictable human Bézier curve
        await this.moveBiomechanical(
          startPt,
          getTargetPoint,
          moveDuration,
          step.actionName || "Navigating..."
        );

        // 3. Cognitive Hover Pause: Real humans pause for 200-260ms to visually acquire the button
        const finalPt = getTargetPoint();
        this.currentCoords = finalPt;
        if (targetEl) {
          targetEl.classList.add(
            "ring-2",
            "ring-cyan-400",
            "ring-offset-2",
            "ring-offset-slate-950",
            "scale-[0.98]"
          );
        }
        await new Promise((r) => setTimeout(r, 240));

        // 4. Physical Mouse Click Press (downwards haptic depression with glowing shockwave)
        const clickKey = Date.now();
        if (this.listener) {
          this.listener({
            x: finalPt.x,
            y: finalPt.y,
            isClicking: true,
            label: step.actionName ? `${step.actionName} (Click)` : "Clicking",
            isVisible: true,
            rippleTrigger: clickKey,
          });
        }

        await new Promise((r) => setTimeout(r, 220));

        // 5. Execute Action Callback OR DOM click
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
        if (targetEl) {
          setTimeout(() => {
            targetEl?.classList.remove(
              "ring-2",
              "ring-cyan-400",
              "ring-offset-2",
              "ring-offset-slate-950",
              "scale-[0.98]"
            );
          }, 320);
        }

        if (this.listener) {
          this.listener({
            x: finalPt.x,
            y: finalPt.y,
            isClicking: false,
            label: step.actionName || "",
            isVisible: true,
            rippleTrigger: 0,
          });
        }

        // Settle pause before next step
        await new Promise((r) => setTimeout(r, 260));
      }

      // Linger at final position so the result of the click is fully seen by the user
      await new Promise((r) => setTimeout(r, 500));
    } finally {
      // 7. Completed -> Fade out smoothly and unregister
      if (this.listener) {
        this.listener({
          x: this.currentCoords.x,
          y: this.currentCoords.y,
          isClicking: false,
          label: "",
          isVisible: false,
          rippleTrigger: 0,
        });
      }
      await new Promise((r) => setTimeout(r, 400));
      this.isRunning = false;
    }
  }
}

export const ghostCursorEngine = new GhostCursorEngine();
if (typeof window !== "undefined") {
  (window as any).__ghostCursorEngine = ghostCursorEngine;
}

export default function GhostCursor() {
  const [cursorState, setCursorState] = useState<CursorState | null>(null);
  const [trail, setTrail] = useState<Point[]>([]);
  const trailRef = useRef<Point[]>([]);

  useEffect(() => {
    ghostCursorEngine.register((state) => {
      setCursorState(state);

      if (state.isVisible) {
        // Maintain smooth 4-point trailing wake
        const updated = [{ x: state.x, y: state.y }, ...trailRef.current.slice(0, 4)];
        trailRef.current = updated;
        setTrail(updated);
      } else {
        trailRef.current = [];
        setTrail([]);
      }
    });

    return () => ghostCursorEngine.unregister();
  }, []);

  if (!cursorState || !cursorState.isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[2147483647] overflow-hidden select-none">
      {/* Light Wake Trail Behind Cursor */}
      {trail.map((pt, idx) => {
        if (idx === 0) return null;
        const opacity = (1 - idx / trail.length) * 0.45;
        const scale = (1 - idx / trail.length) * 0.75;
        return (
          <div
            key={idx}
            className="absolute rounded-full bg-cyan-400 blur-[1px] transition-transform duration-75 pointer-events-none"
            style={{
              left: pt.x - 4,
              top: pt.y - 4,
              width: 8,
              height: 8,
              opacity,
              transform: `scale(${scale})`,
              boxShadow: "0 0 8px rgba(6, 182, 212, 0.7)",
            }}
          />
        );
      })}

      {/* Sonic Click Ripple Shockwave */}
      {cursorState.rippleTrigger > 0 && (
        <div
          key={cursorState.rippleTrigger}
          className="absolute pointer-events-none rounded-full border-2 border-cyan-300 animate-ping"
          style={{
            left: cursorState.x - 24,
            top: cursorState.y - 24,
            width: 48,
            height: 48,
            boxShadow: "0 0 25px rgba(34, 211, 238, 0.95), inset 0 0 15px rgba(6, 182, 212, 0.8)",
            animationDuration: "550ms",
          }}
        />
      )}

      {/* Cybernetic High-Definition Blue Cursor Arrow (Completely transparent background, zero square artifacts) */}
      <div
        className="absolute transition-transform ease-out will-change-transform pointer-events-none"
        style={{
          left: cursorState.x,
          top: cursorState.y,
          transform: cursorState.isClicking
            ? "scale(0.86) translate(3px, 4px)"
            : "scale(1)",
          transformOrigin: "2px 2px",
          transitionDuration: "120ms",
        }}
      >
        <div className="relative pointer-events-none">
          <svg
            width="32"
            height="36"
            viewBox="0 0 28 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="overflow-visible pointer-events-none"
            style={{
              overflow: "visible",
              filter:
                "drop-shadow(0px 2px 8px rgba(0, 0, 0, 0.85)) drop-shadow(0px 0px 8px rgba(6, 182, 212, 0.9))",
            }}
          >
            {/* Outer Cybernetic Cyan Border with Gradient */}
            <defs>
              <linearGradient id="cursorGrad" x1="2" y1="2" x2="26" y2="28" gradientUnits="userSpaceOnUse">
                <stop stopColor="#38bdf8" />
                <stop offset="0.55" stopColor="#06b6d4" />
                <stop offset="1" stopColor="#0284c7" />
              </linearGradient>
              <linearGradient id="innerGrad" x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ffffff" />
                <stop offset="0.4" stopColor="#e0f2fe" />
                <stop offset="1" stopColor="#38bdf8" />
              </linearGradient>
            </defs>

            {/* Outer Armor Hull */}
            <path
              d="M2 2L11.8 29.5L16.4 18.5L26.5 14L2 2Z"
              fill="#020617"
              stroke="url(#cursorGrad)"
              strokeWidth="2.6"
              strokeLinejoin="round"
            />

            {/* Radiant Solid Inner Pointer Body */}
            <path
              d="M4.6 4.8L12.2 25.2L15.6 16.6L24 12.8L4.6 4.8Z"
              fill="url(#innerGrad)"
            />

            {/* Precision Hotspot Pointer Tip */}
            <circle cx="2.5" cy="2.5" r="1.6" fill="#38bdf8" />
            <circle cx="2.5" cy="2.5" r="0.9" fill="#ffffff" />
          </svg>
        </div>

        {/* Floating High-Tech Action Label Pill */}
        {cursorState.label && (
          <div className="absolute left-8 top-1.5 flex items-center gap-2 whitespace-nowrap rounded-full border border-cyan-400/80 bg-slate-950/90 px-3.5 py-1 text-[11px] font-bold text-cyan-200 shadow-[0_0_25px_rgba(6,182,212,0.55)] backdrop-blur-2xl animate-in fade-in zoom-in-95">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-300" />
            </span>
            <span className="font-mono text-cyan-300 font-extrabold tracking-wide">Q-AI</span>
            <span className="border-l border-cyan-500/40 pl-2 font-medium text-slate-100">
              {cursorState.label}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
