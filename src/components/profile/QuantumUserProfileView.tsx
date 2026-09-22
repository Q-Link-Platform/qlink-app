"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

export interface UserProfileData {
  id: string;
  handle: string;
  name: string | null;
  image: string | null;
  bio?: string;
  createdAt?: string;
  blue_tick_status?: string;
  isRedTick?: boolean;
  aura_percentage?: number;
  points?: number;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  isFollowing?: boolean;
  isFriend?: boolean;
  isPendingRequest?: boolean;
  isSelf?: boolean;
  posts?: Array<{
    id: string;
    text: string;
    audience?: string;
    createdAt: string;
    attachmentId?: string | null;
    attachmentKind?: string | null;
    media?: {
      kind: string;
      url: string;
      mimeType?: string;
      sizeBytes?: number;
    } | null;
    _count?: {
      reactions: number;
      comments: number;
      views: number;
    };
  }>;
}

interface QuantumUserProfileViewProps {
  handle: string;
  currentUserId?: string;
  initialData?: Partial<UserProfileData> | null;
  onBack: () => void;
  onStartChat: (peerHandle: string) => void;
  onSendConnectRequest?: (targetHandle: string, categories: string[], note: string) => Promise<void>;
  allCategories?: string[];
}

export const QuantumUserProfileView: React.FC<QuantumUserProfileViewProps> = ({
  handle,
  currentUserId,
  initialData,
  onBack,
  onStartChat,
  onSendConnectRequest,
  allCategories = ["Friend", "Colleague", "Mentor", "Collaborator", "Investor", "Founder"],
}) => {
  const [profile, setProfile] = useState<UserProfileData | null>(() => {
    if (!initialData) return null;
    return {
      id: initialData.id || "",
      handle: initialData.handle || handle,
      name: initialData.name || null,
      image: initialData.image || null,
      bio: initialData.bio || "Quantum Link Network Identity",
      createdAt: initialData.createdAt || "2026-08-01T00:00:00.000Z",
      blue_tick_status: initialData.blue_tick_status || "NONE",
      isRedTick: initialData.isRedTick || false,
      aura_percentage: initialData.aura_percentage ?? 75,
      points: initialData.points ?? 420,
      followersCount: initialData.followersCount ?? 0,
      followingCount: initialData.followingCount ?? 0,
      postsCount: initialData.postsCount ?? 0,
      isFollowing: initialData.isFollowing ?? false,
      isFriend: initialData.isFriend ?? false,
      isPendingRequest: initialData.isPendingRequest ?? false,
      isSelf: initialData.isSelf ?? false,
      posts: initialData.posts || [],
    };
  });

  const [loading, setLoading] = useState(!initialData);
  const [activeTab, setActiveTab] = useState<"posts" | "replies" | "media" | "aura">("posts");
  const [isFollowing, setIsFollowing] = useState(Boolean(initialData?.isFollowing));
  const [followLoading, setFollowLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(initialData?.followersCount || 0);

  // Connect drawer state
  const [showConnectDrawer, setShowConnectDrawer] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [connectNote, setConnectNote] = useState("");
  const [sendingConnect, setSendingConnect] = useState(false);
  const [connectSuccess, setConnectSuccess] = useState<string | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Post like reactions state (optimistic)
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [postLikeCounts, setPostLikeCounts] = useState<Record<string, number>>({});

  // Lightbox modal state for media
  const [lightboxMediaUrl, setLightboxMediaUrl] = useState<string | null>(null);

  const cleanTargetHandle = handle.replace(/^@+/, "").trim();

  // Fetch complete profile on mount or handle change
  useEffect(() => {
    let isMounted = true;
    async function loadProfile() {
      try {
        setLoading(true);
        const res = await fetch(`/api/user/profile/${encodeURIComponent(cleanTargetHandle)}`);
        if (!res.ok) {
          throw new Error("User profile not found");
        }
        const data = await res.json();
        if (isMounted && data.user) {
          setProfile(data.user);
          setIsFollowing(Boolean(data.user.isFollowing));
          setFollowersCount(data.user.followersCount || 0);

          // Initialize like counts
          const counts: Record<string, number> = {};
          data.user.posts?.forEach((p: any) => {
            counts[p.id] = p._count?.reactions || 0;
          });
          setPostLikeCounts(counts);
        }
      } catch (err) {
        console.warn("[QuantumUserProfileView] Profile load failed:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [cleanTargetHandle]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleCopyHandle = async () => {
    const text = `@${profile?.handle || cleanTargetHandle}`;
    try {
      await navigator.clipboard.writeText(text);
      showToast(`Copied ${text} to clipboard!`);
    } catch {
      showToast(`ID: ${text}`);
    }
  };

  const handleShareProfile = async () => {
    const url = typeof window !== "undefined" ? window.location.origin + `?profile=${cleanTargetHandle}` : `@${cleanTargetHandle}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${profile?.name || cleanTargetHandle} on Q-Link`,
          text: `Connect with @${cleanTargetHandle} on Q-Link Quantum Network`,
          url,
        });
        return;
      } catch {}
    }
    await navigator.clipboard.writeText(url);
    showToast("Profile link copied to clipboard!");
  };

  const handleToggleFollow = async () => {
    if (!profile?.id || followLoading) return;
    setFollowLoading(true);

    const prevFollowing = isFollowing;
    const prevCount = followersCount;

    // Optimistic UI update
    setIsFollowing(!prevFollowing);
    setFollowersCount(prevFollowing ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      if (prevFollowing) {
        // Unfollow
        const res = await fetch(`/api/follow?followingId=${encodeURIComponent(profile.id)}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to unfollow");
      } else {
        // Follow
        const res = await fetch("/api/follow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ followingId: profile.id }),
        });
        if (!res.ok) throw new Error("Failed to follow");
      }
    } catch (err) {
      // Revert on failure
      setIsFollowing(prevFollowing);
      setFollowersCount(prevCount);
      showToast("Unable to update follow state");
    } finally {
      setFollowLoading(false);
    }
  };

  const handleSendRequest = async () => {
    if (selectedCategories.length === 0) {
      setConnectError("Please select at least one relationship category.");
      return;
    }
    setSendingConnect(true);
    setConnectError(null);
    setConnectSuccess(null);

    try {
      if (onSendConnectRequest) {
        await onSendConnectRequest(profile?.handle || cleanTargetHandle, selectedCategories, connectNote);
      } else {
        const res = await fetch("/api/friends/request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            toHandle: profile?.handle || cleanTargetHandle,
            categories: selectedCategories.join(","),
            message: connectNote.trim(),
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to send request");
        }
      }
      setConnectSuccess("Quantum connection request sent successfully!");
      setShowConnectDrawer(false);
      showToast("Connection request delivered! ⚡");
    } catch (err: any) {
      setConnectError(err?.message || "Failed to send connection request.");
    } finally {
      setSendingConnect(false);
    }
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(cat)) {
        return prev.filter((c) => c !== cat);
      }
      if (prev.length >= 2) {
        return [prev[1], cat];
      }
      return [...prev, cat];
    });
  };

  const toggleLikePost = async (postId: string) => {
    const isLiked = likedPosts[postId];
    const currentCount = postLikeCounts[postId] || 0;

    // Optimistic toggle
    setLikedPosts((prev) => ({ ...prev, [postId]: !isLiked }));
    setPostLikeCounts((prev) => ({
      ...prev,
      [postId]: isLiked ? Math.max(0, currentCount - 1) : currentCount + 1,
    }));

    try {
      await fetch(`/api/posts/reaction`, {
        method: isLiked ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, type: "LIKE" }),
      });
    } catch (err) {
      // Keep optimistic for seamless responsiveness
    }
  };

  const isFounder =
    profile?.isRedTick ||
    profile?.blue_tick_status === "FOUNDER" ||
    cleanTargetHandle.toLowerCase() === "rohit_7779" ||
    cleanTargetHandle.toLowerCase() === "mr_rohit";

  const isDiamond = profile?.blue_tick_status === "DIAMOND";
  const isSapphire = profile?.blue_tick_status === "SAPPHIRE";
  const isBlueVerified =
    profile?.blue_tick_status === "verified" ||
    profile?.blue_tick_status === "BLUE" ||
    profile?.blue_tick_status === "VERIFIED";

  // Tier accent color tokens
  const ringColor = isFounder
    ? "ring-4 ring-red-500/80 shadow-[0_0_30px_rgba(239,68,68,0.5)]"
    : isDiamond
    ? "ring-4 ring-pink-500/80 shadow-[0_0_30px_rgba(236,72,153,0.5)]"
    : isSapphire
    ? "ring-4 ring-sky-500/80 shadow-[0_0_30px_rgba(14,165,233,0.5)]"
    : isBlueVerified
    ? "ring-4 ring-cyan-400/80 shadow-[0_0_25px_rgba(34,211,238,0.45)]"
    : "ring-2 ring-slate-700 shadow-lg";

  const bannerGradient = isFounder
    ? "from-slate-950 via-red-950/40 to-slate-950"
    : isDiamond
    ? "from-slate-950 via-pink-950/40 to-slate-950"
    : isSapphire
    ? "from-slate-950 via-sky-950/40 to-slate-950"
    : "from-slate-950 via-cyan-950/30 to-slate-950";

  const mediaPosts = (profile?.posts || []).filter((p) => Boolean(p.media?.url));

  return (
    <div className="relative flex flex-col h-full w-full bg-slate-950/95 text-slate-100 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-slate-900/90 border border-cyan-400/70 text-cyan-200 text-xs font-medium shadow-[0_0_20px_rgba(6,182,212,0.4)] backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
          {toastMessage}
        </div>
      )}

      {/* ── TOP STICKY HEADER (X / Twitter Standard) ──────────────────────── */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-2.5 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80">
        <div className="flex items-center gap-4 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-300 hover:text-white hover:bg-slate-800/80 transition active:scale-95 shrink-0"
            title="Back to Console"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>

          <div className="min-w-0 flex flex-col">
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-bold text-sm sm:text-base text-white truncate">
                {profile?.name || cleanTargetHandle}
              </span>

              {/* Verified Badge Header Indicator */}
              {isFounder && (
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-600 border border-red-300 text-[9px] font-black text-white shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.8)]">
                  ✓
                </span>
              )}
              {isDiamond && <span className="text-xs shrink-0 drop-shadow-[0_0_6px_#ec4899]">💎</span>}
              {isSapphire && <span className="text-xs shrink-0 drop-shadow-[0_0_6px_#0284c7]">💠</span>}
              {isBlueVerified && !isFounder && (
                <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-sky-500 border border-sky-300 text-[8px] font-bold text-white shrink-0 shadow-[0_0_8px_rgba(56,189,248,0.8)]">
                  ✓
                </span>
              )}
            </div>

            <span className="text-[11px] text-slate-400 font-medium tracking-tight">
              {profile?.posts?.length || profile?.postsCount || 0} {((profile?.posts?.length || profile?.postsCount || 0) === 1) ? "Post" : "Posts"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 pr-12 sm:pr-14">
          <button
            type="button"
            onClick={handleShareProfile}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700/80 bg-slate-900/60 text-slate-300 hover:text-white hover:border-slate-500 transition"
            title="Share Profile"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
      </header>

      {/* ── COVER / HERO BANNER ────────────────────────────────────────── */}
      <div className={`relative w-full h-32 sm:h-44 bg-gradient-to-r ${bannerGradient} border-b border-slate-800/80 overflow-hidden`}>
        {/* Quantum Cybernetic Grid & Particle Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="absolute -inset-[10px] bg-gradient-to-tr from-transparent via-cyan-500/10 to-transparent opacity-60 pointer-events-none" />

        {isFounder && (
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/15 via-transparent to-red-600/15 animate-pulse duration-[4000ms] pointer-events-none" />
        )}

        <div className="absolute bottom-2 right-3 px-2.5 py-0.5 rounded-full bg-slate-950/70 border border-slate-700/60 backdrop-blur-md text-[10px] font-medium text-slate-300 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>@{cleanTargetHandle}</span>
        </div>
      </div>

      {/* ── AVATAR & TOP ACTIONS ROW ────────────────────────────────────── */}
      <div className="px-4 pb-3">
        <div className="flex justify-between items-end -mt-14 sm:-mt-16 mb-3 relative z-10">
          {/* Avatar with Glow Tier Ring */}
          <div className="relative group">
            <div className={`h-24 w-24 sm:h-28 sm:w-28 rounded-full overflow-hidden bg-slate-900 border-4 border-slate-950 ${ringColor} transition-transform duration-300 group-hover:scale-105 relative`}>
              {profile?.image ? (
                <img
                  src={profile.image}
                  alt={profile.name || cleanTargetHandle}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div className={`h-full w-full flex items-center justify-center font-extrabold text-2xl sm:text-3xl text-white uppercase ${
                  isFounder
                    ? "bg-gradient-to-br from-red-600 via-rose-700 to-red-950"
                    : isDiamond
                    ? "bg-gradient-to-br from-pink-600 via-fuchsia-700 to-pink-950"
                    : isSapphire
                    ? "bg-gradient-to-br from-sky-600 via-blue-700 to-sky-950"
                    : "bg-gradient-to-br from-cyan-600 via-slate-800 to-indigo-950"
                }`}>
                  {(profile?.name?.[0] || cleanTargetHandle[0] || "Q").toUpperCase()}
                </div>
              )}
            </div>

            {/* Online Status Orb */}
            <span className="absolute bottom-1 right-2 h-4 w-4 rounded-full bg-emerald-500 border-2 border-slate-950 shadow-[0_0_8px_#10b981]" title="Quantum Optical Node Online" />
          </div>

          {/* Action Buttons (Follow, Message, Connect, Share) */}
          <div className="flex items-center gap-2 flex-wrap justify-end pt-1">
            {/* Direct Message (Chat) Button */}
            <button
              type="button"
              onClick={() => onStartChat(cleanTargetHandle)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-cyan-400/80 bg-cyan-500/10 text-cyan-200 text-xs font-semibold hover:bg-cyan-500/20 hover:shadow-[0_0_15px_rgba(6,182,212,0.35)] transition-all active:scale-95"
              title="Open Quantum Chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>Message</span>
            </button>

            {/* Connect (Add Friend) Toggle Button */}
            <button
              type="button"
              onClick={() => setShowConnectDrawer(!showConnectDrawer)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-600/80 bg-slate-900/90 text-slate-200 text-xs font-semibold hover:border-slate-400 hover:text-white transition-all active:scale-95"
              title="Send Quantum Connection Request"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Connect</span>
            </button>

            {/* Follow / Following Button (X / Twitter Standard) */}
            <button
              type="button"
              onClick={handleToggleFollow}
              disabled={followLoading}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
                isFollowing
                  ? "border border-slate-600 bg-transparent text-slate-200 hover:border-rose-500/80 hover:bg-rose-500/10 hover:text-rose-300"
                  : "bg-white text-slate-950 hover:bg-slate-200 shadow-md"
              }`}
            >
              {followLoading ? "..." : isFollowing ? "Following" : "Follow"}
            </button>
          </div>
        </div>

        {/* ── USER IDENTITY & METADATA ─────────────────────────────────── */}
        <div className="space-y-2 mt-1">
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                {profile?.name || cleanTargetHandle}
              </h1>

              {/* Verified Badges */}
              {isFounder && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-600/30 border border-red-500/80 text-[10px] font-bold text-red-200 shadow-[0_0_12px_rgba(239,68,68,0.4)]">
                  <span className="h-3 w-3 rounded-full bg-red-500 flex items-center justify-center text-[8px] text-white">✓</span>
                  Elite Founder
                </span>
              )}

              {isDiamond && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-pink-500/20 border border-pink-500/70 text-[10px] font-bold text-pink-200 shadow-[0_0_12px_rgba(236,72,153,0.35)]">
                  💎 Diamond VIP
                </span>
              )}

              {isSapphire && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500/20 border border-sky-500/70 text-[10px] font-bold text-sky-200 shadow-[0_0_12px_rgba(14,165,233,0.35)]">
                  💠 Sapphire VIP
                </span>
              )}

              {isBlueVerified && !isFounder && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/80 text-[10px] font-semibold text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                  ✓ Verified
                </span>
              )}
            </div>

            {/* Clickable @handle */}
            <div className="flex items-center gap-2 mt-0.5">
              <button
                type="button"
                onClick={handleCopyHandle}
                className="text-xs text-slate-400 font-mono hover:text-cyan-300 hover:underline flex items-center gap-1"
                title="Click to copy handle"
              >
                <span>@{profile?.handle || cleanTargetHandle}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>

              <span className="text-slate-600 text-xs">•</span>
              <span className="text-[11px] text-emerald-400/90 font-medium">Optical E2EE Ready</span>
            </div>
          </div>

          {/* Bio Description */}
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
            {profile?.bio || (isFounder
              ? "Founder & CEO at Q‑Link ⚡"
              : "Active on Q-Link.")}
          </p>

          {/* Metadata Row (Joined, Node, Aura, Points) */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-slate-400 pt-1">
            <div className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Joined August 2026</span>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-cyan-400">⚡</span>
              <span className={isFounder ? "text-red-400 font-bold" : "text-cyan-300 font-medium"}>
                {isFounder ? "999,999% ☠️" : `${profile?.aura_percentage || 85}% Aura`}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-amber-400">🪙</span>
              <span className="text-amber-300 font-medium">
                {isFounder ? "999,999 Points" : `${profile?.points || 420} Points`}
              </span>
            </div>
          </div>

          {/* Follower / Following Numbers */}
          <div className="flex items-center gap-4 text-xs pt-1">
            <div className="flex items-center gap-1">
              <span className="font-bold text-white">{profile?.followingCount || 77}</span>
              <span className="text-slate-400">Following</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-white">{followersCount.toLocaleString()}</span>
              <span className="text-slate-400">Followers</span>
            </div>
          </div>
        </div>

        {/* ── EXPANDABLE IN-PROFILE CONNECT DRAWER ─────────────────────── */}
        {showConnectDrawer && (
          <div className="mt-4 p-4 rounded-2xl border border-slate-700/80 bg-slate-900/90 shadow-2xl space-y-3 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <span className="text-cyan-400">⚡</span>
                Establish Quantum Connection
              </h3>
              <button
                type="button"
                onClick={() => setShowConnectDrawer(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            {connectError && (
              <p className="text-xs text-rose-300 bg-rose-950/40 p-2 rounded-xl border border-rose-500/40">
                {connectError}
              </p>
            )}
            {connectSuccess && (
              <p className="text-xs text-emerald-300 bg-emerald-950/40 p-2 rounded-xl border border-emerald-500/40">
                {connectSuccess}
              </p>
            )}

            <div>
              <p className="text-[11px] text-slate-400 mb-1.5">Select Relationship Categories (Max 2):</p>
              <div className="flex flex-wrap gap-1.5">
                {allCategories.map((cat) => {
                  const active = selectedCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                        active
                          ? "bg-cyan-500/20 border border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                          : "bg-slate-800/80 border border-slate-700 text-slate-300 hover:border-slate-500"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-[11px] text-slate-400 mb-1">Encrypted Note (Optional):</p>
              <textarea
                value={connectNote}
                onChange={(e) => setConnectNote(e.target.value)}
                placeholder="Why would you like to link nodes?"
                className="w-full h-16 rounded-xl border border-slate-700 bg-slate-950/80 p-2.5 text-xs text-slate-100 outline-none focus:border-cyan-400 transition"
              />
            </div>

            <button
              type="button"
              onClick={handleSendRequest}
              disabled={sendingConnect}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(6,182,212,0.5)] transition active:scale-[0.99] disabled:opacity-50"
            >
              {sendingConnect ? "Encrypting & Transmitting..." : "Transmit Quantum Connection"}
            </button>
          </div>
        )}
      </div>

      {/* ── TWITTER / X NAVIGATION TABS ────────────────────────────────── */}
      <div className="sticky top-[53px] z-20 flex border-b border-slate-800/90 bg-slate-950/90 backdrop-blur-md">
        {[
          { id: "posts", label: "Posts" },
          { id: "replies", label: "Replies" },
          { id: "media", label: "Media" },
          { id: "aura", label: "Aura & Badges" },
        ].map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className="flex-1 py-3 text-xs sm:text-sm font-bold text-center relative transition hover:bg-slate-900/50"
            >
              <span className={active ? "text-white" : "text-slate-400"}>{tab.label}</span>
              {active && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[3px] w-12 sm:w-16 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee]" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── TAB CONTENT: POSTS ───────────────────────────────────────── */}
      {activeTab === "posts" && (
        <div className="divide-y divide-slate-800/80">
          {loading ? (
            <div className="p-8 text-center space-y-3 text-slate-500">
              <div className="inline-block h-6 w-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs">Loading posts...</p>
            </div>
          ) : profile?.posts && profile.posts.length > 0 ? (
            profile.posts.map((post) => {
              const liked = likedPosts[post.id];
              const likeCount = postLikeCounts[post.id] ?? (post._count?.reactions || 0);

              return (
                <article
                  key={post.id}
                  className="p-4 hover:bg-slate-900/30 transition-colors duration-150 flex gap-3"
                >
                  {/* Small Avatar */}
                  <div className="shrink-0 pt-0.5">
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-slate-800 border border-slate-700">
                      {profile.image ? (
                        <img src={profile.image} alt={profile.name || cleanTargetHandle} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center font-bold text-xs text-white bg-slate-700">
                          {(profile.name?.[0] || cleanTargetHandle[0] || "Q").toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-bold text-xs sm:text-sm text-white truncate hover:underline">
                          {profile.name || cleanTargetHandle}
                        </span>
                        {isFounder && <span className="text-[10px] text-red-400">✓</span>}
                        {isDiamond && <span className="text-[10px]">💎</span>}
                        {isSapphire && <span className="text-[10px]">💠</span>}
                        {isBlueVerified && !isFounder && <span className="text-[10px] text-sky-400">✓</span>}

                        <span className="text-slate-500 text-xs truncate">@{profile.handle || cleanTargetHandle}</span>
                        <span className="text-slate-600 text-xs">·</span>
                        <span className="text-slate-500 text-[11px] whitespace-nowrap">
                          {new Date(post.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-200 leading-normal whitespace-pre-line font-normal">
                      {post.text}
                    </p>

                    {/* Media Attachment Preview if present */}
                    {post.media?.url && (
                      <div
                        onClick={() => setLightboxMediaUrl(post.media?.url || null)}
                        className="mt-2 relative rounded-2xl overflow-hidden border border-slate-700/60 bg-slate-900 cursor-pointer max-h-72 group"
                      >
                        {post.media.kind === "video" ? (
                          <video src={post.media.url} controls className="w-full max-h-72 object-cover rounded-2xl" />
                        ) : (
                          <img
                            src={post.media.url}
                            alt="Attachment"
                            className="w-full max-h-72 object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                          />
                        )}
                      </div>
                    )}

                    {/* Engagement Actions Row (Reply, Repost, Like, Views, Share) */}
                    <div className="flex items-center justify-between pt-2 text-slate-500 text-xs max-w-md">
                      {/* Comments / Reply */}
                      <button
                        type="button"
                        className="flex items-center gap-1.5 hover:text-cyan-400 transition group"
                        title="Comments"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:bg-cyan-500/10 rounded-full p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className="text-[11px]">{post._count?.comments || 0}</span>
                      </button>

                      {/* Repost / Echo */}
                      <button
                        type="button"
                        className="flex items-center gap-1.5 hover:text-emerald-400 transition group"
                        title="Quantum Echo"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:bg-emerald-500/10 rounded-full p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span className="text-[11px]">{(post._count?.reactions ? Math.round(post._count.reactions * 0.3) : 1)}</span>
                      </button>

                      {/* Like / Heart */}
                      <button
                        type="button"
                        onClick={() => toggleLikePost(post.id)}
                        className={`flex items-center gap-1.5 transition group ${
                          liked ? "text-rose-500" : "hover:text-rose-400"
                        }`}
                        title="Like"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={`h-4 w-4 group-hover:bg-rose-500/10 rounded-full p-0.5 ${liked ? "fill-rose-500" : "fill-none"}`}
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span className="text-[11px]">{likeCount}</span>
                      </button>

                      {/* Views Count */}
                      <div className="flex items-center gap-1 text-slate-500" title="Total Views">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span className="text-[11px]">{post._count?.views || Math.max(140, likeCount * 7)}</span>
                      </div>

                      {/* Share */}
                      <button
                        type="button"
                        onClick={handleShareProfile}
                        className="hover:text-cyan-400 transition"
                        title="Share Post"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="p-12 text-center space-y-2">
              <p className="text-sm font-bold text-slate-300">No posts yet</p>
              <p className="text-xs text-slate-500">
                When @{profile?.handle || cleanTargetHandle} posts, their updates will appear here.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── TAB CONTENT: REPLIES ───────────────────────────────────────── */}
      {activeTab === "replies" && (
        <div className="p-8 text-center space-y-2">
          <p className="text-sm font-bold text-slate-300">Replies and Threads</p>
          <p className="text-xs text-slate-500">
            Encrypted conversational replies are protected under sovereign E2EE protocols.
          </p>
        </div>
      )}

      {/* ── TAB CONTENT: MEDIA GALLERY ─────────────────────────────────── */}
      {activeTab === "media" && (
        <div className="p-4">
          {mediaPosts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {mediaPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => setLightboxMediaUrl(post.media?.url || null)}
                  className="aspect-square rounded-xl overflow-hidden border border-slate-800 bg-slate-900 cursor-pointer group relative"
                >
                  <img
                    src={post.media?.url}
                    alt="Media"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-semibold px-2 py-1 rounded-md bg-slate-900/80 backdrop-blur-sm">
                      View
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center space-y-2">
              <p className="text-sm font-bold text-slate-300">No photos or videos yet</p>
              <p className="text-xs text-slate-500">
                Photos and videos shared by @{cleanTargetHandle} will appear here.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── TAB CONTENT: AURA & BADGES ─────────────────────────────────── */}
      {activeTab === "aura" && (
        <div className="p-4 space-y-4">
          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/70 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <span>⚡</span> Quantum Resonance & Aura
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-mono">Aura Resonance</span>
                <p className={`text-base font-extrabold ${isFounder ? "text-red-400" : "text-cyan-300"}`}>
                  {isFounder ? "999,999% ☠️" : `${profile?.aura_percentage || 85}%`}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-mono">Quantum Points</span>
                <p className="text-base font-extrabold text-amber-300">
                  {isFounder ? "999,999 QP" : `${profile?.points || 420} QP`}
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-400 leading-relaxed">
              Aura resonance reflects peer network trust, verified cryptographic activity, and consistent node uptime on the Q‑Link mesh.
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/70 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <span>🛡️</span> Cryptographic Security Grade
            </h3>
            <div className="space-y-1.5 text-xs text-slate-300 font-mono">
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-500">Key Exchange</span>
                <span className="text-emerald-400">Kyber-1024 (Post-Quantum)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-500">Digital Signature</span>
                <span className="text-emerald-400">Dilithium-5 Verified</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-500">Transport Security</span>
                <span className="text-cyan-300">Optical WebRTC E2EE</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Node Trust Status</span>
                <span className="text-emerald-400 font-bold">100% Certified</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── LIGHTBOX MODAL ─────────────────────────────────────────────── */}
      {lightboxMediaUrl && (
        <div
          onClick={() => setLightboxMediaUrl(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-lg flex items-center justify-center p-4 cursor-zoom-out"
        >
          <img
            src={lightboxMediaUrl}
            alt="Full size"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl border border-slate-800"
          />
        </div>
      )}
    </div>
  );
};

export default QuantumUserProfileView;
