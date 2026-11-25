"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import {
  evaluateProjectionGeometry,
  evaluateProjectedTargets,
  localScale,
  mapPoint,
  type GlassQuad,
  type Point,
  type Size,
  type SourceRect,
} from "@/lib/display-projection";
import type { EntryPresentation } from "./HomeEntryShell";

type Phase = EntryPresentation["phase"];

/**
 * One 5:3 logical source for projected mode. The same values are written to
 * CSS variables on the host; the DOM dimensions are re-read and asserted
 * before any matrix is applied. 448×269 is an integer-pixel 5:3 candidate
 * (448/269 ≈ 1.665) chosen against 480×288 by browser measurement.
 */
export const PROJECTED_SOURCE: Size = { width: 448, height: 269 };
export const PROJECTED_SOURCE_STYLE = {
  "--linos-projected-width": `${PROJECTED_SOURCE.width}px`,
  "--linos-projected-height": `${PROJECTED_SOURCE.height}px`,
} as CSSProperties;

export type DisplayMode = "flat" | "projected";

type LocalRect = SourceRect;

interface LocalText {
  center: Point;
  fontPx: number;
}

interface LayoutMetrics {
  source: Size;
  canvas: Size;
  overflow: boolean;
  texts: LocalText[];
  links: LocalRect[];
  focus: LocalRect | null;
}

export interface UseDisplayRegistrationOptions {
  enabled: boolean;
  phase: Phase;
  showBootScreen: boolean;
  showContent: boolean;
  showNav: boolean;
}

export interface DisplayRegistration {
  containerRef: React.RefObject<HTMLDivElement | null>;
  anchorRef: React.RefObject<HTMLDivElement | null>;
  surfaceRef: React.RefObject<HTMLDivElement | null>;
  sourceStyle: CSSProperties;
  mode: DisplayMode;
  registerQuad: (quad: GlassQuad | null) => void;
}

// Before-paint phase sync on the client; fall back to useEffect for SSR.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const MIN_TEXT_PX = 10;
const EXPECTED_LINK_HASHES = ["#about", "#projects", "#capabilities", "#contact"];
const ENTRY_HYSTERESIS_MS = 180;
const FOCUS_CLEARANCE_PX = 8;
const DIAGNOSTIC_PHASES: ReadonlySet<Phase> = new Set([
  "booting", "system-check", "access-granted", "welcome-hold", "camera-push",
]);
const REVEAL_PHASES: ReadonlySet<Phase> = new Set(["ui-reveal", "interactive"]);

/** Reveal can hold a qualified projection, but only interactive can qualify targets. */
export function projectionPhaseAllows(
  phase: Phase,
  mode: DisplayMode,
  interactiveQualified: boolean,
  targets?: { fits: boolean; confident: boolean },
): boolean {
  if (DIAGNOSTIC_PHASES.has(phase)) return true;
  if (phase === "ui-reveal") return mode === "projected";
  if (phase !== "interactive") return false;
  return (mode === "projected" && interactiveQualified ? targets?.fits : targets?.confident) === true;
}

function isVisuallyVisible(element: HTMLElement, root: HTMLElement): boolean {
  let node: HTMLElement | null = element;
  while (node && node !== root) {
    const style = getComputedStyle(node);
    if (style.display === "none" || style.visibility === "hidden" || parseFloat(style.opacity) < 0.05) return false;
    node = node.parentElement;
  }
  return element.offsetWidth > 0 || element.offsetHeight > 0;
}

