"use client";

import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";

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

const QUICK_REACTION_EMOJIS = ["🙏", "❤️", "👍", "🔥", "😂", "😮", "😢", "🎉"];

export function MessageReactionDetailsModal({
  isOpen,
  onClose,
  message,
  currentUserId,
  onReact,
  onRemoveReaction,
}: MessageReactionDetailsModalProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
  const [customEmojiInput, setCustomEmojiInput] = useState<string>("");
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);

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
          {/* Add Reaction Button */}
          <button
            type="button"
            onClick={() => setShowCustomInput((prev) => !prev)}
            title="Add reaction"
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-200 active:scale-95 cursor-pointer ${
              showCustomInput
                ? "border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                : "border-white/15 bg-white/[0.06] text-slate-300 hover:border-white/30 hover:bg-white/10"
            }`}
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

        {/* Custom / Quick Emoji Selector Dropdown */}
        {showCustomInput && (
          <div className="py-2.5 px-1 animate-fade-in border-b border-white/10">
            <div className="flex items-center justify-between gap-1.5 mb-2">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Choose reaction:
              </span>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (customEmojiInput.trim()) {
                    onReact(message.id, customEmojiInput.trim());
                    setCustomEmojiInput("");
                    setShowCustomInput(false);
                  }
                }}
                className="flex items-center gap-1"
              >
                <input
                  type="text"
                  placeholder="Custom emoji"
                  value={customEmojiInput}
                  onChange={(e) => setCustomEmojiInput(e.target.value)}
                  className="w-24 px-2 py-0.5 rounded-lg border border-white/20 bg-black/40 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="submit"
                  disabled={!customEmojiInput.trim()}
                  className="px-2 py-0.5 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-[11px] text-cyan-300 hover:bg-cyan-500/30 disabled:opacity-40"
                >
                  Add
                </button>
              </form>
            </div>
            <div className="flex items-center justify-between gap-1">
              {QUICK_REACTION_EMOJIS.map((emoji) => {
                const isSelected = myReaction?.emoji === emoji;
                return (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      onReact(message.id, emoji);
                      setShowCustomInput(false);
                    }}
                    className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg transition-transform duration-150 hover:scale-125 active:scale-95 cursor-pointer ${
                      isSelected
                        ? "bg-cyan-500/30 border border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                        : "hover:bg-white/10"
                    }`}
                  >
                    {emoji}
                  </button>
                );
              })}
            </div>
          </div>
        )}

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

        {/* Bottom Quick React Bar if user hasn't reacted or wants to add another */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-400 font-mono">
            {myReaction ? `Your reaction: ${myReaction.emoji}` : "React to message:"}
          </span>
          <div className="flex items-center gap-1">
            {QUICK_REACTION_EMOJIS.slice(0, 5).map((emoji) => {
              const isSelected = myReaction?.emoji === emoji;
              return (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => onReact(message.id, emoji)}
                  className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm transition-transform duration-150 hover:scale-125 active:scale-90 cursor-pointer ${
                    isSelected
                      ? "bg-cyan-500/30 border border-cyan-400/60 shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                      : "hover:bg-white/10"
                  }`}
                  title={`React ${emoji}`}
                >
                  {emoji}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
