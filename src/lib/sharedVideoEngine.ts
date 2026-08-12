/**
 * SharedVideoEngine
 *
 * Tech-Giant Standard Singleton Master Video Engine.
 * Decodes 1 master video stream in memory and paints frames onto N subscriber canvases via hardware-synced callbacks.
 *
 * - Hardware frame-synchronized rendering via requestVideoFrameCallback (0% wasted drawing ops)
 * - Fallback to 60 FPS requestAnimationFrame when unsupported
 * - 0% CPU/GPU when 0 subscribers are visible in viewport
 * - Automatic pause/resume on tab visibility change or window focus
 * - 100% visual frame synchronization across all Diamond VIP cards
 */

type CanvasSubscriber = {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  resizeObserver: ResizeObserver;
  width: number;
  height: number;
};

class SharedVideoEngine {
  private static instance: SharedVideoEngine | null = null;

  private video: HTMLVideoElement | null = null;
  private bufferCanvas: HTMLCanvasElement | null = null;
  private bufferCtx: CanvasRenderingContext2D | null = null;
  private subscribers: Map<HTMLCanvasElement, CanvasSubscriber> = new Map();
  private rafId: number | null = null;
  private videoCallbackId: number | null = null;
  private isPlaying = false;
  private videoSrc = '/media/diamond-vip-loop.mp4';
  private pauseTimeoutId: ReturnType<typeof setTimeout> | null = null;

  private constructor() {
    if (typeof window === 'undefined') return;

    this.initVideo();
    this.initBufferCanvas();
    this.initVisibilityListeners();
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
    video.loop = true;
    video.playsInline = true;
    video.autoplay = true;
    video.setAttribute('aria-hidden', 'true');
    video.setAttribute('tabindex', '-1');

    // Keep video at 854x480 in active DOM viewport with near-zero opacity to force full 60 FPS Chromium decoding
    video.style.position = 'fixed';
    video.style.bottom = '0px';
    video.style.right = '0px';
    video.style.width = '854px';
    video.style.height = '480px';
    video.style.opacity = '0.001';
    video.style.pointerEvents = 'none';
    video.style.zIndex = '-99999';

    video.oncanplay = () => {
      if (this.subscribers.size > 0 && !this.isPlaying) {
        this.startPlayback();
      }
    };

    // Auto-resume if browser attempts to pause active video stream
    video.onpause = () => {
      if (this.isPlaying && this.subscribers.size > 0 && document.visibilityState === 'visible') {
        video.play().catch(() => {});
      }
    };

    document.body.appendChild(video);
    this.video = video;
  }

  private initBufferCanvas() {
    if (typeof document === 'undefined') return;

    const canvas = document.createElement('canvas');
    canvas.width = 854;
    canvas.height = 480;
    const ctx = canvas.getContext('2d', { alpha: false });

    this.bufferCanvas = canvas;
    this.bufferCtx = ctx;
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

    // Fast GPU blitting optimization
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'low';

    // Use ResizeObserver to set canvas dimensions outside the rendering loop
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

    if (this.video && 'requestVideoFrameCallback' in this.video) {
      if (this.videoCallbackId === null) {
        this.videoCallbackId = (this.video as any).requestVideoFrameCallback(this.onVideoFrameCallback);
      }
    } else {
      if (this.rafId === null) {
        this.rafId = requestAnimationFrame(this.onAnimationFrameCallback);
      }
    }
  }

  private cancelScheduledFrames() {
    if (this.videoCallbackId !== null && this.video && 'cancelVideoFrameCallback' in this.video) {
      (this.video as any).cancelVideoFrameCallback(this.videoCallbackId);
      this.videoCallbackId = null;
    }
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private onVideoFrameCallback = () => {
    this.videoCallbackId = null;
    if (!this.isPlaying || this.subscribers.size === 0) return;

    this.renderFrame();
    this.scheduleNextFrame();
  };

  private onAnimationFrameCallback = () => {
    this.rafId = null;
    if (!this.isPlaying || this.subscribers.size === 0) return;

    this.renderFrame();
    this.scheduleNextFrame();
  };

  private renderFrame() {
    if (!this.isPlaying || this.subscribers.size === 0) return;

    if (this.video && this.bufferCtx && this.bufferCanvas) {
      // Force resume if video paused unexpectedly
      if (this.video.paused && document.visibilityState === 'visible') {
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
