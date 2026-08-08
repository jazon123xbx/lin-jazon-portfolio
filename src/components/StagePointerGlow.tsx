"use client";

import { useEffect, useRef } from "react";

interface StagePointerGlowProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * DOM/CSS-only pointer-following glow layer.
 *
 * Tracks pointer position via CSS custom properties (`--pointer-x`,
 * `--pointer-y`) set directly through a ref — no React state, no
 * Three/R3F, no continuous RAF loop. The highlight layer has
 * `pointer-events: none` so it cannot block clicks or touches. The
 * effect is gated to `(hover: hover) and (pointer: fine)` in CSS and
 * disabled under `prefers-reduced-motion: reduce`.
 */
export default function StagePointerGlow({
  children,
  className = "",
}: StagePointerGlowProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function onPointerMove(e: PointerEvent) {
      const r = el!.getBoundingClientRect();
      el!.style.setProperty("--pointer-x", `${e.clientX - r.left}px`);
      el!.style.setProperty("--pointer-y", `${e.clientY - r.top}px`);
    }

    el.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => el.removeEventListener("pointermove", onPointerMove);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      {children}
      <div className="stage-glow-highlight" aria-hidden="true" />
    </div>
  );
}
