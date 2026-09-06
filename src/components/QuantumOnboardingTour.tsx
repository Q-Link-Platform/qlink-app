"use client";

import React, { useState, useEffect, useLayoutEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";

export interface TourStep {
  id: number;
  selector: string;
  category: string;
  title: string;
  description: string;
  preferredPlacement?: "bottom" | "top" | "left" | "right" | "auto";
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 0,
    selector: '[data-tour="quantum-id"]',
    category: "Quantum Identity",
    title: "This is your Quantum ID",
    description:
      "Your decentralized digital handle on Q-Link. Share this handle with people you trust so they can find you and initiate a private, encrypted communication channel.",
    preferredPlacement: "bottom",
  },
  {
    id: 1,
    selector: '[data-tour="edit-id"]',
    category: "Personalization",
    title: "Refine your Quantum ID",
    description:
      "Tap the Edit button to modify your Quantum ID anytime. Choose a unique, memorable handle that complies with network namespace rules so peers can reliably reach you.",
    preferredPlacement: "bottom",
  },
  {
    id: 2,
    selector: '[data-tour="connect"]',
    category: "Peer Discovery",
    title: "Connect to a friend",
    description:
      "Search any friend's Quantum ID directly, specify how you know them, and send an encrypted connection invitation with an optional personal note.",
    preferredPlacement: "top",
  },
  {
    id: 3,
    selector: '[data-tour="requests"]',
    category: "Access Control",
    title: "Incoming & outgoing requests",
    description:
      "Track and manage all peer requests here. Review incoming invitations, accept trusted connections, dismiss requests, or jump directly into live chat.",
    preferredPlacement: "top",
  },
  {
    id: 4,
    selector: '[data-tour="chat-panel"]',
    category: "Encrypted Messaging",
    title: "Your secure chat panel",
    description:
      "Once a peer request is accepted, this panel becomes your real-time private tunnel. Send end-to-end encrypted messages, voice notes, and media seamlessly.",
    preferredPlacement: "left",
  },
  {
    id: 5,
    selector: '[data-tour="full-chat"]',
    category: "Focus View",
    title: "Go full-screen when you need focus",
    description:
      "Click the Full Chat button to expand your conversation edge-to-edge and minimize the side console—ideal for prolonged, distraction-free messaging.",
    preferredPlacement: "bottom",
  },
  {
    id: 6,
    selector: '[data-tour="console-btn"]',
    category: "Global Network",
    title: "Quantum Link Console",
    description:
      "Explore the Quantum Link Console—your window into community presence, active profiles, public updates, and network discovery.",
    preferredPlacement: "bottom",
  },
  {
    id: 7,
    selector: '[data-tour="settings-btn"]',
    category: "Security & Control",
    title: "Settings & identity controls",
    description:
      "Manage your privacy toggles, bio, profile photo, Aura rank progression, and account credentials from the centralized Settings panel.",
    preferredPlacement: "bottom",
  },
];

interface QuantumOnboardingTourProps {
  isOpen: boolean;
  step: number;
  onStepChange: (newStep: number) => void;
  onClose: () => void;
}

interface TargetRect {
  x: number;
  y: number;
  width: number;
  height: number;
  top: number;
  left: number;
  right: number;
  bottom: number;
}

