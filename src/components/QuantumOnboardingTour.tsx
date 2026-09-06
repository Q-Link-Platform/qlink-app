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
    category: "Username",
    title: "This is your Quantum ID",
    description:
      "This is your unique username (like your @handle on X or Instagram). Share it with friends so they can find you and start a direct conversation.",
    preferredPlacement: "bottom",
  },
  {
    id: 1,
    selector: '[data-tour="edit-id"]',
    category: "Edit Profile",
    title: "Change your username",
    description:
      "Tap Edit whenever you want to customize your handle to make it memorable and easy for friends to search.",
    preferredPlacement: "bottom",
  },
  {
    id: 2,
    selector: '[data-tour="connect"]',
    category: "Add Friends",
    title: "Find and add friends",
    description:
      "Search for any friend by their username here, choose how you know them, and send them a friend request with a quick note.",
    preferredPlacement: "top",
  },
  {
    id: 3,
    selector: '[data-tour="requests"]',
    category: "Friend Requests",
    title: "Manage incoming requests",
    description:
      "All friend requests you receive and send appear here. Tap Accept on any request to connect and start chatting.",
    preferredPlacement: "top",
  },
  {
    id: 4,
    selector: '[data-tour="chat-panel"]',
    category: "Direct Messages",
    title: "Private chat room",
    description:
      "This is your direct messaging area (like WhatsApp or Instagram DMs). Send live text messages, audio voice notes, photos, and videos securely.",
    preferredPlacement: "left",
  },
  {
    id: 5,
    selector: '[data-tour="full-chat"]',
    category: "Full Screen",
    title: "Full-screen chat view",
    description:
      "Click Full Chat to expand your chat edge-to-edge and hide the side menu when you want to focus completely on messaging.",
    preferredPlacement: "bottom",
  },
  {
    id: 6,
    selector: '[data-tour="console-btn"]',
    category: "Feed & Profile",
    title: "Quantum Link Console",
    description:
      "This is like your Feed and Profile in apps like X (Twitter) or Instagram. See your posts, check out updates from the community, and share media.",
    preferredPlacement: "bottom",
  },
  {
    id: 7,
    selector: '[data-tour="settings-btn"]',
    category: "Settings",
    title: "Account & privacy settings",
    description:
      "Change your profile picture, edit your bio, adjust privacy settings, and choose what information other users can see.",
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
  const [cardPlacement, setCardPlacement] = useState<"bottom" | "top">("bottom");
  const [cardTop, setCardTop] = useState<number>(100);
  const [cardLeft, setCardLeft] = useState<number>(16);
  const [isMobileScreen, setIsMobileScreen] = useState(false);
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

  // Lock horizontal scroll completely while guide is active to avoid any weird scrollbars or horizontal shifts
  useEffect(() => {
    if (!isOpen) return;
    if (typeof document !== "undefined") {
      document.documentElement.style.overflowX = "hidden";
      document.body.style.overflowX = "hidden";
      window.scrollTo({ left: 0 });
    }
    return () => {
      if (typeof document !== "undefined") {
        document.documentElement.style.overflowX = "";
        document.body.style.overflowX = "";
      }
    };
  }, [isOpen]);

  // Measure and update the spotlight target rectangle
  const measureTarget = useCallback(() => {
    if (!isOpen) return;

    // Force zero horizontal scroll
    if (typeof window !== "undefined" && window.scrollX !== 0) {
      window.scrollTo({ left: 0 });
    }

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

  // Auto-scroll target element vertically ONLY (never horizontal!)
  const scrollTargetIntoView = useCallback(() => {
    if (!isOpen) return;

    const el = document.querySelector(currentStep.selector);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const margin = 80;
    const isOutOfVerticalView =
      rect.top < margin || rect.bottom > window.innerHeight - margin;

    if (isOutOfVerticalView) {
      // ONLY scroll vertical axis with inline: "nearest" so horizontal offset stays 0
      el.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    }

    // Force zero horizontal scroll on window & document
    if (typeof window !== "undefined") {
      window.scrollTo({ left: 0 });
      document.documentElement.scrollLeft = 0;
      document.body.scrollLeft = 0;
    }

    measureTarget();
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      measureTarget();
      if (typeof window !== "undefined") window.scrollTo({ left: 0 });
    }, 280);
  }, [isOpen, currentStep.selector, measureTarget]);

  // When step changes, initiate auto-scroll and remeasure
  useEffect(() => {
    if (isOpen) {
      scrollTargetIntoView();
    }
  }, [isOpen, step, scrollTargetIntoView]);

  // Handle window resize and scroll events
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

  // Bulletproof Card Positioning: Safe Clamping on Desktop and Mobile
  useLayoutEffect(() => {
    if (!isOpen) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const isMobile = vw < 640;
    setIsMobileScreen(isMobile);

    const card = cardRef.current;
    const cardW = isMobile ? Math.min(vw - 32, 340) : (card?.offsetWidth || 340);
    const cardH = card?.offsetHeight || 190;
    const padding = 16;
    const offset = 16;

    if (!targetRect) {
      // Fallback: viewport center
      setCardTop(Math.max(padding, (vh - cardH) / 2));
      setCardLeft(Math.max(padding, (vw - cardW) / 2));
      setCardPlacement("bottom");
      return;
    }

    const { top, bottom, left, width } = targetRect;
    const targetCenterX = left + width / 2;

    // Check space below vs space above
    const spaceBelow = vh - (bottom + offset);
    const spaceAbove = top - offset;

    let placement: "bottom" | "top" = "bottom";
    let calculatedTop = 0;

    if (spaceBelow >= cardH + padding) {
      placement = "bottom";
      calculatedTop = bottom + offset;
    } else if (spaceAbove >= cardH + padding) {
      placement = "top";
      calculatedTop = top - offset - cardH;
    } else {
      // Choose whichever side has more room
      if (spaceBelow >= spaceAbove) {
        placement = "bottom";
        calculatedTop = Math.min(vh - cardH - padding, bottom + offset);
      } else {
        placement = "top";
        calculatedTop = Math.max(padding, top - offset - cardH);
      }
    }

    // Horizontal clamping: MUST stay within [16px, vw - cardW - 16px]
    let calculatedLeft = targetCenterX - cardW / 2;
    calculatedLeft = Math.max(padding, Math.min(vw - cardW - padding, calculatedLeft));
    calculatedTop = Math.max(padding, Math.min(vh - cardH - padding, calculatedTop));

    setCardPlacement(placement);
    setCardTop(calculatedTop);
    setCardLeft(calculatedLeft);
  }, [isOpen, targetRect, step]);

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

  // Spotlight dimensions with comfortable margins
  const paddingX = 8;
  const paddingY = 6;
  const cutoutX = targetRect ? Math.max(4, targetRect.left - paddingX) : -9999;
  const cutoutY = targetRect ? Math.max(4, targetRect.top - paddingY) : -9999;
  const cutoutW = targetRect ? Math.max(20, targetRect.width + paddingX * 2) : 0;
  const cutoutH = targetRect ? Math.max(20, targetRect.height + paddingY * 2) : 0;
  const cutoutRx = 14;

  const progressPercent = Math.round(((step + 1) / totalSteps) * 100);

  const modalContent = (
    <div
      className="fixed inset-0 z-[99990] overflow-hidden select-none pointer-events-none"
      style={{ overflow: "hidden" }}
    >
      {/* SVG Mask with True Backdrop Blur */}
      <svg
        className="fixed inset-0 h-full w-full pointer-events-none transition-all duration-300 ease-out"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: "hidden" }}
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
          {/* Neon border with breathing pulse */}
          <div className="absolute inset-0 rounded-2xl border-2 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.8),inset_0_0_10px_rgba(34,211,238,0.3)] animate-pulse" />

          {/* Expanding Radar Ping */}
          <div className="absolute -inset-2 rounded-2xl border border-cyan-300/35 animate-ping opacity-60 pointer-events-none" />

          {/* Corner optical brackets */}
          <span className="absolute -top-1.5 -left-1.5 h-3 w-3 border-t-2 border-l-2 border-cyan-300 rounded-tl shadow-[0_0_6px_#22d3ee]" />
          <span className="absolute -top-1.5 -right-1.5 h-3 w-3 border-t-2 border-r-2 border-cyan-300 rounded-tr shadow-[0_0_6px_#22d3ee]" />
          <span className="absolute -bottom-1.5 -left-1.5 h-3 w-3 border-b-2 border-l-2 border-cyan-300 rounded-bl shadow-[0_0_6px_#22d3ee]" />
          <span className="absolute -bottom-1.5 -right-1.5 h-3 w-3 border-b-2 border-r-2 border-cyan-300 rounded-br shadow-[0_0_6px_#22d3ee]" />

          {/* Animated Hand Arrow Sign Attached Directly to the Target Element */}
          <div
            className={`absolute left-1/2 -translate-x-1/2 flex items-center justify-center transition-all duration-300 ${
              cardPlacement === "bottom"
                ? "-bottom-8 animate-bounce-subtle-y"
                : "-top-8 animate-bounce-subtle-y-reverse"
            }`}
          >
            <div className="flex items-center gap-1.5 rounded-full border border-cyan-400/90 bg-slate-950/95 px-2.5 py-0.5 shadow-[0_0_16px_rgba(34,211,238,0.8)] backdrop-blur-md">
              {cardPlacement === "bottom" ? (
                <>
                  <span className="text-xs">👇</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-300">Look Here</span>
                </>
              ) : (
                <>
                  <span className="text-xs">👆</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-300">Look Here</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Quiet Luxury Popover Card */}
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-label={currentStep.title}
        className="fixed z-[99995] pointer-events-auto transition-all duration-300 ease-out"
        style={{
          top: cardTop,
          left: isMobileScreen ? 16 : cardLeft,
          width: isMobileScreen ? "calc(100vw - 32px)" : 340,
          maxWidth: "calc(100vw - 32px)",
        }}
      >
        {/* Card Body - Obsidian Glassmorphism */}
        <div className="relative overflow-hidden rounded-2xl border border-cyan-500/35 bg-slate-950/95 p-4 sm:p-5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.85),0_0_25px_rgba(34,211,238,0.25)] backdrop-blur-2xl">
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
          <div className="flex items-center justify-between gap-2 pt-0.5 pb-2">
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
          <div className="mt-1 space-y-1.5">
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
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-sky-500 px-4 py-1.5 text-xs font-bold text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.45)] hover:from-cyan-300 hover:to-sky-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.6)] active:scale-95 transition-all cursor-pointer"
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