function localRect(element: HTMLElement, root: HTMLElement): LocalRect {
  let left = 0;
  let top = 0;
  let node: HTMLElement | null = element;
  while (node && node !== root) {
    left += node.offsetLeft;
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  // Offset geometry excludes the reveal's CSS translations. Include every
  // ancestor's current translation so probes measure painted, not final, tiles.
  // Unknown non-translation transforms fail closed instead of inventing a rect.
  node = element;
  while (node && node !== root) {
    const style = getComputedStyle(node);
    const translate = style.translate === "none" ? [] : style.translate.split(/\s+/);
    const resolve = (value: string | undefined, extent: number) => {
      if (!value) return 0;
      if (!/^-?(?:\d+\.?\d*|\.\d+)(?:px|%)?$/.test(value)) return NaN;
      return parseFloat(value) * (value.endsWith("%") ? extent / 100 : 1);
    };
    left += resolve(translate[0], node.offsetWidth);
    top += resolve(translate[1], node.offsetHeight);
    if (style.transform !== "none") {
      const matrix = new DOMMatrixReadOnly(style.transform);
      if (!matrix.is2D || matrix.a !== 1 || matrix.b !== 0 || matrix.c !== 0 || matrix.d !== 1) {
        left = top = NaN;
      } else {
        left += matrix.e;
        top += matrix.f;
      }
    }
    node = node.parentElement;
  }
  return {
    center: { x: left + element.offsetWidth / 2, y: top + element.offsetHeight / 2 },
    width: element.offsetWidth,
    height: element.offsetHeight,
  };
}

/** One persistent semantic display; only its presentation changes. */
export function useDisplayRegistration({
  enabled,
  phase,
  showBootScreen,
  showContent,
  showNav,
}: UseDisplayRegistrationOptions): DisplayRegistration {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const [mode, setMode] = useState<DisplayMode>("flat");
  const modeRef = useRef<DisplayMode>("flat");
  const enabledRef = useRef(enabled);
  const phaseRef = useRef<Phase>(phase);
  const quadRef = useRef<GlassQuad | null>(null);
  const focusInsideRef = useRef(false);
  const candidateSinceRef = useRef<number | null>(null);
  const entryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sourceCoherentRef = useRef(false);
  const interactiveQualifiedRef = useRef(false);
  const pendingRef = useRef(false);
  const metricsRef = useRef<LayoutMetrics>({
    source: { width: 0, height: 0 }, canvas: { width: 0, height: 0 },
    overflow: true, texts: [], links: [], focus: null,
  });

  const setModeImperative = useCallback((next: DisplayMode) => {
    if (modeRef.current === next) return;
    modeRef.current = next;
    const anchor = anchorRef.current;
    if (anchor) anchor.dataset.mode = next;
    if (next === "flat") {
      const surface = surfaceRef.current;
      if (surface) surface.style.transform = "";
    }
    setMode(next);
  }, []);

  /**
   * Imperative pending flag on the existing anchor. It suppresses the detached
   * flat bezel only while a qualified candidate waits on the entry hysteresis.
   * It is never React state: the attribute is written synchronously so its
   * removal can be ordered after matrix/mode promotion in the same task.
   */
  const setPending = useCallback((value: boolean) => {
    if (pendingRef.current === value) return;
    pendingRef.current = value;
    const anchor = anchorRef.current;
    if (!anchor) return;
    if (value) anchor.dataset.projectionPending = "true";
    else delete anchor.dataset.projectionPending;
  }, []);

  const goFlat = useCallback(() => {
    if (entryTimerRef.current !== null) {
      clearTimeout(entryTimerRef.current);
      entryTimerRef.current = null;
    }
    candidateSinceRef.current = null;
    sourceCoherentRef.current = false;
    interactiveQualifiedRef.current = false;
    setPending(false);
    setModeImperative("flat");
  }, [setModeImperative, setPending]);

  /**
   * Layout is read only on explicit refresh events, never in the frame callback.
   * Projection decisions consume these metrics against the 448x269 source
   * homography, so only projected-space measurements are usable: pairing
   * flat-space text centers or font sizes with the projected transform
   * mis-scales every readability check and wrongly rejects qualified
   * candidates at exactly the phase boundary that first reveals the screen.
   * Probes and promoted mode measure in full below; while the DOM is flat the
   * last probed metrics stay authoritative and only the mode-independent
   * canvas size is refreshed, so resize events cannot clobber probe state.
   */
  const refreshMetrics = useCallback(() => {
    const anchor = anchorRef.current;
    const surface = surfaceRef.current;
    const container = containerRef.current;
    if (!anchor || !surface || !container) return;
    if (anchor.dataset.mode !== "projected") {
      metricsRef.current = {
        ...metricsRef.current,
        canvas: { width: container.clientWidth, height: container.clientHeight },
      };
      return;
    }
    const computed = getComputedStyle(surface);
    const cssWidth = parseFloat(computed.width);
    const cssHeight = parseFloat(computed.height);
    const source: Size = {
      width: Number.isFinite(cssWidth) ? cssWidth : surface.offsetWidth,
      height: Number.isFinite(cssHeight) ? cssHeight : surface.offsetHeight,
    };
    const canvas: Size = { width: container.clientWidth, height: container.clientHeight };
    const panel = surface.querySelector<HTMLElement>(".hub-screen-panel");
    let overflow = source.width <= 0 || source.height <= 0 || canvas.width <= 0 || canvas.height <= 0;
    if (panel) overflow = overflow || panel.scrollWidth > panel.clientWidth + 1;
    const bodies = Array.from(surface.querySelectorAll<HTMLElement>(".hub-boot-body, .hub-content-body"))
      .filter((body) => isVisuallyVisible(body, surface));
    overflow = overflow || bodies.some((body) =>
      body.scrollHeight > body.clientHeight + 16 || body.scrollWidth > body.clientWidth + 1);
    const anchors = Array.from(surface.querySelectorAll<HTMLAnchorElement>("nav a"));
    const expectedLinks = anchors.length === EXPECTED_LINK_HASHES.length && anchors.every((link, i) =>
      link.hash === EXPECTED_LINK_HASHES[i] && link.classList.contains("hub-dash-tile") &&
      !link.closest('[inert], [aria-hidden="true"]') && isVisuallyVisible(link, surface));
    const links = expectedLinks ? anchors.map((link) => localRect(link, surface)) : [];
    const texts = Array.from(surface.querySelectorAll<HTMLElement>(
      ".hub-screen-header span, .hub-screen-title, .hub-screen-row, .hub-screen-message, .hub-content-body h3, .hub-content-body p, .hub-content-body a"
    )).filter((node) => isVisuallyVisible(node, surface)).map((node) => {
      const fontPx = parseFloat(getComputedStyle(node).fontSize);
      return { center: localRect(node, surface).center, fontPx: Number.isFinite(fontPx) ? fontPx : 0 };
    }).filter((text) => text.fontPx > 0);
    metricsRef.current = { source, canvas, overflow, texts, links, focus: metricsRef.current.focus };
  }, []);

  const evaluateNow = useCallback((quad: GlassQuad | null, sourceOverride?: Size) => {
    const metrics = metricsRef.current;
    const currentPhase = phaseRef.current;
    if (!enabledRef.current || !quad || metrics.overflow) return null;
    if (!DIAGNOSTIC_PHASES.has(currentPhase) && !REVEAL_PHASES.has(currentPhase)) return null;
    const source = sourceOverride ?? metrics.source;
    const evaluation = evaluateProjectionGeometry(quad, {
      canvas: metrics.canvas,
      source,
    });
    if (!evaluation.confident || !evaluation.homography) return null;
    const h = evaluation.homography;
    if (metrics.texts.length === 0) return null;
    for (const text of metrics.texts) {
      const scale = localScale(h, text.center, text.fontPx / 2);
      const textPx = text.fontPx * Math.min(scale.x, scale.y);
      if (!Number.isFinite(textPx) || textPx < MIN_TEXT_PX) return null;
    }
    const targets = currentPhase === "interactive" ? evaluateProjectedTargets(h, source, metrics.links) : undefined;
    if (!projectionPhaseAllows(currentPhase, modeRef.current, interactiveQualifiedRef.current, targets)) return null;
    if (focusInsideRef.current && metrics.focus) {
      const scale = localScale(h, metrics.focus.center);
      const halfW = (metrics.focus.width * scale.x) / 2 + FOCUS_CLEARANCE_PX;
      const halfH = (metrics.focus.height * scale.y) / 2 + FOCUS_CLEARANCE_PX;
      const point = mapPoint(h, metrics.focus.center);
      const pts = [quad.topLeft, quad.topRight, quad.bottomRight, quad.bottomLeft];
      const minX = Math.min(...pts.map((p) => p.x)) + FOCUS_CLEARANCE_PX;
      const maxX = Math.max(...pts.map((p) => p.x)) - FOCUS_CLEARANCE_PX;
      const minY = Math.min(...pts.map((p) => p.y)) + FOCUS_CLEARANCE_PX;
      const maxY = Math.max(...pts.map((p) => p.y)) - FOCUS_CLEARANCE_PX;
      if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) return null;
      if (point.x - halfW < minX || point.x + halfW > maxX || point.y - halfH < minY || point.y + halfH > maxY) return null;
    }
    return evaluation;
  }, []);

  /**
   * Flips to projected CSS, confirms the real DOM source matches the math and
   * measures layout in that mode, then reverts — all inside one task so no
   * intermediate paint occurs. Also records coherence for the pending preview.
   * The measurement deliberately runs without any visibility suppression:
   * hiding the candidate while measuring would make isVisuallyVisible filter
   * the very texts and bodies this probe must qualify, leaving readability
   * metrics vacuous. Cross-paint suppression stays with the caller's pending
   * flag, which is applied in the same task before the next paint.
   */
  const probeProjection = useCallback((quad: GlassQuad | null) => {
    const anchor = anchorRef.current;
    const surface = surfaceRef.current;
    if (!anchor || !surface) { sourceCoherentRef.current = false; return null; }
    anchor.dataset.mode = "projected";
    const computed = getComputedStyle(surface);
    const cssWidth = parseFloat(computed.width);
    const cssHeight = parseFloat(computed.height);
    const offsetWidth = surface.offsetWidth;
    const offsetHeight = surface.offsetHeight;
    const coherent =
      Math.abs(cssWidth - PROJECTED_SOURCE.width) <= 0.5 &&
      Math.abs(cssHeight - PROJECTED_SOURCE.height) <= 0.5 &&
      offsetWidth === PROJECTED_SOURCE.width &&
      offsetHeight === PROJECTED_SOURCE.height;
    sourceCoherentRef.current = coherent;
    if (!coherent) {
      anchor.dataset.mode = modeRef.current;
      return null;
    }
    refreshMetrics();
    const evaluation = evaluateNow(quad, { width: offsetWidth, height: offsetHeight });
    anchor.dataset.mode = modeRef.current;
    return evaluation;
  }, [evaluateNow, refreshMetrics]);

  const tryEnterProjected = useCallback(() => {
    if (!enabledRef.current || focusInsideRef.current || modeRef.current === "projected") {
      setPending(false);
      return;
    }
    const anchor = anchorRef.current;
    const surface = surfaceRef.current;
    if (!anchor || !surface) { setPending(false); return; }
    const evaluation = probeProjection(quadRef.current);
    if (!evaluation || !evaluation.matrix3d) {
      goFlat();
      return;
    }
    if (surface.style.transform !== evaluation.matrix3d) surface.style.transform = evaluation.matrix3d;
    setModeImperative("projected");
    interactiveQualifiedRef.current = phaseRef.current === "interactive";
    // Same task: matrix and projected source styles are live before suppression
    // lifts, so no flat intermediate frame can paint between them.
    setPending(false);
    candidateSinceRef.current = null;
  }, [goFlat, probeProjection, setModeImperative, setPending]);

  const registerQuad = useCallback((quad: GlassQuad | null) => {
    if (!enabledRef.current) {
      quadRef.current = null;
      goFlat();
      return;
    }
    quadRef.current = quad;
    if (!quad) {
      goFlat();
      return;
    }
    const surface = surfaceRef.current;
    if (modeRef.current === "projected") {
      const evaluation = evaluateNow(quad, metricsRef.current.source);
      if (!evaluation || !evaluation.matrix3d) {
        goFlat();
        return;
      }
      // Identical rewrites are skipped so an idle publisher (or a passive
      // re-evaluation against an unchanged quad) never performs projection
      // writes; the style value is only touched when the matrix moves.
      if (surface && surface.style.transform !== evaluation.matrix3d) {
        surface.style.transform = evaluation.matrix3d;
      }
      interactiveQualifiedRef.current = phaseRef.current === "interactive";
      setPending(false);
      return;
    }
    const now = Date.now();
    if (candidateSinceRef.current === null) {
      candidateSinceRef.current = now;
      // One DOM probe establishes source coherence and projected-mode metrics
      // for this candidate window; per-frame qualification stays pure math.
      probeProjection(quad);
    }
    if (now - candidateSinceRef.current < ENTRY_HYSTERESIS_MS) {
      const qualifies =
        sourceCoherentRef.current === true &&
        evaluateNow(quad, PROJECTED_SOURCE) !== null;
      // Suppress only a qualified candidate in a noninteractive diagnostic
      // phase with no focused dashboard; never a failed/unreadable one.
      setPending(
        qualifies &&
        DIAGNOSTIC_PHASES.has(phaseRef.current) &&
        !focusInsideRef.current
      );
      if (entryTimerRef.current === null) {
        entryTimerRef.current = setTimeout(() => {
          entryTimerRef.current = null;
          tryEnterProjected();
        }, ENTRY_HYSTERESIS_MS - (now - candidateSinceRef.current));
      }
      return;
    }
    tryEnterProjected();
  }, [evaluateNow, goFlat, probeProjection, setPending, tryEnterProjected]);

  const reevaluateLatest = useCallback(() => {
    if (quadRef.current) registerQuad(quadRef.current);
  }, [registerQuad]);

  useEffect(() => {
    enabledRef.current = enabled;
    if (!enabled) { quadRef.current = null; goFlat(); }
  }, [enabled, goFlat]);

  // Phase boundary runs before paint: sync the phase ref and re-evaluate the
  // last published quad in the same task the new phase paints. With the demand
  // frame loop stopped after activation, a passive re-evaluation lands after
  // paint and exposes 1-2 visible flat frames. A qualified candidate reaches
  // pending here through the exact same registerQuad/probe/timer path as a live
  // frame; an unqualified one leaves the intentional flat presentation visible.
  // Any candidate still open from the previous phase (e.g. activation) first
  // discards its stale timer and coherence state through goFlat — its probe
  // described a hidden, differently-laid-out DOM — so the re-evaluation below
  // starts a fresh bounded candidate whose probe re-establishes the 448x269
  // source and real readability metrics in this same pre-paint task, using the
  // cached quad. A promoted display is left untouched (goFlat is guarded).
  useIsomorphicLayoutEffect(() => {
    phaseRef.current = phase;
    if (phase !== "interactive") interactiveQualifiedRef.current = false;
    if (DIAGNOSTIC_PHASES.has(phase) || REVEAL_PHASES.has(phase)) {
      if (modeRef.current === "flat") goFlat();
      refreshMetrics();
      reevaluateLatest();
    }
  }, [goFlat, phase, refreshMetrics, reevaluateLatest]);

  useEffect(() => {
    // Non-projection phases and leaving diagnostics only need cleanup here.
    if (!DIAGNOSTIC_PHASES.has(phase)) setPending(false);
    if (phase === "idle" || phase === "activation") goFlat();
  }, [phase, goFlat, setPending]);

  useEffect(() => {
    const container = containerRef.current;
    const surface = surfaceRef.current;
    if (!container || !surface) return;
    let disposed = false;
    const observer = new ResizeObserver((entries) => {
      refreshMetrics();
      // The candidate probe temporarily resizes the surface to the projected
      // source. Re-evaluate the latest quad only on stable container
      // (viewport/layout) changes so probing cannot feed back into another
      // synchronous probe cycle and create repeated layout reads.
      if (entries.some((entry) => entry.target === containerRef.current)) {
        reevaluateLatest();
      }
    });
    observer.observe(container);
    observer.observe(surface);
    const onResize = () => { refreshMetrics(); reevaluateLatest(); };
    // Visibility/layout transitions may finish after the phase-boundary probe.
    // Re-measure painted anchors then, without changing any phase or timer.
    surface.addEventListener("transitionend", onResize);
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    if (typeof document !== "undefined" && "fonts" in document) {
      // fonts.ready can settle long after unmount; the disposed guard keeps
      // that continuation from re-registering a quad and re-arming the entry
      // timer on a detached tree.
      void document.fonts.ready.then(() => {
        if (disposed) return;
        refreshMetrics();
        reevaluateLatest();
      }).catch(() => {});
    }
    refreshMetrics();
    return () => {
      disposed = true;
      observer.disconnect();
      surface.removeEventListener("transitionend", onResize);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      if (entryTimerRef.current !== null) {
        clearTimeout(entryTimerRef.current);
        entryTimerRef.current = null;
      }
      setPending(false);
    };
  }, [refreshMetrics, reevaluateLatest, setPending]);

  useEffect(() => {
    refreshMetrics();
    reevaluateLatest();
  }, [refreshMetrics, reevaluateLatest, showBootScreen, showContent, showNav]);

  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return;
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement) || !surface.contains(target)) return;
      focusInsideRef.current = true;
      metricsRef.current.focus = localRect(target, surface);
      setPending(false);
    };
    const onFocusOut = () => {
      focusInsideRef.current = false;
      metricsRef.current.focus = null;
      reevaluateLatest();
    };
    surface.addEventListener("focusin", onFocusIn);
    surface.addEventListener("focusout", onFocusOut);
    return () => {
      surface.removeEventListener("focusin", onFocusIn);
      surface.removeEventListener("focusout", onFocusOut);
    };
  }, [reevaluateLatest, setPending]);

  return { containerRef, anchorRef, surfaceRef, sourceStyle: PROJECTED_SOURCE_STYLE, mode, registerQuad };
}
