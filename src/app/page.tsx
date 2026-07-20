"use client";

import React from "react";
import {
  useEffect,
  useState,
  useRef,
  FormEvent,
  ChangeEvent,
  KeyboardEvent,
} from "react";
import Image from "next/image";
import Link from "next/link";
import AuraHelpModal from "@/components/AuraHelpModal";
import SimpleModal from "@/components/SimpleModal";
import PortalModal from "@/components/PortalModal";
import { createPortal } from "react-dom";
import { SessionProvider, useSession, signIn, signOut } from "next-auth/react";
import Cropper from "react-easy-crop";
import { usePassiveTouchEvents, useAndroidScrollOptimization } from "@/hooks/usePassiveTouchEvents";
import { ThemeToggle } from "@/components/ThemeToggle";
import { countries } from "@/utils/countries";
import dynamic from "next/dynamic";

const StoreModal = dynamic(() => import("@/components/StoreModal"), {
  ssr: false,
});

function useInView<T extends Element>(options?: IntersectionObserverInit) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  const [ratio, setRatio] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let cancelled = false;
    const obs = new IntersectionObserver(
      (entries) => {
        if (cancelled) return;
        const entry = entries[0];
        const nextRatio = typeof entry?.intersectionRatio === "number" ? entry.intersectionRatio : 0;
        setRatio(nextRatio);
        setInView(!!entry?.isIntersecting);
      },
      {
        root: null,
        rootMargin: "200px 0px",
        threshold: [0, 0.25, 0.6, 1],
        ...(options || {}),
      },
    );

    obs.observe(el);
    return () => {
      cancelled = true;
      obs.disconnect();
    };
  }, [options]);

  return { ref, inView, ratio };
}

function StableImage(props: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative h-full w-full">
      {/* Skeleton Loading State - Only visible when image not loaded */}
      <div
        className={
          "absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 transition-opacity duration-150 " +
          (loaded ? "opacity-0 pointer-events-none" : "opacity-100")
        }
      >
        {/* Shimmer Animation */}
        <div className="relative w-full h-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/60 via-slate-800/40 to-slate-900/60 animate-pulse" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
        </div>
        {/* Loading Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
          </div>
          <p className="text-[11px] font-medium text-cyan-200/80 tracking-wide">Loading image...</p>
        </div>
      </div>
      <img
        src={props.src}
        alt={props.alt}
        className={
          "block h-full w-full max-h-full max-w-full m-auto " +
          (loaded ? "opacity-100" : "opacity-0") +
          (props.className ? ` ${props.className}` : "")
        }
        style={{ objectFit: "contain" }}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}

function SmartVideo(props: {
  src: string;
  className?: string;
  preload?: "none" | "metadata" | "auto";
  autoplayMuted?: boolean;
}) {
  const { ref, inView, ratio } = useInView<HTMLVideoElement>({ rootMargin: "250px 0px" });
  const [loaded, setLoaded] = useState(false);

  const shouldPlay = inView && ratio >= 0.6;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!props.autoplayMuted) return;

    if (shouldPlay) {
      try {
        el.muted = true;
        el.loop = true;
        if (el.paused) {
          requestAnimationFrame(() => {
            try {
              void el.play();
            } catch {
              // ignore
            }
          });
        }
      } catch {
        // ignore
      }
    } else {
      try {
        if (!el.paused) {
          el.pause();
        }
      } catch {
        // ignore
      }
    }
  }, [shouldPlay, props.autoplayMuted, ref]);

  return (
    <div className="relative h-full w-full">
      {/* Skeleton Loading State */}
      <div
        className={
          "absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 transition-opacity duration-150 z-10 " +
          (loaded ? "opacity-0 pointer-events-none" : "opacity-100")
        }
      >
        {/* Shimmer Animation */}
        <div className="relative w-full h-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/60 via-slate-800/40 to-slate-900/60 animate-pulse" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-fuchsia-500/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
        </div>
        {/* Loading Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-fuchsia-400 animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2 h-2 rounded-full bg-fuchsia-400 animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2 h-2 rounded-full bg-fuchsia-400 animate-bounce" />
          </div>
          <p className="text-[11px] font-medium text-fuchsia-200/80 tracking-wide">Loading video...</p>
        </div>
      </div>
      <video
        ref={ref}
        src={props.src}
        controls={true}
        preload={props.preload || "metadata"}
        playsInline
        muted={!!props.autoplayMuted}
        className={(props.className ? props.className + " " : "") + "block h-full w-full max-h-full max-w-full m-auto"}
        style={{ objectFit: "contain" }}
        onLoadedData={() => setLoaded(true)}
      />
    </div>
  );
}

function getHighResProfilePic(url: string | null | undefined): string {
  if (!url) return "";
  let highResUrl = url;
  if (highResUrl.includes("googleusercontent.com")) {
    // Dynamically request high-res profile pictures from Google
    highResUrl = highResUrl.replace(/=s\d+(-[a-zA-Z0-9_-]+)?$/, "=s512-c");
    highResUrl = highResUrl.replace(/\/s\d+(-[a-zA-Z0-9_-]+)?\//, "/s512-c/");
  }
  return highResUrl;
}

function isValidImageUrl(url: any): boolean {
  return !!(
    url &&
    typeof url === 'string' &&
    url !== 'null' &&
    url !== 'undefined' &&
    url.trim() !== ''
  );
}

function CustomAudioPlayer(props: { src: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    
    const handleDurationChange = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("durationchange", handleDurationChange);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("durationchange", handleDurationChange);
    };
  }, []);

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      const allAudios = document.querySelectorAll("audio");
      allAudios.forEach((a) => {
        if (a !== audio) {
          a.pause();
        }
      });
      audio.play().catch((err) => console.error("Error playing audio:", err));
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const value = parseFloat(e.target.value);
    audio.currentTime = value;
    setCurrentTime(value);
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div 
      className="flex flex-col gap-1 w-full relative overflow-hidden select-none" 
      draggable="false"
      onDragStart={(e) => e.preventDefault()}
    >
      <audio ref={audioRef} src={props.src} preload="metadata" />
      
      <div className="flex items-center gap-2.5 w-full py-0.5 select-none" draggable="false">
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={togglePlay}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-400 to-sky-500 text-slate-950 font-bold hover:scale-105 active:scale-95 transition-all shadow-[0_0_8px_rgba(34,211,238,0.5)]"
        >
          {isPlaying ? (
            <svg className="h-4 w-4 text-slate-950" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg className="h-4 w-4 text-slate-950 translate-x-[1px]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Custom Progress Timeline Slider */}
        <div 
          className="flex-1 relative flex items-center h-4 group select-none"
          draggable="false"
          onDragStart={(e) => e.preventDefault()}
        >
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSliderChange}
            draggable="false"
            onDragStart={(e) => e.preventDefault()}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 select-none"
          />
          {/* Custom Track Background */}
          <div className="absolute left-0 right-0 h-1 bg-slate-800 rounded-full z-0 overflow-hidden">
            {/* Custom Glowing Fill Progress bar */}
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-sky-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] rounded-full transition-all duration-75"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          {/* Custom Slider Handle/Thumb */}
          <div
            className="absolute w-2.5 h-2.5 bg-cyan-300 rounded-full border border-white/80 shadow-[0_0_6px_rgba(34,211,238,0.9)] z-10 -translate-x-1/2 group-hover:scale-125 transition-transform"
            style={{ left: `${progressPercentage}%` }}
          />
        </div>

        {/* Audio Duration Indicators */}
        <div className="text-[10px] font-mono text-cyan-300 shrink-0 select-none">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>
    </div>
  );
}

type ViewMode = "home" | "connect";

type OutgoingRequest = {
  id: string;
  status: string;
  categories: string[];
  message?: string | null;
  createdAt: string;
  toUser: {
    id: string;
    handle: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

type ChatMessage = {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  isEncrypted?: boolean;
};

type IncomingRequest = {
  id: string;
  status: string;
  categories: string[];
  message?: string | null;
  createdAt: string;
  fromUser: {
    id: string;
    handle: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

type FoundUser = {
  id: string;
  handle: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  blue_tick_status?: string | null;
};

type DirectoryItem = {
  id: string;
  handle: string | null;
  name: string | null;
  image?: string | null;
  rank: number;
  isRedTick: boolean;
  auraPercentage: number;
  blueTickStatus: string;
  points: number;
};

function renderMessageText(text: string, isMe: boolean) {
  if (!text) return null;
  const URL_REGEX = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(URL_REGEX);
  return parts.map((part, index) => {
    if (part.match(URL_REGEX)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className={
            isMe
              ? "underline text-blue-900 hover:text-blue-950 font-semibold break-all"
              : "underline text-cyan-400 hover:text-cyan-300 font-semibold break-all"
          }
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

export default function Home() {
  // Initialize hooks at component top level
  // DISABLED: Scroll optimization hooks causing scroll issues
  // const passiveTouchRef = usePassiveTouchEvents();
  // const androidScrollRef = useAndroidScrollOptimization();

  return (
    <SessionProvider
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus={true} // Refetch when window gains focus
    >
      <HomeInner
        passiveTouchRef={null}
        androidScrollRef={null}
      />
    </SessionProvider>
  );
}

const decryptMessageList = async (
  messages: ChatMessage[],
  peerPublicKey: string | null
): Promise<ChatMessage[]> => {
  try {
    const { decryptMessage } = await import("@/lib/e2e-crypto");
    return await Promise.all(
      messages.map(async (m) => {
        const isEncrypted = m.content.trim().startsWith('{"__e2e"');
        if (isEncrypted) {
          if (peerPublicKey) {
            const decrypted = await decryptMessage(m.content, peerPublicKey);
            return { ...m, content: decrypted, isEncrypted: true };
          }
          return { ...m, content: "🔒 [Encrypted Message - Key Unavailable]", isEncrypted: true };
        }
        return m;
      })
    );
  } catch (e) {
    console.error("[E2E] Batch decryption failed:", e);
    return messages;
  }
};

const playSciFiSound = (action: "on" | "off") => {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    if (action === "on") {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc1.type = "sine";
      osc2.type = "triangle";
      
      osc1.frequency.setValueAtTime(220, now);
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      
      osc2.frequency.setValueAtTime(220, now);
      osc2.frequency.exponentialRampToValueAtTime(1760, now + 0.15);
      
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.25);
      osc2.stop(now + 0.25);
    } else {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sawtooth";
      
      osc.frequency.setValueAtTime(660, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.2);
      
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(400, now);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.3);
    }
  } catch (e) {
    console.debug("[Audio] Failed to play sci-fi sound:", e);
  }
};

const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve) => {
    // Skip if not an image or is an animated gif
    if (!file.type.startsWith("image/") || file.type === "image/gif") {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = document.createElement("img");
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        // Limit dimensions to a max of 1600px to ensure file stays well under 4MB
        const MAX_WIDTH = 1600;
        const MAX_HEIGHT = 1600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to JPEG with a quality of 0.8 to optimize size with low distortion
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const name = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
            const compressedFile = new File([blob], `${name}.jpg`, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          "image/jpeg",
          0.8
        );
      };
      img.onerror = () => resolve(file);
      img.src = event.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
};

function HomeInner({ passiveTouchRef, androidScrollRef }: { 
  passiveTouchRef?: React.Ref<HTMLDivElement>;
  androidScrollRef?: React.Ref<HTMLDivElement>;
}) {
  const { data: session, status, update: updateSession } = useSession();
  
  // Temporary bypass for testing animations
  const isTempBypass = typeof window !== 'undefined' && localStorage.getItem('temp_bypass') === 'true';
  const mockSession = isTempBypass ? {
    user: {
      name: "Test User",
      email: "test@example.com",
      image: null,
      handle: "TEST_USER"
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  } : null;
  
  const effectiveSession = session || mockSession;
  const myId = (effectiveSession?.user as any)?.id;
  const [mode, setMode] = useState<ViewMode>("home");

  const [outgoing, setOutgoing] = useState<OutgoingRequest[]>([]);
  const [isLoadingOutgoing, setIsLoadingOutgoing] = useState(false);

  const [incoming, setIncoming] = useState<IncomingRequest[]>([]);
  const [isLoadingIncoming, setIsLoadingIncoming] = useState(false);
  const [incomingError, setIncomingError] = useState<string | null>(null);

  const [activePeerHandle, setActivePeerHandle] = useState<string | null>(null);
  const [activePeerPublicKey, setActivePeerPublicKey] = useState<string | null>(null);
  const [chatRoomId, setChatRoomId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [isChatFull, setIsChatFull] = useState(false);
  const [isGlowActive, setIsGlowActive] = useState(false);
  const [isPushEnabled, setIsPushEnabled] = useState(false);
  // Detect if running inside the Electron desktop app (has our preload bridge)
  const [isElectron] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return !!(window as any).electronAPI;
  });
  const [desktopNotificationsEnabled, setDesktopNotificationsEnabled] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("qlink_desktop_notifications_enabled");
        return stored === "true";
      } catch {
        return false;
      }
    }
    return false;
  });
  const [isE2EEnabled, setIsE2EEnabled] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const dragCounterRef = useRef(0);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // States for the Secure Message Sharing feature
  const [shareToastText, setShareToastText] = useState<string | null>(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);

  // Unread message tracking (Array of { id, sender } objects to prevent duplicates and race conditions)
  interface UnreadMessage {
    id: string;
    sender: string;
  }

  const [unreadMessages, setUnreadMessages] = useState<UnreadMessage[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("qlink_unread_messages");
        if (stored) {
          return JSON.parse(stored);
        }
      } catch {
        // ignore
      }
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem("qlink_unread_messages", JSON.stringify(unreadMessages));
    } catch {
      // ignore
    }
  }, [unreadMessages]);

  // Derived state to keep compatibility with existing UI includes check
  const unreadSenders = React.useMemo(() => {
    return Array.from(new Set(unreadMessages.map((m) => m.sender)));
  }, [unreadMessages]);

  // Clear unread state for the active chat peer
  useEffect(() => {
    if (activePeerHandle) {
      setUnreadMessages((prev) => {
        if (prev.some((m) => m.sender === activePeerHandle)) {
          return prev.filter((m) => m.sender !== activePeerHandle);
        }
        return prev;
      });
    }
  }, [activePeerHandle]);

  // Dynamic App Badge & Electron taskbar overlay syncing
  useEffect(() => {
    if (typeof window === "undefined") return;
    const count = unreadMessages.length;

    // 1. Web/PWA App Badge Support (Skip in Electron to prevent overwriting custom blue badge)
    if ("setAppBadge" in navigator && !isElectron) {
      if (count > 0) {
        navigator.setAppBadge(count).catch((err) => console.warn("[Badge] setAppBadge error:", err));
      } else {
        navigator.clearAppBadge().catch((err) => console.warn("[Badge] clearAppBadge error:", err));
      }
    }

    // 2. Electron-specific Taskbar Overlay Icon Badge
    const win = window as any;
    if (win.electronAPI && typeof win.electronAPI.updateBadgeCount === "function") {
      if (count > 0) {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = 32;
          canvas.height = 32;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            // Draw medium blue circular background
            ctx.fillStyle = "#2563eb"; // Medium blue color
            ctx.beginPath();
            ctx.arc(16, 16, 15, 0, 2 * Math.PI);
            ctx.fill();

            // Draw white count text
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            if (count > 99) {
              ctx.font = "bold 11px Arial, sans-serif";
              ctx.fillText("99+", 16, 16);
            } else if (count > 9) {
              ctx.font = "bold 13px Arial, sans-serif";
              ctx.fillText(count.toString(), 16, 16);
            } else {
              ctx.font = "bold 17px Arial, sans-serif";
              ctx.fillText(count.toString(), 16, 16);
            }

            const dataUrl = canvas.toDataURL("image/png");
            win.electronAPI.updateBadgeCount(count, dataUrl);
          } else {
            win.electronAPI.updateBadgeCount(count, null);
          }
        } catch (e) {
          console.error("Failed to generate taskbar badge canvas:", e);
          win.electronAPI.updateBadgeCount(count, null);
        }
      } else {
        win.electronAPI.updateBadgeCount(0, null);
      }
    }
  }, [unreadMessages, isElectron]);

  const toggleDesktopNotifications = async (enable: boolean) => {
    if (!enable) {
      setDesktopNotificationsEnabled(false);
      localStorage.setItem("qlink_desktop_notifications_enabled", "false");
      return;
    }

    if (typeof window !== "undefined" && "Notification" in window) {
      let permission = Notification.permission;
      if (permission === "default" || permission === "denied") {
        try {
          permission = await Notification.requestPermission();
        } catch (err) {
          console.warn("[Desktop Toggle] requestPermission error:", err);
        }
      }
    }

    setDesktopNotificationsEnabled(true);
    localStorage.setItem("qlink_desktop_notifications_enabled", "true");

    // Trigger a native test notification to verify OS alerts work
    const win = window as any;
    if (win.electronAPI && typeof win.electronAPI.showNotification === "function") {
      try {
        win.electronAPI.showNotification(
          "Q-Link Notifications Enabled",
          "You will now receive desktop alerts for incoming messages."
        );
      } catch (e) {
        console.error("Failed to show native test notification:", e);
      }
    }
  };

  const triggerDesktopNotification = (peerHandle: string) => {
    if (isElectron && desktopNotificationsEnabled) {
      const win = window as any;
      if (win.electronAPI && typeof win.electronAPI.showNotification === "function") {
        try {
          win.electronAPI.showNotification("Q-Link", `New message from ${peerHandle}`, peerHandle);
          return;
        } catch (e) {
          console.error("Failed to show Electron native notification:", e);
        }
      }
    }

    if (
      !isElectron &&
      desktopNotificationsEnabled &&
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      try {
        const notif = new Notification("Q-Link", {
          body: `New message from ${peerHandle}`,
          icon: "/logo-256.png"
        });
        notif.onclick = () => {
          setActivePeerHandle(peerHandle);
          setIsChatFull(true);
        };
      } catch (e) {
        console.error("Error showing fallback HTML5 notification:", e);
      }
    }
  };


  const togglePushNotifications = async (enable: boolean) => {
    // No-op inside Electron — desktop notifications are always-on natively
    if (typeof window !== "undefined" && !!(window as any).electronAPI) return;

    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      alert("Push notifications are not supported on this browser.");
      return;
    }

    try {
      if (enable) {
        // 1. Request Permission FIRST, before any service worker code!
        // This guarantees that the native browser prompt is triggered immediately
        // and doesn't get blocked by a hanging service worker registration promise.
        let permission = Notification.permission;
        
        try {
          permission = await Notification.requestPermission();
          if (permission === "granted") {
            setIsPushEnabled(true);
          }
        } catch (err) {
          console.warn("[Push Toggle] requestPermission error:", err);
        }

        if (permission !== "granted") {
          setIsPushEnabled(false);
          if (permission === "denied") {
            alert(
              "Notifications are currently blocked by your browser settings.\n\n" +
              "To receive push notifications, please click the site settings icon on the left of the URL bar (next to q-link-v3-0.vercel.app) and set 'Notifications' to 'Allow'.\n\n" +
              "Once you do, Chrome will display a banner asking you to reload the page to apply the settings."
            );
          }
          return;
        }

        // 2. Only after permission is granted, obtain the service worker registration
        let registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
          registration = await navigator.serviceWorker.ready;
        }

        // 3. Subscribe
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "BMQemcbop-dfZ7bLlwyL083mRANSiRsNbggorApxFfg5U-M_KKMVpwoUdZGM4mbG5rpav7w-vZbcNhiWtW4hvQE";

        let subscription = await registration.pushManager.getSubscription();
        if (!subscription) {
          const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
          try {
            subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey,
            });
          } catch (err) {
            console.error("[Push Toggle] Failed to subscribe locally:", err);
            setIsPushEnabled(false);
            return;
          }
        }

        // Ensure state is true
        setIsPushEnabled(true);

        // 4. Save to backend asynchronously without blocking UI response
        try {
          const res = await fetch("/api/push/subscribe", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(subscription),
          });

          if (!res.ok) {
            console.error("[Push Toggle] Backend registration failed status:", res.status);
          } else {
            console.log("[Push Toggle] Successfully synchronized subscription with backend!");
          }
        } catch (backendErr) {
          console.error("[Push Toggle] Backend network error:", backendErr);
        }
      } else {
        // Optimistically set to false immediately for instantaneous UI response!
        setIsPushEnabled(false);

        // Unsubscribe asynchronously in the background
        try {
          let registration = await navigator.serviceWorker.getRegistration();
          if (!registration) {
            registration = await navigator.serviceWorker.ready;
          }

          const subscription = await registration.pushManager.getSubscription();
          if (subscription) {
            // 1. Unsubscribe locally
            await subscription.unsubscribe();
            
            // 2. Delete on backend
            await fetch("/api/push/subscribe", {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ endpoint: subscription.endpoint }),
            });
          }
          console.log("[Push Toggle] Successfully unsubscribed in background!");
        } catch (unsubErr) {
          console.error("[Push Toggle] Error during unsubscribe background cleanup:", unsubErr);
        }
      }
    } catch (error) {
      console.error("[Push Toggle] Error toggling push notifications:", error);
      // Revert state on unexpected core error
      setIsPushEnabled(false);
    }
  };

  // High-Fidelity Audio Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [recordingTimer, setRecordingTimer] = useState<any>(null);

  const chatInputRef = useRef<HTMLTextAreaElement | null>(null);
  const chatPanelRef = useRef<HTMLElement | null>(null);
  const pendingImageRef = useRef<HTMLDivElement | null>(null);
  const mainScrollRef = useRef<HTMLDivElement | null>(null);

  // Disabled manual global wheel listener: It was manually updating scrollTop on every wheel event,
  // causing double-scrolling and layout jitter/scrollbar jumping. The browser now handles scroll
  // naturally on #main-scroll-container.


  // Helper to convert VAPID public key from Base64 URL to Uint8Array required by pushManager
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  // Register PWA Service Worker & Subscribe to Web Push Notifications
  useEffect(() => {
    // Skip Web Push entirely inside the Electron desktop app — native notifications handle this
    if (typeof window !== "undefined" && !!(window as any).electronAPI) return;

    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.warn("PWA Service Worker or Web Push is not supported by this browser.");
      return;
    }

    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "BMQemcbop-dfZ7bLlwyL083mRANSiRsNbggorApxFfg5U-M_KKMVpwoUdZGM4mbG5rpav7w-vZbcNhiWtW4hvQE";

    const registerAndSubscribe = async () => {
      try {
        // 1. Register sw.js
        const registration = await navigator.serviceWorker.register("/sw.js");
        console.log("Service Worker registered successfully with scope:", registration.scope);

        // 2. Wait until user is fully logged in before subscribing
        if (status !== "authenticated" || !session?.user?.id) {
          return;
        }

        // 3. Check for existing permission - NEVER request permission on page load without user gesture
        const permission = Notification.permission;
        if (permission !== "granted") {
          console.log("[PWA Push] Notification permission not granted yet. Waiting for manual user toggle in Settings.");
          setIsPushEnabled(false);
          return;
        }

        // 4. Check for existing subscription or create new one silently since permission is already granted
        let subscription = await registration.pushManager.getSubscription();

        if (subscription) {
          setIsPushEnabled(true);
        } else {
          setIsPushEnabled(false);
          const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
          try {
            subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey,
            });
            if (subscription) {
              setIsPushEnabled(true);
            }
          } catch (subErr) {
            console.error("[PWA Push] Silent subscription failed:", subErr);
            return;
          }
        }

        if (subscription) {
          // 5. Send subscription to Prisma backend
          const res = await fetch("/api/push/subscribe", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(subscription),
          });

          if (res.ok) {
            console.log("Registered Push Subscription successfully on backend!");
          } else {
            console.error("Failed to save push subscription on backend:", await res.text());
          }
        }
      } catch (error) {
        console.error("Error setting up Web Push Notifications:", error);
      }
    };

    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "NAVIGATE") {
        const targetUrl = event.data.url;
        console.log("Received NAVIGATE message from Service Worker:", targetUrl);
        try {
          const urlObj = new URL(targetUrl, window.location.origin);
          const chatHandle = urlObj.searchParams.get("chat");
          const tabName = urlObj.searchParams.get("tab");
          if (chatHandle) {
            setActivePeerHandle(chatHandle);
            setIsChatFull(true);
          } else if (tabName === "requests") {
            setMode("connect");
          }
        } catch (e) {
          console.error("Error parsing targetUrl:", e);
        }
      } else if (event.data && event.data.type === "NEW_MESSAGE_RECEIVED") {
        const from = event.data.fromHandle;
        if (from && from !== activePeerHandle) {
          setUnreadMessages((prev) => {
            const msgId = event.data.messageId || `sw-${Date.now()}`;
            if (prev.some((m) => m.id === msgId)) return prev;
            return [...prev, { id: msgId, sender: from }];
          });
        }
      }
    };

    navigator.serviceWorker.addEventListener("message", handleServiceWorkerMessage);
    void registerAndSubscribe();

    return () => {
      navigator.serviceWorker.removeEventListener("message", handleServiceWorkerMessage);
    };
  }, [status, session?.user?.id]);

  // Dynamically clear PWA App Badges, capture unread sender IDs, and close active push notifications
  useEffect(() => {
    const clearBadgesAndSyncUnread = async () => {
      if (typeof window !== "undefined") {
        if ("clearAppBadge" in navigator) {
          navigator.clearAppBadge().catch((err) => console.warn("[Badge] Error clearing badge:", err));
        }
        
        if ("serviceWorker" in navigator) {
          try {
            const reg = await navigator.serviceWorker.getRegistration();
            if (reg) {
              const notifications = await reg.getNotifications();
              const handlesToAdd: string[] = [];
              notifications.forEach((n) => {
                const targetUrl = n.data?.url;
                if (targetUrl) {
                  try {
                    const urlObj = new URL(targetUrl, window.location.origin);
                    const h = urlObj.searchParams.get("chat");
                    if (h && h !== activePeerHandle) {
                      handlesToAdd.push(h);
                    }
                  } catch {
                    // ignore
                  }
                }
                n.close(); // Close the notification
              });

              if (handlesToAdd.length > 0) {
                setUnreadMessages((prev) => {
                  const filtered = prev.filter((m) => !handlesToAdd.includes(m.sender));
                  const newMsgs = handlesToAdd.map((h, idx) => ({ id: `notif-${h}-${idx}-${Date.now()}`, sender: h }));
                  return [...filtered, ...newMsgs];
                });
              }
            }
          } catch (err) {
            console.warn("[Badge] Error syncing notifications:", err);
          }
        }
      }
    };

    void clearBadgesAndSyncUnread();

    const handleFocus = () => {
      clearBadgesAndSyncUnread();
      if (activePeerHandle) {
        setUnreadMessages((prev) => prev.filter((m) => m.sender !== activePeerHandle));
      }
      const win = window as any;
      if (win.electronAPI && typeof win.electronAPI.focusWindow === "function") {
        win.electronAPI.focusWindow();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [activePeerHandle]);

  useEffect(() => {
    const win = window as any;
    if (win.electronAPI && typeof win.electronAPI.onNotificationClicked === "function") {
      const unsubscribe = win.electronAPI.onNotificationClicked((data: { peerHandle: string }) => {
        if (data && data.peerHandle) {
          setActivePeerHandle(data.peerHandle);
          setIsChatFull(true);
        }
      });
      return () => {
        if (typeof unsubscribe === "function") {
          unsubscribe();
        }
      };
    }
  }, []);

  // Lightbox for viewing attachments fullscreen inside the app
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);
  const [lightboxImageName, setLightboxImageName] = useState<string | null>(null);
  const [lightboxVideoUrl, setLightboxVideoUrl] = useState<string | null>(null);
  const [lightboxVideoName, setLightboxVideoName] = useState<string | null>(null);
  
  // Logo viewer state
  const [showLogoViewer, setShowLogoViewer] = useState(false);
  const [logoViewerImage, setLogoViewerImage] = useState<string>("/logo-square.png");
  
  // Welcome screen logo viewer state (right top corner)
  const [showWelcomeLogoViewer, setShowWelcomeLogoViewer] = useState(false);
  const [welcomeLogoViewerImage, setWelcomeLogoViewerImage] = useState<string>("/logo-square.png");
  
  // Settings animation state
  const [isSettingsAnimating, setIsSettingsAnimating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsScreen, setSettingsScreen] = useState("main");
  const settingsClickTimeRef = useRef<number>(0);

  // Synchronize Push Notifications button state dynamically whenever settings modal is opened
  useEffect(() => {
    if (showSettings) {
      const syncPushEnabledState = async () => {
        if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
          setIsPushEnabled(false);
          return;
        }

        try {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration && Notification.permission === "granted") {
            const subscription = await registration.pushManager.getSubscription();
            setIsPushEnabled(!!subscription);
          } else {
            setIsPushEnabled(false);
          }
        } catch (err) {
          console.warn("[Push Sync] Error checking subscription status:", err);
          setIsPushEnabled(false);
        }
      };

      void syncPushEnabledState();
    }
  }, [showSettings]);
  
  // Privacy visibility states
  const [emailVisibility, setEmailVisibility] = useState<"public" | "private">("private");
  const [ageVisibility, setAgeVisibility] = useState<"public" | "private">("private");
  const [genderVisibility, setGenderVisibility] = useState<"public" | "private">("private");
  const [bioVisibility, setBioVisibility] = useState<"public" | "private">("private");
  const [interestsVisibility, setInterestsVisibility] = useState<"public" | "private">("private");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Console animation state
  const [isConsoleAnimating, setIsConsoleAnimating] = useState(false);
  
  // Full chat animation state
  const [isChatAnimating, setIsChatAnimating] = useState(false);
  
  // Smooth chat toggle with animations
  const toggleChatFull = () => {
    setIsChatAnimating(true);
    setIsChatFull(!isChatFull);
    // Reset animation state after transition completes
    setTimeout(() => setIsChatAnimating(false), 400);
  };
  
  const quantumIdRef = useRef<HTMLDivElement | null>(null);
  const connectRef = useRef<HTMLDivElement | null>(null);
  const requestsRef = useRef<HTMLDivElement | null>(null);

  // Typing debounce timer + state (optimize calls to presence/typing)
  const typingTimeoutRef = useRef<any | null>(null);
  const isTypingRef = useRef<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const imageVideoInputRef = useRef<HTMLInputElement | null>(null);
  const profilePicInputRef = useRef<HTMLInputElement | null>(null);

  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
  const [avatarViewerImageUrl, setAvatarViewerImageUrl] = useState<string | null>(null);
  const [isAvatarHovered, setIsAvatarHovered] = useState(false);

  // Avatar image load error state
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  
  // Reset avatar load error state when user image changes
  useEffect(() => {
    setAvatarLoadError(false);
  }, [session?.user?.image, profilePicUrl]);

  const [currentHandle, setCurrentHandle] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [editingHandle, setEditingHandle] = useState(false);
  const [handleDraft, setHandleDraft] = useState("");
  const [nameDraft, setNameDraft] = useState("");
  const [handleError, setHandleError] = useState<string | null>(null);
  const [handleSaving, setHandleSaving] = useState(false);
  const [showVipTerms, setShowVipTerms] = useState(false);
  const [isVipTermsAnimating, setIsVipTermsAnimating] = useState(false);
  const [showAuraHelp, setShowAuraHelp] = useState(false);
  const [showAIHelpButton, setShowAIHelpButton] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [manualStopAnimation, setManualStopAnimation] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("qlink_manual_stop_ai_animation") === "true";
    }
    return false;
  });

  // Phone/No account modal states
  const [showNoAccountModal, setShowNoAccountModal] = useState(false);
  const [phoneSignInStep, setPhoneSignInStep] = useState<"menu" | "phone" | "otp" | "success">("menu");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState({ name: "India", code: "IN", dial: "+91", flag: "🇮🇳" });
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState("");

  // Dynamically filter 190+ countries in real-time
  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(countrySearchQuery.toLowerCase()) ||
    c.dial.includes(countrySearchQuery) ||
    c.code.toLowerCase().includes(countrySearchQuery.toLowerCase())
  );

  // Debug: Track modal state changes
  useEffect(() => {
    console.log('Aura help modal state changed:', showAuraHelp);
  }, [showAuraHelp]);

  // AI Help Button Animation Logic
  useEffect(() => {
    if (manualStopAnimation) return;
    
    const showButton = () => setShowAIHelpButton(true);
    const hideButton = () => setShowAIHelpButton(false);
    
    // Show button after 3 seconds
    const showTimer = setTimeout(showButton, 3000);
    
    // Hide button after 8 seconds (visible for 5 seconds)
    const hideTimer = setTimeout(hideButton, 8000);
    
    // Repeat cycle every 15 seconds
    const cycleTimer = setInterval(() => {
      if (!manualStopAnimation) {
        showButton();
        setTimeout(hideButton, 5000);
      }
    }, 15000);
    
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      clearInterval(cycleTimer);
    };
  }, [manualStopAnimation]);

  // Install Prompt Handler
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const prompt = (e as any);
      setDeferredPrompt(prompt);
      setShowInstallButton(true);
      console.log('beforeinstallprompt event captured - install button available');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Install button click handler
  const handleInstallClick = () => {
    const promptEvent = installPromptEvent || deferredPrompt;
    if (promptEvent) {
      promptEvent.prompt();
      promptEvent.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted install prompt');
        } else {
          console.log('User dismissed install prompt');
        }
        setInstallPromptEvent(null);
        setDeferredPrompt(null);
        setShowInstallButton(false);
      });
    }
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("qc_pwa_install_seen_v1", "dismissed");
      }
    } catch {
      // ignore
    }
    setShowInstallPrompt(false);
  };

  // Onboarding state for new users
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isFirstAutoOnboarding, setIsFirstAutoOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [bioDraft, setBioDraft] = useState("");
  const [age, setAge] = useState<number | null>(null);
  const [gender, setGender] = useState<"male" | "female" | "other" | null>(null);

  // Interests categories for onboarding
  const interestsCategories = [
    "Technology", "Artificial Intelligence", "Machine Learning", "Deep Learning",
    "Robotics", "Automation", "Software Development", "Web Development", "App Development",
    "Game Development", "Cybersecurity", "Ethical Hacking", "Blockchain", "Web3",
    "Cryptocurrency", "Cloud Computing", "DevOps", "Data Science", "Big Data", "Quantum Computing",
    "Edge Computing", "Internet of Things (IoT)", "Electronics", "Embedded Systems", "Hardware Engineering",
    "Open Source", "Startups", "Entrepreneurship", "Business Strategy", "Finance", "Investing",
    "Stock Market", "Crypto Trading", "Economics", "Banking", "Venture Capital", "Personal Finance",
    "Space Technology", "Astronomy", "Physics", "Chemistry", "Biotechnology", "Neuroscience",
    "Psychology", "Philosophy", "Self Improvement", "Productivity", "Leadership", "Marketing",
    "Digital Marketing", "Content Creation", "Writing", "Graphic Design", "UI/UX Design", "Fashion",
    "Art", "Music", "Gaming", "Virtual Reality (VR)", "Augmented Reality (AR)", "Sports",
    "Fitness", "Nutrition", "Medicine", "Travel", "Engineering", "Real Estate",
    "History", "Politics", "Law", "Education", "Research", "DIY Projects", "Sustainability"
  ];

  // Onboarding handlers
  const handleSkipOnboarding = () => {
    setShowOnboarding(false);
    setIsFirstAutoOnboarding(false);
    // Mark onboarding as completed so it doesn't auto-open again
    if (typeof window !== "undefined") {
      localStorage.setItem("qc_onboarding_completed", "true");
    }
  };

  const handleNextOnboarding = () => {
    if (onboardingStep === 1) {
      setOnboardingStep(2);
      return;
    }
    if (onboardingStep === 2) {
      setOnboardingStep(3);
      return;
    }
    if (onboardingStep === 3) {
      if (!bioDraft.trim()) {
        alert("Please add a short bio about yourself.");
        return;
      }
      setOnboardingStep(4);
      return;
    }
    if (onboardingStep === 4) {
      if (!age) {
        alert("Please select your age.");
        return;
      }
      setOnboardingStep(5);
    }
  };

  const handleFinishOnboarding = () => {
    if (!gender) {
      alert("Please select your gender.");
      return;
    }

    setShowOnboarding(false);
    setIsFirstAutoOnboarding(false);

    // Mark onboarding as completed so it doesn't auto-open again
    if (typeof window !== "undefined") {
      window.localStorage.setItem("qc_onboarding_completed", "true");
    }

    // For first-time users, immediately show the "How this works" guide
    // so they understand the main panels after finishing onboarding.
    setShowGuide(true);
    setGuideStep(0);

    // TODO: Save selected interests, bio, age, gender to backend
  };

  const handleAutoGenerate = () => {
    // Use the system-generated ID and name from the user's session
    if (session?.user) {
      const userHandle = (session.user as any).handle;
      const userName = session.user.name || session.user.email?.split('@')[0];
      
      if (userHandle) {
        setHandleDraft(userHandle);
      }
      if (userName) {
        setNameDraft(userName);
      }
    }
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  useEffect(() => {
    const checkUserOnboarding = async () => {
      if (status === "authenticated" && effectiveSession && canUseDom) {
        setDisplayName(effectiveSession.user?.name || null);
        setCurrentHandle((effectiveSession.user as any)?.handle || null);
        if (effectiveSession.user?.image) {
          setProfilePicUrl(getHighResProfilePic(effectiveSession.user.image));
        }

        // Check if user has completed onboarding (you can store this in localStorage or backend)
        const hasCompletedOnboarding = localStorage.getItem("qc_onboarding_completed");
        const hasSeenGuide = localStorage.getItem("qc_seen_guide_v1");
        
        // Check if user exists in database (this is a simplified check - in production, you'd want to verify with your backend)
        const checkExistingUser = async () => {
          try {
            // For now, we'll use localStorage to track existing users
            // In production, you'd make an API call to check if user exists in your database
            const userHandle = (session.user as any)?.handle;
            if (userHandle) {
              const existingUserKey = `qc_existing_user_${userHandle}`;
              const isExistingUser = localStorage.getItem(existingUserKey);
              
              if (isExistingUser) {
                // User exists in database - mark onboarding and guide as completed
                localStorage.setItem("qc_onboarding_completed", "true");
                localStorage.setItem("qc_seen_guide_v1", "1");
                return true;
              } else {
                // New user - mark as existing for future logins
                localStorage.setItem(existingUserKey, "true");
                return false;
              }
            }
          } catch (error) {
            console.error("Error checking existing user:", error);
            return false;
          }
        };

        const isExistingUser = await checkExistingUser();
        
        if (!hasCompletedOnboarding && !isExistingUser) {
          setShowOnboarding(true);
          setIsFirstAutoOnboarding(true);
        }
        
        if (!hasSeenGuide && !isExistingUser) {
          setShowGuide(true);
          setGuideStep(0);
        }
      }
    };

    checkUserOnboarding();
  }, [status, session]);

  // Load followers when authenticated
  useEffect(() => {
    if (status === "authenticated" && (session?.user as any)?.id) {
      fetchFollowers();
    }
  }, [status, session]);

  // Animation state for Q-Link logo
  const [logoAnimationStep, setLogoAnimationStep] = useState(0);

  // Q-Link animation cycle every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLogoAnimationStep(prev => (prev + 1) % 10); // 0-9 for complete cycle
    }, 400); // 400ms per step = 4 seconds total

    return () => clearInterval(interval);
  }, []);

  const [showDirectory, setShowDirectory] = useState(false);
  const [showDirectoryMediaOnly, setShowDirectoryMediaOnly] = useState(false);
  const [mediaFilterTab, setMediaFilterTab] = useState<'all' | 'shorts' | 'posts' | 'tweets'>('all');
  const [directoryItems, setDirectoryItems] = useState<DirectoryItem[] | null>(null);
  const [directoryLoading, setDirectoryLoading] = useState(false);
  const [directoryError, setDirectoryError] = useState<string | null>(null);
  const [directoryLatestPostsByAuthorId, setDirectoryLatestPostsByAuthorId] =
    useState<Record<string, any[]>>({});
  const [directoryPostsLoading, setDirectoryPostsLoading] = useState(false);
  const [directoryPostsError, setDirectoryPostsError] = useState<string | null>(null);
  const [directoryOpenCommentsPostId, setDirectoryOpenCommentsPostId] =
    useState<string | null>(null);

  // Engagement state management
  const [followStatus, setFollowStatus] = useState<Record<string, boolean>>({});
  const [postReactions, setPostReactions] = useState<Record<string, { likes: number; dislikes: number; userReaction: number | null }>>({});
  const [postComments, setPostComments] = useState<Record<string, any[]>>({});
  const [commentsLoading, setCommentsLoading] = useState<Record<string, boolean>>({});
  const [engagementLoading, setEngagementLoading] = useState<Record<string, { follow?: boolean; reaction?: boolean; comment?: boolean }>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [viewedPosts, setViewedPosts] = useState<Set<string>>(new Set());

  const formatTimeAgo = (value: unknown) => {
    const date = value ? new Date(value as any) : null;
    if (!date || Number.isNaN(date.getTime())) return "";
    const diffMs = Date.now() - date.getTime();
    const diffSec = Math.max(0, Math.floor(diffMs / 1000));
    if (diffSec < 10) return "now";
    if (diffSec < 60) return `${diffSec}s`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay}d`;
  };

  const [showIdConsole, setShowIdConsole] = useState(false);
  const [showStore, setShowStore] = useState(false);
  const [isStoreAnimating, setIsStoreAnimating] = useState(false);
  const [cardRotateX, setCardRotateX] = useState(0);
  const [cardRotateY, setCardRotateY] = useState(0);
  const [cardShineX, setCardShineX] = useState(50);
  const [cardShineY, setCardShineY] = useState(50);
  const [isUpgradingStore, setIsUpgradingStore] = useState(false);
  const [showPointsGuide, setShowPointsGuide] = useState(false);
  const [copiedInviteLink, setCopiedInviteLink] = useState(false);
  const [localPointsOverride, setLocalPointsOverride] = useState<number | null>(null);
  const [localBlueTickOverride, setLocalBlueTickOverride] = useState<string | null>(null);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const [transactionNotification, setTransactionNotification] = useState<{
    show: boolean;
    type: "credit" | "debit";
    amount: number;
    title: string;
    message: string;
    txHash: string;
  } | null>(null);
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [isDowngrading, setIsDowngrading] = useState(false);
  const [storeError, setStoreError] = useState<string | null>(null);
  const [storeSuccessMsg, setStoreSuccessMsg] = useState<string | null>(null);
  const [isConsoleClosing, setIsConsoleClosing] = useState(false);
  const [idConsoleTab, setIdConsoleTab] = useState<"my" | "global">("my");
  const [postAudience, setPostAudience] = useState<"GLOBAL" | "FOLLOWERS" | "FRIENDS" | "ALL">("GLOBAL");
  const [postTextDraft, setPostTextDraft] = useState("");
  const [postMediaFile, setPostMediaFile] = useState<File | null>(null);
  const [postMediaKind, setPostMediaKind] = useState<"image" | "video" | null>(null);
  const [idConsoleUploadProgress, setIdConsoleUploadProgress] = useState<number | null>(null);
  const [idConsoleLocalPreviewUrl, setIdConsoleLocalPreviewUrl] = useState<string | null>(null);
  const [idConsolePosts, setIdConsolePosts] = useState<any[] | null>(null);
  const [idConsolePostsLoading, setIdConsolePostsLoading] = useState(false);
  const [idConsolePostsError, setIdConsolePostsError] = useState<string | null>(null);
  const [showConsoleLoadingDelayed, setShowConsoleLoadingDelayed] = useState(false);
  const [postingIdConsole, setPostingIdConsole] = useState(false);
  const [idConsolePostStatus, setIdConsolePostStatus] = useState<string | null>(null);

  // Founder Grant State
  const [founderGrantTarget, setFounderGrantTarget] = useState<string | null>(null);
  const [founderGrantAmount, setFounderGrantAmount] = useState("");
  const [isFounderGrantModalOpen, setIsFounderGrantModalOpen] = useState(false);
  const [isFounderGrantLoading, setIsFounderGrantLoading] = useState(false);
  const [founderGrantError, setFounderGrantError] = useState<string | null>(null);

  // Followers state
  const [followers, setFollowers] = useState<any[]>([]);
  const [followersLoading, setFollowersLoading] = useState(false);
  const [followersError, setFollowersError] = useState<string | null>(null);

  // Console post engagement state
  const [consolePostComments, setConsolePostComments] = useState<Record<string, any[]>>({});
  const [consoleCommentsLoading, setConsoleCommentsLoading] = useState<Record<string, boolean>>({});
  const [consoleCommentInputs, setConsoleCommentInputs] = useState<Record<string, string>>({});
  const [consoleOpenCommentsPostId, setConsoleOpenCommentsPostId] = useState<string | null>(null);

  const [showGuide, setShowGuide] = useState(false);
  const [guideStep, setGuideStep] = useState(0);

  // Chat state
  const [chatFull, setChatFull] = useState(false);
  const [friendIdInput, setFriendIdInput] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [foundUser, setFoundUser] = useState<FoundUser | null>(null);

  // Presence + typing state for active peer
  const [peerOnline, setPeerOnline] = useState<boolean | null>(null);
  const [peerTyping, setPeerTyping] = useState(false);
  const [peerLastSeen, setPeerLastSeen] = useState<Date | null>(null);
  const [showOfflineTransitionName, setShowOfflineTransitionName] = useState(false);
  const lastOnlineRef = useRef<boolean | null>(null);
  const [canUseDom, setCanUseDom] = useState(false);

  // Initialize canUseDom flag
  useEffect(() => {
    setCanUseDom(true);
  }, []);

  // Secure Message Sharing: Handle shared message links on mount/auth
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (status !== "authenticated") return;

    const urlParams = new URLSearchParams(window.location.search);
    const chatParam = urlParams.get("chat");
    const messageIdParam = urlParams.get("messageId");

    if (chatParam) {
      openChatWithPeer(chatParam);
      if (messageIdParam) {
        setHighlightedMessageId(messageIdParam);
        // Clear query parameters from URL so refreshes don't re-trigger
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, [status]);

  // Secure Message Sharing: Handle scrolling and highlighting for shared message
  useEffect(() => {
    if (!highlightedMessageId || chatMessages.length === 0) return;

    const hasMessage = chatMessages.some((m) => m.id === highlightedMessageId);
    if (!hasMessage) return;

    const timer = setTimeout(() => {
      const targetEl = document.querySelector(`[data-message-id="${highlightedMessageId}"]`);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
        
        // Clear highlight state after 3 seconds
        const clearTimer = setTimeout(() => {
          setHighlightedMessageId(null);
        }, 3000);
        return () => clearTimeout(clearTimer);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [chatMessages, highlightedMessageId]);

  // Quantum Referral Tracking core Algorithm
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (status !== 'authenticated') return; // Wait until referee is logged in
    const urlParams = new URLSearchParams(window.location.search);
    const refHandle = urlParams.get('ref');
    if (!refHandle) return;

    // Prevent self-referrals
    const myHandle = (session?.user as any)?.handle;
    if (myHandle && myHandle === refHandle) return;

    // Prevention of double claims via localStorage (Fast browser-side check)
    const cacheKey = `qlink_claimed_referral_${refHandle}`;
    if (localStorage.getItem(cacheKey) === 'true') return;

    const claimReferralClick = async () => {
      try {
        const res = await fetch('/api/referral/click', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ referrerHandle: refHandle })
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem(cacheKey, 'true');
          setTransactionNotification({
            show: true,
            type: 'credit',
            amount: 5,
            title: 'Quantum Referral Verified',
            message: `You helped @${refHandle} earn +5 Quantum Points! Welcome to Q-Link.`,
            txHash: 'REF-' + Math.random().toString(36).substring(2, 10).toUpperCase()
          });
          setTimeout(() => {
            setTransactionNotification(prev => prev ? { ...prev, show: false } : null);
          }, 3500);
        } else if (data.error && (data.error.includes('already claimed') || data.error.includes('Self-referral'))) {
          // Sync client storage if server confirms the click is invalid/spent
          localStorage.setItem(cacheKey, 'true');
        }
      } catch (err) {
        console.error('Failed to register referral click:', err);
      }
    };

    claimReferralClick();
  }, [session?.user, status]);

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    setCardRotateY((x - xc) / (rect.width / 12)); // Max 15 degrees
    setCardRotateX(-(y - yc) / (rect.height / 12)); // Max 15 degrees
    setCardShineX((x / rect.width) * 100);
    setCardShineY((y / rect.height) * 100);
  };

  const handleCardMouseLeave = () => {
    setCardRotateX(0);
    setCardRotateY(0);
    setCardShineX(50);
    setCardShineY(50);
  };

  // Keep our own presence "online" while the app is open
  useEffect(() => {
    let stopped = false;

    const sendPing = async () => {
      try {
        await fetch("/api/presence/ping", { method: "POST" });
      } catch {
        // ignore presence ping errors
      }

      if (!stopped) {
        // refresh roughly every 20 seconds
        setTimeout(sendPing, 20_000);
      }
    };

    sendPing();

    return () => {
      stopped = true;
    };
  }, []);

  // Ultra-smooth momentum scroll physics with spring damping
  // DISABLED: This was causing random scrolling issues
  // useEffect(() => {
  //   const mainContainer = document.getElementById('main-scroll-container');
  //   if (!mainContainer) return;

  //   let isScrolling = false;
  //   let scrollVelocity = 0;
  //   let lastScrollY = 0;
  //   let lastTimestamp = 0;
  //   let animationFrameId: number | null = null;

  //   const handleScroll = () => {
  //     const currentScrollY = mainContainer.scrollTop;
  //     const currentTimestamp = performance.now();

  //     if (lastTimestamp > 0) {
  //       const deltaTime = currentTimestamp - lastTimestamp;
  //       const deltaY = currentScrollY - lastScrollY;
  //       scrollVelocity = deltaY / deltaTime;
  //     }

  //     lastScrollY = currentScrollY;
  //     lastTimestamp = currentTimestamp;
  //     isScrolling = true;

  //     // Clear previous timeout
  //     if (animationFrameId !== null) {
  //       cancelAnimationFrame(animationFrameId);
  //     }

  //     // Reset scrolling state after momentum stops
  //     animationFrameId = requestAnimationFrame(() => {
  //       setTimeout(() => {
  //         isScrolling = false;
  //         scrollVelocity = 0;
  //       }, 150);
  //     });
  //   };

  //   // Spring physics for overscroll
  //   const handleTouchStart = (e: TouchEvent) => {
  //     lastScrollY = mainContainer.scrollTop;
  //     lastTimestamp = performance.now();
  //     scrollVelocity = 0;
  //   };

  //   const handleTouchMove = (e: TouchEvent) => {
  //     const currentScrollY = mainContainer.scrollTop;
  //     const currentTimestamp = performance.now();
  //     const deltaTime = currentTimestamp - lastTimestamp;

  //     if (deltaTime > 0) {
  //       scrollVelocity = (currentScrollY - lastScrollY) / deltaTime;
  //     }

  //     lastScrollY = currentScrollY;
  //     lastTimestamp = currentTimestamp;
  //   };

  //   const handleTouchEnd = () => {
  //     if (Math.abs(scrollVelocity) > 0.5) {
  //       // Apply momentum
  //       const momentumScroll = () => {
  //         if (Math.abs(scrollVelocity) < 0.1) {
  //           scrollVelocity = 0;
  //           return;
  //         }

  //         scrollVelocity *= 0.95; // Damping factor
  //         mainContainer.scrollTop += scrollVelocity * 16;

  //         animationFrameId = requestAnimationFrame(momentumScroll);
  //       };

  //       animationFrameId = requestAnimationFrame(momentumScroll);
  //     }
  //   };

  //   mainContainer.addEventListener('scroll', handleScroll, { passive: true });
  //   mainContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
  //   mainContainer.addEventListener('touchmove', handleTouchMove, { passive: true });
  //   mainContainer.addEventListener('touchend', handleTouchEnd, { passive: true });

  //   return () => {
  //     mainContainer.removeEventListener('scroll', handleScroll);
  //     mainContainer.removeEventListener('touchstart', handleTouchStart);
  //     mainContainer.removeEventListener('touchmove', handleTouchMove);
  //     mainContainer.removeEventListener('touchend', handleTouchEnd);
  //     if (animationFrameId !== null) {
  //       cancelAnimationFrame(animationFrameId);
  //     }
  //   };
  // }, []);

  // Load presence for the currently active peer in full chat
  useEffect(() => {
    if (!activePeerHandle) {
      setPeerOnline(null);
      setPeerTyping(false);
      setPeerLastSeen(null);
      setShowOfflineTransitionName(false);
      lastOnlineRef.current = null;
      return;
    }

    let cancelled = false;
    let offlineTimeout: NodeJS.Timeout | null = null;

    const fetchPresence = async () => {
      try {
        const res = await fetch(
          `/api/presence/${encodeURIComponent(activePeerHandle)}`,
        );
        if (!res.ok) return;

        const data: {
          online?: boolean;
          lastSeenAt?: string | null;
          typing?: boolean;
        } = await res.json();

        if (cancelled) return;

        const prevOnline = lastOnlineRef.current;
        const nowOnline = Boolean(data.online);

        setPeerOnline(nowOnline);
        setPeerTyping(Boolean(data.typing));
        setPeerLastSeen(
          data.lastSeenAt ? new Date(data.lastSeenAt) : null,
        );

        // Handle the short "Chat with @handle" transition when they go offline
        if (prevOnline === null) {
          // first load for this peer
          lastOnlineRef.current = nowOnline;
          setShowOfflineTransitionName(!nowOnline);
        } else {
          if (prevOnline && !nowOnline) {
            setShowOfflineTransitionName(true);
            if (offlineTimeout) clearTimeout(offlineTimeout);
            offlineTimeout = setTimeout(() => {
              setShowOfflineTransitionName(false);
            }, 3_000);
          }
          lastOnlineRef.current = nowOnline;
        }
      } catch {
        // ignore presence read errors
      }
    };

    fetchPresence();
    const interval = setInterval(fetchPresence, 5_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
      if (offlineTimeout) clearTimeout(offlineTimeout);
    };
  }, [activePeerHandle]);

  const fetchIdConsolePosts = async () => {
    try {
      setIdConsolePostsLoading(true);
      setIdConsolePostsError(null);

      const res = await fetch("/api/posts");
      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any));
        const msg =
          typeof (err as any)?.error === "string"
            ? (err as any).error
            : `HTTP ${res.status}`;
        setIdConsolePostsError(`Failed to load posts (${msg})`);
        return;
      }

      const data: { posts?: any[] } = await res.json();
      const posts = Array.isArray(data.posts) ? data.posts : [];
      setIdConsolePosts(posts);

      // Prefetch images in background for instant display
      posts.forEach((post: any) => {
        if (post?.attachment?.url && typeof window !== 'undefined') {
          const img = document.createElement('img');
          img.src = post.attachment.url;
        }
        if (post?.author?.image && typeof window !== 'undefined') {
          const img = document.createElement('img');
          img.src = post.author.image;
        }
      });

      // Initialize reaction data for console posts
      if (session?.user) {
        const reactionPromises = posts.map(async (post: any) => {
          await fetchPostReaction(post.id);
        });
        await Promise.all(reactionPromises);
      }
    } catch {
      setIdConsolePostsError("Failed to load posts (network error)");
    } finally {
      setIdConsolePostsLoading(false);
    }
  };

  const fetchDirectoryLatestPosts = async () => {
    try {
      setDirectoryPostsLoading(true);
      setDirectoryPostsError(null);
      const postsRes = await fetch(
        `/api/posts?mode=directory_global_latest&perAuthor=3&t=${Date.now()}`,
        { cache: "no-store" },
      );
      if (!postsRes.ok) {
        const err = await postsRes.json().catch(() => ({} as any));
        const msg =
          typeof (err as any)?.error === "string"
            ? (err as any).error
            : `HTTP ${postsRes.status}`;
        setDirectoryPostsError(`Unable to load global posts (${msg}).`);
        return;
      }
      const postsData: { posts?: any[] } = await postsRes.json();
      const byAuthorId: Record<string, any[]> = {};
      const posts = Array.isArray(postsData.posts) ? postsData.posts : [];

      for (const p of posts) {
        if (!p?.authorId) continue;
        const arr = byAuthorId[p.authorId] || [];
        if (arr.length >= 3) continue;
        arr.push(p);
        byAuthorId[p.authorId] = arr;
      }
      setDirectoryLatestPostsByAuthorId(byAuthorId);

      // Prefetch post attachment images during animation for instant display
      posts.forEach((post: any) => {
        if (post?.attachment?.url && typeof window !== 'undefined') {
          const img = document.createElement('img');
          img.src = post.attachment.url;
        }
      });
    } catch {
      setDirectoryPostsError("Unable to load global posts (network error).");
    } finally {
      setDirectoryPostsLoading(false);
    }
  };

  // Fetch followers for current user
  const fetchFollowers = async () => {
    if (!(session?.user as any)?.id) return;
    
    try {
      setFollowersLoading(true);
      setFollowersError(null);
      
      const res = await fetch('/api/followers');
      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any));
        const msg = typeof (err as any)?.error === "string" ? (err as any).error : `HTTP ${res.status}`;
        setFollowersError(`Failed to load followers (${msg})`);
        return;
      }
      
      const data = await res.json();
      setFollowers(data.followers || []);
    } catch (error) {
      setFollowersError("Failed to load followers (network error)");
    } finally {
      setFollowersLoading(false);
    }
  };

  const handleStoreUpgrade = async () => {
    if (!(session?.user as any)?.id || isUpgradingStore) return;
    setIsUpgradingStore(true);
    setStoreError(null);
    setStoreSuccessMsg(null);
    
    const currentPoints = localPointsOverride !== null ? localPointsOverride : ((session?.user as any)?.points || 0);
    
    try {
      const res = await fetch('/api/store/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: (session?.user as any)?.id })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upgrade');
      }
      
      // 1. Silent Local State Update (0ms lag!)
      setLocalPointsOverride(Math.max(0, currentPoints - 50));
      setLocalBlueTickOverride('SAPPHIRE');
      loadDirectoryData(true);
      
      // 2. Trigger Bank-like Celestial Receipt popup
      setTransactionNotification({
        show: true,
        type: 'debit',
        amount: 50,
        title: 'Upgrade Successful',
        message: 'Sapphire VIP Upgraded. Celestial deep-cobalt theme activated!',
        txHash: 'TX-' + Math.random().toString(36).substring(2, 10).toUpperCase()
      });
      
      // 3. Silent background session token refresh safely
      if (typeof updateSession === 'function') {
        try {
          updateSession();
        } catch (e) {
          console.error("NextAuth updateSession failed:", e);
        }
      }
      
      // Auto-hide popup receipt after 3.5 seconds
      setTimeout(() => {
        setTransactionNotification(prev => prev ? { ...prev, show: false } : null);
      }, 3500);

    } catch (err: any) {
      setStoreError(err.message || 'Failed to complete upgrade.');
    } finally {
      setIsUpgradingStore(false);
    }
  };

  const handleStoreDowngrade = async () => {
    if (!(session?.user as any)?.id || isDowngrading) return;
    setIsDowngrading(true);
    setStoreError(null);
    setStoreSuccessMsg(null);
    try {
      const res = await fetch('/api/store/downgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: (session?.user as any)?.id })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to downgrade');
      }

      // 1. Instantly reset local VIP status locally (0ms lag!)
      setLocalBlueTickOverride('NONE');
      loadDirectoryData(true);

      // 2. Trigger Reverted Ledger popup (styled as a debit)
      setTransactionNotification({
        show: true,
        type: 'debit',
        amount: 0,
        title: 'Status Revoked',
        message: 'Sapphire VIP status revoked. Reverted back to standard network user.',
        txHash: 'TX-' + Math.random().toString(36).substring(2, 10).toUpperCase()
      });

      // 3. Silent background session token refresh safely
      if (typeof updateSession === 'function') {
        try {
          updateSession();
        } catch (e) {
          console.error("NextAuth updateSession failed:", e);
        }
      }

      // 4. Close the downgrade confirmation modal
      setShowDowngradeModal(false);

      // Auto-hide popup receipt after 3.5 seconds
      setTimeout(() => {
        setTransactionNotification(prev => prev ? { ...prev, show: false } : null);
      }, 3500);

    } catch (err: any) {
      setStoreError(err.message || 'Failed to complete downgrade.');
    } finally {
      setIsDowngrading(false);
    }
  };

  // Engagement functions
  const handleFollow = async (userId: string) => {
    if (!(session?.user as any)?.id || engagementLoading[userId]?.follow) return;
    
    // Debug logging
    console.log('handleFollow called with:', { 
      targetUserId: userId, 
      currentUserId: (session?.user as any)?.id,
      areSame: userId === (session?.user as any)?.id,
      sessionUser: session?.user,
      targetUserType: typeof userId,
      currentUserType: typeof (session?.user as any)?.id
    });
    
    // Prevent self-follow
    if (userId === (session?.user as any)?.id) {
      console.log('Self-follow prevented');
      return;
    }
    
    try {
      setEngagementLoading(prev => ({ ...prev, [userId]: { ...prev[userId], follow: true } }));
      
      const isCurrentlyFollowing = followStatus[userId];
      
      if (isCurrentlyFollowing) {
        // Unfollow
        const res = await fetch(`/api/follow?followingId=${encodeURIComponent(userId)}`, {
          method: 'DELETE',
        });
        
        if (res.ok) {
          setFollowStatus(prev => ({ ...prev, [userId]: false }));
        } else {
          const data = await res.json().catch(() => ({}));
          console.error('Unfollow error:', data.error);
        }
      } else {
        // Follow
        const res = await fetch('/api/follow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ followingId: userId }),
        });
        
        if (res.ok) {
          setFollowStatus(prev => ({ ...prev, [userId]: true }));
          fetchFollowers();
        } else {
          const data = await res.json().catch(() => ({}));
          console.error('Follow error:', data.error);
        }
      }
    } catch (error) {
      console.error('Follow/unfollow error:', error);
    } finally {
      setEngagementLoading(prev => ({ ...prev, [userId]: { ...prev[userId], follow: false } }));
    }
  };

  const handleReaction = async (postId: string, value: number) => {
    if (!(session?.user as any)?.id || engagementLoading[postId]?.reaction) return;
    
    try {
      setEngagementLoading(prev => ({ ...prev, [postId]: { ...prev[postId], reaction: true } }));
      
      const currentReaction = postReactions[postId]?.userReaction;
      let action = 'created';
      
      // Optimistic update
      if (currentReaction === value) {
        // Remove reaction
        setPostReactions(prev => ({
          ...prev,
          [postId]: {
            ...prev[postId],
            likes: prev[postId]?.likes - (value === 1 ? 1 : 0) || 0,
            dislikes: prev[postId]?.dislikes - (value === -1 ? 1 : 0) || 0,
            userReaction: null,
          }
        }));
        action = 'removed';
      } else {
        // Change or add reaction
        setPostReactions(prev => {
          const current = prev[postId] || { likes: 0, dislikes: 0, userReaction: null };
          const newLikes = current.likes + (value === 1 ? 1 : 0) - (current.userReaction === 1 ? 1 : 0);
          const newDislikes = current.dislikes + (value === -1 ? 1 : 0) - (current.userReaction === -1 ? 1 : 0);
          
          return {
            ...prev,
            [postId]: {
              likes: Math.max(0, newLikes),
              dislikes: Math.max(0, newDislikes),
              userReaction: value,
            }
          };
        });
        action = currentReaction ? 'updated' : 'created';
      }
      
      const res = await fetch('/api/posts/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, value }),
      });
      
      if (!res.ok) {
        // Revert optimistic update on error
        const data = await res.json().catch(() => ({}));
        console.error('Reaction error:', data.error);
        
        // Revert by refetching
        await fetchPostReaction(postId);
      }
    } catch (error) {
      console.error('Reaction error:', error);
      // Revert on error
      await fetchPostReaction(postId);
    } finally {
      setEngagementLoading(prev => ({ ...prev, [postId]: { ...prev[postId], reaction: false } }));
    }
  };

  const fetchPostReaction = async (postId: string) => {
    if (!postId) {
      console.warn('[fetchPostReaction] Invalid postId');
      return;
    }
    try {
      const res = await fetch(`/api/posts/reactions?postId=${encodeURIComponent(postId)}`);
      if (res.ok) {
        const data = await res.json();
        setPostReactions(prev => ({
          ...prev,
          [postId]: {
            likes: data.likes || 0,
            dislikes: data.dislikes || 0,
            userReaction: data.userReaction?.value || null,
          }
        }));
      } else if (res.status !== 404) {
        console.warn('[fetchPostReaction] Failed:', postId, res.status);
      }
    } catch (error) {
      console.error('[fetchPostReaction] Error:', postId, error);
    }
  };

  const fetchComments = async (postId: string) => {
    if (!(session?.user as any)?.id || commentsLoading[postId]) return;
    
    try {
      setCommentsLoading(prev => ({ ...prev, [postId]: true }));
      
      const res = await fetch(`/api/posts/comments?postId=${encodeURIComponent(postId)}`);
      if (res.ok) {
        const data = await res.json();
        setPostComments(prev => ({ ...prev, [postId]: data.comments }));
      } else {
        const data = await res.json().catch(() => ({}));
        console.error('Fetch comments error:', data.error);
      }
    } catch (error) {
      console.error('Fetch comments error:', error);
    } finally {
      setCommentsLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleAddComment = async (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!(session?.user as any)?.id || !text || engagementLoading[postId]?.comment) return;
    
    try {
      setEngagementLoading(prev => ({ ...prev, [postId]: { ...prev[postId], comment: true } }));
      
      const res = await fetch('/api/posts/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, text }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setPostComments(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), data.comment]
        }));
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
        
        // Update comment count
        setPostReactions(prev => ({
          ...prev,
          [postId]: {
            ...prev[postId],
            likes: prev[postId]?.likes || 0,
            dislikes: prev[postId]?.dislikes || 0,
            userReaction: prev[postId]?.userReaction || null,
          }
        }));
      } else {
        const data = await res.json().catch(() => ({}));
        console.error('Add comment error:', data.error);
      }
    } catch (error) {
      console.error('Add comment error:', error);
    } finally {
      setEngagementLoading(prev => ({ ...prev, [postId]: { ...prev[postId], comment: false } }));
    }
  };

  // Initialize engagement data when directory loads
  const initializeEngagementData = async (directoryItems: any[]) => {
    if (!(session?.user as any)?.id) return;
    if (!Array.isArray(directoryItems) || directoryItems.length === 0) return;
    
    const userIds = [...new Set(directoryItems.map(item => item.id).filter(Boolean))];
    const postIds = directoryItems.flatMap(item => item.posts?.map((post: any) => post.id).filter(Boolean) || []);
    
    console.log('[initializeEngagementData] Processing:', { userCount: userIds.length, postCount: postIds.length });
    
    // Fetch follow status for all users
    const followPromises = userIds.map(async (userId) => {
      try {
        const res = await fetch(`/api/follow?followingId=${encodeURIComponent(userId)}`);
        if (res.ok) {
          const data = await res.json();
          setFollowStatus(prev => ({ ...prev, [userId]: data.isFollowing }));
        } else {
          console.warn('[initializeEngagementData] Follow fetch failed:', userId, res.status);
        }
      } catch (error) {
        console.error('[initializeEngagementData] Follow error:', userId, error);
      }
    });
    
    // Fetch reaction data for all posts
    const reactionPromises = postIds.map(async (postId) => {
      try {
        await fetchPostReaction(postId);
      } catch (error) {
        console.error('[initializeEngagementData] Reaction error:', postId, error);
      }
    });
    
    await Promise.all([...followPromises, ...reactionPromises]);
    console.log('[initializeEngagementData] Complete');
  };

  // Console post engagement functions
  const trackPostView = async (postId: string) => {
    if (!(session?.user as any)?.id || viewedPosts.has(postId)) return;
    
    try {
      await fetch('/api/posts/views', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      });
      
      setViewedPosts(prev => new Set([...prev, postId]));
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const fetchConsolePostComments = async (postId: string) => {
    if (!(session?.user as any)?.id || consoleCommentsLoading[postId]) return;
    
    try {
      setConsoleCommentsLoading(prev => ({ ...prev, [postId]: true }));
      
      const res = await fetch(`/api/posts/comments?postId=${encodeURIComponent(postId)}`);
      if (res.ok) {
        const data = await res.json();
        setConsolePostComments(prev => ({ ...prev, [postId]: data.comments }));
      } else {
        const data = await res.json().catch(() => ({}));
        console.error('Fetch console comments error:', data.error);
      }
    } catch (error) {
      console.error('Fetch console comments error:', error);
    } finally {
      setConsoleCommentsLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleConsoleAddComment = async (postId: string) => {
    const text = consoleCommentInputs[postId]?.trim();
    if (!(session?.user as any)?.id || !text || engagementLoading[postId]?.comment) return;
    
    try {
      setEngagementLoading(prev => ({ ...prev, [postId]: { ...prev[postId], comment: true } }));
      
      const res = await fetch('/api/posts/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, text }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setConsolePostComments(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), data.comment]
        }));
        setConsoleCommentInputs(prev => ({ ...prev, [postId]: '' }));
      } else {
        const data = await res.json().catch(() => ({}));
        console.error('Add console comment error:', data.error);
      }
    } catch (error) {
      console.error('Add console comment error:', error);
    } finally {
      setEngagementLoading(prev => ({ ...prev, [postId]: { ...prev[postId], comment: false } }));
    }
  };

  useEffect(() => {
    if (!showIdConsole) return;
    fetchIdConsolePosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showIdConsole, idConsoleTab]);

  // Preload console data immediately when session is ready (no delay)
  useEffect(() => {
    if (!session?.user) return;
    fetchIdConsolePosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  // Initialize E2E Encryption Keys on login
  useEffect(() => {
    if (!effectiveSession?.user) return;

    const setupE2EKeys = async () => {
      try {
        const serverPublicKey = (effectiveSession.user as any).publicKeyString;
        const serverEncryptedPrivateKey = (effectiveSession.user as any).encryptedPrivateKey;
        const masterSeed = (effectiveSession.user as any).e2eMasterSeed;

        const { initE2EKeys, backupPrivateKey } = await import("@/lib/e2e-crypto");
        const publicKeyString = await initE2EKeys(
          serverEncryptedPrivateKey,
          serverPublicKey,
          masterSeed
        );
        
        if (!publicKeyString) return;

        // Determine if we need to upload a backup or update keys
        const needsPublicKeyUpload = !serverPublicKey || serverPublicKey !== publicKeyString;
        const needsBackupUpload = !serverEncryptedPrivateKey && !!masterSeed;

        if (needsPublicKeyUpload || needsBackupUpload) {
          console.log("[E2E] Syncing keys with the server...");
          
          let encryptedPrivateKey: string | undefined = undefined;
          if (masterSeed) {
            // Attempt to generate a backup of the private key
            const backupStr = await backupPrivateKey(masterSeed);
            if (backupStr) {
              encryptedPrivateKey = backupStr;
            }
          }

          // Only upload if we have a new public key or if we successfully created a backup
          if (needsPublicKeyUpload || encryptedPrivateKey) {
            const res = await fetch("/api/user/public-key", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ 
                publicKeyString,
                ...(encryptedPrivateKey ? { encryptedPrivateKey } : {})
              }),
            });
            if (res.ok) {
              console.log("[E2E] Keys successfully synced/backed up to the server.");
              if (typeof updateSession === "function") {
                updateSession();
              }
            } else {
              console.warn("[E2E] Failed to sync keys:", res.statusText);
            }
          }
        } else {
          console.log("[E2E] E2E keys and backups are in sync with the server.");
        }
      } catch (err) {
        console.error("[E2E] Setup error:", err);
      }
    };

    setupE2EKeys();
  }, [effectiveSession?.user, updateSession]);

  // Delayed loading indicator - only show "Loading..." after 300ms to prevent flash
  useEffect(() => {
    if (!idConsolePostsLoading) {
      setShowConsoleLoadingDelayed(false);
      return;
    }
    const timer = setTimeout(() => {
      setShowConsoleLoadingDelayed(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [idConsolePostsLoading]);

  const handleIdConsolePost = async () => {
    if (postingIdConsole) return;

    const text = postTextDraft.trim();
    if (!text && !postMediaFile) {
      setIdConsolePostStatus("Write something or attach media.");
      return;
    }

    try {
      setPostingIdConsole(true);
      setIdConsolePostStatus(null);
      setIdConsoleUploadProgress(null);

      let attachmentId: string | null = null;
      let attachmentKind: "image" | "video" | null = null;

      if (postMediaFile && postMediaKind) {
        const maxBytes = postMediaKind === "video" ? 45 * 1024 * 1024 : 3 * 1024 * 1024;
        if (postMediaFile.size > maxBytes) {
          setIdConsolePostStatus(
            postMediaKind === "video"
              ? "Video too large (max 45MB)."
              : "Image too large (max 3MB).",
          );
          return;
        }

        setIdConsolePostStatus("Preparing upload…");
        const signRes = await fetch("/api/posts/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requestSignedUrl: true,
            kind: postMediaKind,
            filename: postMediaFile.name,
            mimeType: postMediaFile.type || "application/octet-stream",
            size: postMediaFile.size,
          }),
        });

        if (!signRes.ok) {
          const err = await signRes.json().catch(() => ({}));
          setIdConsolePostStatus(err?.error || "Preparation failed");
          return;
        }

        const signData = await signRes.json();
        const { signedUrl, attachment } = signData;

        setIdConsolePostStatus("Uploading…");
        const directUploadSuccess = await new Promise<boolean>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", signedUrl);
          xhr.setRequestHeader("Content-Type", postMediaFile.type || "application/octet-stream");
          xhr.upload.onprogress = (e) => {
            if (!e.lengthComputable) return;
            const pct = Math.max(0, Math.min(100, Math.round((e.loaded / e.total) * 100)));
            setIdConsoleUploadProgress(pct);
          };
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(true);
            } else {
              reject(new Error("Direct upload failed"));
            }
          };
          xhr.onerror = () => reject(new Error("Direct upload failed"));
          xhr.send(postMediaFile);
        }).catch((e) => {
          setIdConsolePostStatus(e?.message || "Upload failed");
          return null;
        });

        if (!directUploadSuccess) return;

        attachmentId = attachment?.id || null;
        attachmentKind = attachment?.kind === "video" ? "video" : "image";
      }

      setIdConsolePostStatus("Posting…");
      const createRes = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text || null,
          audience: postAudience,
          attachmentId,
          attachmentKind,
        }),
      });

      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}));
        setIdConsolePostStatus(err?.error || "Failed to post");
        return;
      }

      setPostTextDraft("");
      setPostMediaFile(null);
      setPostMediaKind(null);
      setIdConsoleUploadProgress(null);
      if (idConsoleLocalPreviewUrl) {
        try {
          URL.revokeObjectURL(idConsoleLocalPreviewUrl);
        } catch {
          // ignore
        }
      }
      setIdConsoleLocalPreviewUrl(null);
      setIdConsolePostStatus("Posted.");
      await fetchIdConsolePosts();
      if (postAudience === "GLOBAL" || postAudience === "ALL") {
        await fetchDirectoryLatestPosts();
      }
    } catch {
      setIdConsolePostStatus("Failed to post");
    } finally {
      setPostingIdConsole(false);
    }
  };

  const allCategories = [
    "Co-Founder",
    "Brother",
    "C.E.O",
    "Founder",
    "Millionaire",
    "Billionaire",
  ];

  const extendedCategories = [
    "Father",
    "Mother",
    "Brother",
    "Sister",
    "Husband",
    "Wife",
    "Son",
    "Daughter",
    "Grandfather",
    "Grandmother",
    "Uncle",
    "Aunt",
    "Cousin Brother",
    "Cousin Sister",
    "Nephew",
    "Niece",
    "Father-in-law",
    "Mother-in-law",
    "Brother-in-law",
    "Sister-in-law",
    "Son-in-law",
    "Daughter-in-law",
    "Fiancé",
    "Fiancée",
    "Boyfriend",
    "Girlfriend",
    "Partner",
    "Life Partner",
    "Romantic Partner",
    "Crush",
    "Love Interest",
    "Ex-Husband",
    "Ex-Wife",
    "Ex-Boyfriend",
    "Ex-Girlfriend",
    "Friend",
    "Best Friend",
    "Close Friend",
    "Childhood Friend",
    "School Friend",
    "College Friend",
    "Online Friend",
    "Guardian",
    "Caretaker",
    "Foster Parent",
    "Foster Child",
    "Adoptive Father",
    "Adoptive Mother",
    "Adopted Son",
    "Adopted Daughter",
    "Boss",
    "Manager",
    "Employee",
    "Colleague",
    "Team Member",
    "Client",
    "Customer",
    "Business Partner",
    "Co-Founder",
    "Investor",
    "Mentor",
    "Advisor",
    "Neighbor",
    "Acquaintance",
    "Stranger",
    "Enemy",
    "Rival",
    "Ex-Friend",
    "Follower",
    "Subscriber",
    "Community Member",
  ];

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const [comment, setComment] = useState("");
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [sendingRequest, setSendingRequest] = useState(false);

  const [authTakingLong, setAuthTakingLong] = useState(false);

  // Debug: track settings visibility
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("[Settings] showSettings changed:", showSettings);
    if (!showSettings) {
      // Reset animation state after animation completes
      setTimeout(() => setIsSettingsAnimating(false), 400);
    }
  }, [showSettings]);

  // Reset console animation state
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("[Console] showDirectory changed:", showDirectory, "isConsoleAnimating:", isConsoleAnimating);
    if (!showDirectory) {
      // Reset animation state after exit animation completes (600ms)
      setTimeout(() => setIsConsoleAnimating(false), 600);
    }
  }, [showDirectory]);

  // Reset VIP Terms animation state
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("[VIP Terms] showVipTerms changed:", showVipTerms);
    if (!showVipTerms) {
      // Reset animation state after animation completes
      setTimeout(() => setIsVipTermsAnimating(false), 400);
    }
  }, [showVipTerms]);

  useEffect(() => {
    setCanUseDom(true);
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("qc_email_visibility");
      if (stored === "public" || stored === "private") {
        setEmailVisibility(stored);
      }

      const storedAge = localStorage.getItem("qc_age_visibility");
      if (storedAge === "public" || storedAge === "private") {
        setAgeVisibility(storedAge);
      }

      const storedGender = localStorage.getItem("qc_gender_visibility");
      if (storedGender === "public" || storedGender === "private") {
        setGenderVisibility(storedGender);
      }

      const storedBio = localStorage.getItem("qc_bio_visibility");
      if (storedBio === "public" || storedBio === "private") {
        setBioVisibility(storedBio);
      }

      const storedInterests = localStorage.getItem("qc_interests_visibility");
      if (storedInterests === "public" || storedInterests === "private") {
        setInterestsVisibility(storedInterests);
      }
    } catch {
      // ignore storage read issues
    }
  }, []);

  // Aura color function
  const getAuraColor = (percentage: number) => {
    if (percentage === 0) return 'text-gray-400';
    if (percentage === 50) return 'text-orange-400';
    if (percentage === 100) return 'text-orange-300';
    if (percentage === 1000) return 'text-green-400';
    if (percentage === 10500) return 'text-red-400';
    if (percentage === 999999) return 'text-red-600';
    // Handle ranges for other values
    if (percentage > 0 && percentage < 50) return 'text-gray-300';
    if (percentage > 50 && percentage < 100) return 'text-orange-400';
    if (percentage > 100 && percentage < 1000) return 'text-orange-300';
    if (percentage > 1000 && percentage < 10500) return 'text-green-400';
    if (percentage > 10500 && percentage < 999999) return 'text-red-400';
    return 'text-gray-400';
  };

  useEffect(() => {
    try {
      localStorage.setItem("qc_email_visibility", emailVisibility);
      localStorage.setItem("qc_age_visibility", ageVisibility);
      localStorage.setItem("qc_gender_visibility", genderVisibility);
      localStorage.setItem("qc_bio_visibility", bioVisibility);
      localStorage.setItem("qc_interests_visibility", interestsVisibility);
    } catch {
      // ignore storage write issues
    }
  }, [emailVisibility, ageVisibility, genderVisibility, bioVisibility, interestsVisibility]);

  // Attachments: quick menu + upload status
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isHoveringAttach, setIsHoveringAttach] = useState(false);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  // Image preview + cropping before upload (for image attachments)
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [pendingImagePreviewUrl, setPendingImagePreviewUrl] = useState<string | null>(null);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any | null>(null);

  // Message Context Menu state & touch long-press tracking
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    messageId: string;
    isMe: boolean;
    content: string;
  } | null>(null);
  const touchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartedRef = useRef<boolean>(false);

  // Message Multi-Selection states
  const [isSelectionMode, setIsSelectionMode] = useState<boolean>(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState<Set<string>>(new Set());

  const prevPendingImageUrlRef = useRef<string | null>(null);
  const prevPeerHandleRef = useRef<string | null>(null);

  // Auto-scroll chat panel to bottom
  const scrollToBottom = () => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    const el = chatScrollRef.current;
    if (!el) return;

    const isPeerChange = activePeerHandle !== prevPeerHandleRef.current;
    prevPeerHandleRef.current = activePeerHandle;

    const isImageTransition = pendingImagePreviewUrl && !prevPendingImageUrlRef.current;
    prevPendingImageUrlRef.current = pendingImagePreviewUrl;

    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;

    if (isPeerChange || isImageTransition || isNearBottom) {
      scrollToBottom();
      const timer = setTimeout(scrollToBottom, 60);
      return () => clearTimeout(timer);
    }
  }, [chatMessages, pendingImagePreviewUrl, activePeerHandle]);

  const handleAttachButtonClick = () => {
    if (!activePeerHandle || isUploadingAttachment) return;
    setAttachmentError(null);
    if (fileInputRef.current) {
      try {
        fileInputRef.current.value = "";
      } catch {}
      fileInputRef.current.click();
    }
  };

  const handleChooseAttachmentKind = (kind: "file" | "video" | "image_video") => {
    if (!activePeerHandle) return;
    const ref = kind === "video" ? videoInputRef : kind === "image_video" ? imageVideoInputRef : fileInputRef;
    if (ref.current) {
      try {
        ref.current.value = "";
      } catch {
        // ignore reset issues
      }
      ref.current.click();
    }
    setShowAttachMenu(false);
  };

  // High-Fidelity Voice Recording Helpers & Core Engine
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const startRecording = async () => {
    if (!activePeerHandle) return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Audio recording is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks: Blob[] = [];
      
      // Determine industry-standard mime-types based on platform support (Chrome/iOS compatibility)
      let options = {};
      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        options = { mimeType: "audio/webm;codecs=opus" };
      } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
        options = { mimeType: "audio/mp4" };
      }

      const recorder = new MediaRecorder(stream, options);
      
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      setAudioChunks([]);
      setRecordingDuration(0);
      setIsRecording(true);
      setMediaRecorder(recorder);

      recorder.start(250); // Capture chunk data every 250ms for performance safety

      const timer = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
      setRecordingTimer(timer);

      // Bind dynamic capture to stream chunk ref closure
      (recorder as any)._localChunks = chunks;

    } catch (err) {
      console.error("Microphone hardware error or permission denied:", err);
      alert("Could not access your microphone. Please enable microphone permissions in your browser's site settings.");
    }
  };

  const stopRecording = async (shouldSend: boolean) => {
    if (!mediaRecorder) return;

    if (recordingTimer) {
      clearInterval(recordingTimer);
      setRecordingTimer(null);
    }

    setIsRecording(false);

    const recorderWithChunks = mediaRecorder as any;
    const capturedChunks = recorderWithChunks._localChunks || [];

    mediaRecorder.onstop = async () => {
      // Release microphone hardware tracks immediately
      const stream = mediaRecorder.stream;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      if (!shouldSend) {
        setAudioChunks([]);
        setRecordingDuration(0);
        setMediaRecorder(null);
        return;
      }

      const mimeType = mediaRecorder.mimeType || "audio/webm";
      const audioBlob = new Blob(capturedChunks, { type: mimeType });
      
      if (audioBlob.size === 0) {
        alert("Audio clip was empty. Please record again.");
        setAudioChunks([]);
        setRecordingDuration(0);
        setMediaRecorder(null);
        return;
      }

      const fileExtension = mimeType.includes("mp4") ? "mp4" : "webm";
      const audioFile = new File(
        [audioBlob],
        `voice-message-${Date.now()}.${fileExtension}`,
        { type: mimeType }
      );

      setIsUploadingAttachment(true);
      setAttachmentError(null);

      try {
        const formData = new FormData();
        formData.append("file", audioFile);
        formData.append("kind", "file");
        formData.append("toHandle", activePeerHandle!);

        const res = await fetch("/api/attachments/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setAttachmentError(data.error || "Failed to upload voice message.");
          return;
        }

        if (data.message) {
          const fullMessage = {
            ...data.message,
            attachments: data.attachment
              ? [
                  {
                    ...data.attachment,
                    sizeBytes: String(data.attachment.size),
                  },
                ]
              : [],
          };
          setChatMessages((prev) => {
            if (prev.some((m) => m.id === fullMessage.id)) return prev;
            return [...prev, fullMessage as ChatMessage];
          });
          
          setTimeout(() => {
            if (chatScrollRef.current) {
              chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
            }
          }, 100);
        }
      } catch (uploadErr) {
        console.error("Voice message upload error:", uploadErr);
        setAttachmentError("Connection lost. Failed to send voice message.");
      } finally {
        setIsUploadingAttachment(false);
        setAudioChunks([]);
        setRecordingDuration(0);
        setMediaRecorder(null);
      }
    };

    mediaRecorder.stop();
  };

  const processSelectedFile = async (
    selected: File,
    kind: "file" | "video" | "image_video",
  ) => {
    if (!activePeerHandle) return;

    // Detect actual target upload kind based on selection
    let targetKind: "file" | "video" = "file";
    if (kind === "image_video") {
      if (selected.type.startsWith("image/")) {
        targetKind = "file"; // Treated as "file" to open the cropper
      } else if (selected.type.startsWith("video/")) {
        targetKind = "video"; // Uploads immediately as "video"
      }
    } else {
      targetKind = kind as "file" | "video";
    }

    // If this is an image and the user chose the generic File & image option or Images & Videos,
    // show a preview with Send / Edit instead of uploading immediately.
    if (targetKind === "file" && selected.type.startsWith("image/")) {
      if (pendingImagePreviewUrl) {
        try {
          URL.revokeObjectURL(pendingImagePreviewUrl);
        } catch {
          // ignore
        }
      }
      const url = URL.createObjectURL(selected);
      setPendingImageFile(selected);
      setPendingImagePreviewUrl(url);
      setIsEditingImage(false);
      setAttachmentError(null);
      setShowAttachMenu(false);
      return;
    }

    // Non-image files or videos: keep existing behaviour (immediate upload)
    const MAX_UPLOAD_LIMIT = 4.5 * 1024 * 1024; // 4.5MB Vercel limit
    if (selected.size > MAX_UPLOAD_LIMIT) {
      setAttachmentError(`File is too large (${(selected.size / (1024 * 1024)).toFixed(1)}MB). Vercel server limit is 4.5MB.`);
      return;
    }

    setIsUploadingAttachment(true);
    setAttachmentError(null);

    try {
      const formData = new FormData();
      formData.append("file", selected);
      formData.append("kind", targetKind);
      formData.append("toHandle", activePeerHandle);

      const res = await fetch("/api/attachments/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 413) {
          setAttachmentError("File is too large to upload. Vercel server limit is 4.5MB.");
          return;
        }
        setAttachmentError(data.error || "Unable to upload attachment.");
        return;
      }

      if (data.message) {
        const fullMessage = {
          ...data.message,
          attachments: data.attachment
            ? [
                {
                  ...data.attachment,
                  sizeBytes: String(data.attachment.size),
                },
              ]
            : [],
        };
        setChatMessages((prev) => {
          if (prev.some((m) => m.id === fullMessage.id)) return prev;
          return [...prev, fullMessage as ChatMessage];
        });
      }
    } catch {
      setAttachmentError("Unable to upload attachment. Please try again.");
    } finally {
      setIsUploadingAttachment(false);
    }
  };

  const handleAttachmentSelected = async (
    e: ChangeEvent<HTMLInputElement>,
    kind: "file" | "video" | "image_video",
  ) => {
    const selected = e.target.files?.[0];
    if (!selected || !activePeerHandle) return;

    await processSelectedFile(selected, kind);

    try {
      e.target.value = "";
    } catch {
      // ignore reset issues
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    if (!activePeerHandle) return;
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDraggingFile(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!activePeerHandle) return;
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current === 0) {
      setIsDraggingFile(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!activePeerHandle) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    if (!activePeerHandle) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
    dragCounterRef.current = 0;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      await processSelectedFile(file, "image_video");
    }
  };

  const handleSendPendingImage = async () => {
    if (!pendingImageFile || !activePeerHandle) return;

    setIsUploadingAttachment(true);
    setAttachmentError(null);

    try {
      const compressedFile = await compressImage(pendingImageFile);
      const formData = new FormData();
      formData.append("file", compressedFile);
      formData.append("kind", "file");
      formData.append("toHandle", activePeerHandle);

      const res = await fetch("/api/attachments/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 413) {
          setAttachmentError("File is too large to upload. Vercel server limit is 4.5MB.");
          return;
        }
        setAttachmentError(data.error || "Unable to upload attachment.");
        return;
      }

      if (data.message) {
        const fullMessage = {
          ...data.message,
          attachments: data.attachment
            ? [
                {
                  ...data.attachment,
                  sizeBytes: String(data.attachment.size),
                },
              ]
            : [],
        };
        setChatMessages((prev) => {
          if (prev.some((m) => m.id === fullMessage.id)) return prev;
          return [...prev, fullMessage as ChatMessage];
        });
      }

      // Clear preview after successful send
      if (pendingImagePreviewUrl) {
        try {
          URL.revokeObjectURL(pendingImagePreviewUrl);
        } catch {
          // ignore
        }
      }
      setPendingImageFile(null);
      setPendingImagePreviewUrl(null);
      setIsEditingImage(false);
    } catch {
      setAttachmentError("Unable to upload attachment. Please try again.");
    } finally {
      setIsUploadingAttachment(false);
    }
  };

  // Chat message context menu & long-press event handlers
  const handleMessageContextMenu = (
    e: React.MouseEvent,
    messageId: string,
    isMe: boolean,
    content: string
  ) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      messageId,
      isMe,
      content,
    });
  };

  const handleMessageTouchStart = (
    e: React.TouchEvent,
    messageId: string,
    isMe: boolean,
    content: string
  ) => {
    touchStartedRef.current = true;
    const clientX = e.touches[0].clientX;
    const clientY = e.touches[0].clientY;
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    touchTimerRef.current = setTimeout(() => {
      if (touchStartedRef.current) {
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate(50);
        }
        setContextMenu({
          x: clientX,
          y: clientY,
          messageId,
          isMe,
          content,
        });
      }
    }, 600);
  };

  const handleMessageTouchEnd = () => {
    touchStartedRef.current = false;
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
  };

  const handleMessageTouchMove = () => {
    touchStartedRef.current = false;
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const res = await fetch("/api/chat/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messageId }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Delete failed" }));
        alert(`Delete failed: ${err.error || "Unknown error"}`);
        return;
      }

      setChatMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch (err) {
      console.error("[Delete Message] Error:", err);
      alert("Failed to delete message due to network error.");
    } finally {
      setContextMenu(null);
    }
  };

  const handleCopyMessageText = (content: string) => {
    let textToCopy = content;
    try {
      if (content.startsWith('{"__e2e":true')) {
        const parsed = JSON.parse(content);
        textToCopy = parsed.ciphertext || content;
      }
    } catch {
      // ignore
    }

    textToCopy = textToCopy.replace(/^\[(FILE|VIDEO) attachment\]\s*/i, "");

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
    }
    setContextMenu(null);
  };

  const handleShareMessage = (messageId: string) => {
    if (!activePeerHandle) return;
    const shareUrl = `${window.location.origin}/?chat=${encodeURIComponent(activePeerHandle)}&messageId=${encodeURIComponent(messageId)}`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setShareToastText("Share link copied!");
        setTimeout(() => {
          setShareToastText(null);
        }, 2000);
      }).catch((err) => {
        console.error("Clipboard copy failed:", err);
      });
    }
    setContextMenu(null);
  };

  const handleBulkDelete = async () => {
    if (selectedMessageIds.size === 0) return;

    const messageIdsArray = Array.from(selectedMessageIds);
    const ownMessagesCount = chatMessages.filter(
      (m) => selectedMessageIds.has(m.id) && m.senderId === meId
    ).length;

    if (ownMessagesCount === 0) {
      alert("You cannot delete any of the selected messages (you are not the sender of any selected messages).");
      return;
    }



    try {
      const res = await fetch("/api/chat/delete-bulk", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messageIds: messageIdsArray }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Bulk delete failed" }));
        alert(`Delete failed: ${err.error || "Unknown error"}`);
        return;
      }

      setChatMessages((prev) =>
        prev.filter((m) => !(selectedMessageIds.has(m.id) && m.senderId === meId))
      );
      
      setIsSelectionMode(false);
      setSelectedMessageIds(new Set());
    } catch (err) {
      console.error("[Bulk Delete] Error:", err);
      alert("Failed to delete messages due to a network error.");
    }
  };

  const handleSelectAll = () => {
    setSelectedMessageIds(new Set(chatMessages.map((m) => m.id)));
  };

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isContextMenuClick = target && typeof target.closest === "function" && target.closest("[data-context-menu]");
      if (isContextMenuClick) {
        return;
      }
      if (isSelectionMode) {
        const bubble = target && typeof target.closest === "function" ? target.closest("[data-message-bubble]") : null;
        if (bubble) {
          e.preventDefault();
          e.stopPropagation();
          const messageId = bubble.getAttribute("data-message-id") || "";
          setSelectedMessageIds((prev) => {
            const next = new Set(prev);
            if (next.has(messageId)) {
              next.delete(messageId);
            } else {
              next.add(messageId);
            }
            return next;
          });
          return;
        }
      }
      setContextMenu(null);
    };

    const handleGlobalContextMenu = (e: MouseEvent) => {
      e.preventDefault(); // Block native browser context menu app-wide
      const target = e.target as HTMLElement;
      const isContextMenuClick = target && typeof target.closest === "function" && target.closest("[data-context-menu]");
      if (isContextMenuClick) {
        return;
      }
      const bubble = target && typeof target.closest === "function" ? target.closest("[data-message-bubble]") : null;
      if (bubble) {
        setContextMenu(null);
        
        const messageId = bubble.getAttribute("data-message-id") || "";
        const isMe = bubble.getAttribute("data-message-isme") === "true";
        const content = bubble.getAttribute("data-message-content") || "";

        // Add a micro-delay to prevent immediate closure if clicked coordinates propagate
        setTimeout(() => {
          setContextMenu({
            x: e.clientX,
            y: e.clientY,
            messageId,
            isMe,
            content,
          });
        }, 10);
      } else {
        setContextMenu(null);
      }
    };

    let touchTimer: NodeJS.Timeout | null = null;
    let touchStarted = false;

    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      const bubble = target && typeof target.closest === "function" ? target.closest("[data-message-bubble]") : null;
      if (bubble) {
        touchStarted = true;
        const touch = e.touches[0];
        const clientX = touch.clientX;
        const clientY = touch.clientY;
        const messageId = bubble.getAttribute("data-message-id") || "";
        const isMe = bubble.getAttribute("data-message-isme") === "true";
        const content = bubble.getAttribute("data-message-content") || "";

        if (touchTimer) clearTimeout(touchTimer);
        touchTimer = setTimeout(() => {
          if (touchStarted) {
            if (typeof navigator !== "undefined" && navigator.vibrate) {
              navigator.vibrate(50);
            }
            setContextMenu({
              x: clientX,
              y: clientY,
              messageId,
              isMe,
              content,
            });
          }
        }, 600);
      }
    };

    const handleTouchEnd = () => {
      touchStarted = false;
      if (touchTimer) {
        clearTimeout(touchTimer);
        touchTimer = null;
      }
    };

    const handleTouchMove = () => {
      touchStarted = false;
      if (touchTimer) {
        clearTimeout(touchTimer);
        touchTimer = null;
      }
    };

    window.addEventListener("click", handleGlobalClick, true);
    window.addEventListener("contextmenu", handleGlobalContextMenu);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchcancel", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("click", handleGlobalClick, true);
      window.removeEventListener("contextmenu", handleGlobalContextMenu);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [isSelectionMode]);

  const handleOpenImageEditor = () => {
    if (!pendingImageFile || !pendingImagePreviewUrl) return;
    setIsEditingImage(true);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setAspect(undefined); // free-form by default
    setCroppedAreaPixels(null);
  };

  const handleCloseImageEditor = () => {
    setIsEditingImage(false);
  };

  const handleCropComplete = (_: any, croppedPixels: any) => {
    setCroppedAreaPixels(croppedPixels);
  };

  const handleAspectChange = (value: number | undefined) => {
    setAspect(value);
  };

  const applyImageCrop = async () => {
    if (!pendingImagePreviewUrl || !pendingImageFile || !croppedAreaPixels) {
      setIsEditingImage(false);
      return;
    }

    try {
      const croppedFile = await createCroppedImageFile(
        pendingImagePreviewUrl,
        croppedAreaPixels,
        pendingImageFile.name,
      );

      if (pendingImagePreviewUrl) {
        try {
          URL.revokeObjectURL(pendingImagePreviewUrl);
        } catch {
          // ignore
        }
      }

      const newUrl = URL.createObjectURL(croppedFile);
      setPendingImageFile(croppedFile);
      setPendingImagePreviewUrl(newUrl);
      setIsEditingImage(false);
    } catch {
      setAttachmentError("Unable to crop image. Please try again.");
      setIsEditingImage(false);
    }
  };

  const createCroppedImageFile = async (
    imageSrc: string,
    cropPixels: { x: number; y: number; width: number; height: number },
    fileName: string,
  ): Promise<File> => {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = document.createElement("img");
      img.onload = () => resolve(img);
      img.onerror = (err: any) => reject(err);
      img.src = imageSrc;
    });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("No 2D context");
    }

    canvas.width = cropPixels.width;
    canvas.height = cropPixels.height;

    ctx.drawImage(
      image,
      cropPixels.x,
      cropPixels.y,
      cropPixels.width,
      cropPixels.height,
      0,
      0,
      cropPixels.width,
      cropPixels.height,
    );

    return new Promise<File>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }
        const file = new File([blob], fileName, { type: blob.type });
        resolve(file);
      }, "image/png");
    });
  };

  const isFounder = (session?.user as any)?.handle === "Rohit_7779";

  const handleOpenFounderGrantModal = (handle: string) => {
    setFounderGrantTarget(handle);
    setFounderGrantAmount("");
    setFounderGrantError(null);
    setIsFounderGrantModalOpen(true);
  };

  const handleFounderGrantSubmit = async () => {
    if (!founderGrantTarget || !founderGrantAmount) return;
    
    setIsFounderGrantLoading(true);
    setFounderGrantError(null);
    
    try {
      const res = await fetch("/api/admin/points/grant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientHandle: founderGrantTarget,
          amount: founderGrantAmount,
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        setFounderGrantError(data.error || "Failed to grant points.");
      } else {
        setIsFounderGrantModalOpen(false);
        
        // Show our gorgeous new Q-Link theme transaction popup!
        setTransactionNotification({
          show: true,
          type: "credit",
          amount: parseInt(founderGrantAmount, 10),
          title: "Quantum Currency Transmitted",
          message: `Successfully granted +${founderGrantAmount} QP to @${founderGrantTarget}!`,
          txHash: "TX-" + Math.random().toString(36).substring(2, 10).toUpperCase(),
        });

        // Autoclose transaction popup after 3.5s
        setTimeout(() => {
          setTransactionNotification(prev => prev ? { ...prev, show: false } : null);
        }, 3500);

        // Instantly reload user data / feed
        try {
          await updateSession();
          await fetchDirectoryLatestPosts();
          await fetchIdConsolePosts();
        } catch {}
      }
    } catch {
      setFounderGrantError("Network error. Please try again.");
    } finally {
      setIsFounderGrantLoading(false);
    }
  };

  // PWA install / create-shortcut prompt
  const [installPromptEvent, setInstallPromptEvent] = useState<any | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isWindowsClient, setIsWindowsClient] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.userAgent.indexOf("Win") !== -1) {
      setIsWindowsClient(true);
    }
  }, []);

  // Authenticated: load outgoing & incoming requests once on auth
  useEffect(() => {
    if (status !== "authenticated") return;

    const loadOutgoingAndIncoming = async () => {
      try {
        setIsLoadingOutgoing(true);
        setIsLoadingIncoming(true);
        setIncomingError(null);

        const res = await fetch("/api/friends/outgoing");
        if (!res.ok) return;
        const data = await res.json();
        setOutgoing((data.requests || []) as OutgoingRequest[]);
      } catch {
        // ignore for now
      } finally {
        setIsLoadingOutgoing(false);
      }

      try {
        const res = await fetch("/api/friends/incoming");
        if (!res.ok) {
          setIncomingError("Unable to load incoming requests.");
          return;
        }
        const data = await res.json();
        setIncoming((data.requests || []) as IncomingRequest[]);
      } catch {
        setIncomingError("Unable to load incoming requests.");
      } finally {
        setIsLoadingIncoming(false);
      }
    };

    loadOutgoingAndIncoming();
  }, [status]);

  const loadDirectoryData = async (force: boolean = false) => {
    // Avoid refetching if we already have data and not forcing
    if (!force && directoryItems && directoryItems.length > 0) {
      await fetchDirectoryLatestPosts();
      return;
    }

    setDirectoryLoading(true);
    setDirectoryError(null);
    try {
      const res = await fetch("/api/directory");
      if (!res.ok) {
        setDirectoryError("Unable to load global directory. Please try again.");
        return;
      }
      const data = await res.json();
      const items = (data.items || []) as DirectoryItem[];
      setDirectoryItems(items);

      await fetchDirectoryLatestPosts();

      // Initialize engagement data for all users and posts
      // Small delay to ensure session is ready and reduce immediate fetch pressure
      if ((session?.user as any)?.id) {
        setTimeout(() => {
          initializeEngagementData(items).catch(err => {
            console.error('[loadData] Engagement init failed:', err);
          });
        }, 100);
      }

      // Prefetch profile images during animation for instant display
      items.forEach((item: DirectoryItem) => {
        if (item.image && typeof window !== 'undefined') {
          const img = document.createElement('img');
          img.src = item.image;
        }
      });
    } catch {
      setDirectoryError("Unable to load global directory. Please check your connection.");
    } finally {
      setDirectoryLoading(false);
    }
  };

  const openDirectory = async () => {
    setIsConsoleAnimating(true);
    setShowDirectory(true); // Animation starts - 0.9s enter duration

    // Start loading immediately - animation provides visual cover
    loadDirectoryData(false);
  };

  // PWA install prompt wiring: capture beforeinstallprompt and appinstalled events
  useEffect(() => {
    if (typeof window === "undefined") return;

    const isElectron = window.navigator.userAgent.toLowerCase().includes("electron");
    if (isElectron) return;

    const seenKey = "qc_pwa_install_seen_v1";
    const installedOrSkipped = window.localStorage.getItem(seenKey);

    const handleBeforeInstallPrompt = (e: any) => {
      // Only show our own custom UI
      e.preventDefault();
      setInstallPromptEvent(e);
      if (!installedOrSkipped) {
        setShowInstallPrompt(true);
      }
    };

    const handleAppInstalled = () => {
      try {
        window.localStorage.setItem(seenKey, "installed");
      } catch {
        // ignore
      }
      setShowInstallPrompt(false);
      setInstallPromptEvent(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt as any);
    window.addEventListener("appinstalled", handleAppInstalled as any);

    // Fallback: if the browser never fires beforeinstallprompt, still show
    // the shortcut screen once for new users after a short delay.
    if (!installedOrSkipped) {
      const id = window.setTimeout(() => {
        setShowInstallPrompt((current) => (current ? current : true));
      }, 4000);
      return () => {
        window.clearTimeout(id);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt as any);
        window.removeEventListener("appinstalled", handleAppInstalled as any);
      };
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt as any);
      window.removeEventListener("appinstalled", handleAppInstalled as any);
    };
  }, []);

  // Light polling so incoming/outgoing stay in sync across devices
  useEffect(() => {
    if (status !== "authenticated") return;

    let cancelled = false;

    const refresh = async () => {
      try {
        const outRes = await fetch("/api/friends/outgoing");
        if (outRes.ok) {
          const outData = await outRes.json();
          if (!cancelled) {
            const requests = (outData.requests || []) as OutgoingRequest[];
            setOutgoing(requests);

            // Sync unread status from latestMessage
            requests.forEach((req: any) => {
              if (req.status === "ACCEPTED" && req.toUser?.handle && req.latestMessage) {
                const peerHandle = req.toUser.handle;
                const latestMsg = req.latestMessage;
                const key = `qlink_last_msg_id_${peerHandle}`;
                const storedId = localStorage.getItem(key);
                if (!storedId) {
                  localStorage.setItem(key, latestMsg.id);
                } else if (storedId !== latestMsg.id) {
                  const isAppHidden = typeof document !== "undefined" && (document.hidden || !document.hasFocus());
                  if (latestMsg.senderId !== myId && (peerHandle !== activePeerHandle || isAppHidden)) {
                    setUnreadMessages((prev) => {
                      if (prev.some((m) => m.id === latestMsg.id)) return prev;
                      return [...prev, { id: latestMsg.id, sender: peerHandle }];
                    });
                    triggerDesktopNotification(peerHandle);
                    localStorage.setItem(key, latestMsg.id);
                  }
                }
              }
            });
          }
        }
      } catch {
        // ignore
      }

      try {
        const inRes = await fetch("/api/friends/incoming");
        if (inRes.ok) {
          const inData = await inRes.json();
          if (!cancelled) {
            const requests = (inData.requests || []) as IncomingRequest[];
            setIncoming(requests);

            // Sync unread status from latestMessage
            requests.forEach((req: any) => {
              if (req.status === "ACCEPTED" && req.fromUser?.handle && req.latestMessage) {
                const peerHandle = req.fromUser.handle;
                const latestMsg = req.latestMessage;
                const key = `qlink_last_msg_id_${peerHandle}`;
                const storedId = localStorage.getItem(key);
                if (!storedId) {
                  localStorage.setItem(key, latestMsg.id);
                } else if (storedId !== latestMsg.id) {
                  const isAppHidden = typeof document !== "undefined" && (document.hidden || !document.hasFocus());
                  if (latestMsg.senderId !== myId && (peerHandle !== activePeerHandle || isAppHidden)) {
                    setUnreadMessages((prev) => {
                      if (prev.some((m) => m.id === latestMsg.id)) return prev;
                      return [...prev, { id: latestMsg.id, sender: peerHandle }];
                    });
                    triggerDesktopNotification(peerHandle);
                    localStorage.setItem(key, latestMsg.id);
                  }
                }
              }
            });
          }
        }
      } catch {
        // ignore
      }
    };

    refresh();
    const id = setInterval(refresh, 5000);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [status, activePeerHandle, session?.user?.id, desktopNotificationsEnabled]);

  // Lightweight "realtime" polling: keep conversation in sync
  useEffect(() => {
    if (!activePeerHandle) return;

    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch(
          `/api/chat/history?peerHandle=${encodeURIComponent(activePeerHandle)}`
        );
        if (!res.ok) return;
        const data = await res.json();
        const peerKey = data.peer?.publicKeyString || null;
        const rawMessages = (data.messages as ChatMessage[]) || [];
        const decryptedMessages = await decryptMessageList(rawMessages, peerKey);

        if (cancelled) return;
        setChatRoomId((data.roomId as string) || null);
        setActivePeerPublicKey(peerKey);
        setChatMessages((prev) => {
          const decryptedIds = new Set(decryptedMessages.map((m) => m.id));
          const filteredPrev = prev.filter(
            (m) => decryptedIds.has(m.id) || m.id.startsWith("temp-")
          );
          const seen = new Set(filteredPrev.map((m) => m.id));
          const unique = decryptedMessages.filter((m) => !seen.has(m.id));
          
          if (unique.length === 0 && filteredPrev.length === prev.length) {
            return prev;
          }
          return [...filteredPrev, ...unique];
        });

        const isAppHidden = typeof document !== "undefined" && (document.hidden || !document.hasFocus());

        // Update last seen message ID to local storage (only if window is focused)
        if (decryptedMessages.length > 0 && !isAppHidden) {
          const lastMsg = decryptedMessages[decryptedMessages.length - 1];
          localStorage.setItem(`qlink_last_msg_id_${activePeerHandle}`, lastMsg.id);
        }


      } catch {
        // ignore; next poll will try again
      }
    };

    // Initial fetch and interval
    poll();
    const id = setInterval(poll, 3000);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [activePeerHandle, desktopNotificationsEnabled]);

  useEffect(() => {
    if (status !== "loading") {
      setAuthTakingLong(false);
      return;
    }

    let cancelled = false;
    const id = setTimeout(() => {
      if (cancelled) return;
      setAuthTakingLong(true);

      if (typeof window !== "undefined") {
        try {
          const key = "qc_auth_reloaded_once";
          const already = window.sessionStorage.getItem(key);
          if (!already) {
            window.sessionStorage.setItem(key, "1");
            window.location.reload();
          }
        } catch {
          // ignore storage/reload issues; user will see the hint text instead
        }
      }
    }, 5000);

    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [status]);

  useEffect(() => {
    if (status !== "loading") {
      setHasInitiallyLoaded(true);
    }
  }, [status]);



  useEffect(() => {
    if (status !== "authenticated") return;
    const raw = (session.user as any)?.handle as string | undefined;
    if (raw && !currentHandle) {
      setCurrentHandle(raw);
    }

    const name = (session.user as any)?.name as string | undefined;
    if (name && !displayName) {
      setDisplayName(name);
    }
  }, [status, session, currentHandle, displayName]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = window.localStorage.getItem("qc_seen_guide_v1");
    if (!seen) {
      setShowGuide(true);
      setGuideStep(0);
    }
  }, []);

  // While auth is loading, show loading spinner (only on initial launch, preventing flash during updateSession background refreshes)
  if (status === "loading" && !hasInitiallyLoaded) {
    return (
      <main className="relative flex min-h-screen w-full items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          <p className="text-xs text-slate-400">Connecting to quantum network...</p>
        </div>
      </main>
    );
  }

  // Unauthenticated: show login gate (only when explicitly unauthenticated)
  if (status === "unauthenticated" || !effectiveSession) {
    return (
      <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-950">
        {/* Background glow effects */}
        <div className="pointer-events-none absolute -left-32 -top-32 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-32 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-3xl" />
        
        <div className="relative z-10 w-full max-w-[480px] mx-auto px-4" style={{ maxWidth: "480px" }}>
          {/* Logo / Brand */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-slate-900/50 px-4 py-2 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
              </span>
              <span className="text-xs font-medium uppercase tracking-wider text-cyan-100">Q-Link Console</span>
            </div>
            <h1 className="mt-4 text-2xl font-bold text-white">
              Welcome to <span className="bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">Quantum Link</span>
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Secure messaging across our global network
            </p>
          </div>

          {/* Sign-in Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl">
            <button
              className="grid w-full grid-cols-[48px_1fr_48px] items-center rounded-xl border border-slate-700 bg-white px-4 py-3 text-sm font-medium text-slate-900 transition-all hover:border-slate-600 hover:bg-slate-50 hover:shadow-lg active:scale-[0.98]"
              onClick={() => signIn("google")}
            >
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden pr-1.5">
                <img
                  src="/google-icon.ico"
                  alt="Google"
                  className="h-8 w-8 object-contain -ml-px"
                />
              </div>
              <span className="text-center">Continue with Google</span>
              <div></div>
            </button>

            {/* Microsoft Sign-in Button */}
            <button
              className="mt-3 grid w-full grid-cols-[48px_1fr_48px] items-center rounded-xl border border-slate-700 bg-white px-4 py-3 text-sm font-medium text-slate-900 transition-all hover:border-slate-600 hover:bg-slate-50 hover:shadow-lg active:scale-[0.98]"
              onClick={() => signIn("azure-ad")}
            >
              <div className="flex h-6 w-6 items-center justify-center overflow-hidden">
                <img
                  src="/microsoft-icon.ico"
                  alt="Microsoft"
                  className="h-6 w-6 object-contain -ml-px"
                />
              </div>
              <span className="text-center whitespace-nowrap pl-3">Continue with Microsoft</span>
              <div></div>
            </button>

            {/* GitHub Sign-in Button */}
            <button
              className="mt-3 grid w-full grid-cols-[48px_1fr_48px] items-center rounded-xl border border-slate-700 bg-white px-4 py-3 text-sm font-medium text-slate-900 transition-all hover:border-slate-600 hover:bg-slate-50 hover:shadow-lg active:scale-[0.98]"
              onClick={() => signIn("github")}
            >
              <div className="flex h-6 w-6 items-center justify-center overflow-hidden">
                <img
                  src="/github-icon.ico"
                  alt="GitHub"
                  className="h-6 w-6 object-contain -ml-px"
                />
              </div>
              <span className="text-center pr-2">Continue with GitHub</span>
              <div></div>
            </button>

            {/* Unified Phone Login/Signup Button */}
            <button
              className="mt-3 grid w-full grid-cols-[48px_1fr_48px] items-center rounded-xl border border-slate-700 bg-slate-800/40 text-slate-200 hover:text-white px-4 py-3 text-sm font-medium transition-all hover:border-slate-600 hover:bg-slate-800/80 hover:shadow-lg active:scale-[0.98]"
              onClick={() => {
                setShowNoAccountModal(true);
                setPhoneSignInStep("menu");
              }}
            >
              <div className="flex h-6 w-6 items-center justify-center overflow-hidden">
                <span className="text-lg">📱</span>
              </div>
              <span className="text-center pr-2">Continue with Phone</span>
              <div></div>
            </button>

            {/* Skip Button - Force Hidden */}
            {process.env.NODE_ENV === 'development' && (
              <button
                className="hidden mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm font-medium text-slate-300 transition-all hover:border-slate-600 hover:bg-slate-800 hover:text-white active:scale-[0.98]"
                onClick={() => {
                  localStorage.setItem('temp_bypass', 'true');
                  window.location.reload();
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
                Skip (Test Animations)
              </button>
            )}

            <p className="mt-4 text-center text-xs text-slate-500">
              After sign-in you'll receive your quantum ID and can connect with
              anyone globally.
            </p>
          </div>
        </div>

        {showVipTerms && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80">
            <div className="relative w-full max-w-2xl rounded-3xl border border-slate-700/70 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-[1px] shadow-[0_0_40px_rgba(148,163,184,0.7)]">
              <div className="relative max-h-[80vh] rounded-3xl bg-slate-950/95 px-5 py-4 sm:px-6 sm:py-5 overflow-y-auto scrollbar-hide">
                <div className="pointer-events-none absolute -left-24 -top-24 h-52 w-52 rounded-full bg-gradient-to-br from-red-500/60 via-fuchsia-500/40 to-cyan-400/40 blur-2xl" />
                <div className="pointer-events-none absolute -right-16 bottom-[-3rem] h-40 w-40 rounded-full bg-gradient-to-tr from-cyan-400/40 via-sky-500/40 to-fuchsia-500/40 blur-2xl" />

                <div className="relative flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                      Verification & Badges
                    </p>
                    <h2 className="mt-1 text-base font-semibold text-slate-50 sm:text-lg">
                      Q-Link badge policy
                    </h2>
                    <p className="mt-1 text-[11px] text-slate-400">
                      These badges are designed to protect identity and highlight
                      high-signal profiles. They are never sold as generic clout
                      icons.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsVipTermsAnimating(true);
                      setTimeout(() => setShowVipTerms(false), 300);
                    }}
                    className="rounded-full border border-slate-600/70 bg-slate-900/80 px-2 py-1 text-[10px] text-slate-300 hover:border-cyan-400/70 hover:text-cyan-200 active:border-cyan-300 active:bg-cyan-800 active:text-cyan-50 active:scale-90 transition-all duration-100"
                  >
                    Close
                  </button>
                </div>

                <div className="relative mt-4 space-y-4 text-[11px] text-slate-200">
                  <div className="rounded-2xl border border-red-500/60 bg-red-500/5 p-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-4.5 w-4.5 items-center justify-center rounded-full border border-red-300 bg-red-500 text-[9px] font-bold text-slate-50">
                        ✓
                      </span>
                      <p className="text-[11px] font-semibold text-red-200">
                        Elite Founder (Red Tick)
                      </p>
                    </div>
                    <ul className="mt-2 space-y-1 text-[11px] text-slate-200">
                      <li>• Reserved for system-level IDs and verified founders only.</li>
                      <li>• Manual review and identity proof are required; cannot be purchased casually.</li>
                      <li>• Grants higher visibility for feedback, product ideas and investor conversations.</li>
                      <li>• Currently experimental and limited; policy may evolve as Q-Link grows.</li>
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-sky-500/60 bg-sky-500/5 p-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-4.5 w-4.5 items-center justify-center rounded-full border border-sky-300 bg-sky-500 text-[9px] font-bold text-slate-50">
                        ✓
                      </span>
                      <p className="text-[11px] font-semibold text-sky-200">
                        Blue Tick (Verified ID)
                      </p>
                    </div>
                    <ul className="mt-2 space-y-1 text-[11px] text-slate-200">
                      <li>• Confirms that a quantum ID maps to a real person or brand.</li>
                      <li>• Issued to early builders, professionals and public profiles after verification.</li>
                      <li>• May be available as a paid verification plan with strict anti-impersonation checks.</li>
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-fuchsia-500/60 bg-fuchsia-500/5 p-3">
                    <p className="text-[11px] font-semibold text-fuchsia-200">
                      Future premium tiers
                    </p>
                    <ul className="mt-2 space-y-1 text-[11px] text-slate-200">
                      <li>• Additional tiers (e.g., Millionaire, Billionaire) may unlock advanced routing or priority lanes.</li>
                      <li>• All future tiers will follow the same principles: clear criteria, no fake status, no identity confusion.</li>
                    </ul>
                  </div>

                  <p className="text-[10px] text-slate-500">
                    Note: Badge designs, names and eligibility criteria may change as we learn from
                    real-world usage. We will always prioritize authenticity and safety over vanity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {showNoAccountModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
            <div 
              className="relative w-full max-w-[380px] rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-2xl overflow-hidden transition-all duration-300" 
              style={{ 
                maxWidth: "380px", 
                minHeight: phoneSignInStep === "phone" ? (showCountryDropdown ? "510px" : "380px") : "auto"
              }}
            >
              {/* Subtle background glow */}
              <div className="pointer-events-none absolute -left-20 -top-20 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl animate-pulse" />
              <div className="pointer-events-none absolute -right-20 -bottom-20 h-40 w-40 rounded-full bg-fuchsia-500/10 blur-3xl animate-pulse" />

              {/* Close Button */}
              <button
                onClick={() => {
                  setShowNoAccountModal(false);
                  setPhoneSignInStep("menu");
                  setPhoneNumber("");
                  setOtpCode("");
                }}
                className="absolute right-4 top-4 rounded-full border border-slate-700/60 bg-slate-950/80 p-1.5 text-slate-400 hover:text-white hover:border-slate-500 transition-all active:scale-95 z-10"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {phoneSignInStep === "menu" && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-xl font-bold text-white tracking-wide">
                      Alternative Access
                    </h2>
                    <p className="mt-1.5 text-xs text-slate-400">
                      Explore alternative methods to establish a link to the network.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {/* Apple Sign-in (Pulsing badge) */}
                    <div className="relative group">
                      <button
                        disabled
                        className="opacity-50 cursor-not-allowed grid w-full grid-cols-[48px_1fr_48px] items-center rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm font-medium text-slate-500 transition-all relative overflow-hidden"
                      >
                        <div className="flex h-5 w-5 items-center justify-center overflow-hidden text-slate-400">
                          {/* Apple Logo SVG */}
                          <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.69-1.12 1.83-.98 2.94.1.08.21.12.33.12.93 0 2.01-.56 2.48-1.45z"/>
                          </svg>
                        </div>
                        <span className="text-center pr-2 font-medium text-slate-400">Continue with Apple</span>
                        <div></div>
                      </button>
                      <span className="absolute top-1/2 -translate-y-1/2 right-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 font-bold uppercase tracking-wider text-[8px] px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.2)] animate-pulse">
                        Coming Soon
                      </span>
                    </div>

                    {/* Mobile Sign-in Button */}
                    <button
                      onClick={() => setPhoneSignInStep("phone")}
                      className="grid w-full grid-cols-[48px_1fr_48px] items-center rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 to-slate-900/60 px-4 py-3 text-sm font-semibold text-cyan-400 hover:text-cyan-300 hover:border-cyan-400/50 hover:bg-cyan-500/10 transition-all hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] active:scale-[0.98]"
                    >
                      <div className="flex h-5 w-5 items-center justify-center overflow-hidden">
                        {/* Mobile Phone SVG */}
                        <svg className="h-5 w-5 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth={2}>
                          <rect x="5" y="2" width="14" height="20" rx="2" />
                          <line x1="12" y1="18" x2="12" y2="18.01" strokeLinecap="round" />
                        </svg>
                      </div>
                      <span className="text-center pr-2">Continue with Mobile Number</span>
                      <div></div>
                    </button>
                  </div>
                </div>
              )}

              {phoneSignInStep === "phone" && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-xl font-bold text-white tracking-wide flex items-center justify-center gap-2">
                      <span className="text-cyan-400">📱</span> Quantum Shield Access
                    </h2>
                    <p className="mt-1.5 text-xs text-slate-400">
                      Enter your mobile number to establish a secure link.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Flags Dropdown & Phone Number input wrapper */}
                    <div className="relative">
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                        Mobile Phone Number
                      </label>
                      <div className="relative flex rounded-xl border border-slate-700 bg-slate-950/80 focus-within:border-cyan-400/70 transition-all z-20">
                        {/* Selector Trigger Button */}
                        <button
                          type="button"
                          onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                          className="flex items-center gap-1.5 border-r border-slate-800 bg-slate-900/50 px-3 text-sm font-semibold text-slate-300 hover:bg-slate-900 transition-all rounded-l-xl focus:outline-none"
                        >
                          <img
                            src={`https://flagcdn.com/w40/${selectedCountry.code.toLowerCase()}.png`}
                            alt={selectedCountry.name}
                            className="h-3 w-4.5 object-cover rounded-sm shadow-sm select-none border border-slate-800"
                          />
                          <span className="text-slate-200">{selectedCountry.dial}</span>
                          <svg className={`h-3 w-3 text-slate-500 transition-transform duration-200 ${showCountryDropdown ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        
                        <input
                          type="tel"
                          placeholder="98765 43210"
                          value={phoneNumber}
                          onFocus={() => setShowCountryDropdown(false)}
                          onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                          className="w-full bg-transparent px-3 py-3 text-sm text-slate-100 placeholder-slate-600 outline-none"
                        />
                      </div>

                      {/* Dropdown Menu */}
                      {showCountryDropdown && (
                        <div className="absolute left-0 right-0 mt-1.5 rounded-2xl border border-slate-800 bg-slate-950/95 shadow-2xl backdrop-blur-xl z-30 p-2 max-h-[220px] overflow-hidden flex flex-col animate-[fadeIn_0.15s_ease-out]">
                          {/* Search Input */}
                          <div className="relative mb-2">
                            <input
                              type="text"
                              placeholder="Search country or code..."
                              value={countrySearchQuery}
                              onChange={(e) => setCountrySearchQuery(e.target.value)}
                              className="w-full rounded-lg border border-slate-800 bg-slate-900/90 px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-400/50 transition-all"
                            />
                            {countrySearchQuery && (
                              <button
                                onClick={() => setCountrySearchQuery("")}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
                              >
                                ✕
                              </button>
                            )}
                          </div>

                          {/* Country List */}
                          <div className="flex-1 overflow-y-auto space-y-0.5 pr-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                            {filteredCountries.length === 0 ? (
                              <p className="text-center text-[10px] text-slate-500 py-3">No matching countries</p>
                            ) : (
                              filteredCountries.map((c) => (
                                <button
                                  key={c.code}
                                  type="button"
                                  onClick={() => {
                                    setSelectedCountry(c);
                                    setShowCountryDropdown(false);
                                    setCountrySearchQuery("");
                                  }}
                                  className="w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs text-slate-300 hover:bg-slate-900 hover:text-white transition-all active:scale-[0.98]"
                                >
                                  <div className="flex items-center gap-2">
                                    <img
                                      src={`https://flagcdn.com/w40/${c.code.toLowerCase()}.png`}
                                      alt={c.name}
                                      className="h-3.5 w-5 object-cover rounded-sm shadow-sm select-none border border-slate-900"
                                    />
                                    <span className="truncate max-w-[160px]">{c.name}</span>
                                  </div>
                                  <span className="font-semibold text-slate-500 text-[10px]">{c.dial}</span>
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={async () => {
                        if (!phoneNumber) {
                          alert("Please enter a valid mobile number.");
                          return;
                        }
                        const fullPhone = `${selectedCountry.dial}${phoneNumber}`;
                        setOtpSending(true);
                        try {
                          const res = await fetch("/api/auth/otp/send", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ phone: fullPhone }),
                          });
                          const data = await res.json();
                          if (res.ok) {
                            setPhoneSignInStep("otp");
                            if (data.mocked) {
                              alert(`[DEVELOPMENT MODE]\nVerification code logged to terminal! (For number: ${fullPhone})`);
                            }
                          } else {
                            alert(data.error || "Unable to dispatch OTP code.");
                          }
                        } catch (err) {
                          alert("Failed to reach key server. Try again.");
                        } finally {
                          setOtpSending(false);
                        }
                      }}
                      disabled={otpSending}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-slate-950 font-bold text-sm tracking-wider uppercase transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                    >
                      {otpSending ? "Generating Secure OTP..." : "Generate OTP"}
                    </button>
                    
                    <button
                      onClick={() => setPhoneSignInStep("menu")}
                      className="w-full text-center text-xs text-slate-500 hover:text-slate-400 underline transition-all"
                    >
                      Back to options
                    </button>
                  </div>
                </div>
              )}

              {phoneSignInStep === "otp" && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-xl font-bold text-white tracking-wide">
                      OTP Key Verification
                    </h2>
                    <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                      Verification key dispatched to <span className="text-cyan-400 font-semibold">{selectedCountry.dial} {phoneNumber.replace(/(\d{5})(\d{5})/, "$1 $2")}</span>.<br/>
                      Enter the 6-digit credential below.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                        Verification Code (OTP)
                      </label>
                      <input
                        type="text"
                        placeholder="• • • • • •"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                        className="w-full text-center tracking-[0.6em] font-mono rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-3 text-base text-slate-100 placeholder-slate-700 outline-none focus:border-cyan-400/70 transition-all"
                      />
                    </div>

                    <button
                      onClick={async () => {
                        if (otpCode.length !== 6) {
                          alert("Please enter the 6-digit OTP code.");
                          return;
                        }
                        const fullPhone = `${selectedCountry.dial}${phoneNumber}`;
                        setOtpSending(true);
                        try {
                          const result = await signIn("phone-otp", {
                            phone: fullPhone,
                            otp: otpCode,
                            redirect: false,
                          });
                          if (result?.error) {
                            alert(result.error || "Verification failed. Please check the code.");
                          } else {
                            setPhoneSignInStep("success");
                          }
                        } catch (err) {
                          alert("Failed to authenticate verification key.");
                        } finally {
                          setOtpSending(false);
                        }
                      }}
                      disabled={otpSending}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-sm tracking-wider uppercase transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                    >
                      {otpSending ? "Authenticating OTP..." : "Verify & Authenticate"}
                    </button>
                    
                    <div className="flex justify-between text-xs px-1">
                      <button
                        onClick={async () => {
                          const fullPhone = `${selectedCountry.dial}${phoneNumber}`;
                          try {
                            const res = await fetch("/api/auth/otp/send", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ phone: fullPhone }),
                            });
                            const data = await res.json();
                            if (res.ok) {
                              alert("OTP resent successfully!");
                              if (data.mocked) {
                                alert(`[DEVELOPMENT MODE]\nNew Verification code logged to terminal!`);
                              }
                            } else {
                              alert(data.error || "Unable to resend OTP.");
                            }
                          } catch {
                            alert("Failed to resend secure key.");
                          }
                        }}
                        className="text-slate-400 hover:text-slate-300 transition-all underline"
                      >
                        Resend OTP
                      </button>
                      <button
                        onClick={() => setPhoneSignInStep("phone")}
                        className="text-slate-500 hover:text-slate-400 transition-all underline"
                      >
                        Change number
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {phoneSignInStep === "success" && (
                <div className="text-center space-y-6 py-4">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-3xl animate-bounce">
                    ✓
                  </div>
                  
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-wide">
                      Credential Validated
                    </h2>
                    <p className="mt-2 text-xs text-slate-400 leading-relaxed px-4">
                      Your quantum access node has been successfully established and verified. 
                      Welcome to the Q-Link core directory!
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      window.location.reload();
                    }}
                    className="w-full py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm tracking-wider uppercase transition-all hover:bg-emerald-400 active:scale-[0.98]"
                  >
                    Enter Core Directory
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Inline settings card is rendered near the top-left instead of a global overlay */}
      </main>
    );
  }

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!friendIdInput.trim()) return;

    setSearching(true);
    setSearchError(null);
    setFoundUser(null);
    setSelectedCategories([]);
    setComment("");
    setRequestError(null);
    setRequestSuccess(null);

    try {
      const res = await fetch("/api/friends/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: friendIdInput.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSearchError(data.error || "Quantum ID not found.");
        return;
      }

      const data = await res.json();
      setFoundUser(data.user as FoundUser);
    } catch {
      setSearchError("Unable to reach quantum directory. Try again.");
    } finally {
      setSearching(false);
    }
  };

  const highlightQuantumId = showGuide && guideStep === 0;
  const highlightEditId = showGuide && guideStep === 1;
  const highlightConnect = showGuide && guideStep === 2;
  const highlightRequests = showGuide && guideStep === 3;
  const highlightChatPanel = showGuide && guideStep === 4;
  const highlightFullChat = showGuide && guideStep === 5;
  const highlightConsole = showGuide && guideStep === 6;
  const highlightSettingsPill = showGuide && guideStep === 7;

  const advanceGuide = () => {
    const next = guideStep + 1;
    const maxStep = 7;
    if (next > maxStep) {
      setShowGuide(false);
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem("qc_seen_guide_v1", "1");
        } catch {
          // ignore
        }
      }
      return;
    }
    setGuideStep(next);
  };

  const restartGuide = () => {
    setShowGuide(true);
    setGuideStep(0);
  };

  const handleChatKeyDown = async (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if (!activePeerHandle || !chatInput.trim()) return;
      e.preventDefault();
      await actuallySendChat();
    }
  };

  const toggleCategory = (cat: string) => {
    setRequestError(null);
    setRequestSuccess(null);
    setSelectedCategories((prev) => {
      if (prev.includes(cat)) {
        return prev.filter((c) => c !== cat);
      }
      if (prev.length >= 2) {
        return prev; // enforce max 2
      }
      return [...prev, cat];
    });
  };

  const handleSendRequest = async () => {
    if (!foundUser) return;
    const isVipTarget = isVipHandle(foundUser.handle);

    const categoriesToSend = isVipTarget
      ? ["Feedback"]
      : selectedCategories;

    if (!isVipTarget && categoriesToSend.length === 0) {
      setRequestError("Select at least one relationship category.");
      return;
    }

    setSendingRequest(true);
    setRequestError(null);
    setRequestSuccess(null);

    try {
      const res = await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toHandle: foundUser.handle,
          categories: categoriesToSend,
          message: comment,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setRequestError(data.error || "Failed to send request.");
        return;
      }

      setRequestSuccess("Request sent successfully.");
      setComment("");
      setSelectedCategories([]);
      setFoundUser(null);
      setFriendIdInput("");

      // Refresh outgoing list
      const outRes = await fetch("/api/friends/outgoing");
      if (outRes.ok) {
        const outData = await outRes.json();
        setOutgoing((outData.requests || []) as OutgoingRequest[]);
      }

      // Return to home view
      setMode("home");
    } catch {
      setRequestError("Something went wrong. Try again.");
    } finally {
      setSendingRequest(false);
    }
  };

  const openChatWithPeer = async (peerHandle: string) => {
    setActivePeerHandle(peerHandle);
    setChatLoading(true);
    setChatError(null);

    try {
      const res = await fetch(
        `/api/chat/history?peerHandle=${encodeURIComponent(peerHandle)}`
      );
      if (!res.ok) {


        
        const data = await res.json().catch(() => ({}));
        setChatError(data.error || "Unable to load conversation.");
        setChatMessages([]);
        setChatRoomId(null);
        return;
      }

      const data = await res.json();
      const peerKey = data.peer?.publicKeyString || null;
      const rawMessages = (data.messages as ChatMessage[]) || [];
      const decryptedMessages = await decryptMessageList(rawMessages, peerKey);

      setChatRoomId((data.roomId as string) || null);
      setActivePeerPublicKey(peerKey);
      const initialMessages = decryptedMessages.map((m) => ({
        ...m,
        createdAt: m.createdAt,
      }));
      // Deduplicate messages by ID
      const seenIds = new Set<string>();
      const uniqueMessages = initialMessages.filter((m) => {
        if (seenIds.has(m.id)) return false;
        seenIds.add(m.id);
        return true;
      });
      setChatMessages(uniqueMessages);
      
      // Update last seen message ID to local storage
      if (uniqueMessages.length > 0) {
        const lastMsg = uniqueMessages[uniqueMessages.length - 1];
        localStorage.setItem(`qlink_last_msg_id_${peerHandle}`, lastMsg.id);
      }
      
      setUnreadMessages((prev) => prev.filter((m) => m.sender !== peerHandle));
    } catch {
      setChatError("Unable to load conversation.");
      setChatMessages([]);
      setChatRoomId(null);
    } finally {
      setChatLoading(false);
    }
  };

  const handleIncomingDecision = async (
    requestId: string,
    action: "ACCEPT" | "REJECT",
    peerHandle: string
  ) => {
    setIncomingError(null);
    try {
      const res = await fetch("/api/friends/decide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setIncomingError(
          data.error || "Unable to update request. Please try again."
        );
        return;
      }

      const data = await res.json();
      const updated = data.request as IncomingRequest;

      setIncoming((prev) =>
        prev.map((r) => (r.id === updated.id ? { ...r, status: updated.status } : r))
      );

      if (action === "ACCEPT") {
        await openChatWithPeer(peerHandle);
      }
    } catch {
      setIncomingError("Unable to update request. Please try again.");
    }
  };

  const actuallySendChat = async () => {
    if (!activePeerHandle || !chatInput.trim()) return;

    const text = chatInput.trim();
    setChatError(null);

    try {
      let contentToSend = text;
      if (activePeerPublicKey && isE2EEnabled) {
        try {
          const { encryptMessage } = await import("@/lib/e2e-crypto");
          contentToSend = await encryptMessage(text, activePeerPublicKey);
        } catch (e) {
          console.error("[E2E] Message encryption failed, sending plain text", e);
        }
      }

      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toHandle: activePeerHandle, content: contentToSend }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setChatError(data.error || "Unable to send message.");
        return;
      }

      const data = await res.json();
      const rawMessage = data.message as ChatMessage;
      const decryptedArray = await decryptMessageList([rawMessage], activePeerPublicKey);
      const message = decryptedArray[0];

      setChatMessages((prev) => {
        // Avoid duplicate if polling already added this message
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
      setChatInput("");
    } catch {
      setChatError("Unable to send message.");
    }
  };

  const handleChatSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await actuallySendChat();
  };

  const handleChatInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setChatInput(e.target.value);
    if (chatInputRef.current) {
      chatInputRef.current.style.height = "auto";
      chatInputRef.current.style.height = `${chatInputRef.current.scrollHeight}px`;
    }

    if (!activePeerHandle) return;

    // Notify backend that we are typing to this peer.
    // Optimization: only send `typing: true` once per burst, but always
    // schedule a single `typing: false` after a short idle.
    const notifyTyping = async (typing: boolean) => {
      try {
        await fetch("/api/presence/typing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toHandle: activePeerHandle, typing }),
        });
      } catch {
        // ignore typing errors
      }
    };

    // Send `typing: true` immediately only when we enter a new typing burst
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      notifyTyping(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      notifyTyping(false);
    }, 3000);
  };

  const quantumId = currentHandle || (effectiveSession.user as any)?.handle || "your-id";
  const meId = (effectiveSession.user as any)?.id as string | undefined;
  const meEmail = (effectiveSession.user as any)?.email as string | undefined;
  const effectiveBlueTickStatus = localBlueTickOverride !== null 
    ? localBlueTickOverride 
    : ((session?.user as any)?.blue_tick_status || 'NONE');

  const isVipHandle = (handle: string | null | undefined) => handle === "Rohit_7779";

  const formatLastOnlineTime = (date: Date | null) => {
    if (!date) return "";
    try {
      return date.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const validateHandleDraft = (value: string): string | null => {
    const trimmed = value.trim();

    // Special-case: allow the founder account to claim the reserved VIP handle
    // Rohit_7779 without enforcing the normal numeric/length rules.
    if (meEmail === "rohiterrors@gmail.com" && trimmed === "Rohit_7779") {
      return null;
    }

    const digitCount = (trimmed.match(/\d/g) || []).length;
    if (!trimmed) return null;
    if (trimmed.length < 6 || digitCount < 4) {
      return "Your quantum ID must be at least 6 characters and include at least 4 numbers.";
    }
    return null;
  };

  const startEditingHandle = () => {
    setHandleDraft(quantumId.replace(/^@/, ""));
    setNameDraft(displayName || "");
    setHandleError(null);
    setEditingHandle(true);
  };

  const cancelEditingHandle = () => {
    setEditingHandle(false);
    setHandleDraft("");
    setNameDraft("");
    setHandleError(null);
  };

  const onHandleDraftChange = (value: string) => {
    setHandleDraft(value);
    const msg = validateHandleDraft(value);
    setHandleError(msg);
  };

  const saveHandle = async () => {
    const trimmed = handleDraft.trim();
    const msg = validateHandleDraft(trimmed);
    if (msg) {
      setHandleError(msg);
      return;
    }

    if (!trimmed) return;

    setHandleSaving(true);
    setHandleError(null);

    try {
      const res = await fetch("/api/user/handle", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: trimmed }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setHandleError(
          data.error ||
            "We couldn't update your quantum ID. Please review the rules above and try again.",
        );
        return;
      }

      const updatedHandle = (data.user?.handle as string | undefined) || trimmed;
      setCurrentHandle(updatedHandle);

      // Update display name if it changed
      const nameToSend = nameDraft.trim();
      if (nameToSend !== (displayName || "")) {
        try {
          const nameRes = await fetch("/api/user/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: nameToSend }),
          });

          const nameData = await nameRes.json().catch(() => ({}));
          if (!nameRes.ok) {
            // Reuse handleError surface for name failures as well
            setHandleError(
              nameData.error ||
                "We couldn't update your display name. Please try again.",
            );
          } else {
            const updatedName = (nameData.user?.name as string | undefined) || nameToSend;
            setDisplayName(updatedName || null);
          }
        } catch {
          setHandleError(
            "We couldn't reach the server to update your display name. Please try again.",
          );
        }
      }

      setEditingHandle(false);
      setHandleDraft("");
      setNameDraft("");
      setHandleError(null);
    } catch {
      setHandleError(
        "We couldn't reach the quantum directory. Please check your connection and try again.",
      );
    } finally {
      setHandleSaving(false);
    }
  };

  const handleSkipInstall = () => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("qc_pwa_install_seen_v1", "dismissed");
      }
    } catch {
      // ignore
    }
    setShowInstallPrompt(false);
  };

  const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert("Image size must be less than 1MB.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/user/profile-pic", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to upload profile picture.");
        return;
      }

      const data = await res.json();
      setProfilePicUrl(data.url);

      // Instantly update next-auth session and reload feed to propagate avatar across existing posts
      try {
        await updateSession();
      } catch (err) {
        console.warn("Failed to update session silently:", err);
      }
      try {
        await fetchIdConsolePosts();
        await fetchDirectoryLatestPosts();
      } catch (err) {
        console.warn("Failed to reload posts automatically:", err);
      }
    } catch {
      alert("Failed to upload profile picture.");
    }

    // Reset input
    if (profilePicInputRef.current) {
      profilePicInputRef.current.value = "";
    }
  };

  const handleDirectorySelect = async (handle: string | null) => {
    if (!handle) return;
    // Close directory and route into existing connect flow
    setShowDirectory(false);
    setMode("connect");
    setFriendIdInput(handle);
    setSearching(true);
    setSearchError(null);
    setFoundUser(null);
    setSelectedCategories([]);
    setComment("");
    setRequestError(null);
    setRequestSuccess(null);

    try {
      const res = await fetch("/api/friends/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: handle.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSearchError(data.error || "Quantum ID not found.");
        return;
      }

      const data = await res.json();
      setFoundUser(data.user as FoundUser);
    } catch {
      setSearchError("Unable to reach quantum directory. Try again.");
    } finally {
      setSearching(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false });
      // Clear any local storage if needed
      localStorage.clear();
      // Optionally redirect to home or login page
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // ── Timestamp helpers ──────────────────────────────────────────────────────
  const formatDateLabel = (iso: string): string => {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const msgDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    if (msgDay.getTime() === today.getTime()) return "Today";
    if (msgDay.getTime() === yesterday.getTime()) return "Yesterday";
    return d.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });
  };

  const formatMsgDateFull = (iso: string): string => {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const msgDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    if (msgDay.getTime() === today.getTime()) {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return (
      d.toLocaleDateString([], { day: "numeric", month: "short" }) +
      " · " +
      d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const isSameDay = (isoA: string, isoB: string): boolean => {
    const a = new Date(isoA);
    const b = new Date(isoB);
    if (isNaN(a.getTime()) || isNaN(b.getTime())) return true;
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  };
  // ──────────────────────────────────────────────────────────────────────────

  return (
    <main
      ref={mainScrollRef}
      id="main-scroll-container"
      className="scrollbar-hide"
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100dvh',
        overflowX: 'hidden',
        overflowY: isChatFull ? 'hidden' : 'auto',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      <div style={{ width: '100%', flexShrink: 0, display: 'flex', flexDirection: 'column', minHeight: isChatFull ? '100%' : 'auto', flex: isChatFull ? '1' : 'unset' }}>
      {showInstallPrompt && (
        <div className="pointer-events-auto fixed inset-0 z-45 flex items-center justify-center bg-slate-950/80 px-4">
          <div className="max-w-md w-full rounded-2xl border border-cyan-500/30 bg-slate-950/95 p-5 text-xs text-slate-100 shadow-[0_0_50px_rgba(6,182,212,0.25)] backdrop-blur-md">
            <p className="text-sm font-bold text-cyan-400 font-mono uppercase tracking-wider">
              Create a shortcut to Q-link Chat
            </p>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              Install this app on your device for the ultimate full-screen experience, zero browser throttling, and 100% reliable background notifications.
            </p>
            <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-[11px] text-amber-400/90 leading-relaxed">
              <strong>⚠️ Warning:</strong> Skipping installation may block real-time lock-screen chat alerts, especially on <strong>iOS (Safari)</strong> where Web Push notifications are exclusively supported for Home Screen apps!
            </div>
            {!installPromptEvent && (
              <p className="mt-2 text-[10px] text-slate-400 font-mono">
                To install manually: open your browser options menu and tap <strong>&quot;Add to Home Screen&quot;</strong>.
              </p>
            )}
            <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
              {isWindowsClient && (
                <a
                  href="/downloads/Q-Link-Setup.exe"
                  download="Q-Link-Setup.exe"
                  onClick={handleSkipInstall}
                  className="flex-1 inline-flex items-center justify-center rounded-xl bg-cyan-500 px-3 py-2.5 text-center font-bold text-slate-950 hover:bg-cyan-400 transition duration-200 text-xs tracking-wide shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                  style={{ textDecoration: 'none' }}
                >
                  Download Windows App (.exe)
                </a>
              )}
              <button
                type="button"
                onClick={handleInstallClick}
                disabled={!installPromptEvent}
                className={
                  "flex-1 inline-flex items-center justify-center rounded-xl px-3 py-2.5 text-center font-bold text-xs tracking-wide transition duration-200 " +
                  (installPromptEvent
                    ? (isWindowsClient ? "bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white" : "bg-cyan-500 text-slate-950 hover:bg-cyan-400")
                    : "bg-slate-900 text-slate-500 border border-slate-800/80 cursor-not-allowed")
                }
              >
                {isWindowsClient ? "Install Web App" : "Install app"}
              </button>
              <button
                type="button"
                onClick={handleSkipInstall}
                className="flex-1 inline-flex items-center justify-center rounded-xl border border-slate-700/60 bg-slate-900/60 px-3 py-2.5 text-center font-bold text-slate-200 hover:bg-slate-800/80 transition duration-200 text-xs tracking-wide"
              >
                Continue in browser
              </button>
            </div>
          </div>
        </div>
      )}



      {showMoreCategories && (
        <div className="pointer-events-auto fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80 px-4 sm:px-0">
          <div className="relative w-full max-w-sm max-h-[70vh] rounded-3xl border border-cyan-400/40 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-[1px] shadow-[0_0_25px_rgba(56,189,248,0.7)] overflow-hidden">
            <div className="relative flex max-h-[68vh] flex-col rounded-3xl bg-slate-950/95 px-4 py-4 overflow-y-auto scrollbar-hide">
              <div className="pointer-events-none absolute -left-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-cyan-400/40 via-fuchsia-500/30 to-indigo-400/30 blur-3xl" />
              <div className="pointer-events-none absolute -right-20 bottom-[-4rem] h-40 w-40 rounded-full bg-gradient-to-tr from-indigo-400/30 via-sky-500/30 to-fuchsia-500/30 blur-3xl" />

              <div className="relative flex items-center justify-between gap-3 pb-2 border-b border-slate-700/60">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300/90">
                    More relationship types
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Pick the most accurate relationship. You can still only choose up to two.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMoreCategories(false)}
                  className="rounded-full border border-slate-600/70 bg-slate-900/80 px-3 py-1 text-[10px] font-medium text-slate-200 hover:border-cyan-400/70 hover:text-cyan-200 responsive-button text-overflow-fix"
                >
                  Close
                </button>
              </div>

              <div className="relative mt-3 space-y-1">
                {extendedCategories.map((cat) => {
                  const active = selectedCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        toggleCategory(cat);
                        setShowMoreCategories(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl border px-3 py-1.5 text-[11px] text-left transition ${
                        active
                          ? "border-cyan-400/80 bg-cyan-500/15 text-cyan-200"
                          : "border-slate-700/70 bg-slate-900/80 text-slate-200 hover:border-cyan-400/70 hover:text-cyan-100"
                      }`}
                    >
                      <span className="truncate">{cat}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {(showVipTerms || isVipTermsAnimating) && (
        <div className={`pointer-events-auto fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80 px-4 sm:px-0 ${
          showVipTerms ? (isVipTermsAnimating ? 'settings-backdrop-enter' : '') : 'settings-backdrop-exit'
        }`}
        style={{ backdropFilter: 'blur(8px)' }}
        onMouseDown={() => {
          setIsVipTermsAnimating(true);
          setTimeout(() => setShowVipTerms(false), 300);
        }}
      >
          <div className={`relative w-full max-w-2xl rounded-3xl border border-slate-700/70 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-[1px] shadow-[0_0_28px_rgba(148,163,184,0.6)] ${
            showVipTerms ? (isVipTermsAnimating ? 'vip-terms-modal-enter' : '') : 'vip-terms-modal-exit'
          }`}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="relative max-h-[80vh] rounded-3xl bg-slate-950/95 px-5 py-4 sm:px-6 sm:py-5 overflow-y-auto scrollbar-hide">
              <div className="pointer-events-none absolute -left-24 -top-24 h-52 w-52 rounded-full bg-gradient-to-br from-red-500/60 via-fuchsia-500/40 to-cyan-400/40 blur-2xl" />
              <div className="pointer-events-none absolute -right-16 bottom-[-3rem] h-40 w-40 rounded-full bg-gradient-to-tr from-cyan-400/40 via-sky-500/40 to-fuchsia-500/40 blur-2xl" />

              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Verification & Badges
                  </p>
                  <h2 className="mt-1 text-base font-semibold text-slate-50 sm:text-lg">
                    Q-Link badge policy
                  </h2>
                  <p className="mt-1 text-[11px] text-slate-400">
                    These badges are designed to protect identity and highlight
                    high-signal profiles. They are never sold as generic clout
                    icons.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsVipTermsAnimating(true);
                    setTimeout(() => setShowVipTerms(false), 300);
                  }}
                  className="rounded-full border border-slate-600/70 bg-slate-900/80 px-2 py-1 text-[10px] text-slate-300 hover:border-cyan-400/70 hover:text-cyan-200 active:border-cyan-300 active:bg-cyan-800 active:text-cyan-50 active:scale-90 transition-all duration-100"
                >
                  Close
                </button>
              </div>

              <div className="relative mt-4 space-y-4 text-[11px] text-slate-200">
                {/* Red Tick / Entrepreneur Verification */}
                <div className="rounded-2xl border border-red-500/60 bg-red-500/5 p-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-4.5 w-4.5 items-center justify-center rounded-full border border-red-300 bg-red-500 text-[9px] font-bold text-slate-50">
                      🔴
                    </span>
                    <p className="text-[11px] font-semibold text-red-200">
                      Red Tick (Entrepreneur Verification)
                    </p>
                  </div>

                  <p className="mt-2 text-[11px] text-slate-200">
                    The Red Tick is an elite verification status reserved exclusively for verified
                    entrepreneurs.
                  </p>

                  <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-red-200/90">
                    Eligibility Criteria
                  </p>
                  <ul className="mt-1 space-y-1 text-[11px] text-slate-200">
                    <li>• Applicant must be a verified Entrepreneur, passing strict cross-verification checks.</li>
                    <li>• Applicant must hold an active leadership role, such as CEO, Founder, Co-Founder or Chairman.</li>
                  </ul>

                  <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-red-200/90">
                    VIP Holding Plan
                  </p>
                  <ul className="mt-1 space-y-1 text-[11px] text-slate-200">
                    <li>• To obtain and retain the Red Tick with VIP Certification, the user must purchase the ₹1 Crore annual VIP Holding Plan.</li>
                    <li>• Valid for 1 year.</li>
                    <li>• Grants access to exclusive VIP IDs and VIP Groups.</li>
                    <li>• Provides maximum visibility across the entire platform.</li>
                  </ul>
                </div>

                {/* Billionaire Badge */}
                <div className="rounded-2xl border border-amber-500/70 bg-amber-500/5 p-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-4.5 w-4.5 items-center justify-center rounded-full border border-amber-300 bg-amber-500 text-[9px] font-bold text-slate-50">
                      👑
                    </span>
                    <p className="text-[11px] font-semibold text-amber-100">
                      Billionaire Badge (Auto-Attached)
                    </p>
                  </div>
                  <ul className="mt-2 space-y-1 text-[11px] text-slate-200">
                    <li>• Automatically awarded upon approval of the 1-year Red Tick VIP Plan.</li>
                    <li>• No separate application is required.</li>
                    <li>• Remains active for the full duration of the VIP plan.</li>
                  </ul>
                </div>

                {/* Blue Tick / Popularity Verification */}
                <div className="rounded-2xl border border-sky-500/60 bg-sky-500/5 p-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-4.5 w-4.5 items-center justify-center rounded-full border border-sky-300 bg-sky-500 text-[9px] font-bold text-slate-50">
                      🔵
                    </span>
                    <p className="text-[11px] font-semibold text-sky-200">
                      Blue Tick (Popularity Verification)
                    </p>
                  </div>

                  <p className="mt-2 text-[11px] text-slate-200">
                    The Blue Tick is designed for highly active and popular users.
                  </p>

                  <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-200/90">
                    Eligibility Criteria
                  </p>
                  <ul className="mt-1 space-y-1 text-[11px] text-slate-200">
                    <li>• Awarded to users with a high number of friends and engagement points.</li>
                    <li>• Valid for 1 year.</li>
                    <li>• No terms or financial requirements.</li>
                  </ul>

                  <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-200/90">
                    Benefits
                  </p>
                  <ul className="mt-1 space-y-1 text-[11px] text-slate-200">
                    <li>• Improves global ranking visibility.</li>
                    <li>• Helps the profile appear near the top of search and discovery.</li>
                    <li>• A user with high points + Blue Tick can rank among the top IDs worldwide.</li>
                  </ul>
                </div>

                {/* Key Distinction */}
                <div className="rounded-2xl border border-fuchsia-500/70 bg-fuchsia-500/5 p-3">
                  <p className="text-[11px] font-semibold text-fuchsia-200">
                    ⚠️ Key Distinction
                  </p>
                  <ul className="mt-2 space-y-1 text-[11px] text-slate-200">
                    <li>• Blue Tick focuses on popularity and reach.</li>
                    <li>• Red Tick represents power, authority and verified leadership.</li>
                    <li>• Red Tick holders receive a dedicated VIP profile card, ensuring superior visibility in every section of the platform — beyond any Blue Tick ranking.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {(showDirectory || isConsoleAnimating) && (
        <div className={`pointer-events-auto fixed inset-0 z-40 flex items-center justify-center bg-slate-950/85 p-0 sm:p-0 ${
          showDirectory ? (isConsoleAnimating ? 'console-backdrop-enter' : '') : 'console-backdrop-exit'
        }`}
        style={{ backdropFilter: 'blur(6px)' }}
        onMouseDown={() => {
          setIsConsoleAnimating(true);
          setTimeout(() => {
            setShowDirectory(false);
            setShowDirectoryMediaOnly(false);
            setMediaFilterTab('all');
          }, 600);
        }}
        >
          <div className={`relative w-[98vw] max-w-none h-[98dvh] flex flex-col rounded-3xl border border-cyan-400/40 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-[1px] shadow-[0_0_30px_rgba(34,211,238,0.7)] transition-all duration-600 ${
            showDirectory ? (isConsoleAnimating ? 'console-modal-enter' : '') : 'console-modal-exit'
          }`}
          style={{
            boxShadow: isConsoleAnimating 
              ? '0 0 100px rgba(34, 211, 238, 0.6), 0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              : '0 0 30px rgba(34, 211, 238, 0.7), 0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch'
          }}
          onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Aura Help Modal - Renders perfectly inside the relative directory container overlay */}
            <AuraHelpModal 
              isOpen={showAuraHelp} 
              onClose={() => setShowAuraHelp(false)} 
            />
            {/* Close Button - Inside Modal */}
            <button
              type="button"
              onClick={() => {
                setIsConsoleAnimating(true);
                setTimeout(() => {
                  setShowDirectory(false);
                  setShowDirectoryMediaOnly(false);
                  setMediaFilterTab('all');
                }, 600);
              }}
              className={`absolute top-2 right-3 z-50 flex h-8 w-8 items-center justify-center rounded-full border border-slate-600/60 bg-slate-900/90 text-slate-300 shadow-lg backdrop-blur-sm hover:border-red-400/70 hover:bg-red-500/10 hover:text-red-200 hover:shadow-red-500/25 active:scale-90 sm:top-2 sm:right-4 sm:h-9 sm:w-9 ${
                showDirectory ? (isConsoleAnimating ? 'close-button-enter' : '') : 'close-button-exit'
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <div
              style={{ overflowAnchor: "none" }}
              className="relative flex h-full flex-col rounded-3xl bg-slate-950/95 px-4 py-0 sm:px-6 sm:py-0 overflow-hidden"
            >
              <div className="pointer-events-none absolute -left-24 -top-24 h-52 w-52 rounded-full bg-gradient-to-br from-cyan-400/50 via-fuchsia-500/40 to-indigo-400/40 blur-3xl" />
              <div className="pointer-events-none absolute -right-24 bottom-[-5rem] h-52 w-52 rounded-full bg-gradient-to-tr from-indigo-400/40 via-sky-500/40 to-fuchsia-500/40 blur-3xl" />

              <div className="relative flex items-center justify-between gap-3 pt-4 pb-2 border-b border-slate-700/60">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300/90">
                    Global Quantum Directory
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Live view of quantum IDs across the network. Tap an ID to open the connect flow.
                  </p>
                </div>
              </div>

              <div
              className="relative mt-3 flex-1 min-h-0 overflow-y-auto pb-6 pr-1 custom-directory-scroll"
            >
                {directoryLoading && (
                  <p className="text-[11px] text-slate-400">Loading global directory…</p>
                )}
                {directoryError && !directoryLoading && (
                  <p className="text-[11px] text-rose-300">{directoryError}</p>
                )}

                {!directoryLoading && !directoryError && directoryItems && directoryItems.length > 0 && (
                  (() => {
                    const allFeedPosts = (directoryItems || [])
                      .filter((item) => {
                        const posts = directoryLatestPostsByAuthorId?.[item.id] || [];
                        return posts.length > 0;
                      })
                      .flatMap((item) => {
                        const posts = directoryLatestPostsByAuthorId?.[item.id] || [];
                        return posts.map((post) => ({
                          ...post,
                          author: item,
                        }));
                      })
                      .sort((a, b) => new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime());

                    const filteredFeedPosts = allFeedPosts.filter((post) => {
                      if (mediaFilterTab === 'all') return true;
                      if (mediaFilterTab === 'shorts') return post.attachmentKind === 'video';
                      if (mediaFilterTab === 'posts') return post.attachmentKind === 'image';
                      if (mediaFilterTab === 'tweets') return post.attachmentKind !== 'video' && post.attachmentKind !== 'image';
                      return true;
                    });

                    return (
                      <>
                    {!showDirectoryMediaOnly && directoryItems.some((item) => item.isRedTick) && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-red-200/90">
                          Elite Founder IDs
                        </p>
                        {directoryItems
                          .filter((item) => item.isRedTick)
                          .map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleDirectorySelect(item.handle)}
                              className="w-full text-left"
                            >
                              <div className="founder-vip-aurora rounded-2xl border border-red-500/80 bg-slate-950/95 p-2.5 overflow-hidden [clip-path:inset(0_round_1rem)] drop-shadow-[0_0_30px_rgba(248,113,113,0.55)]">
                                <div className="founder-vip-aurora-inner founder-vip-shine space-y-1.5 rounded-2xl bg-gradient-to-br from-slate-950/90 via-slate-900/90 to-slate-950/90 px-3 py-2 relative overflow-hidden [clip-path:inset(0_round_1rem)] isolation-isolate">
                                  <div className="founder-vip-line-full absolute inset-x-0 -top-2 -bottom-2 rounded-2xl"></div>
                                  <div className="relative z-10 flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                      <p className="truncate text-[11px] font-semibold text-slate-50 flex items-center gap-1">
                                        <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border border-red-400/80 bg-red-600/60 text-[8px] font-bold text-slate-50">
                                          ✓
                                        </span>
                                        @{item.handle}
                                      </p>
                                      <p className="text-[10px] font-semibold text-slate-200">
                                        Founder & CEO at Q‑Link
                                      </p>
                                    </div>
                                    <div className="relative z-10 shrink-0">
                                      <span className="rounded-full border border-red-400/80 bg-red-500/20 px-2 py-0.5 text-[9px] font-medium text-red-200">
                                        Elite Founder
                                      </span>
                                    </div>
                                  </div>
                                  <div className="relative z-10">
                                    <p className="text-[10px] text-slate-400">
                                      Tap to open this VIP founder ID and send a direct feedback request.
                                    </p>
                                  </div>
                              </div>
                              </div>
                            </button>
                          ))}
                      </div>
                    )}

                    {!showDirectoryMediaOnly && directoryItems.some((item) => item.blueTickStatus === 'SAPPHIRE') && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-300">
                          Sapphire VIP IDs
                        </p>
                        {directoryItems
                          .filter((item) => item.blueTickStatus === 'SAPPHIRE')
                          .map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleDirectorySelect(item.handle)}
                              className="w-full text-left"
                            >
                              <div className="founder-vip-sapphire rounded-2xl border border-sky-500/80 bg-slate-950/95 p-2.5 overflow-hidden [clip-path:inset(0_round_1rem)] drop-shadow-[0_0_30px_rgba(14,165,233,0.55)]">
                                <div className="founder-vip-sapphire-inner founder-vip-sapphire-shine space-y-1.5 rounded-2xl bg-gradient-to-br from-slate-950/90 via-slate-900/90 to-slate-950/90 px-3 py-2 relative overflow-hidden [clip-path:inset(0_round_1rem)] isolation-isolate">
                                  <div className="founder-vip-sapphire-line-full absolute inset-x-0 -top-2 -bottom-2 rounded-2xl"></div>
                                  <div className="relative z-10 flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                      <p className="truncate text-[11px] font-semibold text-slate-50 flex items-center gap-1">
                                        <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border border-sky-300 bg-sky-500 text-[8px] font-bold text-slate-50">
                                          ✓
                                        </span>
                                        @{item.handle}
                                      </p>
                                      <p className="text-[10px] font-semibold text-sky-200">
                                        {item.name || 'Sapphire VIP'}
                                      </p>
                                    </div>
                                    <div className="relative z-10">
                                      <span className="rounded-full border border-sky-400/80 bg-sky-500/20 px-2 py-0.5 text-[9px] font-medium text-sky-200">
                                        Sapphire VIP
                                      </span>
                                    </div>
                                  </div>
                                  <div className="relative z-10">
                                    <p className="text-[10px] text-slate-400">
                                      Tap to open this Sapphire VIP ID and send a direct connection request.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                      </div>
                    )}

                    {!showDirectoryMediaOnly && directoryItems.some((item) => item.blueTickStatus === 'verified') && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-200/90">
                          Blue Tick Verified IDs
                        </p>
                        {directoryItems
                          .filter((item) => item.blueTickStatus === 'verified')
                          .map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleDirectorySelect(item.handle)}
                              className="w-full text-left"
                            >
                              <div className="founder-vip-aurora rounded-2xl border border-sky-500/80 bg-slate-950/95 p-2.5 overflow-hidden [clip-path:inset(0_round_1rem)] drop-shadow-[0_0_30px_rgba(56,189,248,0.55)]">
                                <div className="founder-vip-aurora-inner founder-vip-shine space-y-1.5 rounded-2xl bg-gradient-to-br from-slate-950/90 via-slate-900/90 to-slate-950/90 px-3 py-2 relative overflow-hidden">
                                  <div className="founder-vip-line-full absolute inset-x-0 -top-2 -bottom-2 rounded-2xl"></div>
                                  <div className="relative z-10 flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                      <p className="truncate text-[11px] font-semibold text-slate-50 flex items-center gap-1">
                                        <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border border-sky-300 bg-sky-500 text-[8px] font-bold text-slate-50">
                                          ✓
                                        </span>
                                        @{item.handle}
                                      </p>
                                      <p className="text-[10px] font-semibold text-slate-200">
                                        {item.name || 'Verified User'}
                                      </p>
                                    </div>
                                    <div className="relative z-10">
                                      <span className="rounded-full border border-sky-400/80 bg-sky-500/20 px-2 py-0.5 text-[9px] font-medium text-sky-200">
                                        Blue Tick
                                      </span>
                                    </div>
                                  </div>
                                  <div className="relative z-10 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <span className={`text-[10px] font-bold ${getAuraColor(item.auraPercentage)}`}>
                                        Aura: {item.auraPercentage}%
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          console.log('Blue Tick Aura help button clicked');
                                          setShowAuraHelp(true);
                                        }}
                                        className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-slate-600/50 bg-slate-800/50 text-[8px] text-slate-400 hover:text-slate-300 hover:bg-slate-700/50 transition-all duration-200 cursor-pointer"
                                        title="What is Aura?"
                                      >
                                        ?
                                      </button>
                                      <span className="text-[10px] text-slate-400">
                                        • {item.points} points
                                      </span>
                                    </div>
                                  </div>
                                  <div className="relative z-10">
                                    <p className="text-[10px] text-slate-400">
                                      Tap to open this verified user and send a direct connection request.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                      </div>
                    )}

                    <div className="space-y-2">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        {showDirectoryMediaOnly ? "Quantum Media Feed" : "All Quantum IDs"}
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIdConsoleTab("my");
                            setShowIdConsole(true);
                          }}
                          className="group relative flex-1 overflow-hidden rounded-2xl border border-cyan-400/50 bg-gradient-to-r from-cyan-500/10 via-sky-500/10 to-fuchsia-500/10 px-3 py-2 text-left text-[11px] font-semibold text-cyan-100 transition hover:border-cyan-300/80 hover:from-cyan-500/15 hover:via-sky-500/15 hover:to-fuchsia-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                        >
                          <span className="pointer-events-none absolute -left-16 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-cyan-400/30 blur-2xl transition group-hover:bg-cyan-400/40" />
                          <span className="pointer-events-none absolute -right-16 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-fuchsia-500/25 blur-2xl transition group-hover:bg-fuchsia-500/35" />
                          <span className="relative flex items-center justify-between gap-3">
                            <span className="flex items-center gap-2">
                              <span className="relative flex h-2.5 w-2.5 items-center justify-center">
                                <span className="absolute inline-flex h-full w-full rounded-full bg-cyan-400/70 opacity-60 animate-ping" />
                                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-200" />
                              </span>
                              <span className="tracking-[0.12em] uppercase">See your ID</span>
                            </span>
                            <span className="text-[10px] font-medium text-slate-200/90">
                              Live
                            </span>
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setShowDirectoryMediaOnly(!showDirectoryMediaOnly);
                          }}
                          className={`group relative flex-1 overflow-hidden rounded-2xl border px-3 py-2 text-left text-[11px] font-bold uppercase transition duration-300 active:scale-95 cursor-pointer ${
                            showDirectoryMediaOnly
                              ? "border-amber-400/85 bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-rose-500/15 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                              : "border-fuchsia-500/40 bg-gradient-to-r from-indigo-500/10 via-fuchsia-500/10 to-pink-500/10 text-fuchsia-200 hover:border-fuchsia-400/80 hover:from-indigo-500/15 hover:to-pink-500/15 shadow-[0_0_15px_rgba(219,39,119,0.25)]"
                          }`}
                        >
                          <span className="pointer-events-none absolute -left-16 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-fuchsia-500/20 blur-2xl transition group-hover:bg-fuchsia-500/30" />
                          <span className="pointer-events-none absolute -right-16 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-amber-500/20 blur-2xl transition group-hover:bg-amber-500/30" />
                          <span className="relative flex items-center justify-between gap-3">
                            <span className="flex items-center gap-1.5">
                              <span className="relative flex h-2 w-2 items-center justify-center">
                                <span className={`absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping ${showDirectoryMediaOnly ? "bg-amber-400" : "bg-fuchsia-400"}`} />
                                <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${showDirectoryMediaOnly ? "bg-amber-300" : "bg-fuchsia-300"}`} />
                              </span>
                              <span className="tracking-[0.11em]">
                                {showDirectoryMediaOnly ? "← All ID Cards" : "Shorts • Posts • Tweets"}
                              </span>
                            </span>
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setLocalPointsOverride((session?.user as any)?.points || 0);
                            setShowStore(true);
                            setIsStoreAnimating(true);
                          }}
                          title="Quantum Upgrade Store"
                          className="group relative flex h-[33px] w-[38px] flex-none items-center justify-center overflow-hidden rounded-2xl border border-blue-500/40 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-cyan-500/10 transition-all duration-300 hover:border-blue-400/80 hover:from-blue-500/20 hover:to-cyan-500/20 shadow-[0_0_15px_rgba(59,130,246,0.3)] active:scale-95"
                        >
                          <span className="pointer-events-none absolute -left-6 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full bg-blue-400/20 blur-xl transition group-hover:bg-blue-400/30" />
                          <span className="relative flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="2.5"
                              stroke="currentColor"
                              className="h-4.5 w-4.5 text-blue-300 transition-all duration-300 group-hover:scale-110 group-hover:text-blue-200"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                              />
                            </svg>
                          </span>
                        </button>
                      </div>

                      {/* Media Filter Sub-Navigation */}
                      {showDirectoryMediaOnly && (
                        <div className="flex flex-col gap-3 pb-3 mb-2 border-b border-slate-800/80 sticky top-0 bg-slate-950/95 z-30 pt-1 backdrop-blur-md">
                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => {
                                setShowDirectoryMediaOnly(false);
                                setMediaFilterTab('all');
                              }}
                              className="group flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-900/40 px-3 py-1.5 text-[11px] font-semibold text-slate-300 transition duration-300 hover:border-cyan-400/80 hover:bg-cyan-500/10 hover:text-cyan-200 active:scale-95 shadow-[0_0_15px_rgba(34,211,238,0.1)] cursor-pointer"
                            >
                              <span className="text-[12px] transition group-hover:-translate-x-0.5">←</span>
                              <span>Back to IDs</span>
                            </button>
                            
                            <div className="flex items-center gap-1.5 rounded-full border border-amber-500/35 bg-amber-500/5 px-2.5 py-0.5 text-[10px] font-bold text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.15)] animate-pulse">
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 animate-ping"></span>
                                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-300"></span>
                              </span>
                              <span>MEDIA ACTIVE</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                            {[
                              { id: 'all', label: 'All Feed', icon: '🌐', color: 'cyan' },
                              { id: 'shorts', label: 'Shorts', icon: '🎬', color: 'amber' },
                              { id: 'posts', label: 'Posts', icon: '📷', color: 'rose' },
                              { id: 'tweets', label: 'Tweets', icon: '💬', color: 'indigo' }
                            ].map((tab) => {
                              const isActive = mediaFilterTab === tab.id;
                              let activeClass = "";
                              let inactiveClass = "border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:text-slate-200";
                              
                              if (isActive) {
                                if (tab.color === 'cyan') activeClass = "border-cyan-400/80 bg-cyan-500/15 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.25)]";
                                else if (tab.color === 'amber') activeClass = "border-amber-400/80 bg-amber-500/15 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.25)]";
                                else if (tab.color === 'rose') activeClass = "border-rose-400/80 bg-rose-500/15 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.25)]";
                                else if (tab.color === 'indigo') activeClass = "border-indigo-400/80 bg-indigo-500/15 text-indigo-200 shadow-[0_0_12px_rgba(99,102,241,0.25)]";
                              }
                              
                              return (
                                <button
                                  key={tab.id}
                                  type="button"
                                  onClick={() => setMediaFilterTab(tab.id as any)}
                                  className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-300 active:scale-95 cursor-pointer ${
                                    isActive ? activeClass : inactiveClass
                                  }`}
                                >
                                  <span>{tab.icon}</span>
                                  <span>{tab.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="space-y-1.5">
                        {!showDirectoryMediaOnly && directoryItems.map((item) => (
                          <div
                            key={item.id}
                            className="rounded-2xl border border-slate-700/70 bg-slate-900/80 px-3 py-2 text-[11px] text-slate-200 hover:border-cyan-400/70 hover:bg-slate-900/95 transition-[border-color,background-color] duration-300 smooth-gpu-card"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="inline-flex h-5 min-w-[1.75rem] items-center justify-center rounded-full bg-slate-800/80 text-[10px] font-semibold text-slate-200">
                                  #{item.rank}
                                </span>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1 min-w-0">
                                    <p className="truncate font-medium text-cyan-200">
                                      @{item.handle}
                                    </p>
                                    {item.blueTickStatus === "SAPPHIRE" && (
                                      <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-sky-500/20 border border-sky-400/80 text-[7px] font-bold text-sky-300 shadow-[0_0_8px_rgba(56,189,248,0.4)]">
                                        ✓
                                      </span>
                                    )}
                                    {item.isRedTick && (
                                      <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500/25 border border-red-400/80 text-[7px] font-bold text-red-300 shadow-[0_0_8px_rgba(248,113,113,0.4)]">
                                        ✓
                                      </span>
                                    )}
                                  </div>
                                  {item.name && (
                                    <p className="truncate text-[10px] text-slate-400">
                                      {item.name}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {/* Aura Display */}
                                <div className="flex items-center gap-1">
                                  <span className={`text-[10px] font-bold ${getAuraColor(item.auraPercentage || 0)}`}>
                                    {item.auraPercentage || 0}% Aura
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      console.log('Aura help button clicked');
                                      setShowAuraHelp(true);
                                    }}
                                    className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-slate-600/50 bg-slate-800/50 text-[8px] text-slate-400 hover:text-slate-300 hover:bg-slate-700/50 transition-all duration-200 cursor-pointer"
                                    title="What is Aura?"
                                  >
                                    ?
                                  </button>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDirectorySelect(item.handle)}
                                  className="inline-flex items-center rounded-full border border-cyan-400/70 bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-medium text-cyan-200 hover:bg-cyan-500/20"
                                >
                                  Send request
                                </button>
                              </div>
                            </div>

                            {/* Latest GLOBAL post card for this ID */}
                            {(() => {
                              const posts = directoryLatestPostsByAuthorId?.[item.id] || [];
                              if (!posts.length) return null;
                              return (
                                <div className="mt-2 space-y-2" style={{ overflowAnchor: "none" }}>
                                  {posts.map((post) => {
                                    const timeAgo = formatTimeAgo(post?.createdAt);
                                    return (
                                      <div
                                        key={post.id}
                                        style={{ overflowAnchor: "none" }}
                                        className="rounded-2xl border border-slate-700/60 bg-slate-950/60 p-2.5 cursor-pointer hover:border-slate-600/80 transition-all"
                                        onClick={() => trackPostView(post.id)}
                                      >
                                        <div className="flex items-start justify-between gap-2">
                                          <div className="min-w-0 flex items-center gap-2">
                                            <div className="relative h-5 w-5 rounded-full overflow-hidden flex-shrink-0 bg-slate-800">
                                              {/* Initials Fallback */}
                                              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 to-fuchsia-500/30 flex items-center justify-center text-[8px] font-bold text-white uppercase">
                                                {(item?.handle?.[0] || item?.name?.[0] || '?').toUpperCase()}
                                              </div>
                                              {isValidImageUrl(item?.image) && (
                                                <img
                                                  src={getHighResProfilePic(item.image)}
                                                  alt={item.name || item.handle || 'User'}
                                                  className="absolute inset-0 h-full w-full object-cover rounded-full"
                                                  referrerPolicy="no-referrer"
                                                  onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                  }}
                                                />
                                              )}
                                            </div>
                                            <div>
                                              <p className="truncate text-[10px] font-semibold text-slate-100">
                                                @{item.handle}
                                              </p>
                                              {timeAgo && (
                                                <p className="text-[10px] text-slate-400">
                                                  {timeAgo}
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                          <span className="rounded-full border border-slate-700/60 bg-slate-900/60 px-2 py-0.5 text-[9px] font-medium text-slate-300">
                                            Global
                                          </span>
                                        </div>

                                  {post?.text && (
                                    <p className="mt-2 whitespace-pre-wrap text-[11px] text-slate-200">
                                      {post.text}
                                    </p>
                                  )}

                                  {post?.media?.url && post?.media?.kind === "image" && (
                                    <div className="mt-2 overflow-hidden rounded-xl border border-slate-800/70 bg-slate-950">
                                      <div className="mx-auto w-full max-w-[720px] bg-slate-950 h-[380px] sm:h-[500px] md:h-[580px] lg:h-[640px] flex items-center justify-center">
                                        <StableImage src={post.media.url} alt="Post media" />
                                      </div>
                                    </div>
                                  )}

                                  {post?.media?.url && post?.media?.kind === "video" && (
                                    <div className="mt-2 overflow-hidden rounded-xl border border-slate-800/70 bg-slate-950">
                                      <div className="mx-auto w-full max-w-[720px] bg-slate-950 h-[380px] sm:h-[500px] md:h-[580px] lg:h-[640px] flex items-center justify-center">
                                        <SmartVideo
                                          src={post.media.url}
                                          className="h-full w-full"
                                          preload="metadata"
                                          autoplayMuted
                                        />
                                      </div>
                                    </div>
                                  )}

                                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          
                                          // Additional validation
                                          const currentUserId = (session?.user as any)?.id;
                                          const postAuthorId = post.authorId;
                                          
                                          console.log('Follow button clicked:', {
                                            postAuthorId,
                                            currentUserId,
                                            areSame: postAuthorId === currentUserId,
                                            postData: post
                                          });
                                          
                                          if (postAuthorId === currentUserId) {
                                            alert('You cannot follow your own post');
                                            return;
                                          }
                                          
                                          handleFollow(postAuthorId);
                                        }}
                                        disabled={!(session?.user as any)?.id || engagementLoading[post.authorId]?.follow}
                                        className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium transition-all ${
                                          followStatus[post.authorId]
                                            ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-300'
                                            : 'border-slate-700/60 bg-slate-900/60 text-slate-200 hover:border-cyan-400/60'
                                        } ${engagementLoading[post.authorId]?.follow ? 'opacity-50 cursor-not-allowed' : ''}`}
                                      >
                                        {engagementLoading[post.authorId]?.follow ? 
                                          (followStatus[post.authorId] ? 'Unfollowing...' : 'Following...') :
                                          (followStatus[post.authorId] ? 'Following' : 'Follow')
                                        }
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleReaction(post.id, 1);
                                        }}
                                        disabled={!(session?.user as any)?.id || engagementLoading[post.id]?.reaction}
                                        className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-medium transition-all ${
                                          postReactions[post.id]?.userReaction === 1
                                            ? 'bg-pink-500/20 border-pink-400/60 text-pink-300'
                                            : 'border-slate-700/60 bg-slate-900/60 text-slate-200 hover:border-pink-400/60'
                                        } ${engagementLoading[post.id]?.reaction ? 'opacity-50 cursor-not-allowed' : ''}`}
                                      >
                                        {engagementLoading[post.id]?.reaction ? (
                                          '...'
                                        ) : (
                                          <svg 
                                            xmlns="http://www.w3.org/2000/svg" 
                                            viewBox="0 0 24 24" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            strokeWidth="2" 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round"
                                            className="w-3.5 h-3.5"
                                          >
                                            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                                          </svg>
                                        )}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleReaction(post.id, -1);
                                        }}
                                        disabled={!(session?.user as any)?.id || engagementLoading[post.id]?.reaction}
                                        className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-medium transition-all ${
                                          postReactions[post.id]?.userReaction === -1
                                            ? 'bg-orange-500/20 border-orange-400/60 text-orange-300'
                                            : 'border-slate-700/60 bg-slate-900/60 text-slate-200 hover:border-orange-400/60'
                                        } ${engagementLoading[post.id]?.reaction ? 'opacity-50 cursor-not-allowed' : ''}`}
                                      >
                                        {engagementLoading[post.id]?.reaction ? (
                                          '...'
                                        ) : (
                                          <svg 
                                            xmlns="http://www.w3.org/2000/svg" 
                                            viewBox="0 0 24 24" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            strokeWidth="2" 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round"
                                            className="w-3.5 h-3.5"
                                          >
                                            <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.28a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"/>
                                          </svg>
                                        )}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setDirectoryOpenCommentsPostId((cur) =>
                                            cur === post.id ? null : post.id,
                                          );
                                          if (!directoryOpenCommentsPostId || directoryOpenCommentsPostId !== post.id) {
                                            fetchComments(post.id);
                                          }
                                        }}
                                        className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium transition-all ${
                                          directoryOpenCommentsPostId === post.id
                                            ? 'bg-blue-500/20 border-blue-400/60 text-blue-300'
                                            : 'border-slate-700/60 bg-slate-900/60 text-slate-200 hover:border-blue-400/60'
                                        }`}
                                      >
                                        Comment
                                      </button>
                                    </div>

                                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                      <span>{postReactions[post.id]?.likes || post?._count?.reactions || 0} likes</span>
                                      <span>{postReactions[post.id]?.dislikes || 0} dislikes</span>
                                      <span>{post?._count?.comments || 0} comments</span>
                                    </div>
                                  </div>

                                  {directoryOpenCommentsPostId === post.id && (
                                    <div className="mt-2 rounded-xl border border-slate-700/60 bg-slate-950/70 p-2">
                                      <p className="text-[10px] font-semibold text-slate-200">
                                        Comments
                                      </p>
                                      
                                      {/* Comment Input */}
                                      {(session?.user as any)?.id && (
                                        <div className="mt-2 flex gap-2">
                                          <input
                                            type="text"
                                            value={commentInputs[post.id] || ''}
                                            onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                                            onKeyPress={(e) => {
                                              if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleAddComment(post.id);
                                              }
                                            }}
                                            placeholder="Add a comment..."
                                            className="flex-1 rounded-lg border border-slate-600/70 bg-slate-900/80 px-2 py-1 text-[10px] text-slate-100 outline-none ring-0 transition focus:border-blue-400 focus:bg-slate-900 focus:shadow-[0_0_0_1px_rgba(59,130,246,0.6)]"
                                            disabled={engagementLoading[post.id]?.comment}
                                          />
                                          <button
                                            onClick={() => handleAddComment(post.id)}
                                            disabled={!commentInputs[post.id]?.trim() || engagementLoading[post.id]?.comment}
                                            className="rounded-lg border border-slate-600/70 bg-slate-900/80 px-2 py-1 text-[10px] font-medium text-slate-200 transition hover:border-blue-400 hover:bg-slate-900 focus:border-blue-400 focus:bg-slate-900 focus:shadow-[0_0_0_1px_rgba(59,130,246,0.6)] disabled:opacity-50 disabled:cursor-not-allowed"
                                          >
                                            {engagementLoading[post.id]?.comment ? 'Posting...' : 'Post'}
                                          </button>
                                        </div>
                                      )}

                                      {/* Comments List */}
                                      <div className="mt-3 space-y-2 max-h-60 overflow-y-auto scrollbar-hide">
                                        {commentsLoading[post.id] ? (
                                          <p className="text-[10px] text-slate-400 text-center py-2">Loading comments...</p>
                                        ) : postComments[post.id]?.length > 0 ? (
                                          postComments[post.id].map((comment) => (
                                            <div key={comment.id} className="rounded-lg border border-slate-700/50 bg-slate-900/40 p-2">
                                              <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                  <div className="relative h-4 w-4 rounded-full overflow-hidden flex-shrink-0 bg-slate-800">
                                                    {/* Initials Fallback */}
                                                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 to-fuchsia-500/30 flex items-center justify-center text-[7px] font-bold text-white uppercase">
                                                      {(comment.author.handle?.[0] || comment.author.name?.[0] || '?').toUpperCase()}
                                                    </div>
                                                    {isValidImageUrl(comment.author.image) && (
                                                      <img
                                                        src={getHighResProfilePic(comment.author.image)}
                                                        alt={comment.author.name || 'User'}
                                                        className="absolute inset-0 h-full w-full object-cover rounded-full"
                                                        referrerPolicy="no-referrer"
                                                        onError={(e) => {
                                                          (e.target as HTMLImageElement).style.display = 'none';
                                                        }}
                                                      />
                                                    )}
                                                  </div>
                                                  <span className="text-[9px] font-medium text-slate-300">
                                                    {comment.author.name || comment.author.handle || 'Anonymous'}
                                                  </span>
                                                </div>
                                                <span className="text-[8px] text-slate-500">
                                                  {formatTimeAgo(comment.createdAt)}
                                                </span>
                                              </div>
                                              <p className="mt-1 text-[10px] text-slate-200 leading-relaxed">
                                                {comment.content}
                                              </p>
                                            </div>
                                          ))
                                        ) : (
                                          <p className="text-[10px] text-slate-400 text-center py-2">
                                            No comments yet. Be the first to comment!
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })()}
                          </div>
                        ))}

                        {/* Dedicated Content-First Media Feed (Media Active Mode) */}
                        {showDirectoryMediaOnly && (
                          filteredFeedPosts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center bg-slate-900/30 rounded-3xl border border-slate-800/80 p-8 shadow-inner">
                              <span className="text-4xl mb-3 animate-pulse">🔍</span>
                              <p className="text-[12px] font-bold text-cyan-300 uppercase tracking-widest">
                                No {mediaFilterTab === 'all' ? 'posts' : mediaFilterTab} Found
                              </p>
                              <p className="text-[10px] text-slate-400 mt-1 max-w-[280px] mx-auto leading-relaxed">
                                Nobody has uploaded any {mediaFilterTab === 'all' ? 'content' : mediaFilterTab} in this category yet.
                              </p>
                            </div>
                          ) : (
                            filteredFeedPosts.map((post) => {
                              const item = post.author;
                              const timeAgo = formatTimeAgo(post?.createdAt);
                              const isVid = post?.attachmentKind === "video";
                              const isImg = post?.attachmentKind === "image";
                              let label = "💬 Tweet";
                              let badgeClass = "border-indigo-500/40 bg-indigo-500/10 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.2)]";
                              if (isVid) {
                                label = "🎬 Shorts";
                                badgeClass = "border-amber-500/40 bg-amber-500/10 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]";
                              } else if (isImg) {
                                label = "📷 Post";
                                badgeClass = "border-cyan-500/40 bg-cyan-500/10 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]";
                              }
                              
                              return (
                                <div
                                  key={post.id}
                                  style={{ overflowAnchor: "none" }}
                                  className="rounded-3xl border border-slate-700/60 bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-4 hover:border-cyan-400/50 transition-[border-color,box-shadow] duration-300 shadow-xl group/card relative overflow-hidden smooth-gpu-card"
                                  onClick={() => trackPostView(post.id)}
                                >
                                  {/* Aura Ambient Background Glow on Hover */}
                                  <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/0 via-fuchsia-500/0 to-cyan-500/0 opacity-0 group-hover/card:opacity-[0.03] transition-opacity duration-500 pointer-events-none" />

                                  {/* Header: Profile Info + Label */}
                                  <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800/80 mb-3.5">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <div className="relative h-6.5 w-6.5 rounded-full overflow-hidden flex-shrink-0 bg-slate-800 border border-slate-700">
                                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 to-fuchsia-500/30 flex items-center justify-center text-[9.5px] font-bold text-white uppercase">
                                          {(item?.handle?.[0] || item?.name?.[0] || '?').toUpperCase()}
                                        </div>
                                        {isValidImageUrl(item?.image) && (
                                          <img
                                            src={getHighResProfilePic(item.image)}
                                            alt={item.name || item.handle || 'User'}
                                            className="absolute inset-0 h-full w-full object-cover rounded-full"
                                            referrerPolicy="no-referrer"
                                            onError={(e) => {
                                              (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                          />
                                        )}
                                      </div>
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-1">
                                          <p className="truncate text-[11px] font-bold text-cyan-200 hover:text-cyan-100 transition">
                                            @{item.handle}
                                          </p>
                                          {item.blueTickStatus === "SAPPHIRE" && (
                                            <span className="flex h-3 w-3 items-center justify-center rounded-full bg-sky-500/20 border border-sky-400/80 text-[6.5px] font-bold text-sky-300 shadow-[0_0_8px_rgba(56,189,248,0.4)]">
                                              ✓
                                            </span>
                                          )}
                                          {item.isRedTick && (
                                            <span className="flex h-3 w-3 items-center justify-center rounded-full bg-red-500/25 border border-red-400/80 text-[6.5px] font-bold text-red-300 shadow-[0_0_8px_rgba(248,113,113,0.4)]">
                                              ✓
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-[9.5px] text-slate-400 flex items-center gap-1 font-medium font-sans">
                                          {item.name || 'Verified User'} • {timeAgo}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <span className={`rounded-full border px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${badgeClass}`}>
                                        {label}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Text content */}
                                  {post?.text && (
                                    <p className="whitespace-pre-wrap text-[11.5px] text-slate-100 leading-relaxed mb-3.5 font-normal px-0.5 font-sans">
                                      {post.text}
                                    </p>
                                  )}

                                  {/* Image Attachment */}
                                  {post?.media?.url && post?.media?.kind === "image" && (
                                    <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950 mb-3.5 relative shadow-lg">
                                      <div className="mx-auto w-full max-w-[720px] bg-slate-950 h-[380px] sm:h-[500px] md:h-[580px] lg:h-[640px] flex items-center justify-center">
                                        <StableImage src={post.media.url} alt="Post media" />
                                      </div>
                                    </div>
                                  )}

                                  {/* Video Attachment */}
                                  {post?.media?.url && post?.media?.kind === "video" && (
                                    <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950 mb-3.5 relative shadow-lg">
                                      <div className="mx-auto w-full max-w-[720px] bg-slate-950 h-[380px] sm:h-[500px] md:h-[580px] lg:h-[640px] flex items-center justify-center">
                                        <SmartVideo
                                          src={post.media.url}
                                          className="h-full w-full"
                                          preload="metadata"
                                          autoplayMuted
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {/* Action buttons */}
                                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 pt-3 mt-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const currentUserId = (session?.user as any)?.id;
                                          const postAuthorId = post.authorId;
                                          if (postAuthorId === currentUserId) {
                                            alert('You cannot follow your own post');
                                            return;
                                          }
                                          handleFollow(postAuthorId);
                                        }}
                                        disabled={!(session?.user as any)?.id || engagementLoading[post.authorId]?.follow}
                                        className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase transition-all duration-200 cursor-pointer ${
                                          followStatus[post.authorId]
                                            ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.15)]'
                                            : 'border-slate-700/60 bg-slate-900/60 text-slate-200 hover:border-cyan-400/60 hover:text-cyan-200'
                                        } ${engagementLoading[post.authorId]?.follow ? 'opacity-50 cursor-not-allowed' : ''}`}
                                      >
                                        {engagementLoading[post.authorId]?.follow ? '...' : (followStatus[post.authorId] ? 'Following' : 'Follow')}
                                      </button>
                                      
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleReaction(post.id, 1);
                                        }}
                                        disabled={!(session?.user as any)?.id || engagementLoading[post.id]?.reaction}
                                        className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase transition-all duration-200 cursor-pointer ${
                                          postReactions[post.id]?.userReaction === 1
                                            ? 'bg-pink-500/20 border-pink-400/60 text-pink-300 shadow-[0_0_10px_rgba(244,63,94,0.15)]'
                                            : 'border-slate-700/60 bg-slate-900/60 text-slate-200 hover:border-pink-400/60 hover:text-pink-200'
                                        } ${engagementLoading[post.id]?.reaction ? 'opacity-50 cursor-not-allowed' : ''}`}
                                      >
                                        {engagementLoading[post.id]?.reaction ? '...' : (
                                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                                        )}
                                      </button>
                                      
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleReaction(post.id, -1);
                                        }}
                                        disabled={!(session?.user as any)?.id || engagementLoading[post.id]?.reaction}
                                        className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase transition-all duration-200 cursor-pointer ${
                                          postReactions[post.id]?.userReaction === -1
                                            ? 'bg-orange-500/20 border-orange-400/60 text-orange-300 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                                            : 'border-slate-700/60 bg-slate-900/60 text-slate-200 hover:border-pink-400/60 hover:text-pink-200'
                                        } ${engagementLoading[post.id]?.reaction ? 'opacity-50 cursor-not-allowed' : ''}`}
                                      >
                                        {engagementLoading[post.id]?.reaction ? '...' : (
                                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.28a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"/></svg>
                                        )}
                                      </button>
                                      
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setDirectoryOpenCommentsPostId((cur) => cur === post.id ? null : post.id);
                                          if (!directoryOpenCommentsPostId || directoryOpenCommentsPostId !== post.id) {
                                            fetchComments(post.id);
                                          }
                                        }}
                                        className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase transition-all duration-200 cursor-pointer ${
                                          directoryOpenCommentsPostId === post.id
                                            ? 'bg-blue-500/20 border-blue-400/60 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.15)]'
                                            : 'border-slate-700/60 bg-slate-900/60 text-slate-200 hover:border-blue-400/60 hover:text-blue-200'
                                        }`}
                                      >
                                        Comment
                                      </button>
                                    </div>

                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold tracking-wider">
                                      <span>{postReactions[post.id]?.likes || post?._count?.reactions || 0} LIKES</span>
                                      <span>•</span>
                                      <span>{post?._count?.comments || 0} COMMENTS</span>
                                    </div>
                                  </div>

                                  {/* Comments Section */}
                                  {directoryOpenCommentsPostId === post.id && (
                                    <div className="mt-3.5 rounded-2xl border border-slate-700/60 bg-slate-950/70 p-3 shadow-inner">
                                      <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-2">Comments</p>
                                      
                                      {/* Comment Input */}
                                      {(session?.user as any)?.id && (
                                        <div className="flex gap-2">
                                          <input
                                            type="text"
                                            value={commentInputs[post.id] || ''}
                                            onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                                            onKeyPress={(e) => {
                                              if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleAddComment(post.id);
                                              }
                                            }}
                                            placeholder="Add a comment..."
                                            className="flex-1 rounded-xl border border-slate-600/70 bg-slate-900/80 px-3 py-1.5 text-[10.5px] text-slate-100 outline-none ring-0 transition focus:border-blue-400 focus:bg-slate-900 focus:shadow-[0_0_0_1px_rgba(59,130,246,0.6)]"
                                            disabled={engagementLoading[post.id]?.comment}
                                          />
                                          <button
                                            onClick={() => handleAddComment(post.id)}
                                            disabled={!commentInputs[post.id]?.trim() || engagementLoading[post.id]?.comment}
                                            className="rounded-xl border border-slate-600/70 bg-slate-900/80 px-3 py-1.5 text-[10px] font-bold text-slate-200 transition hover:border-blue-400 hover:bg-slate-900 focus:border-blue-400 focus:bg-slate-900 focus:shadow-[0_0_0_1px_rgba(59,130,246,0.6)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                          >
                                            {engagementLoading[post.id]?.comment ? '...' : 'Post'}
                                          </button>
                                        </div>
                                      )}

                                      {/* Comments List */}
                                      <div className="mt-3.5 space-y-2 max-h-60 overflow-y-auto scrollbar-hide">
                                        {commentsLoading[post.id] ? (
                                          <p className="text-[10px] text-slate-400 text-center py-2">Loading comments...</p>
                                        ) : postComments[post.id]?.length > 0 ? (
                                          postComments[post.id].map((comment) => (
                                            <div key={comment.id} className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-2.5">
                                              <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                  <div className="relative h-4.5 w-4.5 rounded-full overflow-hidden flex-shrink-0 bg-slate-800">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 to-fuchsia-500/30 flex items-center justify-center text-[7px] font-bold text-white uppercase">
                                                      {(comment.author.handle?.[0] || comment.author.name?.[0] || '?').toUpperCase()}
                                                    </div>
                                                    {isValidImageUrl(comment.author.image) && (
                                                      <img
                                                        src={getHighResProfilePic(comment.author.image)}
                                                        alt={comment.author.name || 'User'}
                                                        className="absolute inset-0 h-full w-full object-cover rounded-full"
                                                        referrerPolicy="no-referrer"
                                                        onError={(e) => {
                                                          (e.target as HTMLImageElement).style.display = 'none';
                                                        }}
                                                      />
                                                    )}
                                                  </div>
                                                  <span className="text-[9.5px] font-bold text-slate-300">
                                                    {comment.author.name || comment.author.handle || 'Anonymous'}
                                                  </span>
                                                </div>
                                                <span className="text-[8.5px] text-slate-500 font-bold uppercase tracking-wider">
                                                  {formatTimeAgo(comment.createdAt)}
                                                </span>
                                              </div>
                                              <p className="mt-1 text-[10px] text-slate-200 leading-relaxed font-normal">
                                                {comment.content}
                                              </p>
                                            </div>
                                          ))
                                        ) : (
                                          <p className="text-[10px] text-slate-400 text-center py-2 font-medium">No comments yet. Be the first to comment!</p>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )
                        )}
                      </div>

                      {directoryPostsLoading && (
                        <p className="text-[11px] text-slate-400">Loading global posts…</p>
                      )}
                      {directoryPostsError && !directoryPostsLoading && (
                        <p className="text-[11px] text-rose-300">{directoryPostsError}</p>
                      )}
                    </div>
                  </>
                );
              })()
            )}

                {!directoryLoading && !directoryError && (!directoryItems || directoryItems.length === 0) && (
                  <p className="text-[11px] text-slate-500">No quantum IDs are visible in the directory yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      
        {/* Main Chat Container - Full Width */}
        <div 
          className={`flex w-full flex-1 glass-panel-responsive neon-border-responsive relative px-0 py-0 sm:px-6 md:px-8 lg:px-10 sm:py-6 md:py-8 ${isChatFull ? "h-full min-h-0 overflow-hidden" : "h-auto min-h-screen overflow-y-visible"} ${isGlowActive ? "glow-active" : ""}`}
          onTouchStart={() => setIsGlowActive(true)}
          onTouchEnd={() => setIsGlowActive(false)}
          onTouchCancel={() => setIsGlowActive(false)}
          style={{
            scrollBehavior: 'smooth',
            overscrollBehaviorY: 'contain',
            WebkitOverflowScrolling: 'touch',
          }}>
        <style jsx>{`
          @keyframes glow-pulse {
            0%, 100% {
              box-shadow: 0 0 0 1px rgba(34, 211, 238, 0.6), 0 0 40px rgba(56, 189, 248, 0.4), 0 0 80px rgba(56, 189, 248, 0.2);
            }
            50% {
              box-shadow: 0 0 0 2px rgba(34, 211, 238, 0.8), 0 0 80px rgba(56, 189, 248, 0.6), 0 0 120px rgba(56, 189, 248, 0.4);
            }
          }
          @keyframes guide-glow {
            0%, 100% {
              box-shadow: 0 0 0 1px rgba(34, 211, 238, 0.2), 0 0 20px rgba(56, 189, 248, 0.15);
            }
            50% {
              box-shadow: 0 0 0 1px rgba(34, 211, 238, 0.6), 0 0 40px rgba(56, 189, 248, 0.4);
            }
          }
          .glow-pulse {
            animation: glow-pulse 1.2s ease-in-out infinite;
          }
          .guide-glow {
            animation: guide-glow 2s ease-in-out infinite;
          }

          /* Ultra-smooth scroll physics - DISABLED */
          .mobile-scroll-container {
            -webkit-overflow-scrolling: touch;
            scroll-behavior: auto;
            overscroll-behavior-y: contain;
          }

          /* Spring bounce effect for overscroll - DISABLED */
          @supports (overscroll-behavior: contain) {
            .mobile-scroll-container {
              overscroll-behavior: contain;
            }
          }

          /* Momentum-based scrolling - DISABLED */
          .mobile-scroll-container {
            scroll-snap-type: none;
            scroll-padding-top: 0;
            scroll-padding-bottom: 0;
          }

          /* Enhanced responsive borders */
          @media (min-width: 1024px) {
            .glass-panel {
              border-width: 1.5px;
              box-shadow: 
                0 0 0 1px rgba(34, 211, 238, 0.3),
                0 4px 20px rgba(0, 0, 0, 0.3),
                0 0 40px rgba(56, 189, 248, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.05);
            }
          }
          
          @media (min-width: 1280px) {
            .glass-panel {
              border-width: 2px;
              box-shadow: 
                0 0 0 1px rgba(34, 211, 238, 0.4),
                0 8px 30px rgba(0, 0, 0, 0.4),
                0 0 60px rgba(56, 189, 248, 0.15),
                inset 0 1px 0 rgba(255, 255, 255, 0.08);
            }
          }

          /* Responsive glass-panel for mobile edge-to-edge stretching */
          .glass-panel-responsive {
            background: transparent;
            border-radius: 0px !important;
            border: none !important;
            box-shadow: none !important;
            backdrop-filter: none !important;
          }
          .neon-border-responsive {
            position: relative;
          }
          .neon-border-responsive::before {
            content: "";
            position: absolute;
            inset: -1px;
            border-radius: inherit;
            background: conic-gradient(from 180deg at 50% 50%,
                rgba(56, 189, 248, 0.25),
                rgba(251, 113, 133, 0.55),
                rgba(129, 140, 248, 0.45),
                rgba(56, 189, 248, 0.25));
            opacity: 0;
            transition: opacity 350ms cubic-bezier(0.4, 0, 0.2, 1);
            filter: blur(16px);
            pointer-events: none;
            display: block !important; /* Enable on all screen sizes! */
          }
          /* Desktop-only hover and active glow states */
          @media (hover: hover) {
            .neon-border-responsive:hover::before,
            .neon-border-responsive:active::before {
              opacity: 1;
            }
          }

          /* Mobile/Desktop manual touch glow state (triggered instantly by React touch events) */
          .neon-border-responsive.glow-active::before {
            opacity: 1;
          }

          @media (min-width: 640px) {
            .glass-panel-responsive {
              background: rgba(15, 23, 42, 0.75);
              border-radius: 1.5rem !important;
              border: 1px solid rgba(148, 163, 184, 0.4) !important;
              box-shadow:
                0 0 0 1px rgba(148, 163, 184, 0.15),
                0 18px 60px rgba(15, 23, 42, 0.85) !important;
              backdrop-filter: blur(22px) saturate(160%) !important;
            }
            .neon-border-responsive::before {
              filter: blur(12px); /* Standard desktop blur */
            }
          }
        `}</style>
        {showGuide && (
          <div
            className={
              "pointer-events-none absolute inset-0 z-30 flex px-4 sm:px-0 " +
              (guideStep === 4 || guideStep === 5
                ? "items-end justify-center pb-6"
                : "items-center justify-center")
            }
          >
            <div
              className={
                "pointer-events-auto max-w-xs rounded-2xl border border-cyan-400/60 bg-slate-950/95 px-4 py-3 text-xs text-slate-100 shadow-xl guide-glow " +
                (guideStep === 0
                  ? "sm:absolute sm:left-6 sm:top-40"
                  : guideStep === 1
                  ? "sm:absolute sm:right-10 sm:top-96"
                  : guideStep === 2
                  ? "sm:absolute sm:left-6 sm:bottom-6"
                  : guideStep === 3
                  ? "sm:absolute sm:left-6 sm:bottom-6"
                  : guideStep === 4
                  ? "sm:absolute sm:right-6 sm:bottom-6"
                  : guideStep === 5
                  ? "sm:absolute sm:right-6 sm:bottom-16"
                  : guideStep === 6
                  ? "sm:absolute sm:left-6 sm:top-28"
                  : "sm:absolute sm:right-6 sm:top-10") +
                (guideStep === 1 ? " mt-24 sm:mt-0" : "")
              }
            >
              {guideStep === 0 && (
                <>
                  <p className="text-[11px] font-semibold text-cyan-200">
                    This is your Quantum ID
                  </p>
                  <p className="mt-1 text-[11px] text-slate-200/85">
                    Share this handle with people you trust. They can use it to
                    find you and open a secure channel.
                  </p>
                </>
              )}
              {guideStep === 1 && (
                <>
                  <p className="text-[11px] font-semibold text-cyan-200">
                    Refine your Quantum ID
                  </p>
                  <p className="mt-1 text-[11px] text-slate-200/85">
                    Use the Edit button to change your Quantum ID. Keep it
                    unique and memorable while following the rules below the
                    card so people can reliably find you.
                  </p>
                </>
              )}
              {guideStep === 2 && (
                <>
                  <p className="text-[11px] font-semibold text-cyan-200">
                    Connect to a friend
                  </p>
                  <p className="mt-1 text-[11px] text-slate-200/85">
                    Use the Connect button to search a friend&apos;s Quantum ID,
                    choose how you know them, and send a short note.
                  </p>
                </>
              )}
              {guideStep === 3 && (
                <>
                  <p className="text-[11px] font-semibold text-cyan-200">
                    Incoming & outgoing requests
                  </p>
                  <p className="mt-1 text-[11px] text-slate-200/85">
                    Here you can track who you&apos;ve requested, who requested
                    you, and quickly Accept, Reject, or open Chat.
                  </p>
                </>
              )}
              {guideStep === 4 && (
                <>
                  <p className="text-[11px] font-semibold text-cyan-200">
                    Your secure chat panel
                  </p>
                  <p className="mt-1 text-[11px] text-slate-200/85">
                    Once a request is accepted, this panel becomes your live
                    DM tunnel. Type your message and press Enter or tap the
                    arrow to send.
                  </p>
                </>
              )}
              {guideStep === 5 && (
                <>
                  <p className="text-[11px] font-semibold text-cyan-200">
                    Go full-screen when you need focus
                  </p>
                  <p className="mt-1 text-[11px] text-slate-200/85">
                    Use the Full chat button to expand this panel edge-to-edge
                    and hide the left console, perfect for longer
                    conversations.
                  </p>
                </>
              )}
              {guideStep === 6 && (
                <>
                  <p className="text-[11px] font-semibold text-cyan-200">
                    Quantum Link Console
                  </p>
                  <p className="mt-1 text-[11px] text-slate-200/85">
                    Quantum Link Console is like your profile and feed in apps
                    like Instagram or X. See how your Quantum ID looks, post
                    updates, and share media with your network.
                  </p>
                </>
              )}
              {guideStep === 7 && (
                <>
                  <p className="text-[11px] font-semibold text-cyan-200">
                    Settings for your identity
                  </p>
                  <p className="mt-1 text-[11px] text-slate-200/85">
                    Settings lets you tune your Quantum ID, profile, and what
                    others can see. Control visibility for your email, age,
                    gender, bio, and interests from here.
                  </p>
                </>
              )}

              <button
                type="button"
                onClick={advanceGuide}
                className="mt-2 inline-flex items-center rounded-full bg-cyan-500/90 px-3 py-1 text-[11px] font-medium text-slate-950 hover:bg-cyan-400"
              >
                Got it
              </button>
            </div>
          </div>
        )}
        <div
          className={
            "pointer-events-none absolute top-0 h-px bg-gradient-to-r from-cyan-400/0 via-cyan-400/70 to-fuchsia-500/0 " +
            "inset-x-0"
          }
        />

        <div
          className={
            isChatFull
              ? "relative grid h-full min-h-0 gap-8 overflow-hidden"
              : "relative grid w-full h-auto min-h-full gap-0 overflow-y-visible lg:grid-cols-2 lg:items-start"
          }
        >
          {/* LEFT: HOME / STATUS */}
          <section
            className={
              isChatFull ? "hidden" : "space-y-4 sm:space-y-6 px-4 lg:px-6 py-4"
            }
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <button
                type="button"
                onClick={openDirectory}
                className={
                  "inline-flex items-center gap-2 rounded-full border bg-cyan-500/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-cyan-100/80 transition hover:border-cyan-300 hover:bg-cyan-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 animate-[pulse_2.4s_ease-in-out_infinite] " +
                  (highlightConsole
                    ? "border-cyan-300 glow-pulse"
                    : "border-cyan-400/40")
                }
              >
                <span className="relative flex h-2 w-2 items-center justify-center">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-cyan-400/70 opacity-60 animate-ping" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-300" />
                </span>
                Quantum Link Console
              </button>

              <Link
                href="/about"
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/40 px-3 py-1 text-[11.5px] font-semibold text-slate-300 hover:border-cyan-400/50 hover:text-cyan-300 transition-all duration-300"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_#22d3ee]" />
                About
              </Link>

              <button
                type="button"
                onClick={() => {
                  // Prevent rapid double-clicks causing flicker
                  const now = Date.now();
                  if (now - settingsClickTimeRef.current < 400) return;
                  settingsClickTimeRef.current = now;
                  // eslint-disable-next-line no-console
                  console.log("[Settings] pill clicked");
                  setIsSettingsAnimating(true);
                  setShowSettings((prev) => !prev);
                  setSettingsScreen("main");
                }}
                className={
                  "inline-flex items-center gap-1 rounded-full border bg-slate-900/70 px-3 py-1 text-[11px] font-medium text-slate-200 hover:border-cyan-400/70 hover:text-cyan-200 " +
                  (highlightSettingsPill
                    ? "border-cyan-400 glow-pulse"
                    : "border-slate-600/70")
                }
              >
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                Settings
              </button>
            </div>

            {(showSettings || isSettingsAnimating) && (
              (canUseDom
                ? createPortal(
                    <div
                      className={`fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 px-4 ${
                        showSettings ? (isSettingsAnimating ? 'settings-backdrop-enter' : '') : 'settings-backdrop-exit'
                      }`}
                      style={{ backdropFilter: 'blur(8px)' }}
                      onMouseDown={() => {
                        if (showOnboarding) return;
                        setIsSettingsAnimating(true);
                        setTimeout(() => setShowSettings(false), 600);
                      }}
                    >
                      <div
                        className={`w-full max-w-sm space-y-3 rounded-2xl border border-cyan-400/40 bg-slate-950/95 px-4 py-4 text-[11px] text-slate-200 shadow-2xl transition-all duration-300 ${
                          showSettings ? (isSettingsAnimating ? 'settings-modal-enter' : '') : 'settings-modal-exit'
                        }`}
                        style={{
                          boxShadow: isSettingsAnimating 
                            ? '0 0 60px rgba(6, 182, 212, 0.3), 0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                            : '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
                            Settings
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setIsSettingsAnimating(true);
                              setTimeout(() => {
                                setShowSettings(false);
                                setSettingsScreen("main");
                              }, 300);
                            }}
                            className="relative flex items-center justify-center gap-1 rounded-full border border-slate-600/70 bg-slate-900/80 px-4 py-2 text-xs font-medium text-slate-200 hover:border-cyan-400/70 hover:text-cyan-200 hover:bg-slate-800/90 active:border-cyan-300 active:bg-cyan-800/50 active:text-cyan-50 active:scale-95 transition-all duration-150 min-w-[80px]"
                            aria-label="Close settings"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            <span>Close</span>
                          </button>
                        </div>

                        {settingsScreen !== "main" && (
                          <div className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-900/30 px-3 py-2">
                            <button
                              type="button"
                              onClick={() => setSettingsScreen("main")}
                              className="text-[11px] font-medium text-cyan-200 hover:text-cyan-100"
                            >
                              Back
                            </button>
                            <span className="text-[10px] text-slate-400">
                              {settingsScreen === "name"
                                ? "Edit name"
                                : settingsScreen === "age"
                                ? "Edit age"
                                : settingsScreen === "gender"
                                ? "Edit gender"
                                : settingsScreen === "bio"
                                ? "Edit bio"
                                : "Edit interests"}
                            </span>
                          </div>
                        )}

                        <div className="space-y-2 rounded-xl border border-slate-700/70 bg-slate-900/40 px-3 py-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-medium text-slate-200">Account</span>
                            <span className="text-[11px] text-slate-300">ID</span>
                          </div>
                          <p className="text-[11px] text-slate-200">
                            Quantum ID: @{currentHandle || (session as any)?.user?.handle || "not-set"}
                          </p>
                          <p>
                            <span className="text-slate-400">Email:</span>{" "}
                            <span className="text-slate-200">
                              {emailVisibility === "public"
                                ? ((session as any)?.user?.email || "no-email-linked")
                                : "Hidden"}
                            </span>
                          </p>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] text-slate-500">Email visibility</span>
                            <div className="inline-flex rounded-full border border-slate-700/80 bg-slate-950/40 p-0.5">
                              <button
                                type="button"
                                onClick={() => setEmailVisibility("private")}
                                className={
                                  "rounded-full px-2.5 py-1 text-[10px] font-medium transition " +
                                  (emailVisibility === "private"
                                    ? "bg-slate-200 text-slate-950"
                                    : "text-slate-300 hover:text-slate-100")
                                }
                              >
                                Private
                              </button>
                              <button
                                type="button"
                                onClick={() => setEmailVisibility("public")}
                                className={
                                  "rounded-full px-2.5 py-1 text-[10px] font-medium transition " +
                                  (emailVisibility === "public"
                                    ? "bg-cyan-500/80 text-slate-950"
                                    : "text-slate-300 hover:text-slate-100")
                                }
                              >
                                Public
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Theme Toggle Section */}
                        <div className="space-y-2 rounded-xl border border-slate-700/70 bg-slate-900/40 px-3 py-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-medium text-slate-200">Appearance</span>
                            <span className="text-[11px] text-slate-300">Theme</span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] text-slate-500">Dark / Light mode</span>
                            <ThemeToggle />
                          </div>
                        </div>

                        {/* Notifications Section — smart: Desktop vs PWA/Web */}
                        {isElectron ? (
                          /* ── ELECTRON DESKTOP: Native Windows Notifications Toggle ── */
                          <div className="space-y-2 rounded-xl border border-slate-700/70 bg-slate-900/40 px-3 py-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-medium text-slate-200">Desktop Notifications</span>
                              <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-semibold text-blue-300 border border-blue-500/40">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                Native
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] text-slate-500">System alert toast on incoming message</span>
                              <div className="inline-flex rounded-full border border-slate-700/80 bg-slate-950/40 p-0.5">
                                <button
                                  type="button"
                                  onClick={() => toggleDesktopNotifications(false)}
                                  className={
                                    "rounded-full px-2.5 py-1 text-[10px] font-medium transition " +
                                    (!desktopNotificationsEnabled
                                      ? "bg-slate-200 text-slate-950 shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                                      : "text-slate-300 hover:text-slate-100")
                                  }
                                >
                                  Off
                                </button>
                                <button
                                  type="button"
                                  onClick={() => toggleDesktopNotifications(true)}
                                  className={
                                    "rounded-full px-2.5 py-1 text-[10px] font-medium transition " +
                                    (desktopNotificationsEnabled
                                      ? "bg-cyan-500/80 text-slate-950 shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                                      : "text-slate-300 hover:text-slate-100")
                                  }
                                >
                                  On
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* ── BROWSER / PWA: Web Push Notifications ── */
                          <div className="space-y-2 rounded-xl border border-slate-700/70 bg-slate-900/40 px-3 py-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-medium text-slate-200">PWA Notifications</span>
                              <span className="text-[11px] text-slate-300">Web Push 🔔</span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] text-slate-500">Lock-screen chat alerts</span>
                              <div className="inline-flex rounded-full border border-slate-700/80 bg-slate-950/40 p-0.5">
                                <button
                                  type="button"
                                  onClick={() => togglePushNotifications(false)}
                                  className={
                                    "rounded-full px-2.5 py-1 text-[10px] font-medium transition " +
                                    (!isPushEnabled
                                      ? "bg-slate-200 text-slate-950 shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                                      : "text-slate-300 hover:text-slate-100")
                                  }
                                >
                                  Off
                                </button>
                                <button
                                  type="button"
                                  onClick={() => togglePushNotifications(true)}
                                  className={
                                    "rounded-full px-2.5 py-1 text-[10px] font-medium transition " +
                                    (isPushEnabled
                                      ? "bg-cyan-500/80 text-slate-950 shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                                      : "text-slate-300 hover:text-slate-100")
                                  }
                                >
                                  On
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* E2E Encryption Toggle Section */}
                        <div className="space-y-2 rounded-xl border border-slate-700/70 bg-slate-900/40 px-3 py-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-medium text-slate-200">E2E Encryption Shield</span>
                            <span className={`text-[11px] font-semibold transition ${isE2EEnabled ? "text-cyan-300" : "text-slate-400"}`}>
                              {isE2EEnabled ? "● Active" : "● Standard"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] text-slate-500">Standard mode is optimized for messaging performance</span>
                            <div className="inline-flex rounded-full border border-slate-700/80 bg-slate-950/40 p-0.5">
                              <button
                                type="button"
                                onClick={() => {
                                  if (!isE2EEnabled) return;
                                  setIsE2EEnabled(false);
                                  playSciFiSound("off");
                                }}
                                className={
                                  "rounded-full px-2.5 py-1 text-[10px] font-medium transition " +
                                  (!isE2EEnabled
                                    ? "bg-slate-200 text-slate-950 shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                                    : "text-slate-300 hover:text-slate-100")
                                }
                              >
                                Off
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (isE2EEnabled) return;
                                  setIsE2EEnabled(true);
                                  playSciFiSound("on");
                                }}
                                className={
                                  "rounded-full px-2.5 py-1 text-[10px] font-medium transition " +
                                  (isE2EEnabled
                                    ? "bg-cyan-500/80 text-slate-950 shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                                    : "text-slate-300 hover:text-slate-100")
                                }
                              >
                                On
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 rounded-xl border border-slate-700/70 bg-slate-900/40 px-3 py-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                              Profile
                            </span>
                            <span className="text-[10px] text-slate-500">Snapshot</span>
                          </div>
                          {settingsScreen === "main" && (
                            <div className="space-y-2">
                              <div
                                role="button"
                                tabIndex={0}
                                onClick={() => {
                                  setSettingsScreen("main");
                                  setShowOnboarding(true);
                                  setOnboardingStep(1);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key !== "Enter" && e.key !== " ") return;
                                  e.preventDefault();
                                  setSettingsScreen("main");
                                  setShowOnboarding(true);
                                  setOnboardingStep(1);
                                }}
                                className="flex w-full items-center justify-between rounded-xl border border-slate-800/70 bg-slate-950/30 px-3 py-2 text-left hover:border-cyan-400/40"
                              >
                                <span className="text-slate-300">Name</span>
                                <span className="truncate text-slate-100">
                                  {displayName || nameDraft || (session as any)?.user?.name || "Not set"}
                                </span>
                              </div>

                              <div
                                role="button"
                                tabIndex={0}
                                onClick={() => {
                                  setSettingsScreen("main");
                                  setShowOnboarding(true);
                                  setOnboardingStep(4);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key !== "Enter" && e.key !== " ") return;
                                  e.preventDefault();
                                  setSettingsScreen("main");
                                  setShowOnboarding(true);
                                  setOnboardingStep(4);
                                }}
                                className="flex w-full items-center justify-between rounded-xl border border-slate-800/70 bg-slate-950/30 px-3 py-2 text-left hover:border-cyan-400/40"
                              >
                                <span className="text-slate-300">Age</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-100">
                                    {ageVisibility === "public" ? (age ?? "Not set") : "Hidden"}
                                  </span>
                                  <div
                                    className="inline-flex rounded-full border border-slate-700/80 bg-slate-950/40 p-0.5"
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <button
                                      type="button"
                                      onClick={() => setAgeVisibility("private")}
                                      className={
                                        "rounded-full px-2 py-0.5 text-[10px] font-medium transition " +
                                        (ageVisibility === "private"
                                          ? "bg-slate-200 text-slate-950"
                                          : "text-slate-300 hover:text-slate-100")
                                      }
                                    >
                                      Private
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setAgeVisibility("public")}
                                      className={
                                        "rounded-full px-2 py-0.5 text-[10px] font-medium transition " +
                                        (ageVisibility === "public"
                                          ? "bg-cyan-500/80 text-slate-950"
                                          : "text-slate-300 hover:text-slate-100")
                                      }
                                    >
                                      Public
                                    </button>
                                  </div>
                                </div>
                              </div>

                              <div
                                role="button"
                                tabIndex={0}
                                onClick={() => {
                                  setSettingsScreen("main");
                                  setShowOnboarding(true);
                                  setOnboardingStep(5);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key !== "Enter" && e.key !== " ") return;
                                  e.preventDefault();
                                  setSettingsScreen("main");
                                  setShowOnboarding(true);
                                  setOnboardingStep(5);
                                }}
                                className="flex w-full items-center justify-between rounded-xl border border-slate-800/70 bg-slate-950/30 px-3 py-2 text-left hover:border-cyan-400/40"
                              >
                                <span className="text-slate-300">Gender</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-100">
                                    {genderVisibility === "public" ? (gender || "Not set") : "Hidden"}
                                  </span>
                                  <div
                                    className="inline-flex rounded-full border border-slate-700/80 bg-slate-950/40 p-0.5"
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <button
                                      type="button"
                                      onClick={() => setGenderVisibility("private")}
                                      className={
                                        "rounded-full px-2 py-0.5 text-[10px] font-medium transition " +
                                        (genderVisibility === "private"
                                          ? "bg-slate-200 text-slate-950"
                                          : "text-slate-300 hover:text-slate-100")
                                      }
                                    >
                                      Private
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setGenderVisibility("public")}
                                      className={
                                        "rounded-full px-2 py-0.5 text-[10px] font-medium transition " +
                                        (genderVisibility === "public"
                                          ? "bg-cyan-500/80 text-slate-950"
                                          : "text-slate-300 hover:text-slate-100")
                                      }
                                    >
                                      Public
                                    </button>
                                  </div>
                                </div>
                              </div>

                              <div
                                role="button"
                                tabIndex={0}
                                onClick={() => {
                                  setSettingsScreen("main");
                                  setShowOnboarding(true);
                                  setOnboardingStep(3);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key !== "Enter" && e.key !== " ") return;
                                  e.preventDefault();
                                  setSettingsScreen("main");
                                  setShowOnboarding(true);
                                  setOnboardingStep(3);
                                }}
                                className="flex w-full items-center justify-between rounded-xl border border-slate-800/70 bg-slate-950/30 px-3 py-2 text-left hover:border-cyan-400/40"
                              >
                                <span className="text-slate-300">Bio</span>
                                <div className="flex items-center gap-2">
                                  <span className="truncate text-slate-100">
                                    {bioVisibility === "public" ? (bioDraft.trim() || "No bio added yet.") : "Hidden"}
                                  </span>
                                  <div
                                    className="inline-flex rounded-full border border-slate-700/80 bg-slate-950/40 p-0.5"
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <button
                                      type="button"
                                      onClick={() => setBioVisibility("private")}
                                      className={
                                        "rounded-full px-2 py-0.5 text-[10px] font-medium transition " +
                                        (bioVisibility === "private"
                                          ? "bg-slate-200 text-slate-950"
                                          : "text-slate-300 hover:text-slate-100")
                                      }
                                    >
                                      Private
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setBioVisibility("public")}
                                      className={
                                        "rounded-full px-2 py-0.5 text-[10px] font-medium transition " +
                                        (bioVisibility === "public"
                                          ? "bg-cyan-500/80 text-slate-950"
                                          : "text-slate-300 hover:text-slate-100")
                                      }
                                    >
                                      Public
                                    </button>
                                  </div>
                                </div>
                              </div>

                              <div
                                role="button"
                                tabIndex={0}
                                onClick={() => {
                                  setSettingsScreen("main");
                                  setShowOnboarding(true);
                                  setOnboardingStep(2);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key !== "Enter" && e.key !== " ") return;
                                  e.preventDefault();
                                  setSettingsScreen("main");
                                  setShowOnboarding(true);
                                  setOnboardingStep(2);
                                }}
                                className="flex w-full items-center justify-between rounded-xl border border-slate-800/70 bg-slate-950/30 px-3 py-2 text-left hover:border-cyan-400/40"
                              >
                                <span className="text-slate-300">Interested fields</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-100">
                                    {interestsVisibility === "public"
                                      ? (selectedInterests.length > 0
                                          ? `${selectedInterests.length} selected`
                                          : "None selected")
                                      : "Hidden"}
                                  </span>
                                  <div
                                    className="inline-flex rounded-full border border-slate-700/80 bg-slate-950/40 p-0.5"
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <button
                                      type="button"
                                      onClick={() => setInterestsVisibility("private")}
                                      className={
                                        "rounded-full px-2 py-0.5 text-[10px] font-medium transition " +
                                        (interestsVisibility === "private"
                                          ? "bg-slate-200 text-slate-950"
                                          : "text-slate-300 hover:text-slate-100")
                                      }
                                    >
                                      Private
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setInterestsVisibility("public")}
                                      className={
                                        "rounded-full px-2 py-0.5 text-[10px] font-medium transition " +
                                        (interestsVisibility === "public"
                                          ? "bg-cyan-500/80 text-slate-950"
                                          : "text-slate-300 hover:text-slate-100")
                                      }
                                    >
                                      Public
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {settingsScreen === "name" && (
                            <div className="space-y-2">
                              <label className="block text-[10px] text-slate-400">Display name</label>
                              <input
                                value={nameDraft}
                                onChange={(e) => setNameDraft(e.target.value)}
                                className="w-full rounded-xl border border-slate-700/70 bg-slate-950/60 px-3 py-2 text-[11px] text-slate-100 outline-none focus:border-cyan-400/60"
                                placeholder="Your name"
                              />
                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDisplayName(nameDraft.trim() || null);
                                    setNameDraft(nameDraft.trim());
                                    setSettingsScreen("main");
                                  }}
                                  className="rounded-xl border border-cyan-400/50 bg-cyan-500/10 px-3 py-2 text-[11px] font-medium text-cyan-200 hover:bg-cyan-500/20"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          )}

                          {settingsScreen === "age" && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-slate-400">Age</span>
                                <span className="text-[11px] text-slate-100">{age ?? "Not set"}</span>
                              </div>
                              <input
                                type="range"
                                min={13}
                                max={80}
                                value={age ?? 21}
                                onChange={(e) => setAge(Number(e.target.value))}
                                className="w-full accent-cyan-400"
                              />
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-slate-500">Visibility</span>
                                <div className="inline-flex rounded-full border border-slate-700/80 bg-slate-950/40 p-0.5">
                                  <button
                                    type="button"
                                    onClick={() => setAgeVisibility("private")}
                                    className={
                                      "rounded-full px-2 py-0.5 text-[10px] font-medium transition " +
                                      (ageVisibility === "private"
                                        ? "bg-slate-200 text-slate-950"
                                        : "text-slate-300 hover:text-slate-100")
                                    }
                                  >
                                    Private
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setAgeVisibility("public")}
                                    className={
                                      "rounded-full px-2 py-0.5 text-[10px] font-medium transition " +
                                      (ageVisibility === "public"
                                        ? "bg-cyan-500/80 text-slate-950"
                                        : "text-slate-300 hover:text-slate-100")
                                    }
                                  >
                                    Public
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {settingsScreen === "gender" && (
                            <div className="space-y-2">
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setGender("male")}
                                  className={
                                    "flex-1 rounded-xl border px-3 py-2 text-[11px] font-medium transition " +
                                    (gender === "male"
                                      ? "border-cyan-400/70 bg-cyan-500/10 text-cyan-200"
                                      : "border-slate-700/70 bg-slate-950/50 text-slate-200 hover:border-cyan-400/40")
                                  }
                                >
                                  Male
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setGender("female")}
                                  className={
                                    "flex-1 rounded-xl border px-3 py-2 text-[11px] font-medium transition " +
                                    (gender === "female"
                                      ? "border-cyan-400/70 bg-cyan-500/10 text-cyan-200"
                                      : "border-slate-700/70 bg-slate-950/50 text-slate-200 hover:border-cyan-400/40")
                                  }
                                >
                                  Female
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setGender("other")}
                                  className={
                                    "flex-1 rounded-xl border px-3 py-2 text-[11px] font-medium transition " +
                                    (gender === "other"
                                      ? "border-cyan-400/70 bg-cyan-500/10 text-cyan-200"
                                      : "border-slate-700/70 bg-slate-950/50 text-slate-200 hover:border-cyan-400/40")
                                  }
                                >
                                  Other
                                </button>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-slate-500">Visibility</span>
                                <div className="inline-flex rounded-full border border-slate-700/80 bg-slate-950/40 p-0.5">
                                  <button
                                    type="button"
                                    onClick={() => setGenderVisibility("private")}
                                    className={
                                      "rounded-full px-2 py-0.5 text-[10px] font-medium transition " +
                                      (genderVisibility === "private"
                                        ? "bg-slate-200 text-slate-950"
                                        : "text-slate-300 hover:text-slate-100")
                                    }
                                  >
                                    Private
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setGenderVisibility("public")}
                                    className={
                                      "rounded-full px-2 py-0.5 text-[10px] font-medium transition " +
                                      (genderVisibility === "public"
                                        ? "bg-cyan-500/80 text-slate-950"
                                        : "text-slate-300 hover:text-slate-100")
                                    }
                                  >
                                    Public
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {settingsScreen === "bio" && (
                            <div className="space-y-2">
                              <label className="block text-[10px] text-slate-400">Bio</label>
                              <textarea
                                value={bioDraft}
                                onChange={(e) => setBioDraft(e.target.value)}
                                rows={4}
                                className="w-full rounded-xl border border-slate-700/70 bg-slate-950/60 px-3 py-2 text-[11px] text-slate-100 outline-none focus:border-cyan-400/60"
                                placeholder="Write a short bio"
                              />
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-slate-500">Visibility</span>
                                <div className="inline-flex rounded-full border border-slate-700/80 bg-slate-950/40 p-0.5">
                                  <button
                                    type="button"
                                    onClick={() => setBioVisibility("private")}
                                    className={
                                      "rounded-full px-2 py-0.5 text-[10px] font-medium transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] will-change-transform " +
                                      (bioVisibility === "private"
                                        ? "bg-gradient-to-r from-slate-100 to-slate-300 text-slate-950 scale-105 shadow-lg shadow-slate-500/30 ring-2 ring-slate-400/50"
                                        : "text-slate-300 hover:text-slate-100 hover:scale-105 hover:bg-slate-800/50")
                                    }
                                  >
                                    Private
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setBioVisibility("public")}
                                    className={
                                      "rounded-full px-2 py-0.5 text-[10px] font-medium transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] will-change-transform " +
                                      (bioVisibility === "public"
                                        ? "bg-gradient-to-r from-cyan-400 to-cyan-600 text-slate-950 scale-105 shadow-lg shadow-cyan-500/40 ring-2 ring-cyan-400/50"
                                        : "text-slate-300 hover:text-cyan-200 hover:scale-105 hover:bg-cyan-950/30")
                                    }
                                  >
                                    Public
                                  </button>
                                </div>
                              </div>
                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setBioDraft(bioDraft);
                                    setSettingsScreen("main");
                                  }}
                                  className="rounded-xl border border-cyan-400/50 bg-cyan-500/10 px-3 py-2 text-[11px] font-medium text-cyan-200 transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-cyan-500/20 hover:scale-102 hover:shadow-md hover:shadow-cyan-500/20 active:scale-98"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          )}

                          {settingsScreen === "interests" && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-slate-400">Select your interests</span>
                                <span className="text-[10px] text-slate-500">{selectedInterests.length} selected</span>
                              </div>
                              <div className="max-h-56 overflow-y-auto scrollbar-hide space-y-1">
                                {interestsCategories.map((interest) => (
                                  <button
                                    type="button"
                                    key={interest}
                                    onClick={() => toggleInterest(interest)}
                                    className={
                                      "w-full text-left rounded-lg px-3 py-2 text-[11px] border transition " +
                                      (selectedInterests.includes(interest)
                                        ? "bg-cyan-500/10 text-cyan-200 border-cyan-400/40"
                                        : "bg-slate-950/40 text-slate-200 border-slate-800/60 hover:border-cyan-400/30")
                                    }
                                  >
                                    {interest}
                                  </button>
                                ))}
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-slate-500">Visibility</span>
                                <div className="inline-flex rounded-full border border-slate-700/80 bg-slate-950/40 p-0.5">
                                  <button
                                    type="button"
                                    onClick={() => setInterestsVisibility("private")}
                                    className={
                                      "rounded-full px-2 py-0.5 text-[10px] font-medium transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] will-change-transform " +
                                      (interestsVisibility === "private"
                                        ? "bg-gradient-to-r from-slate-100 to-slate-300 text-slate-950 scale-105 shadow-lg shadow-slate-500/30 ring-2 ring-slate-400/50"
                                        : "text-slate-300 hover:text-slate-100 hover:scale-105 hover:bg-slate-800/50")
                                    }
                                  >
                                    Private
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setInterestsVisibility("public")}
                                    className={
                                      "rounded-full px-2 py-0.5 text-[10px] font-medium transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] will-change-transform " +
                                      (interestsVisibility === "public"
                                        ? "bg-gradient-to-r from-cyan-400 to-cyan-600 text-slate-950 scale-105 shadow-lg shadow-cyan-500/40 ring-2 ring-cyan-400/50"
                                        : "text-slate-300 hover:text-cyan-200 hover:scale-105 hover:bg-cyan-950/30")
                                    }
                                  >
                                    Public
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setShowLogoutConfirm(true);
                          }}
                          className="w-full rounded-xl border border-rose-500/80 bg-rose-500/10 px-3 py-2 text-[11px] font-medium text-rose-100 transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-rose-500/25 hover:scale-[1.02] hover:shadow-md hover:shadow-rose-500/20 active:scale-98"
                        >
                          Log out
                        </button>

                        <p className="text-center text-[10px] text-slate-500 pt-1">
                          Tap backdrop or Close button to exit
                        </p>
                      </div>

                      {showLogoutConfirm && (
                        <div
                          className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/60 px-4"
                          onMouseDown={() => setShowLogoutConfirm(false)}
                        >
                          <div
                            className="w-full max-w-sm space-y-3 rounded-2xl border border-slate-700/70 bg-slate-950/95 px-4 py-4 text-[11px] text-slate-200 shadow-2xl"
                            onMouseDown={(e) => e.stopPropagation()}
                          >
                            <div className="space-y-1">
                              <p className="text-[11px] font-semibold text-slate-100">
                                Log out of Quantum Chat?
                              </p>
                              <p className="text-[10px] text-slate-400">
                                You will be signed out on this device. You can log back in anytime.
                              </p>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setShowLogoutConfirm(false)}
                                className="rounded-xl border border-slate-600/70 bg-slate-900/80 px-3 py-2 text-[11px] font-medium text-slate-200 transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] hover:border-cyan-400/70 hover:text-cyan-200 hover:scale-102 hover:shadow-md hover:shadow-cyan-500/20 active:scale-98"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setShowLogoutConfirm(false);
                                  setShowSettings(false);
                                  handleSignOut();
                                }}
                                className="rounded-xl border border-rose-500/80 bg-rose-500/15 px-3 py-2 text-[11px] font-medium text-rose-100 transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-rose-500/25 hover:scale-102 hover:shadow-md hover:shadow-rose-500/20 active:scale-98"
                              >
                                Log out
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>,
                    document.body,
                  )
                : (
                    <div className="mt-3 space-y-2 rounded-2xl border border-slate-700/80 bg-slate-950/90 px-3 py-3 text-[11px] text-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-slate-200">Account</span>
                        <button
                          type="button"
                          onClick={() => {
                              setIsSettingsAnimating(true);
                              setTimeout(() => setShowSettings(false), 600);
                            }}
                          className="flex items-center justify-center gap-1 rounded-full border border-slate-600/70 bg-slate-900/80 px-3 py-1.5 text-[11px] font-medium text-slate-200 hover:border-cyan-400/70 hover:text-cyan-200"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          Close
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-200">
                        Quantum ID: @{currentHandle || (session as any)?.user?.handle || "not-set"}
                      </p>
                      <div className="flex items-center justify-between gap-2">
                        <p className="min-w-0 truncate">Email: {emailVisibility === "public" ? ((session as any)?.user?.email || "no-email-linked") : "Hidden"}</p>
                        <div className="inline-flex rounded-full border border-slate-700/80 bg-slate-950/40 p-0.5">
                          <button
                            type="button"
                            onClick={() => setEmailVisibility("private")}
                            className={
                              "rounded-full px-2 py-0.5 text-[10px] font-medium transition " +
                              (emailVisibility === "private"
                                ? "bg-slate-200 text-slate-950"
                                : "text-slate-300 hover:text-slate-100")
                            }
                          >
                            Private
                          </button>
                          <button
                            type="button"
                            onClick={() => setEmailVisibility("public")}
                            className={
                              "rounded-full px-2 py-0.5 text-[10px] font-medium transition " +
                              (emailVisibility === "public"
                                ? "bg-cyan-500/80 text-slate-950"
                                : "text-slate-300 hover:text-slate-100")
                            }
                          >
                            Public
                          </button>
                        </div>
                      </div>
                      <p>Name: {displayName || nameDraft || (session as any)?.user?.name || "Not set"}</p>
                      <div className="flex items-center justify-between gap-2">
                        <p>Age: {ageVisibility === "public" ? (age ?? "Not set") : "Hidden"}</p>
                        <div className="inline-flex rounded-full border border-slate-700/80 bg-slate-950/40 p-0.5">
                          <button
                            type="button"
                            onClick={() => setAgeVisibility("private")}
                            className={
                              "rounded-full px-2 py-0.5 text-[10px] font-medium transition " +
                              (ageVisibility === "private"
                                ? "bg-slate-200 text-slate-950"
                                : "text-slate-300 hover:text-slate-100")
                            }
                          >
                            Private
                          </button>
                          <button
                            type="button"
                            onClick={() => setAgeVisibility("public")}
                            className={
                              "rounded-full px-2 py-0.5 text-[10px] font-medium transition " +
                              (ageVisibility === "public"
                                ? "bg-cyan-500/80 text-slate-950"
                                : "text-slate-300 hover:text-slate-100")
                            }
                          >
                            Public
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <p>Gender: {genderVisibility === "public" ? (gender || "Not set") : "Hidden"}</p>
                        <div className="inline-flex rounded-full border border-slate-700/80 bg-slate-950/40 p-0.5">
                          <button
                            type="button"
                            onClick={() => setGenderVisibility("private")}
                            className={
                              "rounded-full px-2 py-0.5 text-[10px] font-medium transition " +
                              (genderVisibility === "private"
                                ? "bg-slate-200 text-slate-950"
                                : "text-slate-300 hover:text-slate-100")
                            }
                          >
                            Private
                          </button>
                          <button
                            type="button"
                            onClick={() => setGenderVisibility("public")}
                            className={
                              "rounded-full px-2 py-0.5 text-[10px] font-medium transition " +
                              (genderVisibility === "public"
                                ? "bg-cyan-500/80 text-slate-950"
                                : "text-slate-300 hover:text-slate-100")
                            }
                          >
                            Public
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <p className="min-w-0 truncate">Bio: {bioVisibility === "public" ? (bioDraft.trim() || "No bio added yet.") : "Hidden"}</p>
                        <div className="inline-flex rounded-full border border-slate-700/80 bg-slate-950/40 p-0.5">
                          <button
                            type="button"
                            onClick={() => setBioVisibility("private")}
                            className={
                              "rounded-full px-2 py-0.5 text-[10px] font-medium transition " +
                              (bioVisibility === "private"
                                ? "bg-slate-200 text-slate-950"
                                : "text-slate-300 hover:text-slate-100")
                            }
                          >
                            Private
                          </button>
                          <button
                            type="button"
                            onClick={() => setBioVisibility("public")}
                            className={
                              "rounded-full px-2 py-0.5 text-[10px] font-medium transition " +
                              (bioVisibility === "public"
                                ? "bg-cyan-500/80 text-slate-950"
                                : "text-slate-300 hover:text-slate-100")
                            }
                          >
                            Public
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <p>Interested fields: {interestsVisibility === "public" ? (selectedInterests.length > 0 ? `${selectedInterests.length} selected` : "None selected") : "Hidden"}</p>
                        <div className="inline-flex rounded-full border border-slate-700/80 bg-slate-950/40 p-0.5">
                          <button
                            type="button"
                            onClick={() => setInterestsVisibility("private")}
                            className={
                              "rounded-full px-2 py-0.5 text-[10px] font-medium transition " +
                              (interestsVisibility === "private"
                                ? "bg-slate-200 text-slate-950"
                                : "text-slate-300 hover:text-slate-100")
                            }
                          >
                            Private
                          </button>
                          <button
                            type="button"
                            onClick={() => setInterestsVisibility("public")}
                            className={
                              "rounded-full px-2 py-0.5 text-[10px] font-medium transition " +
                              (interestsVisibility === "public"
                                ? "bg-cyan-500/80 text-slate-950"
                                : "text-slate-300 hover:text-slate-100")
                            }
                          >
                            Public
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setShowLogoutConfirm(true);
                        }}
                        className="mt-1 w-full rounded-xl border border-rose-500/80 bg-rose-500/10 px-3 py-2 text-[11px] font-medium text-rose-100 hover:bg-rose-500/25"
                      >
                        Log out
                      </button>
                    </div>
                  ))
            )}

            {showLogoutConfirm && !canUseDom && (
              <div
                className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/60 px-4"
                onMouseDown={() => setShowLogoutConfirm(false)}
              >
                <div
                  className="w-full max-w-sm space-y-3 rounded-2xl border border-slate-700/70 bg-slate-950/95 px-4 py-4 text-[11px] text-slate-200 shadow-2xl"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold text-slate-100">
                      Log out of Quantum Chat?
                    </p>
                    <p className="text-[10px] text-slate-400">
                      You will be signed out on this device. You can log back in anytime.
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowLogoutConfirm(false)}
                      className="rounded-xl border border-slate-600/70 bg-slate-900/80 px-3 py-2 text-[11px] font-medium text-slate-200 hover:border-cyan-400/70 hover:text-cyan-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowLogoutConfirm(false);
                        setShowSettings(false);
                        handleSignOut();
                      }}
                      className="rounded-xl border border-rose-500/80 bg-rose-500/15 px-3 py-2 text-[11px] font-medium text-rose-100 hover:bg-rose-500/25"
                    >
                      Log out
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-balance text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl md:text-6xl">
                Talk to anyone on Earth
                <span className="block bg-gradient-to-r from-cyan-300 via-fuchsia-400 to-indigo-300 bg-clip-text text-transparent">
                  with a single ID.
                </span>
              </h1>
              <p className="max-w-lg text-base text-slate-300/90 sm:text-lg leading-relaxed">
                Share your quantum chat ID, send a relationship request, and
                open a secure, near-instant channel to your co-founders,
                family, investors and more.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400/90 sm:text-sm">
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-500/40 bg-slate-900/50 px-2.5 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Live presence
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-500/40 bg-slate-900/50 px-2.5 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                Encrypted DMs
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-500/40 bg-slate-900/50 px-2.5 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400" />
                Global handles
              </span>
            </div>

            {/* Your Quantum ID + outgoing requests */}
            <div
              ref={quantumIdRef}
              className={
                "mt-4 space-y-4 rounded-2xl border border-slate-600/60 bg-slate-900/70 p-4 text-sm text-slate-300 transition-shadow " +
                (highlightQuantumId
                  ? "glow-pulse border-cyan-400/80"
                  : "")
              }
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-xs text-slate-400">
                    Your Quantum ID
                  </span>
                  {displayName && !editingHandle && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-100">
                        {displayName}
                      </span>
                      <button
                        type="button"
                        onClick={() => profilePicInputRef.current?.click()}
                        className="h-5 w-5 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 hover:border-cyan-400/70 flex items-center justify-center text-[10px] text-cyan-300 hover:text-cyan-200 transition-all duration-300 shadow-[0_0_8px_rgba(34,211,238,0.3)] hover:shadow-[0_0_12px_rgba(34,211,238,0.5)] animate-pulse"
                        title="Upload profile picture"
                      >
                        {profilePicUrl ? (
                          <img
                            src={profilePicUrl}
                            alt="Profile"
                            referrerPolicy="no-referrer"
                            className="h-5 w-5 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-cyan-400 text-[16px] leading-none">+</span>
                        )}
                      </button>
                      <input
                        ref={profilePicInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePicUpload}
                        className="hidden"
                      />
                    </div>
                  )}
                  {handleError && (
                    <span className="flex items-center gap-1 text-[10px] text-amber-300">
                      <span>⚠</span>
                      <span>{handleError}</span>
                    </span>
                  )}
                </div>
                {editingHandle ? (
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col gap-1">
                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-2 flex items-center text-[11px] text-slate-500">
                          @
                        </span>
                        <input
                          value={handleDraft}
                          onChange={(e) => onHandleDraftChange(e.target.value)}
                          className="w-40 rounded-full border border-slate-600/70 bg-slate-900/80 py-1 pl-5 pr-2 text-[11px] text-slate-100 outline-none ring-0 transition focus:border-cyan-400 focus:bg-slate-900 focus:shadow-[0_0_0_1px_rgba(34,211,238,0.6)]"
                          placeholder="new-id"
                        />
                      </div>
                      <input
                        value={nameDraft}
                        onChange={(e) => setNameDraft(e.target.value)}
                        className="w-40 rounded-full border border-slate-600/70 bg-slate-900/80 py-1 px-2 text-[11px] text-slate-100 outline-none ring-0 transition focus:border-cyan-400 focus:bg-slate-900 focus:shadow-[0_0_0_1px_rgba(34,211,238,0.6)]"
                        placeholder="Your display name"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={saveHandle}
                      disabled={handleSaving}
                      className="rounded-full border border-emerald-400/70 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-200 hover:bg-emerald-500/20 disabled:opacity-60"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditingHandle}
                      className="rounded-full border border-slate-600/70 bg-slate-900/60 px-2 py-0.5 text-[10px] font-medium text-slate-300 hover:bg-slate-800/80"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        "rounded-full bg-slate-800 px-2 py-0.5 text-[11px] " +
                        (isVipHandle(quantumId)
                          ? "font-semibold text-red-400"
                          : effectiveBlueTickStatus === "SAPPHIRE"
                          ? "font-semibold text-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.25)]"
                          : "font-mono text-cyan-300")
                      }
                    >
                      @{quantumId}
                    </span>
                    {effectiveBlueTickStatus === "SAPPHIRE" && (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-sky-500/20 border border-sky-400/80 text-[8px] font-bold text-sky-300 shadow-[0_0_10px_rgba(56,189,248,0.4)]">
                        ✓
                      </span>
                    )}
                    {/* Hide Edit for the reserved founder VIP handle for everyone except the owner */}
                    {!(isVipHandle(quantumId) && meEmail !== "rohiterrors@gmail.com") && (
                      <button
                        type="button"
                        onClick={startEditingHandle}
                        className={
                          "rounded-full border bg-slate-900/70 px-2 py-0.5 text-[10px] font-medium text-slate-200 hover:border-cyan-400/70 hover:text-cyan-200 " +
                          (highlightEditId
                            ? "glow-pulse border-cyan-400/80"
                            : "border-slate-500/70")
                        }
                      >
                        Edit
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <p className="text-[10px] text-slate-500">
                  Share this ID so people can connect to you.
                </p>
                <button
                  type="button"
                  onClick={() => setGuideStep(0)}
                  className="rounded-full border border-slate-600/60 bg-slate-900/80 px-3 py-1 text-xs font-medium text-slate-200 hover:border-cyan-400/70 hover:text-cyan-200"
                >
                  How this works
                </button>
              </div>

              <div
                ref={connectRef}
                className="mt-3 flex items-center justify-between gap-2"
              >
                <p className="text-xs text-slate-400">
                  Outgoing connection requests
                </p>
                <button
                  type="button"
                  onClick={() => setMode("connect")}
                  className="rounded-full border border-cyan-400/70 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-200 hover:bg-cyan-500/20"
                >
                  + Connect to a friend
                </button>
              </div>

              <div
                ref={requestsRef}
                className={
                "mt-2 space-y-1 max-h-40 overflow-y-auto scrollbar-hide " +
                (highlightRequests
                  ? "glow-pulse border border-cyan-400/80 rounded-xl"
                  : "")
              }
              >
                {isLoadingOutgoing && (
                  <p className="text-[11px] text-slate-500">
                    Loading your outgoing links…
                  </p>
                )}
                {!isLoadingOutgoing && outgoing.length === 0 && (
                  <p className="text-[11px] text-slate-500">
                    No outgoing requests yet. Use "Connect to a friend" to
                    start.
                  </p>
                )}
                {outgoing.map((req) => (
                  <div
                    key={req.id}
                    className={
                      "flex items-center justify-between gap-2 rounded-xl bg-slate-900/90 px-2 py-1.5 " +
                      (req.status === "ACCEPTED" && req.toUser?.handle
                        ? "cursor-pointer hover:bg-slate-800/90"
                        : "")
                    }
                    onClick={() => {
                      if (req.status === "ACCEPTED" && req.toUser?.handle) {
                        openChatWithPeer(req.toUser.handle);
                        setIsChatFull(true);
                      }
                    }}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs text-slate-200 flex items-center">
                        @{req.toUser?.handle || "unknown"}
                        {req.toUser?.handle && unreadSenders.includes(req.toUser.handle) && (
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316] animate-pulse ml-1.5" title="New Message!" />
                        )}
                      </p>
                      <p className="truncate text-[11px] text-slate-500">
                        {(req.categories || []).join(" · ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          req.status === "ACCEPTED"
                            ? "bg-emerald-500/15 text-emerald-300 border border-emerald-400/40"
                            : req.status === "REJECTED"
                            ? "bg-rose-500/15 text-rose-300 border border-rose-400/40"
                            : "bg-amber-500/10 text-amber-200 border border-amber-400/40"
                        }`}
                      >
                        {req.status}
                      </span>
                      {req.status === "ACCEPTED" && req.toUser?.handle && (
                        <div className="flex items-center gap-1.5">
                          {isFounder && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenFounderGrantModal(req.toUser.handle);
                              }}
                              className="inline-flex items-center rounded-full border border-fuchsia-400/80 bg-fuchsia-500/10 px-2 py-0.5 text-[10px] font-semibold text-fuchsia-200 hover:bg-fuchsia-500/20 shadow-[0_0_10px_rgba(240,46,170,0.2)] active:scale-95 transition-all"
                            >
                              💎 Give QP
                            </button>
                          )}
                          {(() => {
                            const isUnread = req.toUser?.handle && unreadSenders.includes(req.toUser.handle);
                            return (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openChatWithPeer(req.toUser.handle);
                                }}
                                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium transition-all ${
                                  isUnread
                                    ? "border-orange-500 bg-orange-500/20 text-orange-200 shadow-[0_0_12px_rgba(249,115,22,0.4)] animate-pulse"
                                    : "border-cyan-400/70 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20"
                                }`}
                              >
                                Chat
                              </button>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Incoming requests */}
              <div className="mt-4 border-t border-slate-700/60 pt-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-slate-400">
                    Incoming connection requests
                  </p>
                </div>
                {isLoadingIncoming && (
                  <p className="text-[11px] text-slate-500">
                    Loading incoming requests…
                  </p>
                )}
                {incomingError && (
                  <p className="text-[11px] text-rose-300">{incomingError}</p>
                )}
                {/* Global Founder section visible to all users */}
                <div className="mt-2 space-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Founder
                  </p>
                  <button
                    type="button"
                    onClick={async () => {
                      setMode("connect");
                      setFriendIdInput("Rohit_7779");
                      setSearching(true);
                      setSearchError(null);
                      setFoundUser(null);
                      setSelectedCategories([]);
                      setComment("");
                      setRequestError(null);
                      setRequestSuccess(null);

                      try {
                        const res = await fetch("/api/friends/search", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ handle: "Rohit_7779" }),
                        });

                        if (!res.ok) {
                          const data = await res.json().catch(() => ({}));
                          setSearchError(data.error || "Quantum ID not found.");
                          return;
                        }

                        const data = await res.json();
                        setFoundUser(data.user as FoundUser);
                      } catch {
                        setSearchError("Unable to reach quantum directory. Try again.");
                      } finally {
                        setSearching(false);
                      }
                    }}
                    className="w-full text-left"
                  >
                    <div className="founder-vip-aurora rounded-2xl border border-red-500/80 bg-slate-950/95 p-2.5 overflow-hidden [clip-path:inset(0_round_1rem)] drop-shadow-[0_0_30px_rgba(248,113,113,0.55)]">
                      <div className="founder-vip-aurora-inner founder-vip-shine space-y-1.5 rounded-2xl bg-gradient-to-br from-slate-950/90 via-slate-900/90 to-slate-950/90 px-3 py-2 relative overflow-hidden [clip-path:inset(0_round_1rem)] isolation-isolate">
                        <div className="founder-vip-line-full absolute inset-x-0 -top-2 -bottom-2 rounded-2xl"></div>
                        <div className="relative z-10 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-[11px] font-semibold text-slate-50 flex items-center gap-1">
                              <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border border-red-400/80 bg-red-600/60 text-[8px] font-bold text-slate-50">
                                ✓
                              </span>
                              @MR_ROHIT
                            </p>
                            <p className="text-[10px] font-semibold text-slate-200">
                              Founder & CEO at Q‑Link
                            </p>
                          </div>
                          <span className="rounded-full border border-red-400/80 bg-red-500/20 px-2 py-0.5 text-[9px] font-medium text-red-200">
                            Elite Founder
                          </span>
                        </div>
                        <div className="relative z-10">
                          <p className="text-[10px] text-slate-400">
                            Tap to open the founder's VIP profile and send a direct feedback
                            request.
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
                {!isLoadingIncoming && !incomingError && incoming.length === 0 && (
                  <p className="text-[11px] text-slate-500">
                    No one has requested to connect yet.
                  </p>
                )}
                <div className="space-y-1 mt-2 max-h-52 overflow-y-auto incoming-requests-scroll pr-1">
                  {incoming.map((req) => (
                    <div
                      key={req.id}
                      className={
                        "flex flex-col gap-1 rounded-xl bg-slate-900/90 px-2 py-1.5 " +
                        (req.status === "ACCEPTED" && req.fromUser?.handle
                          ? "cursor-pointer hover:bg-slate-800/90"
                          : "")
                      }
                      onClick={() => {
                        if (req.status === "ACCEPTED" && req.fromUser?.handle) {
                          openChatWithPeer(req.fromUser.handle || "");
                          setIsChatFull(true);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-[11px] text-slate-200 flex items-center">
                            @{req.fromUser?.handle || "unknown"}
                            {req.fromUser?.handle && unreadSenders.includes(req.fromUser.handle) && (
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316] animate-pulse ml-1.5" title="New Message!" />
                            )}
                          </p>
                          <p className="truncate text-[10px] text-slate-500">
                            {(req.categories || []).join(" · ")}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            req.status === "ACCEPTED"
                              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-400/40"
                              : req.status === "REJECTED"
                              ? "bg-rose-500/15 text-rose-300 border border-rose-400/40"
                              : "bg-amber-500/10 text-amber-200 border border-amber-400/40"
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>
                      {req.message && (
                        <p className="text-[10px] text-slate-400 line-clamp-2">
                          {req.message}
                        </p>
                      )}
                      {req.status === "PENDING" && (
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() =>
                              handleIncomingDecision(
                                req.id,
                                "ACCEPT",
                                req.fromUser?.handle || ""
                              )
                            }
                            className="rounded-full border border-emerald-400/70 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-200 hover:bg-emerald-500/20"
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleIncomingDecision(
                                req.id,
                                "REJECT",
                                req.fromUser?.handle || ""
                              )
                            }
                            className="rounded-full border border-rose-400/70 bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-medium text-rose-200 hover:bg-rose-500/20"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {req.status === "ACCEPTED" && req.fromUser?.handle && (
                        <div className="flex items-center gap-2 pt-1">
                          {isFounder && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenFounderGrantModal(req.fromUser.handle);
                              }}
                              className="inline-flex items-center rounded-full border border-fuchsia-400/80 bg-fuchsia-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-fuchsia-200 hover:bg-fuchsia-500/20 shadow-[0_0_10px_rgba(240,46,170,0.2)] active:scale-95 transition-all"
                            >
                              💎 Give QP
                            </button>
                          )}
                          {(() => {
                            const isUnread = req.fromUser?.handle && unreadSenders.includes(req.fromUser.handle);
                            return (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openChatWithPeer(req.fromUser?.handle || "");
                                }}
                                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium transition-all ${
                                  isUnread
                                    ? "border-orange-500 bg-orange-500/20 text-orange-200 shadow-[0_0_12px_rgba(249,115,22,0.4)] animate-pulse"
                                    : "border-cyan-400/70 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20"
                                }`}
                              >
                                Chat
                              </button>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT: CONNECT FLOW / CHAT */}
          <section
            ref={chatPanelRef}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={
              "relative overflow-hidden scrollbar-hide " +
              (isChatFull
                ? "fixed inset-0 z-[9999] flex h-[100dvh] w-screen"
                : "flex h-auto min-h-full flex-1 flex-col px-4 lg:px-6 py-4")
            }
          >
            {isDraggingFile && (
              <div
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className="absolute inset-0 z-[200] flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-md border-2 border-dashed border-cyan-400/80 rounded-2xl m-3 sm:m-4 animate-float-in"
              >
                {/* Tech corner elements */}
                <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
                <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
                <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
                <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

                {/* Glowing Drop Area Icon */}
                <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-cyan-500/40 bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.3)] animate-pulse pointer-events-none">
                  <svg
                    className="h-8 w-8 text-cyan-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 16.5 4.5H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Z"
                    />
                  </svg>
                </div>

                <h3 className="text-sm font-black uppercase tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300 pointer-events-none">
                  Quantum Link Upload
                </h3>
                <p className="mt-2 text-xs text-slate-300 text-center font-medium px-6 pointer-events-none">
                  Drop files here to send securely to @{activePeerHandle}
                </p>
                <span className="mt-1 text-[9px] font-mono text-slate-500 uppercase tracking-widest pointer-events-none">
                  Maximum file size: 50MB
                </span>
              </div>
            )}

            <div className="glow-ping pointer-events-none absolute inset-0 rounded-2xl" />

            <div
              className={
                "glass-panel relative z-10 rounded-2xl border bg-slate-900/80 shadow-xl fullchat-panel overflow-hidden " +
                (isChatFull ? "fullscreen rounded-none border-none " : "") +
                (isChatAnimating ? (isChatFull ? "opening" : "closing") : "") +
                (isChatFull
                  ? "flex-1 flex h-[100dvh] min-h-0 w-full flex-col space-y-3 p-3"
                  : "flex h-auto min-h-0 flex-col space-y-5 p-5") +
                " border-slate-500/60"
              }
            >
              {!isChatFull && (
                <>
                  <header className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-4">
                      <div 
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setShowLogoViewer(true)}
                      >
                        <Image
                          src="/logo-256.png"
                          alt="Q-Link Logo"
                          width={32}
                          height={32}
                          className="rounded-full object-cover"
                          priority
                        />
                      </div>
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-400">
                          Session Key
                        </p>
                        <p className="mt-1 min-w-0 text-xs font-mono text-slate-300 break-all sm:break-normal">
                          q-link://channel
                          <span className="text-cyan-300">/alpha</span>
                        </p>
                      </div>
                    </div>
                    
                    {/* Clear Bypass Button - Only show when using temp bypass */}
                    {isTempBypass && (
                      <button
                        type="button"
                        onClick={() => {
                          localStorage.removeItem('temp_bypass');
                          window.location.reload();
                        }}
                        className="text-[10px] text-red-400 hover:text-red-300 transition-colors"
                        title="Clear Test Bypass"
                      >
                        Clear Test
                      </button>
                    )}
                    <div className="flex w-full flex-row items-center justify-between text-left sm:w-auto sm:flex-col sm:items-end sm:text-right">
                      <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                        Status
                      </span>
                      <span className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-emerald-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        {mode === "home" ? "Idle" : "Connecting"}
                      </span>
                    </div>
                  </header>

                  {/* Friend search form */}
                  <form
                    onSubmit={handleSearch}
                    className={
                      "space-y-4 rounded-2xl " +
                      (highlightConnect
                        ? "glow-pulse border-cyan-400/80"
                        : "")
                    }
                  >
                    <label className="space-y-2 text-xs font-medium text-slate-200">
                      <span className="flex items-center justify-between gap-2">
                        <span>
                          {mode === "home"
                            ? "Search a friend by quantum ID"
                            : "Enter quantum chat ID"}
                        </span>
                        <span className="text-[10px] font-normal text-slate-400">
                          Example: @orion-9x or @yourname
                        </span>
                      </span>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-500">
                          @
                        </div>
                        <input
                          value={friendIdInput}
                          onChange={(e) => setFriendIdInput(e.target.value)}
                          placeholder="friend-id"
                          className="w-full rounded-xl border border-slate-600/70 bg-slate-900/80 py-2.5 pl-7 pr-24 text-sm text-slate-100 outline-none ring-0 transition focus:border-cyan-400 focus:bg-slate-900 focus:shadow-[0_0_0_1px_rgba(34,211,238,0.6)]"
                        />
                        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[10px] font-mono text-slate-500">
                          x.chat
                        </span>
                      </div>
                    </label>

                    <button
                      type="submit"
                      disabled={!friendIdInput.trim() || searching}
                      className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-fuchsia-400 px-4 py-2.5 text-sm font-medium text-slate-950 shadow-[0_0_25px_rgba(56,189,248,0.65)] transition hover:shadow-[0_0_40px_rgba(56,189,248,0.85)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 transition group-hover:translate-x-full group-hover:opacity-100" />
                      <span className="relative flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-900" />
                        {searching
                          ? "Scanning quantum directory…"
                          : "Connect via quantum ID"}
                      </span>
                    </button>
                  </form>

                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500">
                    <span>
                      {mode === "home"
                        ? "Next: choose relationship & send a note"
                        : "Next: username reservation & secure pairing"}
                    </span>
                    {mode === "connect" && (
                      <button
                        type="button"
                        onClick={() => setMode("home")}
                        className="text-[10px] font-medium text-cyan-300 hover:text-cyan-200"
                      >
                        Back to console
                      </button>
                    )}
                  </div>

                  {/* Messages & request state */}
                  {searchError && (
                    <p className="mt-2 text-[11px] text-rose-300">{searchError}</p>
                  )}
                  {requestSuccess && (
                    <p className="mt-2 text-[11px] text-emerald-300">
                      {requestSuccess}
                    </p>
                  )}
                  {requestError && (
                    <p className="mt-2 text-[11px] text-rose-300">{requestError}</p>
                  )}

                  {/* Found user + categories + note / VIP special card */}
                  {foundUser && (
                    <>
                      {isVipHandle(foundUser.handle) ? (
                        <div className="relative mt-3">
                          {/* Close Button — OUTSIDE founder-vip-aurora so contain:paint can't clip it */}
                          <button
                            type="button"
                            onClick={() => {
                              setMode("home");
                              setFoundUser(null);
                              setSearchError(null);
                            }}
                            className="absolute -top-3 -left-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-red-400/60 bg-slate-900/90 text-red-300 shadow-lg backdrop-blur-sm transition-all duration-200 hover:border-red-300 hover:bg-red-500/10 hover:text-red-200 hover:shadow-red-500/25 active:scale-90"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        <div className="founder-vip-aurora rounded-2xl border border-red-500/80 bg-slate-950/95 p-[2px] shadow-[0_0_40px_rgba(248,113,113,0.65)]">
                          <div className="founder-vip-aurora-inner founder-vip-shine space-y-3 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-3 relative overflow-hidden [clip-path:inset(0_round_1rem)] isolation-isolate">
                            <div className="founder-vip-line-full absolute inset-x-0 -top-2 -bottom-2 rounded-2xl"></div>
                            <div className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-red-400/80 bg-red-600/60 px-2.5 py-0.5 text-[10px] font-semibold text-slate-50">
                              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-red-300 bg-red-500 text-[9px] font-bold">
                                ✓
                              </span>
                              <span className="tracking-wide">@{foundUser.handle}</span>
                            </div>

                            <div className="flex items-start justify-between gap-2 pt-5">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-50">
                                  {foundUser.name || foundUser.email || "@MR_ROHIT"}
                                </p>
                                <p className="mt-0.5 text-[11px] font-semibold text-slate-100">
                                  Founder & CEO at Q‑Link
                                </p>
                              </div>
                              <span className="mt-1 rounded-full border border-red-400/80 bg-red-500/15 px-2 py-0.5 text-[10px] font-medium text-red-200">
                                Elite Founder
                              </span>
                            </div>

                            <div className="space-y-1 text-[11px] text-slate-200">
                              <p>
                                This is a globally recognized **VIP founder ID** on Q‑Link. The Red
                                Tick is an elite badge reserved for system-level identities and
                                upcoming premium entrepreneur verification.
                              </p>
                              <p className="text-[10px] text-slate-400">
                                The Red Tick VIP tier will soon be available for purchase for
                                selected IDs only, with enhanced visibility and VIP features.
                              </p>
                            </div>

                            <div className="space-y-2">
                              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
                                Send feedback request
                              </p>
                              <textarea
                                className="min-h-[60px] w-full resize-none rounded-xl border border-slate-600/70 bg-slate-950/80 px-3 py-2 text-xs text-slate-100 outline-none ring-0 transition focus:border-red-400 focus:bg-slate-950 focus:shadow-[0_0_0_1px_rgba(248,113,113,0.6)]"
                                placeholder="Share your feedback or improvement ideas for Q‑Link…"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                              />
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <button
                                type="button"
                                onClick={handleSendRequest}
                                disabled={sendingRequest}
                                className="group relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-red-400 via-rose-500 to-fuchsia-500 px-4 py-2.5 text-sm font-medium text-slate-950 shadow-[0_0_25px_rgba(248,113,113,0.7)] transition hover:shadow-[0_0_40px_rgba(248,113,113,0.9)] disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 transition group-hover:translate-x-full group-hover:opacity-100" />
                                <span className="relative flex items-center gap-2">
                                  <span className="h-1.5 w-1.5 rounded-full bg-slate-900" />
                                  {sendingRequest ? "Sending VIP request…" : "Send request"}
                                </span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setIsVipTermsAnimating(true);
                                  setShowVipTerms(true);
                                }}
                                className="mt-1 inline-flex items-center justify-center rounded-xl border border-slate-600/70 bg-slate-900/80 px-3 py-1.5 text-[10px] font-medium text-slate-200 hover:border-red-400/70 hover:text-red-200 active:border-red-300 active:bg-red-900/80 active:text-red-50 active:scale-90 transition-all duration-100 sm:mt-0 sm:flex-none"
                              >
                                View Verification & Badge Policy
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      ) : foundUser.blue_tick_status === "SAPPHIRE" ? (
                        <div className="relative mt-3">
                          {/* Close Button — OUTSIDE founder-vip-sapphire so contain:paint can't clip it */}
                          <button
                            type="button"
                            onClick={() => {
                              setMode("home");
                              setFoundUser(null);
                              setSearchError(null);
                            }}
                            className="absolute -top-3 -left-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-sky-400/60 bg-slate-900/90 text-sky-300 shadow-lg backdrop-blur-sm transition-all duration-200 hover:border-sky-300 hover:bg-sky-500/10 hover:text-sky-200 hover:shadow-sky-500/25 active:scale-90"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        <div className="founder-vip-sapphire rounded-2xl border border-sky-500/80 bg-slate-950/95 p-[2px] shadow-[0_0_40px_rgba(14,165,233,0.65)]">
                          <div className="founder-vip-sapphire-inner founder-vip-sapphire-shine space-y-3 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-3 relative overflow-hidden [clip-path:inset(0_round_1rem)] isolation-isolate">
                            <div className="founder-vip-sapphire-line-full absolute inset-x-0 -top-2 -bottom-2 rounded-2xl"></div>
                            <div className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-sky-400/80 bg-sky-600/60 px-2.5 py-0.5 text-[10px] font-semibold text-slate-50">
                              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-sky-300 bg-sky-500 text-[9px] font-bold">
                                ✓
                              </span>
                              <span className="tracking-wide">@{foundUser.handle}</span>
                            </div>

                            <div className="flex items-start justify-between gap-2 pt-5">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-50">
                                  {foundUser.name || foundUser.email || "Quantum User"}
                                </p>
                                <p className="mt-0.5 text-[11px] font-semibold text-slate-300">
                                  Quantum VIP Member
                                </p>
                              </div>
                              <span className="mt-1 rounded-full border border-sky-400/80 bg-sky-500/15 px-2 py-0.5 text-[10px] font-medium text-sky-200">
                                Sapphire VIP
                              </span>
                            </div>

                            <div className="space-y-1 text-[11px] text-slate-200">
                              <p>
                                This is a verified **Sapphire VIP profile** on Q‑Link. Unlocked cosmic high directory sorting and 1.5x permanent Aura score booster.
                              </p>
                            </div>

                            <div className="space-y-2">
                              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
                                Relationship categories
                              </p>
                              <div className="flex flex-wrap items-center gap-2">
                                {allCategories.slice(0, 3).map((cat) => {
                                  const active = selectedCategories.includes(cat);
                                  return (
                                    <button
                                      key={cat}
                                      type="button"
                                      onClick={() => toggleCategory(cat)}
                                      className={`rounded-full border px-2.5 py-1 text-[11px] transition ${
                                        active
                                          ? "border-sky-400/75 bg-sky-500/15 text-sky-200"
                                          : "border-slate-700/60 bg-slate-900/70 text-slate-300 hover:border-sky-400/60 hover:text-sky-200"
                                      }`}
                                    >
                                      {cat}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
                                Add note (optional)
                              </p>
                              <textarea
                                className="min-h-[50px] w-full resize-none rounded-xl border border-slate-600/70 bg-slate-950/80 px-3 py-2 text-xs text-slate-100 outline-none ring-0 transition focus:border-sky-400 focus:bg-slate-950 focus:shadow-[0_0_0_1px_rgba(56,189,248,0.6)]"
                                placeholder="Type a secure connection request note..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                              />
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <button
                                type="button"
                                onClick={handleSendRequest}
                                disabled={sendingRequest}
                                className="group relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 px-4 py-2.5 text-sm font-medium text-slate-950 shadow-[0_0_25px_rgba(56,189,248,0.7)] transition hover:shadow-[0_0_40px_rgba(56,189,248,0.9)] disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 transition group-hover:translate-x-full group-hover:opacity-100" />
                                <span className="relative flex items-center gap-2">
                                  <span className="h-1.5 w-1.5 rounded-full bg-slate-900" />
                                  {sendingRequest ? "Sending VIP request…" : "Send request"}
                                </span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setMode("home");
                                  setFoundUser(null);
                                  setSearchError(null);
                                }}
                                className="rounded-xl border border-slate-700/60 bg-slate-900/60 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-300 hover:border-slate-500 hover:bg-slate-800"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      ) : (
                        <div className="mt-3 space-y-3 rounded-2xl border border-slate-600/70 bg-slate-900/90 p-3 relative">
                          {/* Close Button for Regular User Card */}
                          <button
                            type="button"
                            onClick={() => {
                              setMode("home");
                              setFoundUser(null);
                              setSearchError(null);
                            }}
                            className="absolute -top-2 -left-2 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-slate-400/60 bg-slate-900/90 text-slate-300 shadow-lg backdrop-blur-sm transition-all duration-200 hover:border-cyan-400/70 hover:bg-cyan-500/10 hover:text-cyan-200 hover:shadow-cyan-500/25 active:scale-90 responsive-button text-overflow-fix"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-slate-50">
                                {foundUser.name ||
                                  foundUser.email ||
                                  "Unknown user"}
                              </p>
                              <p className="truncate text-xs text-cyan-300">
                                @{foundUser.handle}
                              </p>
                            </div>
                            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                              Quantum match
                            </span>
                          </div>

                          <div className="space-y-2">
                            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
                              Relationship categories
                            </p>
                            <div className="flex flex-wrap items-center gap-2">
                              {allCategories.map((cat) => {
                                const active = selectedCategories.includes(cat);
                                return (
                                  <button
                                    key={cat}
                                    type="button"
                                    onClick={() => toggleCategory(cat)}
                                    className={`rounded-full border px-2.5 py-1 text-[11px] transition ${
                                      active
                                        ? "border-cyan-400/70 bg-cyan-500/15 text-cyan-200"
                                        : "border-slate-600/70 bg-slate-900/70 text-slate-300 hover:border-cyan-400/60 hover:text-cyan-200"
                                    }`}
                                  >
                                    {cat}
                                  </button>
                                );
                              })}
                              <button
                                type="button"
                                onClick={() => setShowMoreCategories(true)}
                                className="rounded-full border border-slate-600/70 bg-slate-900/70 px-2.5 py-1 text-[11px] text-slate-300 hover:border-cyan-400/60 hover:text-cyan-200"
                              >
                                More
                              </button>
                            </div>
                            <p className="text-[10px] text-slate-500">
                              You can select up to two categories.
                            </p>
                          </div>

                          <div className="space-y-2">
                            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
                              Send a note
                            </p>
                            <textarea
                              className="min-h-[60px] w-full resize-none rounded-xl border border-slate-600/70 bg-slate-950/80 px-3 py-2 text-xs text-slate-100 outline-none ring-0 transition focus:border-cyan-400 focus:bg-slate-950 focus:shadow-[0_0_0_1px_rgba(34,211,238,0.6)]"
                              placeholder="Tell them why you want to connect…"
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                            />
                          </div>

                          <button
                            type="button"
                            onClick={handleSendRequest}
                            disabled={sendingRequest}
                            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-fuchsia-400 px-4 py-2.5 text-sm font-medium text-slate-950 shadow-[0_0_25px_rgba(56,189,248,0.65)] transition hover:shadow-[0_0_40px_rgba(56,189,248,0.85)] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 transition group-hover:translate-x-full group-hover:opacity-100" />
                            <span className="relative flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-900" />
                              {sendingRequest
                                ? "Sending request…"
                                : "Send quantum request"}
                            </span>
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {/* Chat view */}
              {!foundUser && (
                <div
                  className={
                    "glass-panel flex flex-col gap-3 text-xs text-slate-300 relative overflow-y-hidden scrollbar-hide " +
                    (isChatFull
                      ? "flex-1 min-h-0 mt-2 rounded-2xl border bg-slate-900/80 p-4 " +
                        (highlightChatPanel ? "glow-pulse border-cyan-400/80" : "border-slate-600/70")
                      : "flex-1 min-h-0 mt-4 -mx-5 -mb-5 p-4 rounded-t-2xl border-t bg-slate-900/80 " +
                        (highlightChatPanel
                          ? "glow-pulse border-cyan-400/80 border-x-0 border-b-0"
                          : "border-slate-600/70 border-x-0 border-b-0"))
                  }
                  style={{
                    minHeight: isChatFull ? 'calc(100% - 40px)' : '400px',
                    maxHeight: isChatFull ? 'calc(100% - 40px)' : '85vh'
                  }}
                >
                  {/* Fixed header at top of chat card */}
                  <div
                    className={
                      "flex items-center justify-between gap-2 border-b bg-slate-900/95 pb-1 " +
                      (peerOnline || peerTyping
                        ? "border-emerald-400/80 shadow-[0_0_18px_rgba(16,185,129,0.45)]"
                        : "border-slate-700/60")
                    }
                  >
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                      {!activePeerHandle && "Quantum tunnel preview"}
                      {activePeerHandle && peerTyping && (
                        <span className="inline-flex items-center gap-1 text-emerald-300">
                          <span>@{activePeerHandle} is typing</span>
                          <span className="flex gap-0.5">
                            <span className="h-1 w-1 rounded-full bg-emerald-300 animate-pulse" />
                            <span className="h-1 w-1 rounded-full bg-emerald-300 animate-pulse delay-150" />
                            <span className="h-1 w-1 rounded-full bg-emerald-300 animate-pulse delay-300" />
                          </span>
                        </span>
                      )}
                      {activePeerHandle && !peerTyping && peerOnline && (
                        <span className="inline-flex items-center gap-1 text-emerald-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          <span>@{activePeerHandle} · Online</span>
                        </span>
                      )}
                      {activePeerHandle &&
                        !peerTyping &&
                        !peerOnline &&
                        showOfflineTransitionName && (
                          <span className="text-slate-400">{`Chat with @${activePeerHandle}`}</span>
                        )}
                      {activePeerHandle &&
                        !peerTyping &&
                        !peerOnline &&
                        !showOfflineTransitionName &&
                        peerLastSeen && (
                          <span className="inline-flex items-center gap-1 text-slate-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                            <span>
                              Last online at {formatLastOnlineTime(peerLastSeen)}
                            </span>
                          </span>
                        )}
                      {activePeerHandle &&
                        !peerTyping &&
                        !peerOnline &&
                        !showOfflineTransitionName &&
                        !peerLastSeen && (
                          <span className="text-slate-400">{`Chat with @${activePeerHandle}`}</span>
                        )}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={toggleChatFull}
                        className={
                          "rounded-full border bg-slate-900 px-2 py-0.5 text-[10px] text-slate-200 hover:border-cyan-400/70 hover:text-cyan-200 fullchat-toggle " +
                          (highlightFullChat || (activePeerHandle && !isChatFull)
                            ? "glow-pulse border-cyan-400/80 shadow-[0_0_10px_rgba(34,211,238,0.4)]"
                            : "border-slate-600/70 ") +
                          (isChatFull ? "fullchat-x-blink" : "")
                        }
                      >
                        {isChatFull ? "×" : "Full chat"}
                      </button>
                    </div>
                  </div>

                  {/* Scrollable middle: errors + messages + pending preview at bottom */}
                  <div ref={chatScrollRef} className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1 scrollbar-hide">
                    {chatError && (
                      <p className="mt-1 text-[11px] text-rose-300">{chatError}</p>
                    )}

                    <div className="space-y-2">
                      {chatLoading && (
                        <p className="text-[11px] text-slate-500">
                          Loading conversation…
                        </p>
                      )}

                      {!chatLoading && chatMessages.length === 0 && !activePeerHandle && (
                        <div className="space-y-2">
                          <div className="flex justify-start">
                            <div className="rounded-2xl rounded-bl-sm bg-slate-800/90 px-3 py-2 text-slate-100 shadow-sm">
                              <p>
                                Welcome to Q-link. Once your request is accepted,
                                this panel becomes your live chat.
                              </p>
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <div className="rounded-2xl rounded-br-sm bg-gradient-to-r from-cyan-400/90 to-sky-500/90 px-3 py-2 text-slate-950 shadow-[0_0_18px_rgba(56,189,248,0.7)]">
                              <p>
                                For now, start by sending a connection request
                                with your chosen categories.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {!chatLoading && chatMessages.length === 0 && activePeerHandle && (
                        <p className="text-[11px] text-slate-500">
                          No messages yet. Say hi to @{activePeerHandle}.
                        </p>
                      )}

                      {chatMessages.map((m, msgIdx) => {
                        const isMe = meId && m.senderId === meId;
                        const prevMsg = msgIdx > 0 ? chatMessages[msgIdx - 1] : null;
                        const showDateSep = !prevMsg || !isSameDay(prevMsg.createdAt, m.createdAt);

                        const attachments = (m as any).attachments as
                          | {
                              id: string;
                              kind: string;
                              bucket: string;
                              objectKey: string;
                              originalName: string;
                              mimeType: string;
                              sizeBytes: string;
                            }[]
                          | undefined;

                        const filesBase = process.env.NEXT_PUBLIC_SUPABASE_URL;
                        const videosBase =
                          process.env.NEXT_PUBLIC_SUPABASE_VIDEOS_URL || filesBase;

                        const makePublicUrl = (
                          bucket: string,
                          objectKey: string,
                          kind: string,
                        ) => {
                          const base = kind === "video" ? videosBase : filesBase;
                          if (!base) return "";
                          return `${base}/storage/v1/object/public/${bucket}/${objectKey}`;
                        };

                        // Always hide the noisy "[FILE attachment]" / "[VIDEO attachment]"
                        // marker text from the visible message content. The raw content is
                        // still available for logic (e.g. detecting auto-deleted attachments).
                        const displayContent = m.content.replace(
                          /^\[(FILE|VIDEO) attachment\]\s*/i,
                          "",
                        );

                        const isSelected = selectedMessageIds.has(m.id);
                        const isHighlighted = highlightedMessageId === m.id;

                        return (
                          <React.Fragment key={m.id}>
                            {/* ── Date Separator ──────────────────────────────── */}
                            {showDateSep && (
                              <div className="flex items-center gap-3 py-3 select-none">
                                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
                                <span className="px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-950/20 text-[9px] font-bold uppercase tracking-[0.18em] text-cyan-500/80 font-mono shadow-[0_0_10px_rgba(6,182,212,0.15)] backdrop-blur-sm">
                                  {formatDateLabel(m.createdAt)}
                                </span>
                                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
                              </div>
                            )}
                            {/* ── Message Row ─────────────────────────────────── */}
                            <div
                              data-message-bubble
                              data-message-id={m.id}
                              data-message-isme={String(!!isMe)}
                              data-message-content={m.content}
                              className="flex items-center w-full transition-all duration-300 ease-out"
                            >
                            {/* Glowing Checkbox */}
                            <div 
                              className="flex items-center justify-center transition-all duration-300 ease-out overflow-hidden"
                              style={{
                                width: isSelectionMode ? "28px" : "0px",
                                opacity: isSelectionMode ? 1 : 0,
                                marginRight: isSelectionMode ? "8px" : "0px",
                              }}
                            >
                              <div className={`h-5 w-5 rounded-full border flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 ${
                                isSelected 
                                  ? "border-cyan-400 bg-cyan-400 text-slate-950 shadow-[0_0_12px_#22d3ee]" 
                                  : "border-slate-600 bg-slate-950/40 hover:border-cyan-500/50"
                              }`}>
                                {isSelected && (
                                  <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                            </div>

                            {/* Bubble Alignments */}
                            <div className={`flex-1 flex ${isMe ? "justify-end" : "justify-start"}`}>
                              <div
                                style={{ WebkitTouchCallout: "none" }}
                                className={
                                  isMe
                                    ? `max-w-[75%] rounded-2xl rounded-br-sm bg-gradient-to-r from-cyan-400/90 to-sky-500/90 px-3 py-2 text-slate-950 select-none cursor-pointer transition-all duration-500 ${
                                        isHighlighted
                                          ? "shadow-[0_0_30px_#22d3ee,0_0_15px_#38bdf8] ring-2 ring-cyan-200 ring-offset-2 ring-offset-slate-950 scale-[1.03]"
                                          : isSelected
                                          ? "ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950 scale-[0.98] shadow-[0_0_18px_rgba(56,189,248,0.7)]"
                                          : "shadow-[0_0_18px_rgba(56,189,248,0.7)]"
                                      }`
                                    : `max-w-[75%] rounded-2xl rounded-bl-sm bg-slate-800/90 px-3 py-2 text-slate-100 select-none cursor-pointer transition-all duration-500 ${
                                        isHighlighted
                                          ? "bg-slate-700/95 ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950 shadow-[0_0_25px_rgba(34,211,238,0.6)] scale-[1.03]"
                                          : isSelected
                                          ? "ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950 scale-[0.98] shadow-md"
                                          : "shadow-sm"
                                      }`
                                }
                              >
                              {/* Text content */}
                              {displayContent && (
                                <p className="break-words flex items-center flex-wrap gap-1">
                                  {m.isEncrypted && (
                                    <span 
                                      title="End-to-End Encrypted" 
                                      className={`inline-flex items-center text-[11px] mr-0.5 select-none ${isMe ? "text-slate-950/60" : "text-cyan-400/80"}`}
                                    >
                                      🔒
                                    </span>
                                  )}
                                  <span>{renderMessageText(displayContent, !!isMe)}</span>
                                </p>
                              )}

                              {/* Attachments, if any */}
                              {attachments && attachments.length > 0 && (
                                <div className="mt-1 space-y-2">
                                  {attachments.map((a) => {
                                    const kind = a.kind;
                                    const url = makePublicUrl(a.bucket, a.objectKey, kind);

                                    if (!url) {
                                      return (
                                        <div key={a.id} className="text-[11px] text-slate-400">
                                          Attachment: {a.originalName}
                                        </div>
                                      );
                                    }

                                    if (kind === "image" || a.mimeType?.startsWith("image/")) {
                                      return (
                                        <div key={a.id} className="space-y-1">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setLightboxImageUrl(url);
                                              setLightboxImageName(a.originalName);
                                            }}
                                            className="block w-full overflow-hidden rounded-xl border border-slate-700/70 bg-slate-950/80 focus:outline-none focus:ring-2 focus:ring-cyan-400/80"
                                          >
                                            <img
                                              src={url}
                                              alt={a.originalName}
                                              className="max-h-64 w-full rounded-xl object-contain"
                                            />
                                          </button>
                                          <div className="flex justify-between">
                                            <span className="truncate text-[10px] text-slate-400">
                                              {a.originalName}
                                            </span>
                                            <button
                                              type="button"
                                              onClick={async () => {
                                                try {
                                                  const res = await fetch(
                                                    `/api/attachments/download?id=${encodeURIComponent(a.id)}`
                                                  );
                                                  if (!res.ok) {
                                                    const err = await res.json().catch(() => ({ error: "Download failed" }));
                                                    console.error("[Download] Failed:", res.status, err);
                                                    alert(`Download failed: ${err.error || "Unknown error"}`);
                                                    return;
                                                  }
                                                  const blob = await res.blob();
                                                  const objectUrl = URL.createObjectURL(blob);
                                                  const link = document.createElement("a");
                                                  link.href = objectUrl;
                                                  link.download = a.originalName;
                                                  link.click();
                                                  URL.revokeObjectURL(objectUrl);
                                                } catch (err) {
                                                  console.error("[Download] Error:", err);
                                                  alert(`Download error: ${err instanceof Error ? err.message : "Unknown error"}`);
                                                }
                                              }}
                                              className="inline-flex items-center gap-1 rounded-full border border-cyan-400/80 bg-gradient-to-r from-cyan-400 via-sky-400 to-fuchsia-400 px-2 py-0.5 text-[10px] text-slate-100 hover:border-cyan-400/80 hover:text-cyan-200"
                                            >
                                              <svg
                                                viewBox="0 0 16 16"
                                                aria-hidden="true"
                                                className="h-3 w-3"
                                              >
                                                <path
                                                  d="M8 2.25a.75.75 0 0 1 .75.75v5.19l1.72-1.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L3.97 7.53a.75.75 0 0 1 1.06-1.06L6.75 8.19V3a.75.75 0 0 1 .75-.75Z"
                                                  fill="currentColor"
                                                />
                                                <path
                                                  d="M3.25 12.5a.75.75 0 0 1 .75-.75h8a.75.75 0 0 1 0 1.5h-8a.75.75 0 0 1-.75-.75Z"
                                                  fill="currentColor"
                                                />
                                              </svg>
                                              <span>Download</span>
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    }

                                    if (kind === "video") {
                                      return (
                                        <div key={a.id} className="space-y-1">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setLightboxVideoUrl(url);
                                              setLightboxVideoName(a.originalName);
                                            }}
                                            className="block w-full overflow-hidden rounded-xl border border-slate-700/70 bg-slate-950/80 focus:outline-none focus:ring-2 focus:ring-cyan-400/80"
                                          >
                                            <video
                                              src={url}
                                              controls
                                              className="max-h-64 w-full rounded-xl bg-black object-contain"
                                            />
                                          </button>
                                          <div className="flex justify-between">
                                            <span className="truncate text-[10px] text-slate-400">
                                              {a.originalName}
                                            </span>
                                            <button
                                              type="button"
                                              onClick={async () => {
                                                try {
                                                  const res = await fetch(
                                                    `/api/attachments/download?id=${encodeURIComponent(a.id)}`
                                                  );
                                                  if (!res.ok) {
                                                    const err = await res.json().catch(() => ({ error: "Download failed" }));
                                                    console.error("[Download] Failed:", res.status, err);
                                                    alert(`Download failed: ${err.error || "Unknown error"}`);
                                                    return;
                                                  }
                                                  const blob = await res.blob();
                                                  const objectUrl = URL.createObjectURL(blob);
                                                  const link = document.createElement("a");
                                                  link.href = objectUrl;
                                                  link.download = a.originalName;
                                                  link.click();
                                                  URL.revokeObjectURL(objectUrl);
                                                } catch (err) {
                                                  console.error("[Download] Error:", err);
                                                  alert(`Download error: ${err instanceof Error ? err.message : "Unknown error"}`);
                                                }
                                              }}
                                              className="inline-flex items-center gap-1 rounded-full border border-cyan-400/80 bg-gradient-to-r from-cyan-400 via-sky-400 to-fuchsia-400 px-2 py-0.5 text-[10px] text-slate-100 hover:border-cyan-400/80 hover:text-cyan-200"
                                            >
                                              <svg
                                                viewBox="0 0 16 16"
                                                aria-hidden="true"
                                                className="h-3 w-3"
                                              >
                                                <path
                                                  d="M8 2.25a.75.75 0 0 1 .75.75v5.19l1.72-1.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L3.97 7.53a.75.75 0 0 1 1.06-1.06L6.75 8.19V3a.75.75 0 0 1 .75-.75Z"
                                                  fill="currentColor"
                                                />
                                                <path
                                                  d="M3.25 12.5a.75.75 0 0 1 .75-.75h8a.75.75 0 0 1 0 1.5h-8a.75.75 0 0 1-.75-.75Z"
                                                  fill="currentColor"
                                                />
                                              </svg>
                                              <span>Download</span>
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    }

                                    if (a.mimeType?.startsWith("audio/") || a.originalName.endsWith(".webm") || a.originalName.endsWith(".ogg") || a.originalName.endsWith(".mp3") || a.originalName.endsWith(".wav")) {
                                       return (
                                         <div key={a.id} className="space-y-1 my-1">
                                           <div className="rounded-xl border border-cyan-500/40 bg-slate-950/80 p-2 shadow-[0_0_12px_rgba(6,182,212,0.15)] backdrop-blur-md flex flex-col gap-1.5 min-w-[200px] sm:min-w-[240px]">
                                             <div className="flex items-center justify-between gap-2">
                                               <div className="flex items-center gap-2">
                                                 <div className="h-6 w-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-md">
                                                   <svg className="h-3 w-3 text-slate-950" fill="currentColor" viewBox="0 0 24 24">
                                                     <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                                                   </svg>
                                                 </div>
                                                 <div className="flex-1 min-w-0">
                                                   <p className="text-[9px] font-bold text-cyan-300 uppercase tracking-wider truncate">
                                                     Voice Message
                                                   </p>
                                                   <p className="text-[8px] text-slate-400 truncate max-w-[100px] sm:max-w-[130px]">
                                                     {a.originalName}
                                                   </p>
                                                 </div>
                                               </div>
                                               
                                               {/* Modern Download Button */}
                                               <button
                                                 type="button"
                                                 onClick={async () => {
                                                   try {
                                                     const res = await fetch(
                                                       `/api/attachments/download?id=${encodeURIComponent(a.id)}`
                                                     );
                                                     if (!res.ok) {
                                                       const err = await res.json().catch(() => ({ error: "Download failed" }));
                                                       console.error("[Download] Failed:", res.status, err);
                                                       alert(`Download failed: ${err.error || "Unknown error"}`);
                                                       return;
                                                     }
                                                     const blob = await res.blob();
                                                     const objectUrl = URL.createObjectURL(blob);
                                                     const link = document.createElement("a");
                                                     link.href = objectUrl;
                                                     link.download = a.originalName;
                                                     link.click();
                                                     URL.revokeObjectURL(objectUrl);
                                                   } catch (err) {
                                                     console.error("[Download] Error:", err);
                                                     alert(`Download error: ${err instanceof Error ? err.message : "Unknown error"}`);
                                                   }
                                                 }}
                                                 className="flex h-5 w-5 items-center justify-center rounded-full border border-cyan-400/50 bg-[#09111c]/95 text-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.2)] transition hover:-translate-y-0.5 hover:bg-slate-800 hover:text-cyan-200 hover:shadow-[0_0_12px_rgba(34,211,238,0.5)] active:scale-95 shrink-0"
                                                 title="Download Voice Note"
                                               >
                                                 <svg
                                                   viewBox="0 0 16 16"
                                                   aria-hidden="true"
                                                   className="h-2.5 w-2.5"
                                                 >
                                                   <path
                                                     d="M8 2.25a.75.75 0 0 1 .75.75v5.19l1.72-1.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L3.97 7.53a.75.75 0 0 1 1.06-1.06L6.75 8.19V3a.75.75 0 0 1 .75-.75Z"
                                                     fill="currentColor"
                                                   />
                                                   <path
                                                     d="M3.25 12.5a.75.75 0 0 1 .75-.75h8a.75.75 0 0 1 0 1.5h-8a.75.75 0 0 1-.75-.75Z"
                                                     fill="currentColor"
                                                   />
                                                 </svg>
                                               </button>
                                             </div>
                                             <CustomAudioPlayer src={url} />
                                           </div>
                                         </div>
                                       );
                                     }

                                    // Default: generic file attachment (separate download button)
                                    return (
                                      <div
                                        key={a.id}
                                        className="flex items-center justify-between gap-2 rounded-xl border border-slate-600/70 bg-slate-900/80 px-2 py-1 text-[11px]"
                                      >
                                        <span className="truncate text-slate-100">
                                          {a.originalName}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={async () => {
                                            try {
                                              const res = await fetch(
                                                `/api/attachments/download?id=${encodeURIComponent(a.id)}`
                                              );
                                              if (!res.ok) {
                                                const err = await res.json().catch(() => ({ error: "Download failed" }));
                                                console.error("[Download] Failed:", res.status, err);
                                                alert(`Download failed: ${err.error || "Unknown error"}`);
                                                return;
                                              }
                                              const blob = await res.blob();
                                              const objectUrl = URL.createObjectURL(blob);
                                              const link = document.createElement("a");
                                              link.href = objectUrl;
                                              link.download = a.originalName;
                                              link.click();
                                              URL.revokeObjectURL(objectUrl);
                                            } catch (err) {
                                              console.error("[Download] Error:", err);
                                              alert(`Download error: ${err instanceof Error ? err.message : "Unknown error"}`);
                                            }
                                          }}
                                          className="inline-flex items-center gap-1 rounded-full border border-slate-500/80 bg-slate-950/90 px-2 py-0.5 text-[10px] text-slate-100 hover:border-cyan-400/80 hover:text-cyan-100"
                                        >
                                          <svg
                                            viewBox="0 0 16 16"
                                            aria-hidden="true"
                                            className="h-3 w-3 flex-shrink-0"
                                          >
                                            <path
                                              d="M8 2.25a.75.75 0 0 1 .75.75v5.19l1.72-1.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L3.97 7.53a.75.75 0 0 1 1.06-1.06L6.75 8.19V3a.75.75 0 0 1 .75-.75Z"
                                              fill="currentColor"
                                            />
                                            <path
                                              d="M3.25 12.5a.75.75 0 0 1 .75-.75h8a.75.75 0 0 1 0 1.5h-8a.75.75 0 0 1-.75-.75Z"
                                              fill="currentColor"
                                            />
                                          </svg>
                                          <span>Download</span>
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* If this message used to represent a file/video attachment
                                  but the attachment metadata is now gone (e.g. auto-deleted
                                  after 24h), show an unavailable placeholder instead of
                                  leaving nothing. */}
                              {!attachments?.length && /\[(FILE|VIDEO) attachment\]/i.test(m.content) && (
                                <div className="mt-1 flex items-center justify-center rounded-xl border border-dashed border-slate-600/70 bg-slate-900/80 px-3 py-2 text-center text-[11px] text-slate-400">
                                  <div>
                                    <p className="font-medium text-slate-300">Attachment unavailable</p>
                                    <p className="mt-0.5 text-[10px] text-slate-500">
                                      This file or video was removed automatically after 24 hours.
                                      Ask the sender to re-send it if you still need it.
                                    </p>
                                  </div>
                                </div>
                              )}

                              {/* ── Bubble Timestamp ────────────────────────── */}
                              {m.createdAt && (
                                <p className={`mt-1.5 text-[9px] font-mono tracking-wide select-none text-right ${
                                  isMe ? "text-slate-900/50" : "text-slate-500/80"
                                }`}>
                                  {formatMsgDateFull(m.createdAt)}
                                </p>
                              )}
                            </div>
                          </div>
                          </div>
                          </React.Fragment>
                        );
                      })}
                    </div>

                    {/* Dynamic scroll spacer when pending image preview is shown */}
                    {pendingImagePreviewUrl && pendingImageFile && (
                      <div className="h-[210px] w-full shrink-0 pointer-events-none" />
                    )}
                  </div>

                  {isEditingImage && pendingImagePreviewUrl && (
                    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/95 px-4">
                      <div className="relative w-full max-w-xl aspect-[4/3] overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-950">
                        <Cropper
                          image={pendingImagePreviewUrl}
                          crop={crop}
                          zoom={zoom}
                          aspect={aspect}
                          onCropChange={setCrop}
                          onZoomChange={setZoom}
                          onCropComplete={handleCropComplete}
                        />
                      </div>
                      <div className="mt-3 flex w-full max-w-xl flex-wrap items-center justify-between gap-2 text-[11px]">
                        <div className="flex flex-wrap gap-1 text-slate-300">
                          <button
                            type="button"
                            onClick={() => handleAspectChange(undefined)}
                            className={`rounded-full px-2 py-0.5 border text-[10px] ${
                              aspect === undefined
                                ? "border-cyan-400/80 bg-cyan-500/20 text-cyan-100"
                                : "border-slate-600/80 bg-slate-900 text-slate-300 hover:border-cyan-400/70 hover:text-cyan-100"
                            }`}
                          >
                            Free
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAspectChange(1)}
                            className={`rounded-full px-2 py-0.5 border text-[10px] ${
                              aspect === 1
                                ? "border-cyan-400/80 bg-cyan-500/20 text-cyan-100"
                                : "border-slate-600/80 bg-slate-900 text-slate-300 hover:border-cyan-400/70 hover:text-cyan-100"
                            }`}
                          >
                            1:1
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAspectChange(4 / 3)}
                            className={`rounded-full px-2 py-0.5 border text-[10px] ${
                              aspect === 4 / 3
                                ? "border-cyan-400/80 bg-cyan-500/20 text-cyan-100"
                                : "border-slate-600/80 bg-slate-900 text-slate-300 hover:border-cyan-400/70 hover:text-cyan-100"
                            }`}
                          >
                            4:3
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAspectChange(16 / 9)}
                            className={`rounded-full px-2 py-0.5 border text-[10px] ${
                              aspect === 16 / 9
                                ? "border-cyan-400/80 bg-cyan-500/20 text-cyan-100"
                                : "border-slate-600/80 bg-slate-900 text-slate-300 hover:border-cyan-400/70 hover:text-cyan-100"
                            }`}
                          >
                            16:9
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleCloseImageEditor}
                            className="rounded-full border border-slate-600/80 bg-slate-900 px-3 py-1 text-[11px] font-medium text-slate-100 hover:border-slate-400/80"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={applyImageCrop}
                            className="rounded-full border border-cyan-400/80 bg-gradient-to-r from-cyan-400 via-sky-400 to-fuchsia-400 px-3 py-1 text-[11px] font-medium text-slate-950 shadow-[0_0_12px_rgba(34,211,238,0.7)]"
                          >
                            Apply crop
                          </button>
                        </div>
                      </div>
                    </div>
                  )}                  <div className="relative z-[9999] -mx-1.5 sm:-mx-2.5">
                    {/* Premium Sci-Fi Selection Mode Command Control Bar */}
                    {isSelectionMode && (
                      <div
                        className="absolute bottom-[calc(100%+8px)] left-1.5 right-1.5 sm:left-2.5 sm:right-2.5 z-[50] rounded-2xl border border-cyan-500/40 bg-[#09111c]/95 p-3 text-[11px] text-slate-200 shadow-[0_0_30px_rgba(6,182,212,0.35)] backdrop-blur-md transition-all duration-300 animate-slide-up flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                      >
                        {/* Title & Selection Count */}
                        <div className="flex items-center gap-2 px-1">
                          <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
                          <span className="text-xs font-bold text-slate-200 font-sans tracking-wide">
                            {selectedMessageIds.size} message{selectedMessageIds.size !== 1 ? "s" : ""} selected
                          </span>
                        </div>

                        {/* Actions Panel */}
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          {/* Select All */}
                          <button
                            type="button"
                            onClick={handleSelectAll}
                            className="px-3.5 py-1.5 rounded-xl border border-slate-800 bg-slate-900/40 text-[10px] font-bold text-slate-300 uppercase tracking-wider transition hover:border-cyan-500/30 hover:text-cyan-400 active:scale-95 duration-150"
                          >
                            Select All
                          </button>

                          {/* Delete Selected (only if there are own messages selected) */}
                          <button
                            type="button"
                            onClick={handleBulkDelete}
                            disabled={
                              chatMessages.filter(
                                (m) => selectedMessageIds.has(m.id) && m.senderId === meId
                              ).length === 0
                            }
                            className="px-3.5 py-1.5 rounded-xl border border-rose-500/25 bg-rose-500/5 text-[10px] font-bold text-rose-400 uppercase tracking-wider transition hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300 disabled:opacity-20 disabled:pointer-events-none active:scale-95 duration-150 shadow-[0_0_8px_rgba(244,63,94,0.05)] hover:shadow-[0_0_12px_rgba(244,63,94,0.15)]"
                          >
                            Delete Selected
                          </button>

                          {/* Cancel / Dismiss */}
                          <button
                            type="button"
                            onClick={() => {
                              setIsSelectionMode(false);
                              setSelectedMessageIds(new Set());
                            }}
                            className="px-3.5 py-1.5 rounded-xl border border-slate-800 bg-slate-900/40 text-[10px] font-bold text-slate-400 uppercase tracking-wider transition hover:border-slate-700 hover:text-slate-200 active:scale-95 duration-150"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Pending image preview pinned statically above input box */}
                    {pendingImagePreviewUrl && pendingImageFile && (
                      <div
                        ref={pendingImageRef}
                        className="absolute bottom-[calc(100%+8px)] left-1.5 right-1.5 sm:left-2.5 sm:right-2.5 z-[50] rounded-2xl border border-slate-600/25 bg-[#09111c]/25 backdrop-blur-[1.5px] p-2 text-[11px] text-slate-200 shadow-[0_0_25px_rgba(0,0,0,0.4)] transition-all"
                      >
                        <p className="mb-1 text-[10px] uppercase tracking-[0.18em] text-slate-400 font-semibold">
                          Pending image
                        </p>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                          <div className="overflow-hidden rounded-xl border border-slate-700/70 bg-slate-950/80">
                            <img
                              src={pendingImagePreviewUrl}
                              alt="Pending attachment"
                              className="max-h-40 w-full object-contain sm:max-h-48 sm:w-64"
                            />
                          </div>
                          <div className="flex flex-1 flex-col items-stretch gap-1 sm:items-end">
                            <div className="w-full truncate text-left text-[10px] text-slate-400 sm:text-right">
                              {pendingImageFile.name}
                            </div>
                            <div className="flex justify-start gap-2 sm:justify-end">
                              <button
                                type="button"
                                disabled={isUploadingAttachment}
                                onClick={() => {
                                  setPendingImageFile(null);
                                  setPendingImagePreviewUrl(null);
                                  setAttachmentError(null);
                                  if (imageVideoInputRef.current) imageVideoInputRef.current.value = "";
                                  if (fileInputRef.current) fileInputRef.current.value = "";
                                }}
                                className="inline-flex items-center justify-center rounded-full border border-rose-500/50 bg-slate-950 px-3 py-1 text-[11px] font-medium text-rose-300 hover:border-rose-400/80 hover:text-rose-200 hover:bg-rose-500/10 disabled:opacity-60 transition-all"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                disabled={isUploadingAttachment}
                                onClick={handleOpenImageEditor}
                                className="inline-flex items-center justify-center rounded-full border border-slate-500/80 bg-slate-950 px-3 py-1 text-[11px] font-medium text-slate-100 hover:border-cyan-400/80 hover:text-cyan-200 hover:bg-cyan-500/10 disabled:opacity-60 transition-all"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                disabled={isUploadingAttachment || !activePeerHandle}
                                onClick={handleSendPendingImage}
                                className="inline-flex items-center justify-center rounded-full border border-cyan-400/80 bg-gradient-to-r from-cyan-400 via-sky-400 to-fuchsia-400 px-3 py-1 text-[11px] font-medium text-slate-950 shadow-[0_0_12px_rgba(34,211,238,0.7)] disabled:opacity-60 hover:shadow-[0_0_18px_rgba(34,211,238,0.9)] transition-all"
                              >
                                {isUploadingAttachment ? "Sending…" : "Send"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  <form
                    onSubmit={handleChatSubmit}
                    className="flex items-center gap-1.5 pt-0 relative z-[9999] w-full"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="*/*"
                      className="hidden"
                      onChange={(e) => handleAttachmentSelected(e, "file")}
                    />
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => handleAttachmentSelected(e, "video")}
                    />
                    <input
                      ref={imageVideoInputRef}
                      type="file"
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={(e) => handleAttachmentSelected(e, "image_video")}
                    />
                    {isRecording ? (
                      <div className="flex-1 flex items-center justify-between rounded-xl border border-rose-500/40 bg-[#09111c]/90 px-3 py-1.5 backdrop-blur-md animate-float-in h-9 sm:h-10">
                        <div className="flex items-center gap-2">
                          <div className="relative flex h-2 w-2 items-center justify-center">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                          </div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-rose-400 ml-1">
                            Recording Voice
                          </span>
                          <span className="text-xs font-semibold text-slate-200 font-mono ml-1">
                            {formatDuration(recordingDuration)}
                          </span>
                        </div>
                        
                        {/* Futuristic soundwave visualizer */}
                        <div className="flex items-end gap-0.5 h-4 px-2">
                          <span className="w-0.5 bg-cyan-400 rounded-full animate-cyberwave-1 origin-bottom h-3" />
                          <span className="w-0.5 bg-cyan-400 rounded-full animate-cyberwave-2 origin-bottom h-4" />
                          <span className="w-0.5 bg-cyan-500 rounded-full animate-cyberwave-3 origin-bottom h-2.5" />
                          <span className="w-0.5 bg-blue-400 rounded-full animate-cyberwave-4 origin-bottom h-5" />
                          <span className="w-0.5 bg-blue-500 rounded-full animate-cyberwave-5 origin-bottom h-3.5" />
                          <span className="w-0.5 bg-purple-400 rounded-full animate-cyberwave-1 origin-bottom h-4" />
                          <span className="w-0.5 bg-purple-500 rounded-full animate-cyberwave-2 origin-bottom h-2" />
                        </div>

                        {/* Stop and controls */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => stopRecording(false)}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-red-500/40 bg-red-950/80 hover:bg-red-900/90 text-red-400 hover:text-red-300 hover:border-red-400/80 transition-all shadow-[0_0_8px_rgba(239,68,68,0.2)]"
                            title="Cancel Recording"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => stopRecording(true)}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-cyan-400/80 bg-gradient-to-tr from-cyan-400 via-sky-400 to-fuchsia-400 text-slate-950 font-bold hover:brightness-110 transition-all shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                            title="Send Voice Message"
                          >
                            <svg className="h-3.5 w-3.5 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Outside Left Action Group (Paperclip & Mic Symmetrical Pairs) */}
                        <div className="flex items-center gap-1 shrink-0 z-[9999]">
                          {/* Paperclip Button & Tooltip Container */}
                          <div className="paperclip-container relative">
                            <style dangerouslySetInnerHTML={{ __html: `
                              .paperclip-tooltip {
                                opacity: 0;
                                transform: translateY(10px) scale(0.95);
                                pointer-events: none;
                                transition: all 0.2s ease-out;
                              }
                              .paperclip-container:hover .paperclip-tooltip {
                                opacity: 1 !important;
                                transform: translateY(0) scale(1) !important;
                              }
                            `}} />
                            <button
                              type="button"
                              disabled={!activePeerHandle}
                              onClick={handleAttachButtonClick}
                              className="select-none flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-slate-600/50 bg-[#09111c]/95 text-slate-300 drop-shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-400/50 hover:bg-slate-800 hover:text-cyan-300 hover:shadow-[0_0_10px_rgba(34,211,238,0.3)] active:scale-95 disabled:opacity-40 disabled:hover:translate-y-0"
                            >
                              {isUploadingAttachment ? (
                                <svg className="h-4 w-4 animate-spin text-cyan-300 drop-shadow-[0_0_6px_rgba(34,211,238,0.8)] pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <svg
                                  viewBox="0 0 24 24"
                                  aria-hidden="true"
                                  className="h-4 w-4 sm:h-5 sm:w-5 pointer-events-none"
                                  style={{ transform: "rotate(-45deg)" }}
                                >
                                  <path
                                    d="M8.5 11.75 13 7.25a2.5 2.5 0 1 1 3.54 3.54l-6.01 6.01a3.75 3.75 0 0 1-5.3-5.3l5.13-5.13"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </button>
                            {/* Premium Cyber-Tooltip (Left-aligned to prevent left clipping, arrow pointing to button center) */}
                            <div 
                              className="paperclip-tooltip absolute bottom-[calc(100%+0.5rem)] left-0 z-[9999] whitespace-nowrap rounded-lg border border-cyan-500/40 bg-[#09111c]/95 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)] backdrop-blur-md overflow-hidden scrollbar-hide after:absolute after:top-full after:left-[18px] sm:after:left-[20px] after:-translate-x-1/2 after:h-0 after:w-0 after:border-x-[4px] after:border-t-[4px] after:border-x-transparent after:border-t-[#09111c] before:absolute before:top-full before:left-[18px] sm:before:left-[20px] before:-translate-x-1/2 before:h-0 before:w-0 before:border-x-[5px] before:border-t-[5px] before:border-x-transparent before:border-t-cyan-500/40"
                            >
                              <span className="flex items-center gap-1.5">
                                <span className="text-[10px]">📁</span>
                                Share files, videos or images
                              </span>
                            </div>
                          </div>

                          {/* Mic Button & Custom Tooltip Container */}
                          <div className="mic-container relative">
                            <style dangerouslySetInnerHTML={{ __html: `
                              .mic-tooltip {
                                opacity: 0;
                                transform: translateY(10px) scale(0.95);
                                pointer-events: none;
                                transition: all 0.2s ease-out;
                              }
                              .mic-container:hover .mic-tooltip {
                                opacity: 1 !important;
                                transform: translateY(0) scale(1) !important;
                              }
                            `}} />
                            <button
                              type="button"
                              disabled={!activePeerHandle || isUploadingAttachment}
                              onClick={startRecording}
                              className="select-none flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-slate-600/50 bg-[#09111c]/95 text-slate-300 drop-shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-400/50 hover:bg-slate-800 hover:text-cyan-300 hover:shadow-[0_0_10px_rgba(34,211,238,0.3)] active:scale-95 disabled:opacity-40 disabled:hover:translate-y-0"
                            >
                              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                              </svg>
                            </button>
                            {/* Premium Cyber-Tooltip for Microphone */}
                            <div 
                              className="mic-tooltip absolute bottom-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 z-[9999] whitespace-nowrap rounded-lg border border-cyan-500/40 bg-[#09111c]/95 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)] backdrop-blur-md overflow-hidden scrollbar-hide after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:h-0 after:w-0 after:border-x-[4px] after:border-t-[4px] after:border-x-transparent after:border-t-[#09111c] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:h-0 before:w-0 before:border-x-[5px] before:border-t-[5px] before:border-x-transparent before:border-t-cyan-500/40"
                            >
                              <span className="flex items-center gap-1.5">
                                <span className="text-[10px]">🎙️</span>
                                Record Voice Message
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Textarea Input Box (Clean, maximized workspace) */}
                        <div className="relative flex-1 group">
                          <textarea
                            rows={1}
                            value={chatInput}
                            onChange={handleChatInputChange}
                            onKeyDown={handleChatKeyDown}
                            ref={chatInputRef}
                            disabled={!activePeerHandle}
                            className="min-h-[36px] max-h-32 w-full resize-none rounded-xl border border-slate-600/70 bg-slate-950/70 pl-3 pr-3 py-1.5 text-xs text-slate-100 outline-none ring-0 transition focus:border-cyan-400 focus:bg-slate-950 focus:shadow-[0_0_0_1px_rgba(34,211,238,0.6)] sm:text-sm disabled:opacity-50"
                            placeholder={
                              activePeerHandle
                                ? `Type a message to @${activePeerHandle}…`
                                : "Accept a request to start chatting…"
                            }
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={!activePeerHandle || !chatInput.trim()}
                          className="select-none inline-flex h-9 w-9 items-center justify-center rounded-full border border-cyan-400/80 bg-gradient-to-tr from-cyan-400 via-sky-400 to-fuchsia-400 text-xs font-medium text-slate-950 drop-shadow-[0_0_8px_rgba(34,211,238,0.7)] [clip-path:circle(50%)] transition hover:brightness-110 sm:h-10 sm:w-10 disabled:opacity-50"
                        >
                          <span className="send-arrow text-base leading-none text-slate-950">
                            ↑
                          </span>
                        </button>
                      </>
                    )}
                  </form>
                  </div>
                  {attachmentError && (
                    <p className="mt-1 text-[10px] text-rose-300">
                      {attachmentError}
                    </p>
                  )}
                  
                  {/* Local self-contained smooth fade animation */}
                  <style dangerouslySetInnerHTML={{ __html: `
                    @keyframes floatInUp {
                      0% {
                        opacity: 0;
                        transform: translateY(12px);
                      }
                      100% {
                        opacity: 1;
                        transform: translateY(0);
                      }
                    }
                    .animate-float-in {
                      animation: floatInUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    }
                    @keyframes cyberWave {
                      0%, 100% { transform: scaleY(0.25); }
                      50% { transform: scaleY(1); }
                    }
                    .animate-cyberwave-1 { animation: cyberWave 0.9s ease-in-out infinite; }
                    .animate-cyberwave-2 { animation: cyberWave 0.6s ease-in-out infinite; }
                    .animate-cyberwave-3 { animation: cyberWave 0.8s ease-in-out infinite; }
                    .animate-cyberwave-4 { animation: cyberWave 0.5s ease-in-out infinite; }
                    .animate-cyberwave-5 { animation: cyberWave 0.7s ease-in-out infinite; }
                  `}} />

                  {/* Unified AI Floating Help Component */}
                  {showAIHelpButton ? (
                    <div className="absolute bottom-20 right-4 z-[99] animate-float-in">
                      <div className="relative group">
                        {/* Built-in Sleek Close Button at Top-Right Corner */}
                        <button
                          type="button"
                          onClick={() => setShowCloseModal(true)}
                          className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full border border-red-500/40 bg-red-950/70 hover:bg-red-900/90 text-red-400 hover:text-red-300 hover:border-red-400/80 flex items-center justify-center z-50 shadow-[0_0_8px_rgba(239,68,68,0.2)] transition-all duration-200"
                        >
                          <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>

                        {/* Sci-Fi AI Help Banner Button */}
                        <button
                          type="button"
                          onClick={() => {
                            alert('AI Assistant is coming soon! 🤖');
                            setShowAIHelpButton(false);
                          }}
                          className="group relative overflow-hidden rounded-2xl border border-cyan-400/50 bg-[#09111c]/95 px-6 py-4 shadow-[0_0_20px_rgba(6,182,212,0.25)] backdrop-blur-md transition-all duration-300 hover:border-cyan-400/80 hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] flex items-center gap-3"
                        >
                          {/* Animated Background Gradient */}
                          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-purple-400/20 animate-pulse pointer-events-none" />
                          
                          {/* Glowing Border Effect */}
                          <div className="absolute inset-0 rounded-2xl border border-cyan-400/30 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)] animate-pulse pointer-events-none" />
                          
                          {/* Button Content */}
                          <div className="relative flex items-center gap-3 pointer-events-none">
                            {/* AI Icon */}
                            <div className="relative">
                              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                </svg>
                              </div>
                              {/* Orbiting Particles */}
                              <div className="absolute inset-0 animate-spin">
                                <div className="absolute top-0 left-1/2 h-1 w-1 bg-cyan-400 rounded-full transform -translate-x-1/2" />
                                <div className="absolute bottom-0 left-1/2 h-1 w-1 bg-blue-400 rounded-full transform -translate-x-1/2" />
                                <div className="absolute left-0 top-1/2 h-1 w-1 bg-purple-400 rounded-full transform -translate-y-1/2" />
                                <div className="absolute right-0 top-1/2 h-1 w-1 bg-pink-400 rounded-full transform -translate-y-1/2" />
                              </div>
                            </div>
                            
                            {/* Text */}
                            <div className="text-left">
                              <p className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300">
                                Need AI Help
                              </p>
                              <p className="text-[10px] text-cyan-400/70 group-hover:text-cyan-300 transition-colors">
                                Smart assistance
                              </p>
                            </div>
                          </div>
                          
                          {/* Hover Glow Effect */}
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400/10 to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Manual AI Help Trigger Button (Compact closed state) */
                    <div className="absolute bottom-20 right-4 z-[99] animate-float-in">
                      <button
                        onClick={() => {
                          setShowAIHelpButton(true);
                          setManualStopAnimation(false);
                          localStorage.setItem("qlink_manual_stop_ai_animation", "false");
                        }}
                        className="select-none group relative h-8 w-8 rounded-full border border-cyan-400/60 bg-[#09111c]/95 shadow-[0_0_10px_rgba(34,211,238,0.25)] transition-all duration-300 hover:border-cyan-400/80 hover:shadow-[0_0_15px_rgba(34,211,238,0.5)] flex items-center justify-center"
                      >
                        <svg className="h-4 w-4 text-cyan-300 group-hover:text-cyan-200 transition-colors group-hover:scale-110 duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                        {/* Glow effect */}
                        <div className="absolute inset-0 rounded-full bg-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </button>
                    </div>
                  )}

                  {/* Close Confirmation Modal */}
                  {showCloseModal && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-[6px] animate-float-in">
                      <div className="relative w-[320px] max-w-[320px] rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-[1px] shadow-[0_0_30px_rgba(34,211,238,0.25)] overflow-hidden h-auto">
                        <div className="relative rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 px-4 py-3 overflow-hidden">
                          {/* Glow Effects */}
                          <div className="pointer-events-none absolute -left-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-cyan-400/40 via-fuchsia-500/30 to-indigo-400/30 blur-3xl animate-pulse" />
                          <div className="pointer-events-none absolute -right-20 bottom-[-4rem] h-40 w-40 rounded-full bg-gradient-to-tr from-indigo-400/30 via-sky-500/30 to-fuchsia-500/30 blur-3xl animate-pulse" />
                          
                          {/* Modal Header */}
                          <div className="text-center mb-3">
                            <div className="mx-auto mb-2 h-10 w-10 rounded-full border border-cyan-400/60 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 flex items-center justify-center">
                              <svg className="h-6 w-6 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <h3 className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300 mb-1">
                              AI Help Assistant
                            </h3>
                            <p className="text-xs text-slate-300 leading-relaxed">
                              This is your intelligent AI assistant that provides smart help and guidance throughout your chat experience. It appears automatically to offer assistance when you might need it.
                            </p>
                          </div>
                          
                          {/* Feature List */}
                          <div className="space-y-1 mb-3">
                            <div className="flex items-center gap-3">
                              <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                              <p className="text-xs text-slate-400 font-medium">Smart contextual assistance</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                              <p className="text-xs text-slate-400 font-medium">Real-time chat guidance</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
                              <p className="text-xs text-slate-400 font-medium">Premium AI-powered features</p>
                            </div>
                          </div>
                          
                          {/* Question */}
                          <div className="text-center mb-3">
                            <p className="text-sm font-bold text-cyan-200">
                              Do you want to close the AI assistant?
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              You can always trigger it again using the arrow button.
                            </p>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                setShowCloseModal(false);
                                setShowAIHelpButton(false);
                                setManualStopAnimation(true);
                                localStorage.setItem("qlink_manual_stop_ai_animation", "true");
                              }}
                              className="flex-1 rounded-xl border border-red-500/80 bg-red-500/20 px-3 py-1.5 text-xs font-bold text-red-300 hover:bg-red-500 hover:text-white transition-all duration-200"
                            >
                              Yes, Close
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowCloseModal(false)}
                              className="flex-1 rounded-xl border border-cyan-500/80 bg-cyan-500/20 px-3 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-500 hover:text-white transition-all duration-200"
                            >
                              No, Keep
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {(lightboxImageUrl || lightboxVideoUrl) && (
                    <div
                      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
                      onClick={() => {
                        setLightboxImageUrl(null);
                        setLightboxImageName(null);
                        setLightboxVideoUrl(null);
                        setLightboxVideoName(null);
                      }}
                    >
                      <div
                        className="relative max-h-[90vh] max-w-5xl"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {lightboxImageUrl && (
                          <img
                            src={lightboxImageUrl}
                            alt={lightboxImageName ?? "Attachment"}
                            className="max-h-[90vh] w-full rounded-2xl object-contain shadow-2xl"
                          />
                        )}
                        {lightboxVideoUrl && (
                          <video
                            src={lightboxVideoUrl}
                            controls
                            autoPlay
                            className="max-h-[90vh] w-full rounded-2xl bg-black object-contain shadow-2xl"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setLightboxImageUrl(null);
                            setLightboxImageName(null);
                            setLightboxVideoUrl(null);
                            setLightboxVideoName(null);
                          }}
                          className="absolute right-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-slate-100 hover:bg-black/90"
                        >
                          Close
                        </button>
                        {(lightboxImageName || lightboxVideoName) && (
                          <div className="mt-2 truncate text-center text-[11px] text-slate-300">
                            {lightboxImageName || lightboxVideoName}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Logo Viewer */}
                  {showLogoViewer && (
                    <div
                      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
                      onClick={() => setShowLogoViewer(false)}
                    >
                      <div
                        className="relative max-h-[90vh] max-w-5xl"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <img
                          src={logoViewerImage}
                          alt="Q-Link Logo - High Quality"
                          className="max-h-[90vh] w-full rounded-2xl object-contain shadow-2xl"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLogoViewer(false)}
                          className="absolute right-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-slate-100 hover:bg-black/90"
                        >
                          Close
                        </button>
                        <div className="mt-2 truncate text-center text-[11px] text-slate-300">
                          Q-Link Chat Logo - Perfect Quality (1024×1024)
                        </div>
                      </div>
                    </div>
                  )}


                </div>
              )}
            </div>
          </section>
        </div>
        </div>

      {/* Dedicated Avatar Picture Viewer (WhatsApp DP style) - Separate Portal */}
      {avatarViewerImageUrl && canUseDom ? (
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md px-4 animate-in fade-in duration-200"
            onClick={() => setAvatarViewerImageUrl(null)}
          >
            {/* Top Action Bar */}
            <div 
              className="w-full max-w-md flex items-center justify-between mb-4 px-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-[0.2em] font-bold text-sky-400">
                  Sapphire VIP Profile
                </span>
                <span className="text-sm font-semibold text-slate-200">
                  {(session?.user as any)?.name || "Quantum User"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAvatarViewerImageUrl(null)}
                className="h-9 w-9 rounded-full bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 flex items-center justify-center text-slate-300 hover:text-slate-100 transition-all duration-200 shadow-lg hover:rotate-90"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Display Container with WhatsApp DP Styling */}
            <div
              className="relative w-full max-w-md aspect-square rounded-2xl border border-sky-500/30 bg-slate-950/80 overflow-hidden shadow-[0_0_50px_rgba(56,189,248,0.4)] flex items-center justify-center p-1 animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={getHighResProfilePic(avatarViewerImageUrl)}
                alt="Hologram Profile Picture"
                className="w-full h-full object-cover rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Bottom Footer Info */}
            <div 
              className="mt-4 text-center px-4"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-[11px] text-sky-300/80 font-medium tracking-wide">
                @{(session?.user as any)?.handle || "your_handle"} • Verified Q-Link VIP
              </p>
            </div>
          </div>,
          document.body
        )
      ) : null}

      {/* Welcome Screen Logo Viewer - Separate Portal */}
      {showWelcomeLogoViewer && canUseDom ? (
        createPortal(
          <div
            className="fixed inset-0 z-[2001] flex items-start justify-end bg-black/40"
            onClick={() => setShowWelcomeLogoViewer(false)}
          >
            <div
              className="fixed top-4 right-4 w-80 max-w-[90vw]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative bg-slate-900/95 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-slate-200">Q-Link Logo</h3>
                    <button
                      type="button"
                      onClick={() => setShowWelcomeLogoViewer(false)}
                      className="rounded-full bg-slate-800/80 px-2 py-1 text-xs font-medium text-slate-300 hover:bg-slate-700/80 hover:text-slate-100 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                  <div className="flex justify-center">
                    <Image
                      src={welcomeLogoViewerImage}
                      alt="Q-Link Logo - Perfect Quality"
                      width={200}
                      height={200}
                      className="rounded-xl object-cover"
                    />
                  </div>
                  <div className="mt-3 text-center">
                    <p className="text-xs text-slate-400">Perfect Quality (1024×1024)</p>
                    <p className="text-[10px] text-slate-500 mt-1">Click outside to close</p>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
      ) : null}

      {/* Onboarding Modal */}
      {showOnboarding ? (
        canUseDom ? (
          createPortal(
            <div
              className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full max-w-2xl mx-4">
                <div className="glass-panel relative rounded-3xl border border-cyan-400/30 bg-slate-900/95 p-8 shadow-xl">
                    {!isFirstAutoOnboarding && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowOnboarding(false);
                          setIsFirstAutoOnboarding(false);
                        }}
                        className="absolute right-4 top-4 rounded-full border border-slate-600/70 bg-slate-900/80 px-2 py-0.5 text-[10px] font-medium text-slate-200 hover:border-cyan-400/70 hover:text-cyan-200"
                      >
                        Close
                      </button>
                    )}
                    {/* Screen 1: ID/Name Setup */}
                    {onboardingStep === 1 && (
                      <div className="space-y-6">
                        <div className="text-center">
                          <div 
                            className="cursor-pointer hover:opacity-80 transition-opacity mb-6 flex items-center justify-center"
                            onClick={() => setShowWelcomeLogoViewer(true)}
                          >
                            <Image
                              src="/logo-256.png"
                              alt="Q-Link Logo"
                              width={64}
                              height={64}
                              className="rounded-full object-cover"
                              priority
                            />
                          </div>
                          <div className="mb-4 h-12 flex items-center justify-center">
                            <div className={`transition-all duration-300 ease-in-out inline-block ${
                              logoAnimationStep >= 1 && logoAnimationStep <= 5 ? '-translate-x-2 opacity-90' : 'translate-x-0 opacity-100'
                            }`}>
                              <span className="text-2xl font-bold text-cyan-300">
                                Welcome to Quantum Chat
                              </span>
                              <span className="ml-2 text-2xl font-bold text-cyan-300">
                                <span className={`inline-block transition-all duration-200 ease-out ${
                                  logoAnimationStep >= 2 && logoAnimationStep <= 8 ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-0 scale-50'
                                }`}>Q</span>
                                <span className={`inline-block transition-all duration-200 ease-out ${
                                  logoAnimationStep >= 3 && logoAnimationStep <= 8 ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-0 scale-50'
                                }`}>-</span>
                                <span className={`inline-block transition-all duration-200 ease-out ${
                                  logoAnimationStep >= 4 && logoAnimationStep <= 8 ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-0 scale-50'
                                }`}>L</span>
                                <span className={`inline-block transition-all duration-200 ease-out ${
                                  logoAnimationStep >= 5 && logoAnimationStep <= 8 ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-0 scale-50'
                                }`}>i</span>
                                <span className={`inline-block transition-all duration-200 ease-out ${
                                  logoAnimationStep >= 6 && logoAnimationStep <= 8 ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-0 scale-50'
                                }`}>n</span>
                                <span className={`inline-block transition-all duration-200 ease-out ${
                                  logoAnimationStep >= 7 && logoAnimationStep <= 8 ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-0 scale-50'
                                }`}>k</span>
                              </span>
                            </div>
                          </div>
                          <p className="text-slate-300">Set up your quantum identity</p>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Your Quantum ID</label>
                            <div className="relative">
                              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">@</span>
                              <input
                                type="text"
                                value={handleDraft}
                                onChange={(e) => onHandleDraftChange(e.target.value)}
                                className="w-full rounded-xl border border-cyan-400/30 bg-slate-800/50 py-3 pl-8 pr-3 text-cyan-100 placeholder-slate-500 outline-none ring-0 transition focus:border-cyan-400 focus:bg-slate-800 focus:shadow-[0_0_0_1px_rgba(34,211,238,0.6)]"
                                placeholder="quantum-1234"
                              />
                            </div>
                            {handleError && (
                              <p className="mt-1 text-xs text-amber-400">{handleError}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Display Name</label>
                            <input
                              type="text"
                              value={nameDraft}
                              onChange={(e) => setNameDraft(e.target.value)}
                              className="w-full rounded-xl border border-cyan-400/30 bg-slate-800/50 py-3 px-3 text-cyan-100 placeholder-slate-500 outline-none ring-0 transition focus:border-cyan-400 focus:bg-slate-800 focus:shadow-[0_0_0_1px_rgba(34,211,238,0.6)]"
                              placeholder="Your Name"
                            />
                          </div>
                        </div>

                        <div className="flex justify-between">
                          <div className="flex gap-2">
                            <button
                              onClick={handleSkipOnboarding}
                              className="rounded-xl border border-slate-600/50 bg-slate-800/50 px-4 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:border-slate-500/50 transition"
                            >
                              Skip
                            </button>
                            <button
                              onClick={handleAutoGenerate}
                              className="rounded-xl border border-cyan-400/50 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-4 py-3 text-sm font-medium text-cyan-300 hover:from-cyan-500/30 hover:to-blue-500/30 hover:border-cyan-400/70 transition shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]"
                            >
                              Auto Generate Your ID and Name
                            </button>
                          </div>
                          <button
                            onClick={handleNextOnboarding}
                            className="rounded-xl border border-cyan-400/50 bg-cyan-500/20 px-6 py-3 text-sm font-medium text-cyan-300 hover:bg-cyan-500/30 hover:border-cyan-400/70 transition"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Screen 2: Interests Selection */}
                    {onboardingStep === 2 && (
                      <div className="space-y-6">
                        <div className="text-center">
                          <h2 className="text-2xl font-bold text-cyan-300 mb-2">Your Interested Fields</h2>
                          <p className="text-slate-300">Select topics that best describe what you care about.</p>
                        </div>

                        <div className="max-h-96 overflow-y-auto scrollbar-hide space-y-1">
                          {interestsCategories.map((interest) => (
                            <div
                              key={interest}
                              onClick={() => toggleInterest(interest)}
                              className={`w-full text-left rounded-lg px-3 py-2 text-sm cursor-pointer ${
                                selectedInterests.includes(interest)
                                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/50"
                                  : "bg-slate-800/50 text-slate-300 border border-slate-600/50 hover:bg-slate-700/50"
                              }`}
                            >
                              {interest}
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-between">
                          <button
                            onClick={() => setOnboardingStep(1)}
                            className="rounded-xl border border-slate-600/50 bg-slate-800/50 px-6 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:border-slate-500/50 transition"
                          >
                            Back
                          </button>
                          <button
                            onClick={handleNextOnboarding}
                            className="rounded-xl border border-cyan-400/50 bg-cyan-500/20 px-6 py-3 text-sm font-medium text-cyan-300 hover:bg-cyan-500/30 hover:border-cyan-400/70 transition"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Screen 3: About You (Bio) */}
                    {onboardingStep === 3 && (
                      <div className="space-y-6">
                        <div className="text-center">
                          <h2 className="text-2xl font-bold text-cyan-300 mb-2">Your Quantum Bio</h2>
                          <p className="text-slate-300">Share a sharp, professional snapshot of who you are and what youre building.</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Introduce yourself</label>
                          <textarea
                            value={bioDraft}
                            onChange={(e) => setBioDraft(e.target.value)}
                            rows={4}
                            className="w-full rounded-xl border border-cyan-400/30 bg-slate-800/60 px-3 py-3 text-sm text-cyan-100 placeholder-slate-500 outline-none ring-0 transition focus:border-cyan-400 focus:bg-slate-800 focus:shadow-[0_0_0_1px_rgba(34,211,238,0.6)] resize-none"
                            placeholder="Example: Operator + builder focused on AI, systems and long-term compounding projects. I like sharp people, deep work and ambitious problems."
                          />
                          <p className="mt-1 text-[11px] text-slate-400">Think like a mini LinkedIn bio: clear, confident and to the point.</p>
                        </div>

                        <div className="flex justify-between">
                          <button
                            onClick={() => setOnboardingStep(2)}
                            className="rounded-xl border border-slate-600/50 bg-slate-800/50 px-6 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:border-slate-500/50 transition"
                          >
                            Back
                          </button>
                          <button
                            onClick={handleNextOnboarding}
                            className="rounded-xl border border-cyan-400/50 bg-cyan-500/20 px-6 py-3 text-sm font-medium text-cyan-300 hover:bg-cyan-500/30 hover:border-cyan-400/70 transition"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Screen 4: Age Selection */}
                    {onboardingStep === 4 && (
                      <div className="space-y-6">
                        <div className="text-center">
                          <h2 className="text-2xl font-bold text-cyan-300 mb-2">How old are you?</h2>
                          <p className="text-slate-300">We use this only to make your connections and recommendations smarter.</p>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-baseline justify-between">
                            <span className="text-sm text-slate-300">Your age</span>
                            <span className="text-lg font-semibold text-cyan-300">{age ?? "Not set"}</span>
                          </div>
                          <input
                            type="range"
                            min={13}
                            max={80}
                            value={age ?? 21}
                            onChange={(e) => setAge(Number(e.target.value))}
                            className="w-full accent-cyan-400"
                          />
                          <div className="flex justify-between text-[11px] text-slate-500">
                            <span>13</span>
                            <span>30</span>
                            <span>50</span>
                            <span>80</span>
                          </div>
                        </div>

                        <div className="flex justify-between">
                          <button
                            onClick={() => setOnboardingStep(3)}
                            className="rounded-xl border border-slate-600/50 bg-slate-800/50 px-6 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:border-slate-500/50 transition"
                          >
                            Back
                          </button>
                          <button
                            onClick={handleNextOnboarding}
                            className="rounded-xl border border-cyan-400/50 bg-cyan-500/20 px-6 py-3 text-sm font-medium text-cyan-300 hover:bg-cyan-500/30 hover:border-cyan-400/70 transition"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Screen 5: Gender Selection */}
                    {onboardingStep === 5 && (
                      <div className="space-y-6">
                        <div className="text-center">
                          <h2 className="text-2xl font-bold text-cyan-300 mb-2">How do you identify?</h2>
                          <p className="text-slate-300">Choose the option that best represents you. This is used only for your profile and matching.</p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                          <button
                            type="button"
                            onClick={() => setGender("male")}
                            className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                              gender === "male"
                                ? "border-cyan-400/80 bg-cyan-500/20 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.4)]"
                                : "border-slate-600/60 bg-slate-800/60 text-slate-300 hover:border-cyan-400/40 hover:bg-slate-800"
                            }`}
                          >
                            Male
                          </button>
                          <button
                            type="button"
                            onClick={() => setGender("female")}
                            className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                              gender === "female"
                                ? "border-cyan-400/80 bg-cyan-500/20 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.4)]"
                                : "border-slate-600/60 bg-slate-800/60 text-slate-300 hover:border-cyan-400/40 hover:bg-slate-800"
                            }`}
                          >
                            Female
                          </button>
                          <button
                            type="button"
                            onClick={() => setGender("other")}
                            className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                              gender === "other"
                                ? "border-cyan-400/80 bg-cyan-500/20 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.4)]"
                                : "border-slate-600/60 bg-slate-800/60 text-slate-300 hover:border-cyan-400/40 hover:bg-slate-800"
                            }`}
                          >
                            Other
                          </button>
                        </div>

                        <div className="flex justify-between">
                          <button
                            onClick={() => setOnboardingStep(4)}
                            className="rounded-xl border border-slate-600/50 bg-slate-800/50 px-6 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:border-slate-500/50 transition"
                          >
                            Back
                          </button>
                          <button
                            onClick={handleFinishOnboarding}
                            className="rounded-xl border border-cyan-400/50 bg-cyan-500/20 px-6 py-3 text-sm font-medium text-cyan-300 hover:bg-cyan-500/30 hover:border-cyan-400/70 transition"
                          >
                            Get Started
                          </button>
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>,
            document.body,
          )
        ) : null
      ) : null}

      {showIdConsole ? (
        canUseDom ? (
          createPortal(
            <div
              className={`fixed inset-0 z-[2100] flex items-center justify-center bg-black/80 ${
                isConsoleClosing ? 'console-backdrop-exit' : 'console-backdrop-enter'
              }`}
              style={{ willChange: 'opacity', transform: 'translateZ(0)' }}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full max-w-3xl mx-4">
                <div
                  className={`glass-panel relative max-h-[90vh] overflow-y-auto scrollbar-hide rounded-3xl border border-cyan-400/30 bg-slate-900/95 p-6 shadow-xl ${
                    isConsoleClosing ? 'console-modal-exit' : 'console-modal-enter'
                  }`}
                  style={{ willChange: 'transform, opacity', transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
                >
                  <div className="pointer-events-none absolute -left-20 -top-20 h-48 w-48 rounded-full bg-gradient-to-br from-cyan-400/45 via-fuchsia-500/35 to-indigo-400/30 blur-3xl" />
                  <div className="pointer-events-none absolute -right-24 bottom-[-4rem] h-56 w-56 rounded-full bg-gradient-to-tr from-indigo-400/35 via-sky-500/35 to-fuchsia-500/30 blur-3xl" />

                  <button
                    type="button"
                    onClick={() => {
                      setIsConsoleClosing(true);
                      setTimeout(() => {
                        setShowIdConsole(false);
                        setIsConsoleClosing(false);
                      }, 350);
                    }}
                    className="absolute right-3 top-3 z-50 flex h-9 w-9 items-center justify-center rounded-full border border-slate-600/70 bg-slate-900/90 text-slate-300 shadow-md transition hover:scale-105 hover:border-cyan-400/70 hover:bg-slate-800 hover:text-cyan-200 active:scale-95"
                    aria-label="Close ID Console"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>

                  <div className="relative flex items-start justify-between gap-4 pr-10">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300/90">
                        Quantum ID Console
                      </p>
                      <p className="mt-1 text-[11px] text-slate-300">
                        @{(session?.user as any)?.handle || "your-id"}
                      </p>
                    </div>
                  </div>

                  <div className="relative mt-4 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIdConsoleTab("my")}
                      className={
                        "rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] transition " +
                        (idConsoleTab === "my"
                          ? "border-cyan-400/70 bg-cyan-500/15 text-cyan-200"
                          : "border-slate-600/70 bg-slate-900/70 text-slate-200 hover:border-cyan-400/70 hover:text-cyan-200")
                      }
                    >
                      My ID
                    </button>
                    <button
                      type="button"
                      onClick={() => setIdConsoleTab("global")}
                      className={
                        "rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] transition " +
                        (idConsoleTab === "global"
                          ? "border-cyan-400/70 bg-cyan-500/15 text-cyan-200"
                          : "border-slate-600/70 bg-slate-900/70 text-slate-200 hover:border-cyan-400/70 hover:text-cyan-200")
                      }
                    >
                      Global
                    </button>
                  </div>

                  <div className="relative mt-4 rounded-2xl border border-slate-700/60 bg-slate-950/40 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                        Create a post
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] text-slate-400">Post visibility</p>
                        <div className="inline-flex overflow-hidden rounded-full border border-slate-700/60 bg-slate-900/70">
                          <button
                            type="button"
                            onClick={() => setPostAudience("GLOBAL")}
                            className={
                              "px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] transition " +
                              (postAudience === "GLOBAL"
                                ? "bg-cyan-500/15 text-cyan-200"
                                : "text-slate-200 hover:text-cyan-200")
                            }
                          >
                            Global
                          </button>
                          <button
                            type="button"
                            onClick={() => setPostAudience("FOLLOWERS")}
                            className={
                              "px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] transition " +
                              (postAudience === "FOLLOWERS"
                                ? "bg-cyan-500/15 text-cyan-200"
                                : "text-slate-200 hover:text-cyan-200")
                            }
                          >
                            Followers
                          </button>
                          <button
                            type="button"
                            onClick={() => setPostAudience("FRIENDS")}
                            className={
                              "px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] transition " +
                              (postAudience === "FRIENDS"
                                ? "bg-cyan-500/15 text-cyan-200"
                                : "text-slate-200 hover:text-cyan-200")
                            }
                          >
                            Friends
                          </button>
                          <button
                            type="button"
                            onClick={() => setPostAudience("ALL")}
                            className={
                              "px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] transition " +
                              (postAudience === "ALL"
                                ? "bg-cyan-500/15 text-cyan-200"
                                : "text-slate-200 hover:text-cyan-200")
                            }
                          >
                            All
                          </button>
                        </div>
                      </div>
                    </div>

                    <textarea
                      value={postTextDraft}
                      onChange={(e) => setPostTextDraft(e.target.value)}
                      rows={3}
                      className="mt-3 w-full resize-none rounded-2xl border border-slate-700/60 bg-slate-900/60 p-3 text-[12px] text-slate-100 outline-none transition focus:border-cyan-400/70 focus:shadow-[0_0_0_1px_rgba(34,211,238,0.5)]"
                      placeholder="Write a post..."
                    />

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <label
                        className={
                          "inline-flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-900/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-200 " +
                          (postingIdConsole
                            ? "cursor-not-allowed opacity-60"
                            : "cursor-pointer hover:border-cyan-400/70 hover:text-cyan-200")
                        }
                        title="Upload images (JPG, PNG, WebP) or videos (MP4, WebM, QuickTime)"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        {idConsoleUploadProgress !== null
                          ? `Uploading ${idConsoleUploadProgress}%`
                          : "Upload Media"}
                        <span className="text-[8px] text-slate-400 ml-1">
                          📷🎬
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                          disabled={postingIdConsole}
                          onChange={(e) => {
                            const f = e.target.files?.[0] || null;
                            setPostMediaFile(f);
                            setIdConsoleUploadProgress(null);
                            setIdConsolePostStatus(null);
                            if (idConsoleLocalPreviewUrl) {
                              try {
                                URL.revokeObjectURL(idConsoleLocalPreviewUrl);
                              } catch {
                                // ignore
                              }
                              setIdConsoleLocalPreviewUrl(null);
                            }
                            if (!f) {
                              setPostMediaKind(null);
                              return;
                            }
                            const isVideo = f.type.startsWith("video/");
                            setPostMediaKind(isVideo ? "video" : "image");
                            try {
                              setIdConsoleLocalPreviewUrl(URL.createObjectURL(f));
                            } catch {
                              // ignore
                            }
                          }}
                        />
                      </label>

                      <div className="min-w-0 text-[11px] text-slate-300">
                        {postMediaFile ? (
                          <span className="truncate">
                            {postMediaKind === "video" ? "🎬" : "📷"} {postMediaKind?.toUpperCase()}: {postMediaFile.name}
                          </span>
                        ) : (
                          <span className="text-slate-400">
                            📷 Images & 🎬 Videos supported
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={handleIdConsolePost}
                        disabled={postingIdConsole}
                        className="rounded-full border border-cyan-400/50 bg-cyan-500/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-200 hover:border-cyan-300/70 hover:bg-cyan-500/20"
                      >
                        {postingIdConsole ? "Posting..." : "Post"}
                      </button>
                    </div>

                    {idConsolePostStatus ? (
                      <p className="mt-2 text-[11px] text-slate-300">{idConsolePostStatus}</p>
                    ) : null}

                    {idConsoleLocalPreviewUrl && postMediaKind === "image" ? (
                      <div className="mt-2 overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-950/40 relative">
                        <button
                          type="button"
                          onClick={() => {
                            // Clear the image preview and reset file state
                            setPostMediaFile(null);
                            setPostMediaKind(null);
                            setIdConsoleUploadProgress(null);
                            setIdConsolePostStatus(null);
                            if (idConsoleLocalPreviewUrl) {
                              try {
                                URL.revokeObjectURL(idConsoleLocalPreviewUrl);
                              } catch {
                                // ignore
                              }
                              setIdConsoleLocalPreviewUrl(null);
                            }
                          }}
                          className="absolute top-2 right-2 z-10 rounded-full border border-slate-600/70 bg-slate-900/80 p-1.5 text-[10px] text-slate-200 hover:border-rose-400/70 hover:bg-rose-500/20 hover:text-rose-300 transition-all duration-200"
                          title="Remove image"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <img
                          src={idConsoleLocalPreviewUrl}
                          alt="Selected upload"
                          className="block w-full max-h-[360px] object-contain bg-slate-950/80"
                        />
                      </div>
                    ) : idConsoleLocalPreviewUrl && postMediaKind === "video" ? (
                      <div className="mt-2 overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-950/40 relative">
                        <button
                          type="button"
                          onClick={() => {
                            // Clear the video preview and reset file state
                            setPostMediaFile(null);
                            setPostMediaKind(null);
                            setIdConsoleUploadProgress(null);
                            setIdConsolePostStatus(null);
                            if (idConsoleLocalPreviewUrl) {
                              try {
                                URL.revokeObjectURL(idConsoleLocalPreviewUrl);
                              } catch {
                                // ignore
                              }
                              setIdConsoleLocalPreviewUrl(null);
                            }
                          }}
                          className="absolute top-2 right-2 z-10 rounded-full border border-slate-600/70 bg-slate-900/80 p-1.5 text-[10px] text-slate-200 hover:border-rose-400/70 hover:bg-rose-500/20 hover:text-rose-300 transition-all duration-200"
                          title="Remove video"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <video
                          src={idConsoleLocalPreviewUrl}
                          controls
                          className="block w-full max-h-[360px] bg-slate-950/80 max-h-[360px] max-w-full m-auto"
                          style={{ objectFit: "contain" }}
                        />
                      </div>
                    ) : null}
                  </div>

                  <div className="relative mt-4 rounded-2xl border border-slate-700/60 bg-slate-950/30 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                      {idConsoleTab === "my" ? "My feed" : "Global feed"}
                    </p>

                    {/* Followers Section - Only show in My feed */}
                    {idConsoleTab === "my" && (
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                            Your Followers
                          </p>
                          <span className="rounded-full border border-slate-700/60 bg-slate-900/60 px-2 py-0.5 text-[9px] font-medium text-slate-300">
                            {followers.length} followers
                          </span>
                        </div>
                        
                        {followersLoading && (
                          <p className="text-[10px] text-slate-500">
                            Loading followers...
                          </p>
                        )}
                        
                        {followersError && (
                          <p className="text-[10px] text-rose-300">
                            {followersError}
                          </p>
                        )}
                        
                        {!followersLoading && !followersError && followers.length > 0 && (
                          <div className="space-y-1.5 max-h-40 overflow-y-auto scrollbar-hide">
                            {followers.map((follower) => (
                              <div
                                key={follower.id}
                                className="flex items-center gap-2 rounded-lg border border-slate-700/50 bg-slate-900/40 p-2 hover:bg-slate-900/60 transition-all"
                              >
                                <div className="relative h-6 w-6 rounded-full overflow-hidden flex-shrink-0 bg-slate-800">
                                  {/* Initials Fallback */}
                                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 to-fuchsia-500/30 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                                    {(follower.handle?.[0] || follower.name?.[0] || '?').toUpperCase()}
                                  </div>
                                  {isValidImageUrl(follower.image) && (
                                    <img
                                      src={getHighResProfilePic(follower.image)}
                                      alt={follower.name || 'User'}
                                      className="absolute inset-0 h-full w-full object-cover rounded-full"
                                      referrerPolicy="no-referrer"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                      }}
                                    />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-[10px] font-medium text-slate-200">
                                    @{follower.handle}
                                  </p>
                                  {follower.name && (
                                    <p className="truncate text-[9px] text-slate-400">
                                      {follower.name}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className={`text-[9px] font-bold ${getAuraColor(follower.auraPercentage || 0)}`}>
                                    {follower.auraPercentage || 0}% Aura
                                  </span>
                                  {follower.points && (
                                    <span className="text-[9px] text-slate-400">
                                      • {follower.points} points
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {!followersLoading && !followersError && followers.length === 0 && (
                          <p className="text-[10px] text-slate-500">
                            No followers yet. Share your posts to get followers!
                          </p>
                        )}
                      </div>
                    )}

                    {showConsoleLoadingDelayed ? (
                      <p className="mt-2 text-[11px] text-slate-400">Loading…</p>
                    ) : idConsolePostsError ? (
                      <p className="mt-2 text-[11px] text-rose-300">{idConsolePostsError}</p>
                    ) : idConsolePosts && idConsolePosts.length ? (
                      <div
                        style={{ scrollbarGutter: "stable", overflowAnchor: "none" }}
                        className="mt-3 space-y-3"
                      >
                        {idConsolePosts
                          .filter((p) =>
                            idConsoleTab === "my"
                              ? p?.authorId === (session?.user as any)?.id
                              : true,
                          )
                          .map((p) => {
                            return (
                            <div
                              key={p.id}
                              style={{ overflowAnchor: "none" }}
                              className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-3 cursor-pointer hover:border-slate-600/80 transition-all"
                              onClick={() => trackPostView(p.id)}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div className="relative h-5 w-5 rounded-full overflow-hidden flex-shrink-0 bg-slate-800">
                                    {/* Initials Fallback */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 to-fuchsia-500/30 flex items-center justify-center text-[8px] font-bold text-white uppercase">
                                      {(p?.author?.handle?.[0] || p?.author?.name?.[0] || '?').toUpperCase()}
                                    </div>
                                    {isValidImageUrl(p?.author?.image) && (
                                      <img
                                        src={getHighResProfilePic(p.author.image)}
                                        alt={p.author.name || 'User'}
                                        className="absolute inset-0 h-full w-full object-cover rounded-full"
                                        referrerPolicy="no-referrer"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                      />
                                    )}
                                  </div>
                                  <p className="text-[11px] font-semibold text-slate-200">
                                    @{p?.author?.handle || "unknown"}
                                  </p>
                                  {p?.author?.blue_tick_status === 'verified' && (
                                    <span className={isVipHandle(p?.author?.handle) ? "flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500/25 border border-red-400/80 text-[7px] font-bold text-red-300 shadow-[0_0_8px_rgba(248,113,113,0.4)]" : "text-blue-400"}>
                                      ✓
                                    </span>
                                  )}
                                  {p?.author?.blue_tick_status === 'SAPPHIRE' && (
                                    <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-sky-500/20 border border-sky-400/80 text-[7px] font-bold text-sky-300 shadow-[0_0_8px_rgba(56,189,248,0.4)]">
                                      ✓
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <p className="text-[10px] text-slate-400">{p.audience}</p>
                                  <p className="text-[8px] text-slate-500">{formatTimeAgo(p.createdAt)}</p>
                                </div>
                              </div>
                              
                              {p.text ? (
                                <p className="mt-2 whitespace-pre-wrap text-[12px] text-slate-100">
                                  {p.text}
                                </p>
                              ) : null}

                              {p?.media?.url && p?.media?.kind === "image" ? (
                                <div className="mt-2 overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-950">
                                  <div
                                    className="mx-auto w-full max-w-[720px] bg-slate-950 h-[380px] sm:h-[500px] md:h-[580px] lg:h-[640px] flex items-center justify-center"
                                  >
                                    <StableImage src={p.media.url} alt="Post media" />
                                  </div>
                                </div>
                              ) : p?.media?.url && p?.media?.kind === "video" ? (
                                <div className="mt-2 overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-950">
                                  <div
                                    className="mx-auto w-full max-w-[720px] bg-slate-950 h-[380px] sm:h-[500px] md:h-[580px] lg:h-[640px] flex items-center justify-center"
                                  >
                                    <SmartVideo
                                      src={p.media.url}
                                      className="h-full w-full"
                                      preload="metadata"
                                      autoplayMuted
                                    />
                                  </div>
                                </div>
                              ) : p.attachmentId ? (
                                <p className="mt-2 text-[11px] text-slate-400">
                                  Media attached: {p.attachmentKind || "file"}
                                </p>
                              ) : null}

                              {/* Engagement Bar */}
                              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-700/40 pt-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleReaction(p.id, 1);
                                    }}
                                    disabled={!(session?.user as any)?.id || engagementLoading[p.id]?.reaction}
                                    className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-medium transition-all ${
                                      postReactions[p.id]?.userReaction === 1
                                        ? 'bg-pink-500/20 border-pink-400/60 text-pink-300'
                                        : 'border-slate-600/60 bg-slate-800/60 text-slate-300 hover:border-pink-400/60'
                                    } ${engagementLoading[p.id]?.reaction ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  >
                                    {engagementLoading[p.id]?.reaction ? (
                                      '...'
                                    ) : (
                                      <img 
                                        src="/like_icon.svg" 
                                        alt="Like" 
                                        className="w-3 h-3"
                                      />
                                    )} {postReactions[p.id]?.likes || p?._count?.reactions || 0}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleReaction(p.id, -1);
                                    }}
                                    disabled={!(session?.user as any)?.id || engagementLoading[p.id]?.reaction}
                                    className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-medium transition-all ${
                                      postReactions[p.id]?.userReaction === -1
                                        ? 'bg-orange-500/20 border-orange-400/60 text-orange-300'
                                        : 'border-slate-600/60 bg-slate-800/60 text-slate-300 hover:border-orange-400/60'
                                    } ${engagementLoading[p.id]?.reaction ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  >
                                    {engagementLoading[p.id]?.reaction ? (
                                      '...'
                                    ) : (
                                      <img 
                                        src="/dislike_icon.svg" 
                                        alt="Dislike" 
                                        className="w-3 h-3"
                                      />
                                    )} {postReactions[p.id]?.dislikes || 0}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setConsoleOpenCommentsPostId((cur) =>
                                        cur === p.id ? null : p.id,
                                      );
                                      if (!consoleOpenCommentsPostId || consoleOpenCommentsPostId !== p.id) {
                                        fetchConsolePostComments(p.id);
                                      }
                                    }}
                                    className={`rounded-full border px-2 py-0.5 text-[9px] font-medium transition-all ${
                                      consoleOpenCommentsPostId === p.id
                                        ? 'bg-blue-500/20 border-blue-400/60 text-blue-300'
                                        : 'border-slate-600/60 bg-slate-800/60 text-slate-300 hover:border-blue-400/60'
                                    }`}
                                  >
                                    💬 {p?._count?.comments || 0}
                                  </button>
                                </div>
                                <div className="flex items-center gap-1 text-[8px] text-slate-500">
                                  <span>👁️ {p?._count?.views || 0} views</span>
                                </div>
                              </div>

                              {/* Comments Section */}
                              {consoleOpenCommentsPostId === p.id && (
                                <div className="mt-3 rounded-xl border border-slate-700/60 bg-slate-950/70 p-2">
                                  <p className="text-[10px] font-semibold text-slate-200 mb-2">
                                    Comments
                                  </p>
                                  
                                  {/* Comment Input */}
                                  {(session?.user as any)?.id && (
                                    <div className="mb-2 flex gap-2">
                                      <input
                                        type="text"
                                        value={consoleCommentInputs[p.id] || ''}
                                        onChange={(e) => setConsoleCommentInputs(prev => ({ ...prev, [p.id]: e.target.value }))}
                                        onKeyPress={(e) => {
                                          if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleConsoleAddComment(p.id);
                                          }
                                        }}
                                        placeholder="Add a comment..."
                                        className="flex-1 rounded-lg border border-slate-600/70 bg-slate-900/80 px-2 py-1 text-[10px] text-slate-100 outline-none ring-0 transition focus:border-blue-400 focus:bg-slate-900 focus:shadow-[0_0_0_1px_rgba(59,130,246,0.6)]"
                                        disabled={engagementLoading[p.id]?.comment}
                                      />
                                      <button
                                        onClick={() => handleConsoleAddComment(p.id)}
                                        disabled={!consoleCommentInputs[p.id]?.trim() || engagementLoading[p.id]?.comment}
                                        className="rounded-lg border border-slate-600/70 bg-slate-900/80 px-2 py-1 text-[10px] font-medium text-slate-200 transition hover:border-blue-400 hover:bg-slate-900 focus:border-blue-400 focus:bg-slate-900 focus:shadow-[0_0_0_1px_rgba(59,130,246,0.6)] disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        {engagementLoading[p.id]?.comment ? 'Posting...' : 'Post'}
                                      </button>
                                    </div>
                                  )}

                                  {/* Comments List */}
                                  <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-hide">
                                    {consoleCommentsLoading[p.id] ? (
                                      <p className="text-[10px] text-slate-400 text-center py-2">Loading comments...</p>
                                    ) : consolePostComments[p.id]?.length > 0 ? (
                                      consolePostComments[p.id].map((comment) => (
                                        <div key={comment.id} className="rounded-lg border border-slate-700/50 bg-slate-900/40 p-2">
                                          <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                              <div className="relative h-3 w-3 rounded-full overflow-hidden flex-shrink-0 bg-slate-800">
                                                {/* Initials Fallback */}
                                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 to-fuchsia-500/30 flex items-center justify-center text-[6px] font-bold text-white uppercase">
                                                  {(comment.author.handle?.[0] || comment.author.name?.[0] || '?').toUpperCase()}
                                                </div>
                                                {isValidImageUrl(comment.author.image) && (
                                                  <img
                                                    src={getHighResProfilePic(comment.author.image)}
                                                    alt={comment.author.name || 'User'}
                                                    className="absolute inset-0 h-full w-full object-cover rounded-full"
                                                    referrerPolicy="no-referrer"
                                                    onError={(e) => {
                                                      (e.target as HTMLImageElement).style.display = 'none';
                                                    }}
                                                  />
                                                )}
                                              </div>
                                              <span className="text-[8px] font-medium text-slate-300">
                                                {comment.author.handle || comment.author.name || 'Anonymous'}
                                              </span>
                                            </div>
                                            <span className="text-[8px] text-slate-500">
                                              {formatTimeAgo(comment.createdAt)}
                                            </span>
                                          </div>
                                          <p className="mt-1 text-[9px] text-slate-200 leading-relaxed">
                                            {comment.content}
                                          </p>
                                        </div>
                                      ))
                                    ) : (
                                      <p className="text-[10px] text-slate-400 text-center py-2">
                                        No comments yet. Be the first to comment!
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                            );
                          })}
                      </div>
                    ) : idConsolePosts === null ? (
                      <div className="mt-4 flex flex-col items-center justify-center gap-2 text-slate-500">
                        <div className="h-8 w-8 rounded-full border-2 border-slate-700/60 border-t-cyan-400 animate-spin" />
                        <p className="text-[11px]">Preparing your console…</p>
                      </div>
                    ) : (
                      <p className="mt-2 text-[11px] text-slate-400">No posts yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        ) : null
      ) : null}

      <StoreModal
        showStore={showStore}
        isStoreAnimating={isStoreAnimating}
        setIsStoreAnimating={setIsStoreAnimating}
        setShowStore={setShowStore}
        cardRotateX={cardRotateX}
        cardRotateY={cardRotateY}
        cardShineX={cardShineX}
        cardShineY={cardShineY}
        handleCardMouseMove={handleCardMouseMove}
        handleCardMouseLeave={handleCardMouseLeave}
        session={session}
        profilePicUrl={profilePicUrl}
        avatarLoadError={avatarLoadError}
        setAvatarLoadError={setAvatarLoadError}
        isAvatarHovered={isAvatarHovered}
        setIsAvatarHovered={setIsAvatarHovered}
        setAvatarViewerImageUrl={setAvatarViewerImageUrl}
        showPointsGuide={showPointsGuide}
        setShowPointsGuide={setShowPointsGuide}
        copiedInviteLink={copiedInviteLink}
        setCopiedInviteLink={setCopiedInviteLink}
        transactionNotification={transactionNotification}
        localBlueTickOverride={localBlueTickOverride}
        localPointsOverride={localPointsOverride}
        isUpgradingStore={isUpgradingStore}
        handleStoreUpgrade={handleStoreUpgrade}
        showDowngradeModal={showDowngradeModal}
        setShowDowngradeModal={setShowDowngradeModal}
        isDowngrading={isDowngrading}
        handleStoreDowngrade={handleStoreDowngrade}
        storeError={storeError}
        setStoreError={setStoreError}
        storeSuccessMsg={storeSuccessMsg}
        setStoreSuccessMsg={setStoreSuccessMsg}
        canUseDom={canUseDom}
      />
      </div>

      {/* Founder Grant Modal */}
      {isFounder && isFounderGrantModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-[420px] rounded-3xl border border-cyan-500/40 bg-slate-950/95 p-6 text-left shadow-[0_0_50px_rgba(34,211,238,0.3)] animate-scale-up mx-4">
            {/* Tech Corner Borders */}
            <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-400 rounded-tl-3xl" />
            <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-cyan-400 rounded-tr-3xl" />
            <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-cyan-400 rounded-bl-3xl" />
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-cyan-400 rounded-br-3xl" />

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsFounderGrantModalOpen(false)}
              className="absolute right-4 top-4 z-50 flex h-8.5 w-8.5 items-center justify-center rounded-full border border-slate-800 bg-slate-900/90 text-slate-400 hover:text-cyan-400 hover:border-cyan-400/50 hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all shadow-md"
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4 pr-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-5.5 w-5.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">
                  Quantum Grant
                </h3>
                <p className="text-[10px] text-slate-400">Founder Privilege: Infinite QP Transmit</p>
              </div>
            </div>

            {/* Recipient info & Input */}
            <div className="my-5 space-y-4">
              <div className="rounded-2xl bg-cyan-950/10 border border-cyan-500/15 p-4 text-[10px] text-slate-300">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 font-medium">RECIPIENT CODESET</span>
                  <span className="font-mono text-cyan-300 font-bold">@{founderGrantTarget}</span>
                </div>
                <div className="h-[1px] bg-cyan-500/10 my-2" />
                <p className="text-[9px] text-slate-400 leading-normal">
                  As the Elite Founder, you possess raw network authorization keys to transmit un-mined Quantum Currency directly into this peer's account.
                </p>
              </div>

              {/* Amount Input */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Transmit Amount (QP)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={founderGrantAmount}
                    onChange={(e) => setFounderGrantAmount(e.target.value)}
                    placeholder="Enter QP amount"
                    className="w-full rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-xs font-mono text-slate-100 placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] font-black tracking-widest text-cyan-500/80 font-mono">
                    QP
                  </div>
                </div>
              </div>

              {/* Presets */}
              <div className="space-y-1.5">
                <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500">
                  Quick Presets
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 50, 100, 500].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setFounderGrantAmount(amt.toString())}
                      className="rounded-xl border border-slate-800/80 bg-slate-900/40 py-1.5 text-[10px] font-bold font-mono text-slate-300 hover:border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-200 transition duration-200 active:scale-95"
                    >
                      +{amt}
                    </button>
                  ))}
                </div>
              </div>

              {founderGrantError && (
                <div className="rounded-2xl border border-red-500/20 bg-red-950/15 p-3 text-[10px] text-red-300 font-medium">
                  {founderGrantError}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setIsFounderGrantModalOpen(false)}
                className="rounded-2xl border border-slate-700/80 bg-slate-900/60 hover:bg-slate-800 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-300 transition active:scale-95 text-center hover:text-slate-100 hover:border-slate-600"
              >
                Abort
              </button>

              <button
                type="button"
                onClick={handleFounderGrantSubmit}
                disabled={isFounderGrantLoading || !founderGrantAmount}
                className="relative overflow-hidden rounded-2xl border border-cyan-500/60 bg-gradient-to-r from-cyan-950 via-cyan-900 to-blue-950 px-6 py-2.5 text-[10px] font-bold uppercase tracking-wider text-cyan-200 hover:border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.25)] hover:shadow-[0_0_30px_rgba(34,211,238,0.45)] transition duration-300 active:scale-95 text-center flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFounderGrantLoading ? (
                  <>
                    <span className="h-3 w-3 animate-spin rounded-full border border-cyan-200 border-t-transparent" />
                    Transmitting...
                  </>
                ) : (
                  "Authorize & Transmit"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global transaction notification popup */}
      {!showStore && transactionNotification?.show && (() => {
        const isDowngradeTx = transactionNotification.amount === 0 && transactionNotification.type === 'debit';
        return (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-[340px] px-4 pointer-events-auto">
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes expandContainer {
                0% { max-width: 48px; opacity: 0; }
                10% { max-width: 48px; opacity: 1; }
                25% { max-width: 48px; opacity: 1; }
                40% { max-width: 340px; opacity: 1; }
                85% { max-width: 340px; opacity: 1; }
                100% { max-width: 48px; opacity: 0; }
              }
              @keyframes qLogoAnimation {
                0% { transform: scale(0) rotate(0deg); opacity: 0; }
                12% { transform: scale(0) rotate(0deg); opacity: 0; }
                22% { transform: scale(1) rotate(0deg); opacity: 1; }
                25% { transform: scale(1) rotate(0deg); opacity: 1; }
                40% { transform: scale(1) rotate(360deg); opacity: 1; }
                85% { transform: scale(1) rotate(360deg); opacity: 1; }
                100% { transform: scale(0) rotate(0deg); opacity: 0; }
              }
              @keyframes tyreScale {
                0% { transform: scale(0); opacity: 0; }
                10% { transform: scale(1); opacity: 1; }
                85% { transform: scale(1); opacity: 1; }
                100% { transform: scale(0); opacity: 0; }
              }
              @keyframes translateWheel {
                0% { transform: translateX(-20px); }
                10% { transform: translateX(0); }
                25% { transform: translateX(0); }
                40% { transform: translateX(0); }
                85% { transform: translateX(0); }
                100% { transform: translateX(-20px); }
              }
              .animate-expand-container {
                animation: expandContainer 3.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              }
              .animate-translate-wheel {
                animation: translateWheel 3.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              }
              .animate-tyre-scale {
                animation: tyreScale 3.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              }
              .animate-q-logo {
                animation: qLogoAnimation 3.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              }
              @keyframes shrinkWidth {
                from { width: 100%; }
                to { width: 0%; }
              }
              .animate-shrink-width {
                animation: shrinkWidth 3.5s linear forwards;
              }
              @keyframes slideUp {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
              }
              .animate-slide-up {
                animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              }
            `}} />
            <div className={`relative flex items-center gap-3 rounded-2xl border backdrop-blur-xl p-2.5 shadow-[0_15px_40px_rgba(0,0,0,0.85)] animate-expand-container overflow-hidden max-w-[340px] w-full ${
              isDowngradeTx 
                ? 'border-fuchsia-500/40 bg-slate-950/85 shadow-[0_0_25px_rgba(240,46,170,0.25)]' 
                : 'border-cyan-500/40 bg-slate-950/85 shadow-[0_0_25px_rgba(34,211,238,0.25)]'
            }`}>
              {/* Animated Corner Tech Borders */}
              <div className={`absolute top-0 left-0 w-2 h-2 border-t-[1.5px] border-l-[1.5px] ${isDowngradeTx ? 'border-fuchsia-400' : 'border-cyan-400'}`} />
              <div className={`absolute top-0 right-0 w-2 h-2 border-t-[1.5px] border-r-[1.5px] ${isDowngradeTx ? 'border-fuchsia-400' : 'border-cyan-400'}`} />
              
              {/* Scanline Effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none opacity-20" />

              {/* Cyber Tyre Wheel (rolling in/out) */}
              <div className="relative shrink-0 w-8.5 h-8.5 flex items-center justify-center animate-translate-wheel z-20">
                {/* Tyre Container (handles scaling/opacity timeline) */}
                <div className="absolute inset-0 animate-tyre-scale">
                  {/* Outer Spinning Cyber Tyre (already spinning on appear!) */}
                  <div className={`absolute inset-0 rounded-full border-[2px] border-dashed animate-[spin_2.5s_linear_infinite] ${
                    isDowngradeTx ? 'border-fuchsia-400/80 bg-fuchsia-500/5' : 'border-cyan-400/80 bg-cyan-500/5'
                  }`} />
                  
                  {/* Inner Tech Ring (spinning infinitely reverse!) */}
                  <div className={`absolute inset-[3px] rounded-full border border-dotted animate-[spin_4s_linear_infinite_reverse] ${
                    isDowngradeTx ? 'border-fuchsia-300/60' : 'border-cyan-300/60'
                  }`} />
                </div>
                
                {/* Central Q logo (appears chronologically, rotates during roll-forward) */}
                <div className={`relative z-10 font-black text-sm tracking-wider font-mono select-none animate-q-logo drop-shadow-[0_0_5px_rgba(34,211,238,0.6)] ${
                  isDowngradeTx ? 'text-fuchsia-400 drop-shadow-[0_0_5px_rgba(240,46,170,0.6)]' : 'text-cyan-400'
                }`}>
                  Q
                </div>
              </div>

              {/* Content Mask (revealing text) */}
              <div className="flex-1 overflow-hidden min-w-0 pr-1">
                <div className="w-[245px] flex items-center justify-between gap-3 text-left">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className={`text-[9px] font-black uppercase tracking-[0.2em] font-mono ${
                        isDowngradeTx ? 'text-fuchsia-400' : 'text-cyan-400'
                      }`}>
                        {transactionNotification.title}
                      </span>
                      <span className="text-[6px] font-mono text-slate-500 uppercase tracking-widest shrink-0">
                        {transactionNotification.txHash}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[8.5px] text-slate-300 leading-tight">
                      {transactionNotification.message}
                    </p>
                  </div>

                  {/* Value */}
                  <div className={`shrink-0 flex flex-col items-end justify-center px-2 py-0.5 rounded-lg border ${
                    isDowngradeTx
                      ? 'bg-fuchsia-950/20 border-fuchsia-500/20 text-fuchsia-300 shadow-[0_0_8px_rgba(240,46,170,0.15)]'
                      : 'bg-cyan-950/20 border-cyan-500/20 text-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.15)]'
                  }`}>
                    <span className="text-[5px] font-bold uppercase tracking-widest text-slate-400 block leading-none">Quantum</span>
                    <span className="text-[10px] font-black tracking-wider font-mono mt-0.5 leading-none">
                      {isDowngradeTx ? 'RESET' : `${transactionNotification.type === 'credit' ? '+' : '-'}${transactionNotification.amount} QP`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className={`absolute bottom-0 inset-x-0 h-[2.5px] rounded-b-2xl animate-shrink-width ${
                isDowngradeTx ? 'bg-fuchsia-500 shadow-[0_0_8px_rgba(240,46,170,0.6)]' : 'bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.6)]'
              }`} />
            </div>
          </div>
        );
      })()}

      {/* Premium Sci-Fi WhatsApp-style Context Menu */}
      {contextMenu && (() => {
        const menuWidth = 170;
        const menuHeight = 110;
        let topPos = contextMenu.y - 10;
        let leftPos = contextMenu.x;
        let translateY = "-100%";

        if (typeof window !== "undefined") {
          if (leftPos - menuWidth/2 < 10) {
            leftPos = menuWidth/2 + 10;
          } else if (leftPos + menuWidth/2 > window.innerWidth - 10) {
            leftPos = window.innerWidth - menuWidth/2 - 10;
          }
          if (topPos - menuHeight < 10) {
            topPos = contextMenu.y + 15;
            translateY = "0%";
          }
        }

        return (
          <div
            data-context-menu
            style={{
              position: "fixed",
              top: topPos,
              left: leftPos,
              transform: `translate(-50%, ${translateY})`,
              zIndex: 9999,
            }}
            className="animate-fade-in min-w-[170px] overflow-hidden rounded-2xl border border-cyan-500/30 bg-[#09111c]/95 p-1.5 shadow-[0_0_25px_rgba(6,182,212,0.25)] backdrop-blur-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Info (Sci-fi Theme) */}
            <div className="border-b border-slate-800 px-2.5 py-1 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              Message Ops
            </div>

            <div className="mt-1 space-y-0.5">
              {/* Copy Button */}
              {!/\[(FILE|VIDEO) attachment\]/i.test(contextMenu.content) && (
                <button
                  type="button"
                  onClick={() => handleCopyMessageText(contextMenu.content)}
                  className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-slate-300 transition duration-150 hover:bg-slate-800/80 hover:text-cyan-300 active:scale-95"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                  <span>Copy Text</span>
                </button>
              )}

              {/* Share Link Button */}
              <button
                type="button"
                onClick={() => handleShareMessage(contextMenu.messageId)}
                className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-slate-300 transition duration-150 hover:bg-slate-800/80 hover:text-cyan-300 active:scale-95"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 10.742l4.618-2.3a3 3 0 100-1.748l-4.618-2.3a3 3 0 100 5.696v0z" />
                </svg>
                <span>Share Link</span>
              </button>

              {/* Select Button */}
              <button
                type="button"
                onClick={() => {
                  setIsSelectionMode(true);
                  setSelectedMessageIds(new Set([contextMenu.messageId]));
                  setContextMenu(null);
                }}
                className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-slate-300 transition duration-150 hover:bg-slate-800/80 hover:text-cyan-300 active:scale-95"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Select</span>
              </button>

              {/* Delete Button (Only for Sender) */}
              {contextMenu.isMe ? (
                <button
                  type="button"
                  onClick={() => handleDeleteMessage(contextMenu.messageId)}
                  className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-rose-400 transition duration-150 hover:bg-rose-950/40 hover:text-rose-300 active:scale-95"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Delete Message</span>
                </button>
              ) : (
                <div className="px-2.5 py-2 text-[10px] italic text-slate-500 font-mono">
                  Read Only
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Glowing Cyberpunk Notification Toast */}
      {shareToastText && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[10000] animate-fade-in px-4 py-2 rounded-full border border-cyan-500/30 bg-[#09111c]/90 text-cyan-400 text-xs font-mono font-bold tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.4)] backdrop-blur-md flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
          {shareToastText}
        </div>
      )}
    </main>
  );
}