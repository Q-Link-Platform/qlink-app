"use client";

import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { EMOJI_CATEGORIES, EmojiCategory } from "@/lib/emojiData";

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
  title = "Add Reaction",
}: UniversalEmojiPickerModalProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<string>("smileys");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // All emojis flattened
  const allEmojis = useMemo(() => {
    return Array.from(new Set(EMOJI_CATEGORIES.flatMap((c) => c.emojis)));
  }, []);

  // Filtered emojis
  const displayEmojis = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) {
      const cat = EMOJI_CATEGORIES.find((c) => c.id === activeCategoryId);
      return cat ? cat.emojis : EMOJI_CATEGORIES[0].emojis;
    }
    // Search query matches emoji directly or matches all emojis
    return allEmojis.filter((e) => e.includes(q));
  }, [searchQuery, activeCategoryId, allEmojis]);

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[11000] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-fade-in select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm sm:max-w-md h-[460px] flex flex-col overflow-hidden rounded-3xl border border-white/20 bg-[#09111c]/95 p-4 sm:p-5 shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_40px_rgba(6,182,212,0.22)] backdrop-blur-2xl transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Optical Atmospheric Glow */}
        <div className="pointer-events-none absolute -top-20 -left-20 h-40 w-40 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-sky-500/20 blur-3xl" />

        {/* Modal Header */}
        <div className="relative flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">✨</span>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
              {title}
            </h3>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-500/30">
              1,800+ Emojis
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-white/10 active:scale-90 transition-all duration-150 cursor-pointer"
            title="Close"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Live Search Input */}
        <div className="relative my-3 shrink-0">
          <input
            type="text"
            placeholder="Search emoji (e.g. smile, heart, fire, flag)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            className="w-full rounded-2xl border border-white/15 bg-black/40 px-3.5 py-2 pl-9 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/80 focus:ring-1 focus:ring-cyan-400/50 transition-all"
          />
          <svg
            className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
            >
              ×
            </button>
          )}
        </div>

        {/* Category Tabs (Horizontal Scrollable Dock) */}
        {!searchQuery && (
          <div className="flex items-center gap-1.5 pb-2.5 overflow-x-auto no-scrollbar border-b border-white/10 shrink-0">
            {EMOJI_CATEGORIES.map((cat: EmojiCategory) => {
              const isActive = activeCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategoryId(cat.id)}
                  title={cat.name}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-base transition-all duration-200 active:scale-95 cursor-pointer ${
                    isActive
                      ? "bg-cyan-500/25 border border-cyan-400/70 shadow-[0_0_12px_rgba(6,182,212,0.4)] scale-110"
                      : "bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-white/25"
                  }`}
                >
                  <span>{cat.icon}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Category Name Subtitle */}
        {!searchQuery && (
          <div className="pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono shrink-0">
            {EMOJI_CATEGORIES.find((c) => c.id === activeCategoryId)?.name || "Emojis"}
          </div>
        )}

        {/* Emojis Grid (Scrollable Container) */}
        <div className="flex-1 overflow-y-auto pr-1 py-1 no-scrollbar grid grid-cols-7 sm:grid-cols-8 gap-1.5 content-start">
          {displayEmojis.length === 0 ? (
            <div className="col-span-full py-12 text-center text-xs text-slate-500 font-mono">
              No emojis found for "{searchQuery}"
            </div>
          ) : (
            displayEmojis.map((emoji, index) => (
              <button
                key={`${emoji}-${index}`}
                type="button"
                onClick={() => {
                  onSelectEmoji(emoji);
                  onClose();
                }}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-2xl transition-all duration-150 hover:scale-130 hover:bg-white/10 active:scale-90 cursor-pointer"
                title={`Select ${emoji}`}
              >
                {emoji}
              </button>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="pt-2.5 mt-1 border-t border-white/10 text-[10px] text-slate-500 font-mono flex items-center justify-between shrink-0">
          <span>Tap any emoji to react</span>
          <span className="text-cyan-400/80">Quantum Unicode 15.0</span>
        </div>
      </div>
    </div>,
    document.body
  );
}
