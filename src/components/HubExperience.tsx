"use client";

import { useState, useCallback, useRef, useEffect, useSyncExternalStore, type ReactNode, type ErrorInfo, Component } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import StaticLaptopFallback from "./StaticLaptopFallback";

const LaptopCanvas = dynamic(() => import("./LaptopCanvas"), {
  ssr: false,
  loading: () => null,
});

/* ── WebGL probe ────────────────────────────────────────────── */

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

/* ── Reduced-motion subscription ────────────────────────────── */

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

/* ── Error boundary ─────────────────────────────────────────── */

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

/* ── Screen overlay links ───────────────────────────────────── */

const overlayLinks = [
  { label: "About", href: "/#about" },
  { label: "Projects", href: "/#projects" },
  { label: "Capabilities", href: "/#capabilities" },
  { label: "Contact", href: "/#contact" },
];

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

/* ── Boot phases ────────────────────────────────────────────── */

type BootPhase =
  | "idle"
  | "activation"
  | "booting"
  | "system-check"
  | "access-granted"
  | "welcome-hold"
  | "camera-push"
  | "ui-reveal"
  | "interactive";

/* ── Boot text content ──────────────────────────────────────── */

const BOOT_LINES = [
  "INITIALIZING",
  "AUTHENTICATING",
  "LOADING CORE MODULES",
  "MOUNTING PROJECT HUB",
  "INDEXING PROJECTS",
  "LOADING CAPABILITIES",
  "CONNECTING SERVICES",
];

const SYSTEM_CHECK_LINES = [
  { label: "SYSTEM CORE", status: "READY" },
  { label: "PROFILE", status: "READY" },
  { label: "PROJECT INDEX", status: "READY" },
  { label: "CAPABILITIES", status: "READY" },
  { label: "COMM LINK", status: "READY" },
];

/* ── WebGL status ───────────────────────────────────────────── */

type WebGLStatus = "checking" | "supported" | "unsupported";

function getWebGLSnapshot(): WebGLStatus {
  return getWebGLSupported() ? "supported" : "unsupported";
}

function subscribeToWebGL(): () => void {
  return () => {};
}

/* ── Main component ─────────────────────────────────────────── */

