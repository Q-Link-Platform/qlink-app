import React from "react";

/**
 * OpticalMediaIcons
 * Quiet Luxury, Apple VisionOS & X-Tier Hairline Vector Glyphs.
 * Replaces cartoon system emojis with precision translucent optical crystal SVG icons.
 */

export function OpticalAllFeedIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" strokeOpacity="0.85" />
      <path d="M3.6 9h16.8M3.6 15h16.8" strokeOpacity="0.6" />
      <path d="M12 3a15.3 15.3 0 014 9 15.3 15.3 0 01-4 9 15.3 15.3 0 01-4-9 15.3 15.3 0 014-9z" strokeOpacity="0.85" />
    </svg>
  );
}

export function OpticalShortsIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5.5" y="2.5" width="13" height="19" rx="3" strokeOpacity="0.9" />
      <path d="M10.2 9.5l4.8 2.5-4.8 2.5v-5z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M5.5 7h13M5.5 17h13" strokeDasharray="1.5 2" strokeOpacity="0.5" />
    </svg>
  );
}

export function OpticalPostsIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7.5a2 2 0 012-2h2.2l1.6-2h4.4l1.6 2H18a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2v-10z" strokeOpacity="0.9" />
      <circle cx="12" cy="12.5" r="3.5" strokeOpacity="0.85" />
      <circle cx="17" cy="8.5" r="0.75" fill="currentColor" />
    </svg>
  );
}

export function OpticalTweetsIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" strokeOpacity="0.9" />
      <path d="M8 11.5h8M8 15h5" strokeLinecap="round" strokeOpacity="0.55" />
    </svg>
  );
}
