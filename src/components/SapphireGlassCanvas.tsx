'use client';

/**
 * SapphireGlassCanvas
 *
 * Ultra-Lightweight, Zero-Bandwidth background renderer for Sapphire VIP Cards.
 * Background video streaming is paused to reduce Vercel bandwidth consumption;
 * uses high-resolution static optical cover picture with hardware GPU acceleration.
 */

import React from 'react';

export default function SapphireGlassCanvas() {
  const mediaStyle: React.CSSProperties = {
    position      : 'absolute',
    inset         : 0,
    width         : '100%',
    height        : '100%',
    display       : 'block',
    borderRadius  : 'inherit',
    pointerEvents : 'none',
    objectFit     : 'cover',
    zIndex        : 1,
    filter        : 'brightness(1.85) contrast(1.10) saturate(1.20)',
  };

  return (
    <div style={{ position: 'absolute', inset: 0, borderRadius: 'inherit' }}>
      <img
        src="/media/sapphire-vip-static.webp"
        alt="Sapphire VIP Background"
        aria-hidden="true"
        style={mediaStyle}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}
