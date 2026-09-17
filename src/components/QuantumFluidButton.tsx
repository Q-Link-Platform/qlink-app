'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';

interface QuantumFluidButtonProps {
  href?: string;
  download?: string;
  className?: string;
}

interface FluidRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  strength: number;
  speed: number;
  life: number;
  vx: number;
  vy: number;
}

interface FluidParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  hue: number;
}

export default function QuantumFluidButton({
  href = '/downloads/Q-Link-Setup.exe',
  download = 'Q-Link-Setup.exe',
  className = '',
}: QuantumFluidButtonProps) {
  const containerRef = useRef<HTMLAnchorElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  const [isHovered, setIsHovered] = useState(false);
  const mousePos = useRef({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 });
  const mouseVel = useRef({ x: 0, y: 0, lastX: 0.5, lastY: 0.5, lastTime: 0 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const ripples = useRef<FluidRipple[]>([]);
  const particles = useRef<FluidParticle[]>([]);
  const idlePhase = useRef<number>(0);

  // Initialize swirling bioluminescent fluid particles
  const initParticles = useCallback((w: number, h: number) => {
    particles.current = [];
    const count = 30;
    for (let i = 0; i < count; i++) {
      particles.current.push({
        x: Math.random() * w,
        y: Math.random() * h * 0.78,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: 1.2 + Math.random() * 2.2,
        alpha: 0.25 + Math.random() * 0.65,
        hue: 182 + Math.random() * 22,
      });
    }
  }, []);

  // Handle Pointer / Touch Tracking
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLAnchorElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    const clampedX = Math.max(0, Math.min(1, px));
    const clampedY = Math.max(0, Math.min(1, py));

    const now = performance.now();
    const dt = Math.max(1, now - mouseVel.current.lastTime);
    const vx = ((clampedX - mouseVel.current.lastX) / dt) * 1000;
    const vy = ((clampedY - mouseVel.current.lastY) / dt) * 1000;
    const speed = Math.sqrt(vx * vx + vy * vy);

    mouseVel.current = { x: vx, y: vy, lastX: clampedX, lastY: clampedY, lastTime: now };
    mousePos.current.targetX = clampedX;
    mousePos.current.targetY = clampedY;

    // 3D Parallax Micro-tilt
    setTilt({
      x: (clampedX - 0.5) * 2.2,
      y: -(clampedY - 0.5) * 2.2,
    });

    // Create wave ripples on movement
    if (speed > 0.05 && canvasRef.current) {
      const w = canvasRef.current.width / (window.devicePixelRatio || 1);
      const h = canvasRef.current.height / (window.devicePixelRatio || 1);
      const rippleX = clampedX * w;
      const rippleY = Math.min(h * 0.8, clampedY * h);

      if (ripples.current.length < 14) {
        ripples.current.push({
          x: rippleX,
          y: rippleY,
          radius: 3,
          maxRadius: Math.min(w * 0.55, 110 + speed * 25),
          strength: Math.min(1.0, 0.4 + speed * 0.35),
          speed: 1.8 + Math.min(speed * 0.8, 2.6),
          life: 1.0,
          vx: vx * 0.07,
          vy: vy * 0.07,
        });
      }

      // Drag fluid particles with fluid velocity
      particles.current.forEach((p) => {
        const dx = p.x - rippleX;
        const dy = p.y - rippleY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 75 && dist > 1) {
          const force = (1 - dist / 75) * (speed * 0.16);
          p.vx += (dx / dist) * force + vx * 0.035;
          p.vy += (dy / dist) * force + vy * 0.035;
        }
      });
    }
  }, []);

  const handlePointerEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handlePointerLeave = useCallback(() => {
    setIsHovered(false);
    mousePos.current.targetX = 0.5;
    mousePos.current.targetY = 0.5;
    setTilt({ x: 0, y: 0 });
  }, []);

  // 60 FPS Fluid Simulation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    const resize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      if (particles.current.length === 0) {
        initParticles(rect.width, rect.height);
      }
    };

    resize();
    window.addEventListener('resize', resize);

    let lastFrameTime = performance.now();

    const render = (time: number) => {
      if (!isRunning || !canvas) return;

      const dt = Math.min(50, time - lastFrameTime) / 1000;
      lastFrameTime = time;

      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      // Smooth mouse interpolation
      const lerpFactor = 0.18;
      mousePos.current.x += (mousePos.current.targetX - mousePos.current.x) * lerpFactor;
      mousePos.current.y += (mousePos.current.targetY - mousePos.current.y) * lerpFactor;

      const mx = mousePos.current.x * w;
      const my = mousePos.current.y * h;

      idlePhase.current += dt * 1.5;

      ctx.clearRect(0, 0, w, h);

      // 1. DYNAMIC SPOTLIGHT POOL
      const spotIntensity = isHovered ? 1.0 : 0.45;
      const spotRadius = Math.min(w * 0.45, 140);

      // Broad luminous liquid bloom
      const ambientGlow = ctx.createRadialGradient(mx, my, 4, mx, my, spotRadius * 1.4);
      ambientGlow.addColorStop(0, `rgba(34, 211, 238, ${0.42 * spotIntensity})`);
      ambientGlow.addColorStop(0.35, `rgba(6, 182, 212, ${0.25 * spotIntensity})`);
      ambientGlow.addColorStop(0.7, `rgba(2, 132, 199, ${0.1 * spotIntensity})`);
      ambientGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = ambientGlow;
      ctx.fillRect(0, 0, w, h);

      // Bright focal core glint
      const coreGlint = ctx.createRadialGradient(mx, my, 0, mx, my, Math.min(w * 0.18, 48));
      coreGlint.addColorStop(0, `rgba(255, 255, 255, ${0.75 * spotIntensity})`);
      coreGlint.addColorStop(0.3, `rgba(165, 243, 252, ${0.45 * spotIntensity})`);
      coreGlint.addColorStop(0.8, `rgba(34, 211, 238, ${0.12 * spotIntensity})`);
      coreGlint.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = coreGlint;
      ctx.fillRect(0, 0, w, h);

      // 2. DYNAMIC PROPAGATING FLUID RIPPLES
      for (let i = ripples.current.length - 1; i >= 0; i--) {
        const r = ripples.current[i];
        r.radius += r.speed;
        r.x += r.vx * 0.4;
        r.y += r.vy * 0.4;
        r.life -= dt * 1.1;

        if (r.life <= 0 || r.radius >= r.maxRadius) {
          ripples.current.splice(i, 1);
          continue;
        }

        const alpha = Math.max(0, r.life * r.strength);

        ctx.save();
        ctx.lineWidth = 2.4;
        ctx.strokeStyle = `rgba(103, 232, 249, ${alpha * 0.65})`;
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, r.radius, r.radius * 0.62, 0, 0, Math.PI * 2);
        ctx.stroke();

        if (r.radius > 10) {
          ctx.lineWidth = 1.2;
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.85})`;
          ctx.beginPath();
          ctx.ellipse(r.x, r.y, r.radius * 0.72, r.radius * 0.44, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 3. REACTIVE LIQUID SINE WAVE CAUSTICS
      ctx.save();
      const waveCount = 3;
      const chamberHeight = h * 0.78;

      for (let wi = 0; wi < waveCount; wi++) {
        const phaseOffset = idlePhase.current * (0.8 + wi * 0.3) + wi * 1.8;
        const waveY = chamberHeight * (0.35 + wi * 0.18);
        const amp = 3.5 + (isHovered ? 4.5 : 2.0) * (1 - wi * 0.2);

        ctx.beginPath();
        ctx.moveTo(0, waveY);

        for (let x = 0; x <= w; x += 8) {
          const dx = x - mx;
          const mouseDist = Math.abs(dx);
          const mouseSurge = Math.exp(-(mouseDist * mouseDist) / 3600) * (isHovered ? 11 : 0);

          const y =
            waveY +
            Math.sin(x * 0.035 + phaseOffset) * amp +
            Math.cos(x * 0.015 - phaseOffset * 0.8) * (amp * 0.5) +
            mouseSurge * Math.sin(x * 0.06 + phaseOffset * 2);

          ctx.lineTo(x, y);
        }

        ctx.lineWidth = 1.6 + wi * 0.4;
        ctx.strokeStyle = `rgba(56, 189, 248, ${(0.22 - wi * 0.05) * spotIntensity})`;
        ctx.stroke();
      }
      ctx.restore();

      // 4. SWIRLING BIOLUMINESCENT FLUID PARTICLES
      particles.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        p.vx *= 0.96;
        p.vy *= 0.96;

        if (p.x < 15) { p.x = 15; p.vx *= -0.8; }
        if (p.x > w - 15) { p.x = w - 15; p.vx *= -0.8; }
        if (p.y < 12) { p.y = 12; p.vy *= -0.8; }
        if (p.y > chamberHeight - 12) { p.y = chamberHeight - 12; p.vy *= -0.8; }

        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const nearCursor = Math.max(0, 1 - dist / 90);
        const currentAlpha = Math.min(1.0, p.alpha * (0.6 + nearCursor * 0.9) * spotIntensity);

        ctx.fillStyle = `hsla(${p.hue}, 100%, 75%, ${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 + nearCursor * 0.8), 0, Math.PI * 2);
        ctx.fill();
      });

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [isHovered, initParticles]);

  return (
    <div className={`w-full flex flex-col items-center ${className}`}>
      <a
        ref={containerRef}
        href={href}
        download={download}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        style={{
          transform: `perspective(600px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
          transformStyle: 'preserve-3d',
        }}
        className="group relative block w-full max-w-[300px] sm:max-w-[350px] md:max-w-[390px] transition-transform duration-200 ease-out filter drop-shadow-[0_12px_35px_rgba(6,182,212,0.35)] hover:drop-shadow-[0_22px_65px_rgba(6,182,212,0.85)] cursor-pointer select-none"
        title="Download Q-Link for Windows - Sovereign Desktop Client (.exe)"
      >
        <div className="relative rounded-full overflow-hidden">
          <img
            src="/visuals/quantum-download-button.png"
            alt="Download for Windows - 75 MB .EXE - Recommended for devs"
            className="w-full h-auto select-none pointer-events-none block"
            loading="eager"
            draggable={false}
          />

          {/* DYNAMIC REACTIVE LIQUID CHAMBER CANVAS */}
          <div
            className="absolute inset-0 pointer-events-none overflow-hidden rounded-full"
            style={{
              clipPath: 'inset(1% 2% 23% 2% round 9999px)',
            }}
          >
            <canvas
              ref={canvasRef}
              className="w-full h-full block"
              style={{
                mixBlendMode: 'screen',
              }}
            />
          </div>

          {/* Specular Refraction Lens Sheen Glint */}
          <div
            className="absolute inset-0 pointer-events-none rounded-full transition-opacity duration-300"
            style={{
              background: `radial-gradient(130px circle at ${mousePos.current.x * 100}% ${mousePos.current.y * 100}%, rgba(255,255,255,0.22), transparent 75%)`,
              mixBlendMode: 'overlay',
              opacity: isHovered ? 1 : 0.35,
            }}
          />

          {/* Specular Shimmer Sweep on Hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none rounded-full" />
        </div>
      </a>
    </div>
  );
}
