"use client";

import React, { useState, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import {
  EMOJI_CATEGORIES,
  EmojiCategory,
  EmojiItem,
  QUICK_DOCK_REACTIONS,
  searchAllEmojis,
} from "@/lib/emojiData";

interface UniversalEmojiPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEmoji: (emoji: string) => void;
  title?: string;
}

export function UniversalEmojiPickerModal({
  isOpen,
  onClose,
  onSelectEmoji,
  title = "React with Emoji",
}: UniversalEmojiPickerModalProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Search results or categorized view
  const searchResults = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return null;
    return searchAllEmojis(q);
  }, [searchQuery]);

  // Categories to display
  const activeCategories = useMemo(() => {
    if (activeCategoryId === "all") return EMOJI_CATEGORIES;
    return EMOJI_CATEGORIES.filter((c) => c.id === activeCategoryId);
  }, [activeCategoryId]);

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[11000] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm sm:max-w-md h-[520px] flex flex-col overflow-hidden rounded-3xl border border-white/20 bg-[#09111c]/95 p-4 sm:p-5 shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_40px_rgba(6,182,212,0.22)] backdrop-blur-2xl transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Optical Atmospheric Glow */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-48 w-48 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-sky-500/15 blur-3xl" />

        {/* Modal Header */}
        <div className="relative flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">✨</span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight leading-none">
                {title}
              </h3>
              <p className="text-[10px] text-cyan-400/80 font-mono mt-0.5">
                Android Keypad • 1,900+ Unicode Emojis
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-white/10 active:scale-90 transition-all duration-150 cursor-pointer"
            title="Close"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Instant Search Bar (Android Gboard style) */}
        <div className="relative my-2.5 shrink-0">
          <div className="relative flex items-center">
            <svg
              className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2.2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search all emojis (e.g. fire, laugh, heart, cat)..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-white/10 text-[10px] text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Quick Reactions Strip (When not actively searching) */}
        {!searchQuery && (
          <div className="mb-2 shrink-0 pb-2 border-b border-white/10">
            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono px-0.5">
              <span>Top Reactions</span>
              <span className="text-cyan-400/80 lowercase">1-tap instant</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5">
              {QUICK_DOCK_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => onSelectEmoji(emoji)}
                  className="shrink-0 flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.04] border border-white/10 hover:border-cyan-400/60 hover:bg-cyan-500/20 text-lg transition-transform duration-150 hover:scale-125 active:scale-90 cursor-pointer"
                  title={`React ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Category Navigation Icons (Gboard / Android Keypad Style) */}
        {!searchQuery && (
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1 mb-2 border-b border-white/10 shrink-0">
            <button
              type="button"
              onClick={() => setActiveCategoryId("all")}
              className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-150 active:scale-95 cursor-pointer ${
                activeCategoryId === "all"
                  ? "bg-cyan-500/25 border border-cyan-400/60 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.3)]"
                  : "bg-white/[0.03] border border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]"
              }`}
            >
              <span>All</span>
            </button>
            {EMOJI_CATEGORIES.map((cat) => {
              const isActive = activeCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategoryId(cat.id)}
                  title={cat.name}
                  className={`shrink-0 flex h-7 w-7 items-center justify-center rounded-lg text-base transition-all duration-150 active:scale-95 cursor-pointer ${
                    isActive
                      ? "bg-cyan-500/25 border border-cyan-400/60 shadow-[0_0_8px_rgba(6,182,212,0.3)] scale-105"
                      : "bg-white/[0.03] border border-transparent hover:bg-white/[0.08] opacity-70 hover:opacity-100"
                  }`}
                >
                  {cat.icon}
                </button>
              );
            })}
          </div>
        )}

        {/* Emojis Scrollable Area (Categorized & Filtered) */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 no-scrollbar scroll-smooth">
          {searchResults ? (
            /* Search Results View */
            <div>
              <div className="sticky top-0 z-10 bg-[#09111c]/95 backdrop-blur-md py-1 mb-2 text-[11px] font-semibold text-cyan-400 font-mono flex items-center justify-between border-b border-white/10">
                <span>Search Results</span>
                <span>{searchResults.length} found</span>
              </div>
              {searchResults.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 font-mono">
                  No matching emojis found for &quot;{searchQuery}&quot;
                </div>
              ) : (
                <div className="grid grid-cols-7 sm:grid-cols-8 gap-1.5 sm:gap-2">
                  {searchResults.map((item, idx) => (
                    <button
                      key={`${item.emoji}-${idx}`}
                      type="button"
                      onClick={() => onSelectEmoji(item.emoji)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.02] hover:bg-white/10 hover:border hover:border-cyan-400/50 text-2xl transition-transform duration-100 hover:scale-130 active:scale-90 cursor-pointer"
                      title={item.name}
                    >
                      {item.emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Standard Android Categorized Scroll View */
            activeCategories.map((category) => (
              <div key={category.id} className="space-y-1.5">
                <div className="sticky top-0 z-10 bg-[#09111c]/95 backdrop-blur-md py-1 text-[11px] font-semibold text-slate-300 font-mono flex items-center justify-between border-b border-white/10">
                  <span className="flex items-center gap-1.5">
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {category.items.length}
                  </span>
                </div>
                <div className="grid grid-cols-7 sm:grid-cols-8 gap-1.5 sm:gap-2 pt-1">
                  {category.items.map((item, idx) => (
                    <button
                      key={`${category.id}-${idx}`}
                      type="button"
                      onClick={() => onSelectEmoji(item.emoji)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.02] hover:bg-white/10 hover:border hover:border-cyan-400/50 text-2xl transition-transform duration-100 hover:scale-130 active:scale-90 cursor-pointer"
                      title={item.name}
                    >
                      {item.emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
