/**
 * SharedVideoEngine
 *
 * Ultra-Robust, Non-Stop Video Streaming & Synchronization Engine.
 * 
 * Guarantees:
 * - 100% Non-Stop, Infinite Quick Video Looping (No freeze, no timeout after 2min).
 * - High-speed GPU blitting to all active Diamond VIP canvases.
 * - Auto-Nudge Watchdog Heartbeat that instantly detects & fixes browser stalls.
 * - Visibility & focus lifecycle management with instantaneous wake-up.
 */

interface CanvasSubscriber {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  resizeObserver: ResizeObserver;
  width: number;
  height: number;
}

class SharedVideoEngine {
  private static instance: SharedVideoEngine | null = null;

  private video: HTMLVideoElement | null = null;
  private bufferCanvas: HTMLCanvasElement | null = null;
  private bufferCtx: CanvasRenderingContext2D | null = null;

  private subscribers: Map<HTMLCanvasElement, CanvasSubscriber> = new Map();
  private isPlaying: boolean = false;
  private rafId: number | null = null;
  private watchdogIntervalId: any = null;
  private pauseTimeoutId: NodeJS.Timeout | null = null;

  private videoSrc = '/media/diamond-vip-loop.mp4';

  private constructor() {
    if (typeof window === 'undefined') return;

    this.initVideo();
    this.initBufferCanvas();
    this.initVisibilityListeners();
    this.startWatchdog();
  }

  public static getInstance(): SharedVideoEngine {
    if (!SharedVideoEngine.instance) {
      SharedVideoEngine.instance = new SharedVideoEngine();
    }
    return SharedVideoEngine.instance;
  }

  private initVideo() {
    if (typeof document === 'undefined') return;

    const video = document.createElement('video');
    video.src = this.videoSrc;
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;
    video.autoplay = true;
    video.preload = 'auto';
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('muted', '');
    video.setAttribute('autoplay', '');
    video.setAttribute('loop', '');
    video.setAttribute('aria-hidden', 'true');
    video.setAttribute('tabindex', '-1');

    // Keep video in active DOM viewport with near-zero opacity to guarantee full hardware GPU decoding
    video.style.position = 'fixed';
    video.style.bottom = '0px';
    video.style.right = '0px';
    video.style.width = '854px';
    video.style.height = '480px';
    video.style.opacity = '0.001';
    video.style.pointerEvents = 'none';
    video.style.zIndex = '-99999';

    // 1. Instant Start on Load / Canplay
    video.oncanplay = () => {
      if (this.subscribers.size > 0 && !this.isPlaying) {
        this.startPlayback();
      }
    };

    // 2. Hardware Non-Stop Loop Handlers
    video.addEventListener('ended', () => {
      video.currentTime = 0;
      video.play().catch(() => {});
      this.scheduleNextFrame();
    });

    video.addEventListener('pause', () => {
      if (this.isPlaying && this.subscribers.size > 0 && document.visibilityState === 'visible') {
        video.play().catch(() => {});
      }
    });

    video.addEventListener('stalled', () => {
      if (this.isPlaying && this.subscribers.size > 0) {
        video.play().catch(() => {});
      }
    });

    video.addEventListener('waiting', () => {
      if (this.isPlaying && this.subscribers.size > 0) {
        video.play().catch(() => {});
      }
    });

    video.addEventListener('error', () => {
      console.warn('[SharedVideoEngine] Video stream error, auto-reloading...');
      video.load();
      video.play().catch(() => {});
    });

    document.body.appendChild(video);
    this.video = video;
  }

