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
    selector: '[data-tour="edit-id"], #tour-edit-profile-btn',
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
  const [pointerOffset, setPointerOffset] = useState<number>(40);
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

  // Lock horizontal scroll completely while guide is active to prevent any horizontal shifts
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

  // Helper to find target element with resilient fallbacks
  const findTargetElement = useCallback((): HTMLElement | null => {
    let el = document.querySelector<HTMLElement>(currentStep.selector);
    if (!el && currentStep.id === 1) {
      el = document.querySelector<HTMLElement>(
        '#tour-edit-profile-btn, [data-tour="edit-id"], [data-tour="quantum-id"] button'
      );
    }
    return el;
  }, [currentStep]);

  // Measure and update the spotlight target rectangle
  const measureTarget = useCallback(() => {
    if (!isOpen) return;

    // Force zero horizontal scroll
    if (typeof window !== "undefined" && window.scrollX !== 0) {
      window.scrollTo({ left: 0 });
    }

    const el = findTargetElement();
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
  }, [isOpen, findTargetElement]);

  // Auto-scroll target element vertically ONLY (never horizontal!)
  const scrollTargetIntoView = useCallback(() => {
    if (!isOpen) return;

    const el = findTargetElement();
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const margin = 90;
    const isOutOfVerticalView =
      rect.top < margin || rect.bottom > window.innerHeight - margin;

    if (isOutOfVerticalView) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    }

    // Lock horizontal scroll
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
  }, [isOpen, findTargetElement, measureTarget]);

  // Isolate active element: Lift small button targets (like Edit Profile button) above blur overlay
  useEffect(() => {
    if (!isOpen) return;
    // Only lift for step 1 (Edit Profile button)
    if (currentStep.id !== 1) return;

    const el = findTargetElement();
    if (!el) return;

    const originalPosition = el.style.position;
    const originalZIndex = el.style.zIndex;

    el.style.position = originalPosition && originalPosition !== "static" ? originalPosition : "relative";
    el.style.zIndex = "99994";

    return () => {
      el.style.position = originalPosition;
      el.style.zIndex = originalZIndex;
    };
  }, [isOpen, findTargetElement, currentStep.id]);

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

  // Calculate Card & Pointer Positions directly adjacent to target element (Requirement 4)
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
    const offset = 14;

    if (!targetRect) {
      setCardTop(Math.max(padding, (vh - cardH) / 2));
      setCardLeft(Math.max(padding, (vw - cardW) / 2));
      setCardPlacement("bottom");
      setPointerOffset(cardW / 2);
      return;
    }

    const { top, bottom, left, width } = targetRect;
    const targetCenterX = left + width / 2;

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
      if (spaceBelow >= spaceAbove) {
        placement = "bottom";
        calculatedTop = Math.min(vh - cardH - padding, bottom + offset);
      } else {
        placement = "top";
        calculatedTop = Math.max(padding, top - offset - cardH);
      }
    }

    // Contextual placement: Center card horizontally under target element, constrained within safe viewport
    let calculatedLeft = targetCenterX - cardW / 2;
    calculatedLeft = Math.max(padding, Math.min(vw - cardW - padding, calculatedLeft));
    calculatedTop = Math.max(padding, Math.min(vh - cardH - padding, calculatedTop));

    // Pointer aligns directly with the target element's center axis
    const calculatedPointerOffset = Math.max(28, Math.min(cardW - 36, targetCenterX - calculatedLeft));

    setCardPlacement(placement);
    setCardTop(calculatedTop);
    setCardLeft(calculatedLeft);
    setPointerOffset(calculatedPointerOffset);
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

  // Spotlight cutout coordinates with clean margins
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
      {/* Fullscreen SVG Definition: userSpaceOnUse mask with boundless screen coverage */}
      <svg
        className="fixed inset-0 w-screen h-screen pointer-events-none z-[99989]"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <mask id="qlink-spotlight-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
            {/* White covers 100% of entire viewport and scroll extent, letting blur through uniformly */}
            <rect x="-10000" y="-10000" width="30000" height="30000" fill="#ffffff" />
            {/* Black punches the aperture hole over the targeted element */}
            {targetRect && (
              <rect
                x={cutoutX}
                y={cutoutY}
                width={cutoutW}
                height={cutoutH}
                rx={cutoutRx}
                ry={cutoutRx}
                fill="#000000"
              />
            )}
          </mask>
        </defs>
      </svg>

      {/* Fullscreen Backdrop with Uniform Blur & Dark Tint (Requirement 2: blur(4px), rgba(0,0,0,0.5)) */}
      <div
        className="fixed inset-0 z-[9990] pointer-events-none transition-all duration-300 ease-out"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          mask: "url(#qlink-spotlight-mask)",
          WebkitMask: "url(#qlink-spotlight-mask)",
          transform: "translateZ(0)",
          willChange: "transform, backdrop-filter",
        }}
      />

      {/* Clean Apple Optical Glowing Rim (Hardware Accelerated) */}
      {targetRect && (
        <div
          className="fixed pointer-events-none z-[99992] transition-all duration-300 ease-out rounded-2xl"
          style={{
            top: cutoutY,
            left: cutoutX,
            width: cutoutW,
            height: cutoutH,
            borderRadius: cutoutRx,
            transform: "translateZ(0)",
            willChange: "transform, top, left, width, height",
          }}
        >
          {/* Continuous neon pulse ring */}
          <div className="absolute inset-0 rounded-2xl border-2 border-cyan-400 shadow-[0_0_24px_rgba(34,211,238,0.85),inset_0_0_12px_rgba(34,211,238,0.35)] animate-pulse" />
          {/* Subtle radar ripple */}
          <div className="absolute -inset-1.5 rounded-2xl border border-cyan-300/40 animate-ping opacity-60 pointer-events-none" />
        </div>
      )}

      {/* Interactive Quiet Luxury Popover Card sitting on top of the blur overlay (Requirement 3: z-index 99995) */}
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
          transform: "translateZ(0)",
          willChange: "transform, top, left",
        }}
      >
        {/* Prominent Floating Focus Hand/Arrow Indicator: Aligns directly with target element */}
        {targetRect && (
          <div
            className={`absolute z-20 pointer-events-none flex items-center transition-all duration-300 ${
              cardPlacement === "bottom"
                ? "-top-8.5 animate-bounce-subtle-y"
                : "-bottom-8.5 animate-bounce-subtle-y-reverse"
            }`}
            style={{
              left: isMobileScreen ? "50%" : pointerOffset,
              transform: isMobileScreen ? "translateX(-50%)" : "translateX(-50%)",
            }}
          >
            <div className="flex items-center gap-1.5 rounded-full bg-cyan-400 text-slate-950 font-extrabold px-3 py-1 text-[11px] tracking-wider uppercase shadow-[0_0_18px_rgba(34,211,238,0.9)]">
              {cardPlacement === "bottom" ? (
                <>
                  <span className="text-sm leading-none">👆</span>
                  <span>LOOK HERE</span>
                </>
              ) : (
                <>
                  <span className="text-sm leading-none">👇</span>
                  <span>LOOK HERE</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Card Body - Deep Obsidian Glassmorphism */}
        <div className="relative overflow-hidden rounded-2xl border border-cyan-400/50 bg-slate-950/98 p-4 sm:p-5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),0_0_30px_rgba(34,211,238,0.25)] backdrop-blur-2xl">
          {/* Top accent line */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

          {/* Progress Bar */}
          <div className="absolute inset-x-0 top-[2px] h-[2px] bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Header: Category & Step Pill & Close Button */}
          <div className="flex items-center justify-between gap-2 pt-0.5 pb-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/40 bg-cyan-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
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

          {/* Title & Simple Explanation */}
          <div className="mt-1 space-y-1.5">
            <h4 className="text-sm sm:text-[15px] font-bold text-slate-100 tracking-tight flex items-center gap-1.5">
              {currentStep.title}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
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
                  className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-slate-600 hover:bg-slate-800 transition-all cursor-pointer"
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
