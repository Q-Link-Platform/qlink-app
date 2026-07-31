"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from "react";

interface RegisteredVideo {
  id: string;
  element: HTMLElement;
  play: () => void;
  pause: () => void;
  intersectionRatio: number;
  isIntersecting: boolean;
  rectTop: number;
  rectHeight: number;
}

interface FeedVideoManagerContextType {
  registerVideo: (id: string, element: HTMLElement, play: () => void, pause: () => void) => () => void;
  activeVideoId: string | null;
  isGlobalMuted: boolean;
  setIsGlobalMuted: (muted: boolean | ((prev: boolean) => boolean)) => void;
  toggleGlobalMute: () => void;
  setActiveVideoOverride: (id: string | null) => void;
}

const FeedVideoManagerContext = createContext<FeedVideoManagerContextType | null>(null);

export function FeedVideoManagerProvider({ children }: { children: ReactNode }) {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [isGlobalMuted, setIsGlobalMuted] = useState<boolean>(true);

  const registeredVideosRef = useRef<Map<string, RegisteredVideo>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const overrideActiveIdRef = useRef<string | null>(null);

  const toggleGlobalMute = useCallback(() => {
    setIsGlobalMuted((prev) => !prev);
  }, []);

  const setActiveVideoOverride = useCallback((id: string | null) => {
    overrideActiveIdRef.current = id;
    if (id !== null) {
      setActiveVideoId(id);
    }
  }, []);

  // X/Twitter-style Center Proximity Algorithm
  const recalculateActiveVideo = useCallback(() => {
    if (overrideActiveIdRef.current) return;

    const videos = Array.from(registeredVideosRef.current.values());
    if (videos.length === 0) {
      setActiveVideoId(null);
      return;
    }

    const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800;
    const viewportCenter = viewportHeight / 2;

    let bestId: string | null = null;
    let minDistance = Infinity;

    for (const v of videos) {
      if (!v.isIntersecting && v.intersectionRatio <= 0.05) continue;

      // Re-read current bounding rect for pixel accuracy
      const rect = v.element.getBoundingClientRect();
      const videoCenter = rect.top + rect.height / 2;
      const distanceToCenter = Math.abs(videoCenter - viewportCenter);

      // Require video to be in reasonable vertical bounds of screen (within middle 85% area)
      const isInFocusZone = rect.top < viewportHeight * 0.85 && rect.bottom > viewportHeight * 0.15;

      if (isInFocusZone && distanceToCenter < minDistance) {
        minDistance = distanceToCenter;
        bestId = v.id;
      }
    }

    setActiveVideoId((prev) => (prev !== bestId ? bestId : prev));
  }, []);

  // Initialize native IntersectionObserver for robust, cross-container scroll tracking
  useEffect(() => {
    if (typeof window === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const targetEl = entry.target as HTMLElement;
          const videoId = targetEl.getAttribute("data-video-id");
          if (videoId && registeredVideosRef.current.has(videoId)) {
            const reg = registeredVideosRef.current.get(videoId)!;
            reg.intersectionRatio = entry.intersectionRatio;
            reg.isIntersecting = entry.isIntersecting;
            reg.rectTop = entry.boundingClientRect.top;
            reg.rectHeight = entry.boundingClientRect.height;
          }
        });

        recalculateActiveVideo();
      },
      {
        root: null, // observe relative to viewport
        rootMargin: "-5% 0px -5% 0px", // focus on active visible zone
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1.0],
      }
    );

    observerRef.current = observer;

    // Additional fallback scroll/resize listeners
    const handleScrollOrResize = () => {
      recalculateActiveVideo();
    };

    window.addEventListener("scroll", handleScrollOrResize, { passive: true, capture: true });
    window.addEventListener("resize", handleScrollOrResize, { passive: true });
    document.addEventListener("scroll", handleScrollOrResize, { passive: true, capture: true });

    return () => {
      observer.disconnect();
      observerRef.current = null;
      window.removeEventListener("scroll", handleScrollOrResize, { capture: true });
      window.removeEventListener("resize", handleScrollOrResize);
      document.removeEventListener("scroll", handleScrollOrResize, { capture: true });
    };
  }, [recalculateActiveVideo]);

  const registerVideo = useCallback(
    (id: string, element: HTMLElement, play: () => void, pause: () => void) => {
      element.setAttribute("data-video-id", id);
      
      const rect = element.getBoundingClientRect();
      registeredVideosRef.current.set(id, {
        id,
        element,
        play,
        pause,
        intersectionRatio: 0,
        isIntersecting: false,
        rectTop: rect.top,
        rectHeight: rect.height,
      });

      if (observerRef.current) {
        observerRef.current.observe(element);
      }

      recalculateActiveVideo();

      return () => {
        if (observerRef.current) {
          observerRef.current.unobserve(element);
        }
        registeredVideosRef.current.delete(id);
        if (activeVideoId === id) {
          recalculateActiveVideo();
        }
      };
    },
    [activeVideoId, recalculateActiveVideo]
  );

  return (
    <FeedVideoManagerContext.Provider
      value={{
        registerVideo,
        activeVideoId,
        isGlobalMuted,
        setIsGlobalMuted,
        toggleGlobalMute,
        setActiveVideoOverride,
      }}
    >
      {children}
    </FeedVideoManagerContext.Provider>
  );
}

export function useFeedVideoManager() {
  return useContext(FeedVideoManagerContext);
}
