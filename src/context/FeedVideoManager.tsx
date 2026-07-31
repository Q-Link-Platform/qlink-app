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

  // Center-proximity algorithm: calculates which video is closest to vertical center of viewport
  const recalculateActiveVideo = useCallback(() => {
    if (overrideActiveIdRef.current) {
      return;
    }

    const videos = Array.from(registeredVideosRef.current.values());
    if (videos.length === 0) {
      setActiveVideoId(null);
      return;
    }

    const viewportHeight = window.innerHeight;
    const viewportCenter = viewportHeight / 2;

    let bestId: string | null = null;
    let minDistance = Infinity;

    for (const v of videos) {
      const rect = v.element.getBoundingClientRect();
      
      // Calculate how much of the video is visible in the viewport
      const visibleTop = Math.max(0, rect.top);
      const visibleBottom = Math.min(viewportHeight, rect.bottom);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);
      const visibilityRatio = rect.height > 0 ? visibleHeight / rect.height : 0;

      // Video must be at least 35% visible to be considered for autoplay
      if (visibilityRatio >= 0.35) {
        const videoCenter = rect.top + rect.height / 2;
        const distanceToCenter = Math.abs(videoCenter - viewportCenter);

        if (distanceToCenter < minDistance) {
          minDistance = distanceToCenter;
          bestId = v.id;
        }
      }
    }

    setActiveVideoId((prev) => (prev !== bestId ? bestId : prev));
  }, []);

  // Shared IntersectionObserver for efficient scroll handling
  useEffect(() => {
    let animationFrameId: number | null = null;

    const handleScrollOrResize = () => {
      if (animationFrameId !== null) return;
      animationFrameId = requestAnimationFrame(() => {
        animationFrameId = null;
        recalculateActiveVideo();
      });
    };

    window.addEventListener("scroll", handleScrollOrResize, { passive: true });
    window.addEventListener("resize", handleScrollOrResize, { passive: true });

    // Initial check
    recalculateActiveVideo();

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize);
      window.removeEventListener("resize", handleScrollOrResize);
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [recalculateActiveVideo]);

  const registerVideo = useCallback(
    (id: string, element: HTMLElement, play: () => void, pause: () => void) => {
      registeredVideosRef.current.set(id, { id, element, play, pause });
      recalculateActiveVideo();

      return () => {
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