export default function HubExperience() {
  const webglStatus = useSyncExternalStore<WebGLStatus>(
    subscribeToWebGL,
    getWebGLSnapshot,
    () => "checking"
  );

  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    () => false
  );

  const [canvasFailed, setCanvasFailed] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [openRequested, setOpenRequested] = useState(false);
  const [bootPhase, setBootPhase] = useState<BootPhase>("idle");
  const [navRevealed, setNavRevealed] = useState(false);
  const [bootLineIndex, setBootLineIndex] = useState(0);
  const [checkLineIndex, setCheckLineIndex] = useState(0);

  const openedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const bootPhaseRef = useRef<BootPhase>("idle");

  const isFallbackMode = webglStatus === "unsupported" || canvasFailed;
  const showCanvas = webglStatus === "supported" && !canvasFailed;
  const showRealLaptop = showCanvas && canvasReady;
  const showFallback = !showRealLaptop;
  const fallbackOpen = isFallbackMode && openRequested;

  /* ── Derived states ── */
  const isHoverReady = !openRequested && bootPhase === "idle" && (showRealLaptop || isFallbackMode);
  const showCta = isHoverReady;
  const showBootScreen = bootPhase !== "idle" && bootPhase !== "activation" && bootPhase !== "interactive";
  const showContent = bootPhase === "ui-reveal" || bootPhase === "interactive";
  const showNav = bootPhase === "interactive" && navRevealed;

  /* ── Helpers ── */
  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  /* ── Callbacks ── */

  const handleFailure = useCallback(() => {
    setCanvasReady(false);
    setCanvasFailed(true);
  }, []);

  const handleReady = useCallback(() => {
    setCanvasReady(true);
  }, []);

  const handleOpened = useCallback(() => {
    if (!openedRef.current) {
      openedRef.current = true;

      /* If we're in activation, advance to booting directly in the callback
         to avoid setState-in-effect. */
      if (bootPhaseRef.current === "activation") {
        setBootPhase("booting");
        setBootLineIndex(0);
      }
    }
  }, []);

  /* ── User clicks CTA ── */

  const startBootSequence = useCallback(() => {
    setOpenRequested(true);
    setBootPhase("activation");

    if (reducedMotion) {
      /* Snap everything — no lid anim, no boot, no camera */
      setBootPhase("interactive");
      setNavRevealed(true);
      return;
    }

    /* Activation phase shows for ~450ms while lid begins opening.
       When onOpened fires, we advance to booting. The advance
       is handled in the useEffect watching `opened`. */
  }, [reducedMotion]);

  /* ── Fallback advance: when in fallback mode, onOpened never fires.
       Advance from activation to booting after the physical-open duration
       (1800ms matches SETTLE_END_MS in LaptopPrototype). Idempotent:
       only advances if still in activation phase. */
  useEffect(() => {
    if (!isFallbackMode || !openRequested) return;
    if (bootPhaseRef.current !== "activation") return;

    const t = setTimeout(() => {
      if (bootPhaseRef.current === "activation") {
        setBootPhase("booting");
        setBootLineIndex(0);
      }
    }, 1800);

    timersRef.current.push(t);
    return () => clearTimeout(t);
  }, [isFallbackMode, openRequested]);

  /* ── Keep bootPhaseRef in sync for callback reads ── */
  useEffect(() => {
    bootPhaseRef.current = bootPhase;
  }, [bootPhase]);

  /* ── Boot line typewriter ── */

  useEffect(() => {
    if (bootPhase !== "booting") return;

    if (bootLineIndex >= BOOT_LINES.length) {
      /* Done typing → system check */
      schedule(() => {
        setBootPhase("system-check");
        setCheckLineIndex(0);
      }, 200);
      return;
    }

    const t = setTimeout(() => {
      setBootLineIndex((i) => i + 1);
    }, 180);

    timersRef.current.push(t);
    return () => clearTimeout(t);
  }, [bootPhase, bootLineIndex, schedule]);

  /* ── System check line advance ── */

  useEffect(() => {
    if (bootPhase !== "system-check") return;

    if (checkLineIndex >= SYSTEM_CHECK_LINES.length) {
      /* All checks done → access granted → welcome → camera → UI */
      schedule(() => setBootPhase("access-granted"), 200);
      schedule(() => setBootPhase("welcome-hold"), 900);
      schedule(() => setBootPhase("camera-push"), 1800);
      schedule(() => setBootPhase("ui-reveal"), 2500);
      schedule(() => {
        setBootPhase("interactive");
        setNavRevealed(true);
      }, 2900);
      return;
    }

    const t = setTimeout(() => {
      setCheckLineIndex((i) => i + 1);
    }, 140);

    timersRef.current.push(t);
    return () => clearTimeout(t);
  }, [bootPhase, checkLineIndex, schedule]);

  /* ── Cleanup all timers ── */

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, []);

  /* ── Render ── */

  return (
    <div ref={containerRef} className="relative h-full w-full">
      {/* ── Fallback ── */}
      <div style={showFallback ? undefined : { visibility: "hidden" }} aria-hidden={!showFallback}>
        <StaticLaptopFallback open={fallbackOpen} hoverReady={isHoverReady} activating={bootPhase === "activation"} />
      </div>

      {/* ── Canvas ── */}
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
              cameraPush={bootPhase === "camera-push" || bootPhase === "ui-reveal" || bootPhase === "interactive"}
            />
          </div>
        </LocalErrorBoundary>
      )}

      {/* ── CTA button ── */}
      {showCta && (
        <div className="absolute left-1/2 top-[62%] z-20 -translate-x-1/2 -translate-y-1/2">
          {/* CTA guide — decorative, aria-hidden */}
          <div
            className="cta-guide-arrow pointer-events-none absolute left-1/2 -top-10 -translate-x-1/2 whitespace-nowrap"
            aria-hidden="true"
          >
            <span className="block text-center text-[8px] font-medium uppercase tracking-[0.2em] text-accent-blue/60 sm:text-[9px]">
              CLICK TO OPEN
            </span>
            <svg
              viewBox="0 0 16 12"
              fill="none"
              className="mx-auto mt-0.5 h-2 w-4 text-accent-blue/50"
              aria-hidden="true"
            >
              <path
                d="M8 0v9M3 6l5 5 5-5"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <button
            type="button"
            onClick={startBootSequence}
            className={cn(
              "rounded-lg border border-accent-blue/40 bg-accent-blue/10 px-6 py-3",
              "text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-blue",
              "backdrop-blur-sm transition-all duration-300",
              "hover:border-accent-blue/60 hover:bg-accent-blue/20 hover:text-white hover:shadow-[0_0_20px_rgba(94,141,255,0.2)]",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue",
              "sm:text-xs"
            )}
          >
            <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-accent-blue animate-pulse" aria-hidden="true" />
            EXPLORE LIN&apos;S PORTFOLIO
          </button>
        </div>
      )}

      {/* ── Hover-ready status (desktop) ── */}
      {isHoverReady && (
        <div
          className="absolute left-1/2 top-[70%] z-20 -translate-x-1/2 -translate-y-1/2"
          aria-hidden="true"
        >
          <p className="hidden text-center text-[9px] font-medium uppercase tracking-[0.25em] text-accent-blue/50 sm:block">
            ACCESS READY
          </p>
        </div>
      )}

      {/* ── Boot screen overlay (inside laptop screen area) ── */}
      {showBootScreen && (
        <div
          className="absolute left-1/2 top-[18%] z-30 w-[62%] -translate-x-1/2 sm:top-[17%] sm:w-[46%] lg:top-[16%] lg:w-[38%]"
          aria-live="polite"
          aria-label="System boot sequence"
        >
          <div className="rounded-lg border border-white/[0.04] bg-black/80 p-4 backdrop-blur-sm sm:p-5">
            {/* Internal grid frame */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.03]" aria-hidden="true">
              <div className="absolute left-1/3 top-0 h-full w-px bg-accent-blue" />
              <div className="absolute left-2/3 top-0 h-full w-px bg-accent-blue" />
              <div className="absolute left-0 top-1/3 h-full w-px bg-accent-blue" />
              <div className="absolute left-0 top-2/3 h-full w-px bg-accent-blue" />
            </div>

            {/* ── Booting lines ── */}
            {bootPhase === "booting" && (
              <div className="relative">
                <div className="ty-eyebrow mb-3 text-accent-blue tracking-[0.3em]">
                  LIN.OS BOOT SEQUENCE
                </div>
                <div className="space-y-0.5">
                  {BOOT_LINES.slice(0, bootLineIndex).map((line) => (
                    <div
                      key={line}
                      className="flex items-center gap-2 font-mono text-[10px] text-white/50"
                    >
                      <span className="text-accent-blue/30">&gt;</span>
                      <span>{line}</span>
                      <span className="ml-auto text-accent-blue/25">OK</span>
                    </div>
                  ))}
                  {bootLineIndex < BOOT_LINES.length && (
                    <div className="flex items-center gap-2 font-mono text-[10px] text-accent-blue/35">
                      <span>&gt;</span>
                      <span className="animate-pulse">_</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── System check ── */}
            {bootPhase === "system-check" && (
              <div className="relative">
                <div className="ty-eyebrow mb-3 text-accent-gold tracking-[0.3em]">
                  SYSTEM CHECK
                </div>
                <div className="space-y-0.5">
                  {SYSTEM_CHECK_LINES.slice(0, checkLineIndex).map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-2 font-mono text-[10px] text-white/50"
                    >
                      <span className="text-accent-blue/30">[</span>
                      <span>{item.label}</span>
                      <span className="ml-auto text-accent-blue/60">{item.status}</span>
                      <span className="text-accent-blue/30">]</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Access granted ── */}
            {bootPhase === "access-granted" && (
              <div className="relative text-center">
                <div className="ty-eyebrow text-accent-gold tracking-[0.3em]">
                  [ ACCESS GRANTED ]
                </div>
              </div>
            )}

            {/* ── Welcome hold ── */}
            {bootPhase === "welcome-hold" && (
              <div className="relative text-center">
                <div className="ty-eyebrow text-accent-blue tracking-[0.3em]">
                  WELCOME, LIN.
                </div>
              </div>
            )}

            {/* ── Camera push ── */}
            {bootPhase === "camera-push" && (
              <div className="relative text-center">
                <div className="mx-auto h-px w-16 bg-gradient-to-r from-transparent via-accent-blue/30 to-transparent" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Screen overlay — welcome content + navigation ── */}
      <div
        className={cn(
          "absolute left-1/2 top-[18%] z-10 w-[62%] -translate-x-1/2 transition-opacity duration-700 ease-out",
          "sm:top-[17%] sm:w-[46%] lg:top-[16%] lg:w-[38%]",
          showContent ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-hidden={!showContent}
      >
        <div className="text-center">
          {/* Title — stagger clip reveal */}
          <h3
            className={cn(
              "text-[11px] font-bold text-white sm:text-base",
              "transition-all duration-500",
              showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            )}
          >
            Welcome to Lin&apos;s Portfolio
          </h3>

          {/* Subtitle — stagger */}
          <p
            className={cn(
              "mt-0.5 text-[11px] leading-snug text-white/70 sm:hidden",
              "transition-all duration-500 delay-100",
              showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            )}
          >
            <span className="text-accent-blue">Creative Developer &amp; Problem Solver</span>
          </p>
          <p
            className={cn(
              "mt-1 text-[11px] font-medium uppercase tracking-wider text-white/50 sm:hidden",
              "transition-all duration-500 delay-150",
              showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            )}
          >
            Choose a section to explore.
          </p>
          <p
            className={cn(
              "mt-0.5 hidden text-[11px] leading-snug text-white/70 sm:block sm:text-xs",
              "transition-all duration-500 delay-100",
              showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            )}
          >
            <span className="text-accent-blue">Creative Developer &amp; Problem Solver</span>
          </p>
          <p
            className={cn(
              "mt-0.5 hidden text-[11px] leading-snug text-white/70 sm:block sm:text-xs",
              "transition-all duration-500 delay-200",
              showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            )}
          >
            Turning ideas into practical digital experiences.
          </p>
          <p
            className={cn(
              "mt-0.5 hidden text-[10px] font-medium uppercase tracking-wider text-white/50 sm:block sm:text-[10px]",
              "transition-all duration-500 delay-300",
              showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            )}
          >
            Choose a section to explore
          </p>
        </div>

        {/* Navigation tiles — staggered bracket reveal */}
        <nav
          className={cn(
            "mt-2 transition-all duration-500 ease-out",
            showNav
              ? "translate-y-0 opacity-100"
              : "translate-y-3 pointer-events-none opacity-0"
          )}
          aria-label="Portfolio sections"
          aria-hidden={!showNav}
        >
          <ul className="grid grid-cols-2 gap-1.5">
            {overlayLinks.map((link, i) => (
              <li
                key={link.href}
                className={cn(
                  "transition-all duration-400",
                  showNav ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                )}
                style={{ transitionDelay: showNav ? `${i * 80}ms` : "0ms" }}
              >
                <a
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    navigateTo(link.href);
                  }}
                  tabIndex={showNav ? undefined : -1}
                  className={cn(
                    "flex min-h-[44px] items-center justify-center rounded-lg",
                    "border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-medium text-white/90",
                    "backdrop-blur-sm transition-colors",
                    "hover:border-white/30 hover:bg-white/20 hover:text-white",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue",
                    "sm:text-xs"
                  )}
                >
                  <span className="mr-1.5 text-accent-blue/50 text-[9px]" aria-hidden="true">[</span>
                  {link.label}
                  <span className="ml-1.5 text-accent-blue/50 text-[9px]" aria-hidden="true">]</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
