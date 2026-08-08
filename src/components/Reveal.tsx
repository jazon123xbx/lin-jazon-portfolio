"use client";

import { useLayoutEffect, useRef } from "react";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

/**
 * Progressive-enhancement reveal wrapper.
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
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  // useLayoutEffect fires before paint on client, no-op on server.
  // This avoids the visible → hidden flash a normal useEffect would cause.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Signal that JS is active — CSS uses this to activate the hidden state
    document.documentElement.classList.add("js-ready");

    // Reduced motion → reveal immediately
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.setAttribute("data-revealed", "");
      return;
    }

    // No IntersectionObserver → reveal immediately
    if (!("IntersectionObserver" in window)) {
      el.setAttribute("data-revealed", "");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay) el.style.transitionDelay = `${delay}ms`;
          el.setAttribute("data-revealed", "");
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={`reveal ${className}`} data-reveal-init>
      {children}
    </div>
  );
}
