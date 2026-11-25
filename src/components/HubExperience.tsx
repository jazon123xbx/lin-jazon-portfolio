"use client";

import { useEffect, useSyncExternalStore, type ReactNode, type ErrorInfo, Component } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import StaticLaptopFallback from "./StaticLaptopFallback";
import LinOsDisplay from "./LinOsDisplay";
import { useDisplayRegistration } from "./useDisplayRegistration";
import type { EntryPresentation } from "./HomeEntryShell";

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

/* ── WebGL status ───────────────────────────────────────────── */

type WebGLStatus = "checking" | "supported" | "unsupported";

function getWebGLSnapshot(): WebGLStatus {
  return getWebGLSupported() ? "supported" : "unsupported";
}

function subscribeToWebGL(): () => void {
  return () => {};
}

/* ── Main component ─────────────────────────────────────────── */

export default function HubExperience({ entry }: { entry: EntryPresentation }) {
  const webglStatus = useSyncExternalStore<WebGLStatus>(
    subscribeToWebGL,
    getWebGLSnapshot,
    () => "checking"
  );

  const { reducedMotion, openRequested, phase: bootPhase, renderer, bootLineIndex, checkLineIndex, onReady: handleReady, onFailure: handleFailure, onOpened: handleOpened, onExplore: startBootSequence } = entry;
  const canvasReady = renderer === "ready";
  const isFallbackMode = renderer === "fallback";
  const showCanvas = webglStatus === "supported" && !isFallbackMode;
  const showRealLaptop = showCanvas && canvasReady;
  const showFallback = isFallbackMode;
  const fallbackOpen = isFallbackMode && openRequested;

  /* ── Derived states ── */
  const isHoverReady = !openRequested && bootPhase === "idle";
  const showCta = isHoverReady;
  const showBootScreen = bootPhase !== "idle" && bootPhase !== "activation" && bootPhase !== "ui-reveal" && bootPhase !== "interactive";
  const showContent = bootPhase === "ui-reveal" || bootPhase === "interactive";
  const showNav = bootPhase === "interactive";

  const { containerRef, anchorRef, surfaceRef, sourceStyle, mode, registerQuad } = useDisplayRegistration({
    enabled: showRealLaptop,
    phase: bootPhase,
    showBootScreen,
    showContent,
    showNav,
  });

  useEffect(() => {
    if (webglStatus === "unsupported") handleFailure();
  }, [webglStatus, handleFailure]);

  /* ── Render ── */

  return (
    <div className="hub-presentation relative h-full w-full" ref={containerRef}>
      {/* ── Fallback ── */}
      <div style={showFallback ? undefined : { visibility: "hidden" }} aria-hidden={!showFallback}>
        <StaticLaptopFallback open={fallbackOpen} hoverReady={isHoverReady} activating={bootPhase === "activation"} />
      </div>

      {/* ── Canvas ── */}
      {showCanvas && (
        <LocalErrorBoundary fallback={null} onFailure={handleFailure}>
          <div
            className="absolute inset-0"
            style={{
              visibility: canvasReady ? "visible" : "hidden",
              opacity: canvasReady ? 1 : 0,
              transition: reducedMotion ? "none" : "opacity 650ms ease-out",
            }}
            aria-hidden="true"
          >
            <LaptopCanvas
              onReady={handleReady}
              onFailure={handleFailure}
              openRequested={openRequested && canvasReady}
              reducedMotion={reducedMotion}
              onOpened={handleOpened}
              cameraPush={bootPhase === "camera-push" || bootPhase === "ui-reveal" || bootPhase === "interactive"}
              onGlassQuad={registerQuad}
            />
          </div>
        </LocalErrorBoundary>
      )}

      {/* ── CTA button ── */}
      {showCta && (
        <div className="absolute left-1/2 top-[88%] z-20 w-max max-w-full -translate-x-1/2 -translate-y-1/2">
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

      {/* One persistent, semantic display host. It sits outside the hardware
          aria-hidden and error boundaries; only its presentation changes. */}
      <div ref={anchorRef} className="hub-display-anchor" data-mode={mode} style={sourceStyle}>
        <div ref={surfaceRef} className="hub-display-surface">
          <LinOsDisplay
            bootPhase={bootPhase}
            bootLineIndex={bootLineIndex}
            checkLineIndex={checkLineIndex}
            showBootScreen={showBootScreen}
            showContent={showContent}
            showNav={showNav}
          />
        </div>
      </div>
    </div>
  );
}
