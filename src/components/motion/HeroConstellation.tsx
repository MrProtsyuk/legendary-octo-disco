"use client";

import { useEffect, useRef } from "react";

/**
 * The one signature motion moment (§3): a graph-paper constellation.
 *
 * Two variants:
 * - "hero" (Home): dots respond to cursor position, lines fade in near the
 *   cursor, and every 4 seconds a pulse sweeps the grid from the top-left
 *   corner to the bottom-right. Chalk-on-blackboard, not laser show.
 * - "ambient" (About / Work / Writing): no cursor tracking — the grid sits
 *   very slightly illuminated and breathes with an ever-so-slight pulse of
 *   glow on the same 4s clock.
 */
export function HeroConstellation({
  variant = "hero",
}: {
  variant?: "hero" | "ambient";
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Respect reduced motion: render a static grid, no animation loop.
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const GRID = 48; // px between dots
    const RADIUS = 160; // cursor influence radius (hero only)
    const PULSE_PERIOD = 4000; // ms — shared clock for sweep and breathe
    const PULSE_BAND = 0.09; // width of the traveling band (0–1 diagonal space)
    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let animating = false;
    const mouse = { x: -9999, y: -9999 };

    function accentColor(): string {
      // Read the live CSS variable so the effect follows the theme.
      const v = getComputedStyle(document.documentElement)
        .getPropertyValue("--color-accent")
        .trim();
      return v || "13 128 76";
    }

    function resize() {
      if (!canvas || !ctx) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    /** Ambient: dim dots joined by faint graph-paper lines, gently breathing. */
    function drawAmbient() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      const accent = accentColor();

      // Slow sine breathe on the shared 4s clock; static render sits at base.
      const breathe = animating
        ? (Math.sin(
            (performance.now() / PULSE_PERIOD) * Math.PI * 2 - Math.PI / 2
          ) +
            1) /
          2
        : 0;
      const alpha = 0.07 + breathe * 0.06; // very slight, by design

      // Lines between the dots — even fainter than the dots so the grid
      // reads as graph paper, not a net. One stroke per row/column.
      ctx.strokeStyle = `rgb(${accent} / ${alpha * 0.35})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let gx = GRID / 2; gx < width; gx += GRID) {
        ctx.moveTo(gx, GRID / 2);
        ctx.lineTo(gx, height - GRID / 2);
      }
      for (let gy = GRID / 2; gy < height; gy += GRID) {
        ctx.moveTo(GRID / 2, gy);
        ctx.lineTo(width - GRID / 2, gy);
      }
      ctx.stroke();

      ctx.fillStyle = `rgb(${accent} / ${alpha})`;
      for (let gx = GRID / 2; gx < width; gx += GRID) {
        for (let gy = GRID / 2; gy < height; gy += GRID) {
          ctx.beginPath();
          ctx.arc(gx, gy, 1 + breathe * 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    /** Hero: cursor proximity + traveling diagonal pulse. */
    function drawHero() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      const accent = accentColor();

      // Pulse front travels the 0–1 diagonal each period, overshooting both
      // ends so the band fully enters and exits. Static render → no pulse.
      const progress = animating
        ? (performance.now() % PULSE_PERIOD) / PULSE_PERIOD
        : -1;
      const front = progress * (1 + PULSE_BAND * 4) - PULSE_BAND * 2;

      for (let gx = GRID / 2; gx < width; gx += GRID) {
        for (let gy = GRID / 2; gy < height; gy += GRID) {
          const dx = gx - mouse.x;
          const dy = gy - mouse.y;
          const dist = Math.hypot(dx, dy);
          const near = Math.max(0, 1 - dist / RADIUS);

          // Dot's position along the top-left → bottom-right diagonal (0–1),
          // and its distance from the traveling pulse band.
          let pulse = 0;
          if (progress >= 0) {
            const diag = (gx / width + gy / height) / 2;
            const off = (diag - front) / PULSE_BAND;
            pulse = Math.exp(-off * off) * 0.7; // soft gaussian band
          }

          // Hover and pulse combine; hover stays dominant up close.
          const glow = Math.min(1, near + pulse);

          ctx.fillStyle = `rgb(${accent} / ${0.1 + glow * 0.5})`;
          ctx.beginPath();
          ctx.arc(gx, gy, 1 + glow * 1.2, 0, Math.PI * 2);
          ctx.fill();

          // Connect to right + down neighbors when lit by cursor or pulse.
          if (glow > 0.05) {
            ctx.strokeStyle = `rgb(${accent} / ${glow * 0.25})`;
            ctx.lineWidth = 1;
            if (gx + GRID < width) {
              ctx.beginPath();
              ctx.moveTo(gx, gy);
              ctx.lineTo(gx + GRID, gy);
              ctx.stroke();
            }
            if (gy + GRID < height) {
              ctx.beginPath();
              ctx.moveTo(gx, gy);
              ctx.lineTo(gx, gy + GRID);
              ctx.stroke();
            }
          }
        }
      }
    }

    const draw = variant === "ambient" ? drawAmbient : drawHero;

    function loop() {
      draw();
      raf = requestAnimationFrame(loop);
    }

    function onMove(e: MouseEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }
    function onLeave() {
      mouse.x = -9999;
      mouse.y = -9999;
    }

    resize();
    draw();

    window.addEventListener("resize", resize);
    if (!reducedMotion) {
      animating = true;
      if (variant === "hero") {
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseout", onLeave);
      }
      raf = requestAnimationFrame(loop);
    }

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [variant]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 h-full w-full"
    />
  );
}
