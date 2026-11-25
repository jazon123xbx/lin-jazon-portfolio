"use client";

import { useCallback, useEffect, useReducer, useRef, useSyncExternalStore, type ReactNode } from "react";
import Script from "next/script";
import Navigation from "./Navigation";
import Footer from "./Footer";
import PortfolioHub from "./PortfolioHub";
import { basePath } from "@/lib/base-path";

const phases = ["idle", "activation", "booting", "system-check", "access-granted", "welcome-hold", "camera-push", "ui-reveal", "interactive"] as const;
type Phase = typeof phases[number];
type Renderer = "pending" | "ready" | "fallback";
interface EntryState { phase: Phase; renderer: Renderer; bootLineIndex: number; checkLineIndex: number; openRequested: boolean }
type Event = { type: "explore" } | { type: "ready" | "fallback" | "opened" } | { type: "advance"; from: Phase } | { type: "line"; phase: Phase; count: number } | { type: "reduce" };
const initialState: EntryState = { phase: "idle", renderer: "pending", bootLineIndex: 0, checkLineIndex: 0, openRequested: false };

// Expected phase/count guards give timers and renderer callbacks one owner.
// Duplicate or late events cannot replay or skip the entrance.
function reducer(state: EntryState, event: Event): EntryState {
  switch (event.type) {
    case "explore": return state.phase === "idle" ? { ...state, phase: "activation", openRequested: true } : state;
    case "ready": return state.renderer === "pending" ? { ...state, renderer: "ready" } : state;
    case "fallback": return state.renderer !== "fallback" ? { ...state, renderer: "fallback" } : state;
    case "opened": return state.phase === "activation" && state.renderer === "ready" ? { ...state, phase: "booting" } : state;
    case "reduce": return state.openRequested && state.phase !== "interactive" ? { ...state, phase: "interactive" } : state;
    case "advance": {
      if (state.phase !== event.from) return state;
      const next = phases[phases.indexOf(state.phase) + 1];
      return next ? { ...state, phase: next } : state;
    }
    case "line": {
      if (state.phase !== event.phase) return state;
      if (event.phase === "booting" && event.count === state.bootLineIndex && event.count < 7) return { ...state, bootLineIndex: event.count + 1 };
      if (event.phase === "system-check" && event.count === state.checkLineIndex && event.count < 5) return { ...state, checkLineIndex: event.count + 1 };
      return state;
    }
  }
}

function subscribeMotion(callback: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
const motionSnapshot = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export interface EntryPresentation extends EntryState {
  reducedMotion: boolean;
  onExplore: () => void;
  onReady: () => void;
  onFailure: () => void;
  onOpened: () => void;
}

export default function HomeEntryShell({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const reducedMotion = useSyncExternalStore(subscribeMotion, motionSnapshot, () => false);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const handedOff = useRef(false);
  const unlocked = state.phase === "interactive";
  const onReady = useCallback(() => dispatch({ type: "ready" }), []);
  const onFailure = useCallback(() => dispatch({ type: "fallback" }), []);
  const onOpened = useCallback(() => dispatch({ type: "opened" }), []);
  const onExplore = useCallback(() => {
    statusRef.current?.focus({ preventScroll: true });
    dispatch({ type: "explore" });
  }, []);

  // Slow imports and stalled contexts have bounded deadlines. Fallback is
  // terminal for this mount, so late readiness cannot replace it.
  useEffect(() => {
    if (state.renderer !== "pending") return;
    const timer = setTimeout(onFailure, 5000);
    return () => clearTimeout(timer);
  }, [state.renderer, onFailure]);

  useEffect(() => {
    if (state.phase !== "activation" || state.renderer === "pending") return;
    const timer = setTimeout(() => {
      if (state.renderer === "ready") onFailure();
      dispatch({ type: "advance", from: "activation" });
    }, state.renderer === "fallback" ? 1800 : 4000);
    return () => clearTimeout(timer);
  }, [state.phase, state.renderer, onFailure]);

  useEffect(() => {
    if (!state.openRequested || !reducedMotion || unlocked) return;
    const timer = setTimeout(() => dispatch({ type: "reduce" }), 0);
    return () => clearTimeout(timer);
  }, [state.openRequested, reducedMotion, unlocked]);

  useEffect(() => {
    const phase = state.phase;
    const bootLineIndex = state.bootLineIndex;
    const checkLineIndex = state.checkLineIndex;
    let delay: number;
    let event: Event = { type: "advance", from: phase };
    if (phase === "booting") {
      delay = bootLineIndex < 7 ? 180 : 200;
      if (bootLineIndex < 7) event = { type: "line", phase, count: bootLineIndex };
    } else if (phase === "system-check") {
      delay = checkLineIndex < 5 ? 140 : 200;
      if (checkLineIndex < 5) event = { type: "line", phase, count: checkLineIndex };
    } else {
      const delays: Partial<Record<Phase, number>> = { "access-granted": 700, "welcome-hold": 900, "camera-push": 700, "ui-reveal": 400 };
      const nextDelay = delays[phase];
      if (nextDelay === undefined) return;
      delay = nextDelay;
    }
    const timer = setTimeout(() => dispatch(event), delay);
    return () => clearTimeout(timer);
  }, [state.phase, state.bootLineIndex, state.checkLineIndex]);

  // Read the current fragment only after entry, including edits during boot.
  // Hidden SSR destinations never auto-enter; unknown hashes use welcome.
  useEffect(() => {
    if (!unlocked || handedOff.current) return;
    handedOff.current = true;
    let id = "";
    try { id = decodeURIComponent(window.location.hash.slice(1)); } catch { /* malformed fragment: use welcome */ }
    const candidate = id ? document.getElementById(id) : null;
    const valid = candidate?.matches("#portfolio-hub, #home-sections section[id], #home-sections [id][class~='group/project'], #home-sections .skill-module[id]");
    const target = valid ? candidate : document.getElementById("hub-welcome");
    if (!target) return;
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
    if (valid) target.scrollIntoView({ behavior: "instant", block: "start" });
    else window.scrollTo({ top: 0, behavior: "instant" });
  }, [unlocked]);

  const presentation: EntryPresentation = { ...state, reducedMotion, onExplore, onReady, onFailure, onOpened };
  return (
    <div className="home-entry" data-entry-locked={unlocked ? undefined : "true"}>
      <div className="entry-chrome" hidden={!unlocked} inert={!unlocked}><Navigation /></div>
      <main>
        <PortfolioHub entry={presentation} />
        <p ref={statusRef} tabIndex={-1} role="status" aria-live="polite" className="sr-only">
          {state.phase === "idle" ? "Select Explore to enter the portfolio." : unlocked ? "Portfolio ready." : "Opening portfolio. Please wait."}
        </p>
        <noscript><p className="entry-noscript">JavaScript is required for this interactive entrance. Enable JavaScript, reload, and select Explore to view the portfolio.</p></noscript>
        <div id="home-sections" hidden={!unlocked} inert={!unlocked}>{children}</div>
      </main>
      <div hidden={!unlocked} inert={!unlocked}><Footer /></div>
      {unlocked && <Script id="home-dropdown" src={basePath("/dropdown.js")} strategy="afterInteractive" />}
    </div>
  );
}