  private initBufferCanvas() {
    if (typeof document === 'undefined') return;

    const canvas = document.createElement('canvas');
    canvas.width = 854;
    canvas.height = 480;
    const ctx = canvas.getContext('2d', {
      alpha: false,
      desynchronized: true,
    });

    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'low';
      this.bufferCanvas = canvas;
      this.bufferCtx = ctx;
    }
  }

  private initVisibilityListeners() {
    if (typeof window === 'undefined') return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (this.subscribers.size > 0) {
          this.startPlayback();
        }
      } else {
        this.pausePlayback();
      }
    };

    const handleFocus = () => {
      if (document.visibilityState === 'visible' && this.subscribers.size > 0) {
        this.startPlayback();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
  }

  /**
   * Watchdog Heartbeat: Checks every 400ms to guarantee non-stop looping
   */
  private startWatchdog() {
    if (this.watchdogIntervalId) return;
    let lastTime = -1;
    let stuckCount = 0;

    this.watchdogIntervalId = setInterval(() => {
      if (typeof document === 'undefined') return;
      if (!this.isPlaying || this.subscribers.size === 0 || document.visibilityState !== 'visible') return;

      if (this.video) {
        // 1. If paused or ended unexpectedly, force play immediately
        if (this.video.paused || this.video.ended) {
          this.video.play().catch(() => {});
        }

        // 2. Seamless loop wrap if near the end
        if (this.video.duration && this.video.currentTime >= this.video.duration - 0.06) {
          this.video.currentTime = 0;
          this.video.play().catch(() => {});
        }

        // 3. Stutter / stall detection & recovery
        if (this.video.currentTime === lastTime && this.video.readyState >= 2 && !this.video.paused) {
          stuckCount++;
          if (stuckCount >= 2) {
            this.video.currentTime = (this.video.currentTime + 0.02) % (this.video.duration || 1);
            this.video.play().catch(() => {});
            stuckCount = 0;
          }
        } else {
          stuckCount = 0;
        }
        lastTime = this.video.currentTime;
      }

      // 4. Ensure rendering loop is active
      if (this.rafId === null && this.isPlaying && this.subscribers.size > 0) {
        this.scheduleNextFrame();
      }
    }, 400);
  }

  /**
   * Register a canvas element to receive video frames.
   */
  public register(canvas: HTMLCanvasElement): void {
    if (this.pauseTimeoutId !== null) {
      clearTimeout(this.pauseTimeoutId);
      this.pauseTimeoutId = null;
    }

    if (this.subscribers.has(canvas)) return;

    const ctx = canvas.getContext('2d', {
      alpha: false,
      desynchronized: true,
    });

    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'low';

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      const rect = entry.contentRect;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const displayWidth = Math.floor(rect.width * dpr);
      const displayHeight = Math.floor(rect.height * dpr);

      if (displayWidth > 0 && displayHeight > 0) {
        if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
          canvas.width = displayWidth;
          canvas.height = displayHeight;
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'low';
        }
        const sub = this.subscribers.get(canvas);
        if (sub) {
          sub.width = displayWidth;
          sub.height = displayHeight;
        }
      }
    });

    resizeObserver.observe(canvas);

    const initialRect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const initialWidth = Math.floor(initialRect.width * dpr) || 300;
    const initialHeight = Math.floor(initialRect.height * dpr) || 150;

    if (canvas.width !== initialWidth || canvas.height !== initialHeight) {
      canvas.width = initialWidth;
      canvas.height = initialHeight;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'low';
    }

    this.subscribers.set(canvas, {
      canvas,
      ctx,
      resizeObserver,
      width: initialWidth,
      height: initialHeight,
    });

    if (this.subscribers.size >= 1 && !this.isPlaying) {
      this.startPlayback();
    }
  }

  /**
   * Unregister a canvas element when it leaves the viewport or unmounts.
   */
  public unregister(canvas: HTMLCanvasElement): void {
    const sub = this.subscribers.get(canvas);
    if (sub) {
      sub.resizeObserver.disconnect();
      this.subscribers.delete(canvas);
    }

    if (this.subscribers.size === 0) {
      if (this.pauseTimeoutId !== null) {
        clearTimeout(this.pauseTimeoutId);
      }
      // 1.5s grace period for modal/view transitions
      this.pauseTimeoutId = setTimeout(() => {
        if (this.subscribers.size === 0) {
          this.pausePlayback();
        }
        this.pauseTimeoutId = null;
      }, 1500);
    }
  }

  private startPlayback() {
    if (!this.video) return;

    if (this.video.paused) {
      this.video.play().catch(() => {});
    }

    this.isPlaying = true;
    this.scheduleNextFrame();
  }

  private pausePlayback() {
    this.isPlaying = false;
    if (this.video && !this.video.paused) {
      this.video.pause();
    }
    this.cancelScheduledFrames();
  }

  private scheduleNextFrame() {
    if (!this.isPlaying || this.subscribers.size === 0) return;

    if (this.rafId === null) {
      this.rafId = requestAnimationFrame(this.onAnimationFrameCallback);
    }
  }

  private cancelScheduledFrames() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private onAnimationFrameCallback = () => {
    this.rafId = null;
    if (!this.isPlaying || this.subscribers.size === 0) return;

    this.renderFrame();
    this.scheduleNextFrame();
  };

  private renderFrame() {
    if (!this.isPlaying || this.subscribers.size === 0) return;

    if (this.video && this.bufferCtx && this.bufferCanvas) {
      // Force resume if video paused unexpectedly while page is visible
      if (this.video.paused && document.visibilityState === 'visible') {
        this.video.play().catch(() => {});
      }

      // Fast loop jump to avoid freeze at exact file end
      if (this.video.duration && this.video.currentTime >= this.video.duration - 0.05) {
        this.video.currentTime = 0;
        this.video.play().catch(() => {});
      }

      if (this.video.readyState >= 2) {
        const bufferWidth = 854;
        const bufferHeight = 480;
        const bufferAspect = bufferWidth / bufferHeight;

        // 1. Draw master video frame ONCE to the shared offscreen buffer
        this.bufferCtx.drawImage(this.video, 0, 0, bufferWidth, bufferHeight);

        // 2. Fast GPU blit with object-fit: cover aspect-ratio preservation to all active card canvases
        this.subscribers.forEach(({ ctx, width, height }) => {
          if (width > 0 && height > 0) {
            const canvasAspect = width / height;

            let sx = 0,
              sy = 0,
              sWidth = bufferWidth,
              sHeight = bufferHeight;

            if (canvasAspect > bufferAspect) {
              sHeight = bufferWidth / canvasAspect;
              sy = (bufferHeight - sHeight) / 2;
            } else {
              sWidth = bufferHeight * canvasAspect;
              sx = (bufferWidth - sWidth) / 2;
            }

            ctx.drawImage(
              this.bufferCanvas!,
              sx,
              sy,
              sWidth,
              sHeight,
              0,
              0,
              width,
              height
            );
          }
        });
      }
    }
  }
}

export const getSharedVideoEngine = (): SharedVideoEngine => {
  return SharedVideoEngine.getInstance();
};
