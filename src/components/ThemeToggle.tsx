"use client";

import { useTheme } from "@/app/providers/ThemeProvider";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, toggleTheme, isChanging } = useTheme();
  const isBlack = resolvedTheme === "black";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      disabled={isChanging}
      className={`
        group relative inline-flex h-9 w-16 items-center rounded-full
        transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
        ${isBlack 
          ? "bg-gradient-to-r from-black to-gray-900 shadow-inner shadow-cyan-500/20" 
          : "bg-gradient-to-r from-slate-800 to-slate-900 shadow-inner shadow-black/50"
        }
        ${isChanging ? "scale-95 opacity-80" : "hover:scale-105"}
        focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50
        ${className}
      `}
      aria-label={isBlack ? "Switch to original dark mode" : "Switch to pure black mode"}
    >
      {/* Background Stars (Original Dark mode) */}
      <span className={`
        absolute inset-0 overflow-hidden rounded-full
        transition-opacity duration-500
        ${!isBlack ? "opacity-100" : "opacity-0"}
      `}>
        <span className="absolute left-2 top-1.5 h-0.5 w-0.5 rounded-full bg-white/60 animate-pulse" />
        <span className="absolute left-4 top-2.5 h-0.5 w-0.5 rounded-full bg-white/40" />
        <span className="absolute right-3 top-2 h-0.5 w-0.5 rounded-full bg-white/50 animate-pulse delay-75" />
      </span>

      {/* Background Grid (Pure Black mode) */}
      <span className={`
        absolute inset-0 overflow-hidden rounded-full
        transition-opacity duration-500
        ${isBlack ? "opacity-100" : "opacity-0"}
      `}>
        <span className="absolute right-2 top-1.5 h-0.5 w-0.5 rounded-full bg-cyan-500/40" />
        <span className="absolute left-3 bottom-1.5 h-0.5 w-0.5 rounded-full bg-cyan-500/30" />
        <span className="absolute left-5 top-2 h-0.5 w-0.5 rounded-full bg-cyan-500/20" />
      </span>

      {/* Toggle Thumb */}
      <span
        className={`
          absolute h-7 w-7 rounded-full
          transform transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
          ${isBlack 
            ? "translate-x-8 bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-lg shadow-cyan-500/40" 
            : "translate-x-1 bg-gradient-to-br from-slate-200 to-slate-400 shadow-lg shadow-black/30"
          }
          group-hover:scale-110
        `}
      >
        {/* Icon inside thumb */}
        <span className="absolute inset-0 flex items-center justify-center">
          {isBlack ? (
            // Black/Dark icon
            <svg
              className="h-4 w-4 text-black transition-transform duration-300 group-hover:scale-110"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
            </svg>
          ) : (
            // Moon icon (original dark)
            <svg
              className="h-4 w-4 text-slate-700 transition-transform duration-300 group-hover:rotate-12"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </span>
      </span>

      {/* Ripple effect on click */}
      <span
        className={`
          absolute inset-0 rounded-full
          transition-all duration-300
          ${isChanging ? "bg-white/10 scale-100" : "bg-white/0 scale-75"}
        `}
      />
    </button>
  );
}
