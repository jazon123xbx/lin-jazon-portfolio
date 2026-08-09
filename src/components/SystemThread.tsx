"use client";

/**
 * SystemThread — a subtle vertical connecting line between sections.
 * Uses a single DOM element with CSS animation; no React state, no
 * continuous RAF, no Three.js. IntersectionObserver triggers the
 * draw-once reveal. Gated to desktop only via CSS media query.
 */
export default function SystemThread() {
  return (
    <div className="system-thread-wrap" aria-hidden="true">
      <div className="system-thread-line" />
    </div>
  );
}
