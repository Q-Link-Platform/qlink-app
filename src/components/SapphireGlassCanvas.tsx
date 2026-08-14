'use client';

/**
 * SapphireGlassCanvas
 *
 * High-performance, viewport-lazy-loaded background renderer for Sapphire VIP Cards.
 * Powered by the Global SharedSapphireVideoEngine singleton:
 * 
 * - Off-screen: Zero CPU/GPU rendering (unregistered from SharedSapphireVideoEngine).
 * - On-screen: Registered with SharedSapphireVideoEngine for 60 FPS smooth synchronized video playback.
 * - Tab/Window Focus: SharedSapphireVideoEngine handles visibility/focus lifecycle automatically.
 */

import { useEffect, useRef } from 'react';
import { getSharedSapphireVideoEngine } from '@/lib/sharedSapphireVideoEngine';

export default function SapphireGlassCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    const canvas = canvasRef.current;
    if (!el || !canvas) return;

    const engine = getSharedSapphireVideoEngine();

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
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={mediaStyle}
      />
    </div>
  );
}
