"use client";

import { useState, useCallback, useRef, useEffect, useSyncExternalStore, type ReactNode, type ErrorInfo, Component } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import StaticLaptopFallback from "./StaticLaptopFallback";

const LaptopCanvas = dynamic(() => import("./LaptopCanvas"), {
  ssr: false,
  loading: () => null,
});

// Module-cached WebGL probe — computed once in browser, reused for every read.
let _webglSupported: boolean | null = null;
function getWebGLSupported(): boolean {
  return (_webglSupported ??= (() => {
    if (typeof document === "undefined") return false;
    try {
      const canvas = document.createElement("canvas");
      return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
    } catch {
      return false;
    }
  })());
}

// ── Reduced-motion subscription (hydration-safe) ──

function getReducedMotionSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function subscribeToReducedMotion(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

// ── Error boundary ──

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
  onFailure?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class LocalErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("[HubExperience] Canvas error boundary caught:", error, info);
    this.props.onFailure?.();
  }

  render(): ReactNode {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

// ── Screen overlay links ──

const overlayLinks = [
  { label: "About", href: "/#about" },
  { label: "Projects", href: "/#projects" },
  { label: "Capabilities", href: "/#capabilities" },
  { label: "Contact", href: "/#contact" },
];

/** Delay before nav links appear after the welcome content. */
const NAV_REVEAL_DELAY_MS = 600;

/** Screen boot overlay ("LIN. SYSTEM") appears during power-on, before UI reveal. */
const BOOT_START_MS = 820; // aligns with screen power-on in LaptopPrototype
const BOOT_END_MS = 1500; // boot overlay fades as the welcome UI reveals

function navigateTo(href: string) {
  const id = href.replace("/#", "");
  const target = document.getElementById(id);
  if (!target) return;

  target.scrollIntoView({ behavior: "smooth", block: "start" });

  if (window.location.hash === `#${id}`) {
    history.replaceState(null, "", href);
  } else {
    history.pushState(null, "", href);
  }
}

type WebGLStatus = 'checking' | 'supported' | 'unsupported';

function getWebGLSnapshot(): WebGLStatus {
  return getWebGLSupported() ? 'supported' : 'unsupported';
}

function subscribeToWebGL(_cb: () => void): () => void {
  // Capability is static; nothing to subscribe to.
  return () => {};
}

export default function HubExperience() {
  const webglStatus = useSyncExternalStore<WebGLStatus>(
    subscribeToWebGL,
    getWebGLSnapshot,
    () => 'checking',
  );

  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    () => false,
  );

  const [canvasFailed, setCanvasFailed] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [openRequested, setOpenRequested] = useState(false);
  const [opened, setOpened] = useState(false);
  const [navRevealed, setNavRevealed] = useState(false);
  const [bootActive, setBootActive] = useState(false);

  // ── Refs ──
  const openedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bootTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const isFallbackMode = webglStatus === 'unsupported' || canvasFailed;
  const showCanvas = webglStatus === 'supported' && !canvasFailed;
  const showRealLaptop = showCanvas && canvasReady;
  const showFallback = !showRealLaptop;
  const fallbackOpen = isFallbackMode && openRequested;
  const experienceOpened = isFallbackMode ? openRequested : showRealLaptop && opened;
  // CTA only visible when user hasn't activated yet.
  const showCta = !openRequested;
  const showContent = experienceOpened;
  const showNav = showContent && navRevealed;

  // ── Callbacks ──

  const handleFailure = useCallback(() => {
    setCanvasReady(false);
    setCanvasFailed(true);
  }, []);

  const handleReady = useCallback(() => {
    setCanvasReady(true);
  }, []);

  /** User clicks the CTA to enter the portfolio. */
  const handleCtaClick = useCallback(() => {
    // openRequested must become true on every activation — gates the CTA.
    setOpenRequested(true);

    if (reducedMotion) {
      // Snap to final state immediately — no opening animation.
      setOpened(true);
      setNavRevealed(true);
      return;
    }

    // Normal motion: schedule the screen boot overlay to coincide with the
    // 3D power-on, then hand off to the welcome UI reveal.
    bootTimersRef.current.push(
      setTimeout(() => setBootActive(true), BOOT_START_MS),
      setTimeout(() => setBootActive(false), BOOT_END_MS),
    );
    // LaptopPrototype runs the opening timeline, fires onOpened when complete,
    // then the timer reveals nav.
  }, [reducedMotion]);

  /** Coarse callback from LaptopPrototype when the opening timeline finishes. */
  const handleOpened = useCallback(() => {
    if (!openedRef.current) {
      openedRef.current = true;
      setOpened(true);
    }
  }, []);

  // ── Delayed nav reveal after opened (normal motion only) ──

  useEffect(() => {
    if (experienceOpened && !navRevealed && !reducedMotion) {
      navTimerRef.current = setTimeout(() => {
        setNavRevealed(true);
      }, NAV_REVEAL_DELAY_MS);
    }
    return () => {
      if (navTimerRef.current) clearTimeout(navTimerRef.current);
    };
  }, [experienceOpened, navRevealed, reducedMotion]);

  // Clear any pending boot timers on unmount.
  useEffect(() => {
    const timers = bootTimersRef.current;
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div ref={containerRef} className="relative h-full w-full">
      {/* ── Fallback — visible until real laptop is ready ── */}
      <div style={showFallback ? undefined : { visibility: "hidden" }} aria-hidden={!showFallback}>
        <StaticLaptopFallback open={fallbackOpen} />
      </div>

      {/* ── Canvas — layered over fallback only when WebGL supported ── */}
      {showCanvas && (
        <LocalErrorBoundary fallback={null} onFailure={handleFailure}>
          <div
            className="absolute inset-0"
            style={canvasReady ? undefined : { visibility: "hidden" }}
            aria-hidden="true"
          >
            <LaptopCanvas
              onReady={handleReady}
              onFailure={handleFailure}
              openRequested={openRequested}
              reducedMotion={reducedMotion}
              onOpened={handleOpened}
            />
          </div>
        </LocalErrorBoundary>
      )}

      {/* ── Screen boot overlay — "power-on" transition before the UI ── */}
      <div
        className={cn(
          "pointer-events-none absolute left-1/2 top-[18%] z-10 w-[60%] -translate-x-1/2 overflow-hidden rounded-[3px]",
          "sm:top-[19%] sm:w-[44%] lg:w-[36%]",
          "transition-opacity duration-300 ease-out",
          bootActive ? "opacity-100" : "opacity-0",
        )}
        aria-hidden="true"
      >
        <div className="relative flex flex-col items-center justify-center py-4">
          {/* Sweeping blue scan line */}
          <span className="laptop-boot-sweep" />
          <span className="font-mono text-[9px] font-bold tracking-[0.28em] text-accent-blue sm:text-[11px]">
            LIN. SYSTEM
          </span>
          <span className="mt-1 font-mono text-[7px] uppercase tracking-[0.22em] text-white/45 sm:text-[9px]">
            Creative Developer Environment
          </span>
        </div>
      </div>

      {/* ── CTA button — associated with the closed laptop ── */}
      {showCta && (
        <button
          type="button"
          onClick={handleCtaClick}
          className={cn(
            "absolute left-1/2 top-[62%] z-20 -translate-x-1/2 -translate-y-1/2",
            "rounded-lg bg-accent-blue px-6 py-3 text-sm font-semibold text-white shadow-lg",
            "transition-all hover:bg-accent-blue-dim",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue",
          )}
        >
          Explore Lin&apos;s Portfolio
        </button>
      )}

      {/* ── Screen overlay — welcome content + navigation ── */}
      <div
        className={cn(
          "absolute left-1/2 top-[22%] z-10 w-[62%] -translate-x-1/2 transition-opacity duration-700 ease-out",
          "sm:top-[21%] sm:w-[46%] lg:top-[20%] lg:w-[38%]",
          showContent ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!showContent}
      >
        {/* Welcome content — staggered reveal */}
        <div className={cn("text-center", showContent && "laptop-seq")}>
          <h3 className="text-[11px] font-bold text-white sm:text-base">
            Welcome to Lin&apos;s Portfolio
          </h3>
          {/* Mobile compact copy */}
          <p className="mt-0.5 text-[11px] leading-snug text-white/70 sm:hidden">
            <span className="text-accent-blue">Creative Developer &amp; Problem Solver</span>
          </p>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-white/50 sm:hidden">
            Choose a section to explore.
          </p>
          <p className="mt-0.5 hidden text-[11px] leading-snug text-white/70 sm:block sm:text-xs">
            <span className="text-accent-blue">Creative Developer &amp; Problem Solver</span>
          </p>
          <p className="mt-0.5 hidden text-[11px] leading-snug text-white/70 sm:block sm:text-xs">
            Turning ideas into practical digital experiences.
          </p>
          <p className="mt-0.5 hidden text-[10px] font-medium uppercase tracking-wider text-white/50 sm:block sm:text-[10px]">
            Choose a section to explore
          </p>
        </div>

        {/* Navigation controls — delayed reveal */}
        <nav
          className={cn(
            "mt-1 transition-all duration-500 ease-out",
            showNav
              ? "translate-y-0 opacity-100"
              : "translate-y-2 pointer-events-none opacity-0",
          )}
          aria-label="Portfolio sections"
          aria-hidden={!showNav}
        >
          <ul className={cn("grid grid-cols-2 gap-1", showNav && "laptop-seq")}>
            {overlayLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={(e) => { e.preventDefault(); navigateTo(link.href); }}
                  tabIndex={showNav ? undefined : -1}
                  className={cn(
                    "group/tile relative flex min-h-[44px] items-center justify-center gap-1 overflow-hidden rounded-lg",
                    "border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-medium text-white/90",
                    "backdrop-blur-sm transition-all duration-300 ease-out",
                    "hover:-translate-y-0.5 hover:border-accent-blue/60 hover:bg-white/20 hover:text-white",
                    "hover:shadow-[0_6px_16px_-6px_rgba(45,127,249,0.5)]",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue",
                    "sm:text-xs",
                  )}
                >
                  {/* Blue edge illumination */}
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-0 h-full w-[2px] bg-accent-blue opacity-0 transition-opacity duration-300 group-hover/tile:opacity-100"
                  />
                  <span>{link.label}</span>
                  <span
                    aria-hidden="true"
                    className="translate-x-0 text-accent-blue opacity-0 transition-all duration-300 group-hover/tile:translate-x-0.5 group-hover/tile:opacity-100"
                  >
                    &rarr;
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