export default function QuantumOnboardingTour({
  isOpen,
  step,
  onStepChange,
  onClose,
}: QuantumOnboardingTourProps) {
  const [mounted, setMounted] = useState(false);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [cardPlacement, setCardPlacement] = useState<"bottom" | "top" | "left" | "right">("bottom");
  const [cardPos, setCardPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const cardRef = useRef<HTMLDivElement | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentStep = TOUR_STEPS[step] || TOUR_STEPS[0];
  const totalSteps = TOUR_STEPS.length;
  const isFirstStep = step === 0;
  const isLastStep = step === totalSteps - 1;

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Measure and update the spotlight target rectangle
  const measureTarget = useCallback(() => {
    if (!isOpen) return;

    const el = document.querySelector(currentStep.selector);
    if (!el) {
      setTargetRect(null);
      return;
    }

    const rect = el.getBoundingClientRect();
    setTargetRect({
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      top: rect.top,
      left: rect.left,
      right: rect.right,
      bottom: rect.bottom,
    });
  }, [isOpen, currentStep.selector]);

  // Auto-scroll the target element smoothly into viewport if offscreen or partially clipped
  const scrollTargetIntoView = useCallback(() => {
    if (!isOpen) return;

    const el = document.querySelector(currentStep.selector);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const margin = 100;
    const isOutOfVerticalView =
      rect.top < margin || rect.bottom > window.innerHeight - margin;
    const isOutOfHorizontalView =
      rect.left < 20 || rect.right > window.innerWidth - 20;

    if (isOutOfVerticalView || isOutOfHorizontalView) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }

    // Measure immediately, then remeasure when smooth scroll settles
    measureTarget();
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      measureTarget();
    }, 350);
  }, [isOpen, currentStep.selector, measureTarget]);

  // When step changes, initiate auto-scroll and remeasure
  useEffect(() => {
    if (isOpen) {
      scrollTargetIntoView();
    }
  }, [isOpen, step, scrollTargetIntoView]);

  // Handle window resize and scroll events to keep spotlight attached
  useEffect(() => {
    if (!isOpen) return;

    const handleUpdate = () => {
      measureTarget();
    };

    window.addEventListener("resize", handleUpdate);
    window.addEventListener("scroll", handleUpdate, { passive: true });

    return () => {
      window.removeEventListener("resize", handleUpdate);
      window.removeEventListener("scroll", handleUpdate);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [isOpen, measureTarget]);

  // Calculate smart tooltip card positioning relative to the spotlighted element
  useLayoutEffect(() => {
    if (!isOpen) return;

    const card = cardRef.current;
    const cardW = card ? card.offsetWidth : 360;
    const cardH = card ? card.offsetHeight : 220;
    const padding = 16;
    const offset = 18;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const isMobile = vw < 640;

    if (!targetRect) {
      // Graceful fallback to viewport center
      setCardPos({
        top: Math.max(padding, (vh - cardH) / 2),
        left: Math.max(padding, (vw - cardW) / 2),
      });
      setCardPlacement("bottom");
      return;
    }

    const { top, bottom, left, right, width, height } = targetRect;
    const targetCenterX = left + width / 2;
    const targetCenterY = top + height / 2;

    if (isMobile) {
      // Mobile screen: Anchor either below or above with safe horizontal margins
      const spaceBelow = vh - (bottom + offset);
      const spaceAbove = top - offset;

      let topPos: number;
      let placement: "bottom" | "top";

      if (spaceBelow >= cardH + padding) {
        topPos = bottom + offset;
        placement = "bottom";
      } else if (spaceAbove >= cardH + padding) {
        topPos = Math.max(padding, top - offset - cardH);
        placement = "top";
      } else {
        // Safe dock to screen bottom
        topPos = Math.max(padding, vh - cardH - padding);
        placement = "bottom";
      }

      const leftPos = Math.max(padding, (vw - cardW) / 2);
      setCardPos({ top: topPos, left: leftPos });
      setCardPlacement(placement);
      return;
    }

    // Desktop: Smart 4-way positioning with preference
    const preferred = currentStep.preferredPlacement || "bottom";
    let chosenPlacement: "bottom" | "top" | "left" | "right" = "bottom";
    let calculatedTop = 0;
    let calculatedLeft = 0;

    const fitsBottom = vh - (bottom + offset) >= cardH + padding;
    const fitsTop = top - offset >= cardH + padding;
    const fitsLeft = left - offset >= cardW + padding;
    const fitsRight = vw - (right + offset) >= cardW + padding;

    if (preferred === "bottom" && fitsBottom) {
      chosenPlacement = "bottom";
    } else if (preferred === "top" && fitsTop) {
      chosenPlacement = "top";
    } else if (preferred === "left" && fitsLeft) {
      chosenPlacement = "left";
    } else if (preferred === "right" && fitsRight) {
      chosenPlacement = "right";
    } else if (fitsBottom) {
      chosenPlacement = "bottom";
    } else if (fitsTop) {
      chosenPlacement = "top";
    } else if (fitsRight) {
      chosenPlacement = "right";
    } else if (fitsLeft) {
      chosenPlacement = "left";
    }

    if (chosenPlacement === "bottom") {
      calculatedTop = bottom + offset;
      calculatedLeft = targetCenterX - cardW / 2;
    } else if (chosenPlacement === "top") {
      calculatedTop = top - offset - cardH;
      calculatedLeft = targetCenterX - cardW / 2;
    } else if (chosenPlacement === "left") {
      calculatedLeft = left - offset - cardW;
      calculatedTop = targetCenterY - cardH / 2;
    } else if (chosenPlacement === "right") {
      calculatedLeft = right + offset;
      calculatedTop = targetCenterY - cardH / 2;
    }

    // Boundary constraints
    calculatedLeft = Math.max(padding, Math.min(vw - cardW - padding, calculatedLeft));
    calculatedTop = Math.max(padding, Math.min(vh - cardH - padding, calculatedTop));

    setCardPlacement(chosenPlacement);
    setCardPos({ top: calculatedTop, left: calculatedLeft });
  }, [isOpen, targetRect, currentStep.preferredPlacement, step]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Enter") {
        e.preventDefault();
        if (isLastStep) {
          onClose();
        } else {
          onStepChange(step + 1);
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (!isFirstStep) {
          onStepChange(step - 1);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, step, isFirstStep, isLastStep, onStepChange, onClose]);

  if (!mounted || !isOpen) return null;

  // Spotlight dimensions with generous padding
  const paddingX = 10;
  const paddingY = 8;
  const cutoutX = targetRect ? Math.max(0, targetRect.left - paddingX) : -9999;
  const cutoutY = targetRect ? Math.max(0, targetRect.top - paddingY) : -9999;
  const cutoutW = targetRect ? targetRect.width + paddingX * 2 : 0;
  const cutoutH = targetRect ? targetRect.height + paddingY * 2 : 0;
  const cutoutRx = 16;

  const progressPercent = Math.round(((step + 1) / totalSteps) * 100);

  const modalContent = (
    <div className="fixed inset-0 z-[99990] overflow-hidden select-none pointer-events-auto">
      {/* SVG Mask with True Backdrop Blur */}
      <svg
        className="fixed inset-0 h-full w-full pointer-events-none transition-all duration-300 ease-out"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <mask id="qlink-onboarding-mask">
            {/* White covers entire screen */}
            <rect x="0" y="0" width="100%" height="100%" fill="#ffffff" />
            {/* Black cuts out the spotlight area */}
            {targetRect && (
              <rect
                x={cutoutX}
                y={cutoutY}
                width={cutoutW}
                height={cutoutH}
                rx={cutoutRx}
                ry={cutoutRx}
                fill="#000000"
                className="transition-all duration-300 ease-out"
              />
            )}
          </mask>
        </defs>

        {/* Backdrop overlay cut through by mask */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(2, 6, 23, 0.78)"
          mask="url(#qlink-onboarding-mask)"
          style={{
            backdropFilter: "blur(7px)",
            WebkitBackdropFilter: "blur(7px)",
          }}
        />
      </svg>

      {/* High-Tech Glowing Rim Around Target Element */}
      {targetRect && (
        <div
          className="fixed pointer-events-none z-[99992] transition-all duration-300 ease-out rounded-2xl"
          style={{
            top: cutoutY,
            left: cutoutX,
            width: cutoutW,
            height: cutoutH,
            borderRadius: cutoutRx,
          }}
        >
          {/* Neon border with breathing quantum pulse */}
          <div className="absolute inset-0 rounded-2xl border-2 border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.7),inset_0_0_12px_rgba(34,211,238,0.35)] animate-pulse" />

          {/* Expanding Radar Wave */}
          <div className="absolute -inset-2 rounded-2xl border border-cyan-300/40 animate-ping opacity-60 pointer-events-none" />

          {/* Optical Corner Target Brackets */}
          <span className="absolute -top-1.5 -left-1.5 h-3.5 w-3.5 border-t-2 border-l-2 border-cyan-300 rounded-tl shadow-[0_0_8px_#22d3ee]" />
          <span className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 border-t-2 border-r-2 border-cyan-300 rounded-tr shadow-[0_0_8px_#22d3ee]" />
          <span className="absolute -bottom-1.5 -left-1.5 h-3.5 w-3.5 border-b-2 border-l-2 border-cyan-300 rounded-bl shadow-[0_0_8px_#22d3ee]" />
          <span className="absolute -bottom-1.5 -right-1.5 h-3.5 w-3.5 border-b-2 border-r-2 border-cyan-300 rounded-br shadow-[0_0_8px_#22d3ee]" />
        </div>
      )}

      {/* Interactive Quiet Luxury Popover Card */}
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-label={currentStep.title}
        className="fixed z-[99995] w-[90vw] sm:w-[380px] max-w-[420px] transition-all duration-300 ease-out"
        style={{
          top: cardPos.top,
          left: cardPos.left,
        }}
      >
        {/* Animated Hand / Optical Arrow Pointer */}
        {targetRect && (
          <div
            className={`pointer-events-none absolute flex items-center justify-center transition-all duration-300 ${
              cardPlacement === "bottom"
                ? "-top-8 left-1/2 -translate-x-1/2 animate-bounce-subtle-y"
                : cardPlacement === "top"
                ? "-bottom-8 left-1/2 -translate-x-1/2 animate-bounce-subtle-y-reverse"
                : cardPlacement === "left"
                ? "-right-8 top-1/2 -translate-y-1/2 animate-bounce-subtle-x-reverse"
                : "-left-8 top-1/2 -translate-y-1/2 animate-bounce-subtle-x"
            }`}
          >
            {/* Tech-Giant Optical Pointer Badge with Glowing Hand / Arrow Icon */}
            <div className="relative flex items-center gap-1.5 rounded-full border border-cyan-400/80 bg-slate-950/95 px-2.5 py-1 shadow-[0_0_20px_rgba(34,211,238,0.7)] backdrop-blur-md">
              {cardPlacement === "bottom" && (
                <>
                  <span className="text-sm">👆</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">Focus</span>
                </>
              )}
              {cardPlacement === "top" && (
                <>
                  <span className="text-sm">👇</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">Focus</span>
                </>
              )}
              {cardPlacement === "left" && (
                <>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">Focus</span>
                  <span className="text-sm">👉</span>
                </>
              )}
              {cardPlacement === "right" && (
                <>
                  <span className="text-sm">👈</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">Focus</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Card Body - Obsidian Glassmorphism */}
        <div className="relative overflow-hidden rounded-2xl border border-cyan-500/35 bg-slate-950/95 p-5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.85),0_0_25px_rgba(34,211,238,0.25)] backdrop-blur-2xl">
          {/* Subtle top accent gradient line */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

          {/* Progress Bar */}
          <div className="absolute inset-x-0 top-[2px] h-[2px] bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Card Header: Category & Step Pill & Close Button */}
          <div className="flex items-center justify-between gap-2 pt-1 pb-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-300">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                {currentStep.category}
              </span>
              <span className="text-[11px] font-medium text-slate-400 font-mono">
                {step + 1} / {totalSteps}
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-800/80 hover:text-white transition-colors"
              title="Skip guide"
              aria-label="Skip guide"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Title & Description */}
          <div className="mt-2 space-y-1.5">
            <h4 className="text-sm sm:text-[15px] font-semibold text-slate-100 tracking-tight flex items-center gap-1.5">
              {currentStep.title}
            </h4>
            <p className="text-xs text-slate-300/90 leading-relaxed">
              {currentStep.description}
            </p>
          </div>

          {/* Controls Footer */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="text-[11px] font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              Skip guide
            </button>

            <div className="flex items-center gap-2">
              {!isFirstStep && (
                <button
                  type="button"
                  onClick={() => onStepChange(step - 1)}
                  className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-slate-600 hover:bg-slate-800 transition-all"
                >
                  Back
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  if (isLastStep) {
                    onClose();
                  } else {
                    onStepChange(step + 1);
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-sky-500 px-4 py-1.5 text-xs font-bold text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.45)] hover:from-cyan-300 hover:to-sky-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.6)] active:scale-95 transition-all"
              >
                <span>{isLastStep ? "Got it" : "Next"}</span>
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
