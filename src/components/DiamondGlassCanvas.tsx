'use client';

/**
 * DiamondGlassCanvas
 *
 * High-performance, viewport-lazy-loaded background renderer for Diamond VIP Cards.
 * Powered by the Global SharedVideoEngine singleton:
 * 
 * - Off-screen: Zero CPU/GPU rendering (unregistered from SharedVideoEngine).
 * - On-screen: Registered with SharedVideoEngine for 60 FPS smooth synchronized video playback.
 * - Tab/Window Focus: SharedVideoEngine handles visibility/focus lifecycle automatically.
 */

import { useState, useEffect, useRef } from 'react';
import { getSharedVideoEngine } from '@/lib/sharedVideoEngine';

export default function DiamondGlassCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    const canvas = canvasRef.current;
    if (!el || !canvas) return;

    const engine = getSharedVideoEngine();

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          engine.register(canvas);
        } else {
          engine.unregister(canvas);
        }
      },
      {
        threshold: 0.01,
        rootMargin: '300px 0px', // High margin to pre-stage video before scrolling into view
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      engine.unregister(canvas);
    };
  }, []);

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
    <div ref={containerRef} style={{ position: 'absolute', inset: 0, borderRadius: 'inherit' }}>
      <img
        src="/media/diamond-vip-static.webp"
        alt="Diamond VIP Background"
        aria-hidden="true"
        style={mediaStyle}
      />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={mediaStyle}
      />
    </div>
  );
}


