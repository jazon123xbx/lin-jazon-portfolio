"use client";

import { useLayoutEffect, useRef } from "react";

export type RevealVariant =
  | "fade-up"
  | "mask-text"
  | "clip-wipe"
  | "line-draw"
  | "bracket-expand"
  | "media-reveal"
  | "stagger";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  variant?: RevealVariant;
}

/**
 * Progressive-enhancement reveal wrapper with multiple variants.
 *
 * `data-reveal-init` is rendered in initial markup. CSS hides it only
 * when `html.js-ready` is present (added by JS on mount). Without JS
 * the class never appears and content stays visible. Reduced motion or
 * missing IntersectionObserver reveal immediately.
 */
export default function Reveal({
  children,
  className = "",
  delay = 0,
  variant = "fade-up",
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    document.documentElement.classList.add("js-ready");

    /* Apply delay upfront via CSS variable so it's ready when
       the observer triggers the transition. */
    if (delay) {
      el.style.setProperty("--reveal-delay", `${delay}ms`);
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.setAttribute("data-revealed", "");
      return;
    }

    if (!("IntersectionObserver" in window)) {
      el.setAttribute("data-revealed", "");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.setAttribute("data-revealed", "");
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  const variantClass = variant !== "fade-up" ? `reveal-${variant}` : "";

  return (
    <div
      ref={ref}
      className={`reveal ${variantClass} ${className}`}
      data-reveal-init
      style={delay ? { "--reveal-delay": `${delay}ms` } as React.CSSProperties : undefined}
    >
      {children}
    </div>
  );
}
