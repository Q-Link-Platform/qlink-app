"use client";

import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";

import { QUICK_DOCK_REACTIONS } from "@/lib/emojiData";
import { UniversalEmojiPickerModal } from "./UniversalEmojiPickerModal";

export interface MessageReactionItem {
  emoji: string;
  userId: string;
  userHandle: string;
  userName: string;
  userImage?: string | null;
  createdAt: string;
}

interface MessageReactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: {
    id: string;
    content: string;
    reactions?: MessageReactionItem[];
  } | null;
  currentUserId: string;
  onReact: (messageId: string, emoji: string) => void;
  onRemoveReaction: (messageId: string) => void;
}

export function MessageReactionDetailsModal({
  isOpen,
  onClose,
  message,
  currentUserId,
  onReact,
  onRemoveReaction,
}: MessageReactionDetailsModalProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
  const [showUniversalPicker, setShowUniversalPicker] = useState<boolean>(false);

  const reactions = useMemo(() => {
    return message?.reactions || [];
  }, [message]);

  // Group reactions by emoji
  const groupedReactions = useMemo(() => {
    const map = new Map<string, MessageReactionItem[]>();
    for (const r of reactions) {
      const list = map.get(r.emoji) || [];
      list.push(r);
      map.set(r.emoji, list);
    }
    return map;
  }, [reactions]);

  // Filtered list based on selected tab
  const filteredReactors = useMemo(() => {
    if (selectedFilter === "ALL") {
      return reactions;
    }
    return groupedReactions.get(selectedFilter) || [];
  }, [selectedFilter, reactions, groupedReactions]);

  // Check if current user has already reacted and with which emoji
  const myReaction = useMemo(() => {
    return reactions.find((r) => r.userId === currentUserId);
  }, [reactions, currentUserId]);

  if (!isOpen || !message || typeof document === "undefined") return null;

  const totalCount = reactions.length;

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm sm:max-w-md overflow-hidden rounded-3xl border border-white/20 bg-[#09111c]/95 p-5 shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_35px_rgba(6,182,212,0.18)] backdrop-blur-2xl transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Luxury Spotlight Glow */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-48 w-48 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-sky-500/15 blur-3xl" />

        {/* Modal Header */}
        <div className="relative flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-white tracking-tight">
              {totalCount} {totalCount === 1 ? "reaction" : "reactions"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-white/10 active:scale-90 transition-all duration-150 cursor-pointer"
            title="Close"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Reaction Filter Tabs (WhatsApp & Telegram Style) */}
        <div className="relative flex items-center gap-2 py-3 overflow-x-auto no-scrollbar border-b border-white/10">
          {/* Add Reaction Button -> opens 1,800+ Universal Emoji Picker */}
          <button
            type="button"
            onClick={() => setShowUniversalPicker(true)}
            title="Browse all 1,800+ emojis"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cyan-500/40 bg-cyan-950/50 text-cyan-300 hover:text-white hover:border-cyan-400 hover:bg-cyan-500/25 shadow-[0_0_8px_rgba(6,182,212,0.3)] transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="sr-only">Add reaction</span>
          </button>

          {/* ALL Tab */}
          <button
            type="button"
            onClick={() => setSelectedFilter("ALL")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 active:scale-95 cursor-pointer ${
              selectedFilter === "ALL"
                ? "bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 shadow-[0_0_14px_rgba(6,182,212,0.35)]"
                : "bg-white/[0.05] border border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/[0.08]"
            }`}
          >
            <span>All</span>
            <span className="text-[11px] opacity-80">{totalCount}</span>
          </button>

          {/* Grouped Emoji Pills */}
          {Array.from(groupedReactions.entries()).map(([emoji, list]) => {
            const isActive = selectedFilter === emoji;
            return (
              <button
                key={emoji}
                type="button"
                onClick={() => setSelectedFilter(emoji)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 active:scale-95 cursor-pointer ${
                  isActive
                    ? "bg-emerald-500/20 border border-emerald-400/60 text-emerald-300 shadow-[0_0_14px_rgba(52,211,153,0.35)]"
                    : "bg-white/[0.05] border border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                <span className="text-sm">{emoji}</span>
                <span className="text-[11px] font-mono opacity-90">{list.length}</span>
              </button>
            );
          })}
        </div>

        {/* Reactor List */}
        <div className="max-h-64 sm:max-h-72 overflow-y-auto py-2 space-y-1 divide-y divide-white/[0.04]">
          {filteredReactors.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 font-mono">
              No reactions in this category
            </div>
          ) : (
            filteredReactors.map((reactor, idx) => {
              const isMe = reactor.userId === currentUserId;
              const displayName = isMe ? "You" : reactor.userName || `@${reactor.userHandle}`;
              const initial = (reactor.userName || reactor.userHandle || "U").charAt(0).toUpperCase();

              return (
                <div
                  key={`${reactor.userId}-${reactor.emoji}-${idx}`}
                  onClick={() => {
                    if (isMe) {
                      onRemoveReaction(message.id);
                    }
                  }}
                  className={`group flex items-center justify-between py-2.5 px-2 rounded-2xl transition-all duration-200 ${
                    isMe
                      ? "hover:bg-rose-500/10 cursor-pointer"
                      : "hover:bg-white/[0.04]"
                  }`}
                  title={isMe ? "Click to remove your reaction" : undefined}
                >
                  {/* Left: Avatar + Names */}
                  <div className="flex items-center gap-3 min-w-0">
                    {/* User Avatar */}
                    {reactor.userImage ? (
                      <img
                        src={reactor.userImage}
                        alt={displayName}
                        className="h-10 w-10 shrink-0 rounded-full object-cover border border-white/20 shadow-sm"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-600/40 via-sky-500/30 to-slate-800 border border-white/20 font-bold text-white text-sm shadow-sm">
                        {initial}
                      </div>
                    )}

                    {/* Name + Subtext */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-semibold text-white">
                          {displayName}
                        </span>
                        {!isMe && reactor.userHandle && (
                          <span className="truncate text-[11px] text-slate-500 font-mono">
                            @{reactor.userHandle}
                          </span>
                        )}
                      </div>
                      {isMe ? (
                        <p className="text-[11px] font-medium text-cyan-400/90 group-hover:text-rose-400 transition-colors">
                          Click to remove
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-400 font-mono">
                          {reactor.createdAt
                            ? new Date(reactor.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Reacted"}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: The Emoji */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xl transition-transform duration-200 group-hover:scale-110">
                      {reactor.emoji}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Horizontally Scrollable Tech-Giant Quick React Bar */}
        <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 font-mono">
            <span>{myReaction ? `Your reaction: ${myReaction.emoji}` : "Quick react:"}</span>
            <span className="text-[10px] text-cyan-400/80">Scroll for more →</span>
          </div>

          <div className="relative flex items-center rounded-xl bg-white/[0.04] border border-white/10 p-0.5 shadow-inner w-full min-w-0">
            {/* Left Scroll Arrow */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const track = e.currentTarget.parentElement?.querySelector("[data-reaction-track]");
                if (track) track.scrollBy({ left: -90, behavior: "smooth" });
              }}
              className="shrink-0 flex h-7 w-3.5 items-center justify-center rounded text-slate-400 hover:text-white hover:bg-white/10 transition active:scale-90 text-[11px] font-bold cursor-pointer"
              title="Scroll left"
            >
              ‹
            </button>

            {/* Scrollable Emojis List with Smooth Touch / Mouse Scroll */}
            <div
              data-reaction-track
              onWheel={(e) => {
                e.currentTarget.scrollLeft += e.deltaY;
              }}
              className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth px-1 flex-1 min-w-0"
            >
              {QUICK_DOCK_REACTIONS.map((emoji) => {
                const isSelected = myReaction?.emoji === emoji;
                return (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => onReact(message.id, emoji)}
                    className={`shrink-0 flex h-7 w-7 items-center justify-center rounded-lg text-base transition-transform duration-150 hover:scale-130 active:scale-90 cursor-pointer ${
                      isSelected
                        ? "bg-cyan-500/30 border border-cyan-400/70 shadow-[0_0_8px_rgba(6,182,212,0.45)] scale-110"
                        : "hover:bg-white/10"
                    }`}
                    title={`React ${emoji}`}
                  >
                    {emoji}
                  </button>
                );
              })}
            </div>

            {/* Right Scroll Arrow */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const track = e.currentTarget.parentElement?.querySelector("[data-reaction-track]");
                if (track) track.scrollBy({ left: 90, behavior: "smooth" });
              }}
              className="shrink-0 flex h-7 w-3.5 items-center justify-center rounded text-slate-400 hover:text-white hover:bg-white/10 transition active:scale-90 text-[11px] font-bold cursor-pointer"
              title="Scroll right"
            >
              ›
            </button>

            {/* Pinned '+' Button opening Universal Emoji Picker (1,900+ Emojis) */}
            <button
              type="button"
              onClick={() => setShowUniversalPicker(true)}
              className="shrink-0 ml-0.5 flex h-7 w-7 items-center justify-center rounded-lg border border-cyan-500/40 bg-cyan-950/50 text-cyan-300 hover:text-white hover:border-cyan-400 hover:bg-cyan-500/25 shadow-[0_0_8px_rgba(6,182,212,0.3)] transition-all duration-150 active:scale-90 cursor-pointer"
              title="Browse all 1,900+ Android emojis"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Universal Emoji Picker (1,900+ Emojis with live search & categories) */}
      <UniversalEmojiPickerModal
        isOpen={showUniversalPicker}
        onClose={() => setShowUniversalPicker(false)}
        onSelectEmoji={(emoji) => {
          onReact(message.id, emoji);
          setShowUniversalPicker(false);
        }}
      />
    </div>,
    document.body
  );
}
