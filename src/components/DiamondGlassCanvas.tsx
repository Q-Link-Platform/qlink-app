'use client';

/**
 * DiamondGlassCanvas
 *
 * Ultra-Lightweight, Zero-Bandwidth background renderer for Diamond VIP Cards.
 * Background video streaming is paused to reduce Vercel bandwidth consumption;
 * uses high-resolution static cover picture with hardware GPU acceleration.
 */

import React from 'react';

export default function DiamondGlassCanvas() {
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
    filter        : 'brightness(1.22)',
  };

  return (
    <div style={{ position: 'absolute', inset: 0, borderRadius: 'inherit' }}>
      <img
        src="/media/diamond-vip-static.webp"
        alt="Diamond VIP Background"
        aria-hidden="true"
        style={mediaStyle}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}
