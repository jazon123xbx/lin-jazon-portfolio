"use client";

import { cn } from "@/lib/utils";
import { basePath } from "@/lib/base-path";
import type { EntryPresentation } from "./HomeEntryShell";

type DisplayPhase = EntryPresentation["phase"];

/* ── Screen overlay links ───────────────────────────────────── */

const overlayLinks = [
  { label: "About", href: "/#about" },
  { label: "Projects", href: "/#projects" },
  { label: "Capabilities", href: "/#capabilities" },
  { label: "Contact", href: "/#contact" },
];

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

export interface LinOsDisplayProps {
  bootPhase: DisplayPhase;
  bootLineIndex: number;
  checkLineIndex: number;
  showBootScreen: boolean;
  showContent: boolean;
  showNav: boolean;
}

/**
 * The single persistent, semantic LIN.OS screen display.
 *
 * This component is a faithful extraction of the masthead, boot/check/access/
 * welcome bodies and the final dashboard from HubExperience. It owns no timers
 * and no entrance state: HomeEntryShell stays authoritative. The same DOM node
 * (ids, links, order, inert/tab semantics and 7/5 cadence) is rendered for both
 * the WebGL and static renderers and in both display modes.
 */
export default function LinOsDisplay({
  bootPhase,
  bootLineIndex,
  checkLineIndex,
  showBootScreen,
  showContent,
  showNav,
}: LinOsDisplayProps) {
  return (
    <div className="hub-screen-panel" data-phase={bootPhase} hidden={!showBootScreen && !showContent}>
      <div className="hub-screen-header" aria-hidden="true">
        <span>LIN.OS</span><span>LOCAL SESSION</span>
      </div>
      {showBootScreen && (
        <div
          className="hub-screen-body hub-boot-body"
          aria-hidden="true"
        >
          {/* ── Booting lines ── */}
          {bootPhase === "booting" && (
            <div>
              <div className="hub-screen-title">
                LIN.OS BOOT SEQUENCE
              </div>
              <div className="hub-screen-rows">
                {BOOT_LINES.map((line, index) => (
                  <div
                    key={line}
                    className="hub-screen-row"
                    style={{ visibility: index < bootLineIndex ? "visible" : "hidden" }}
                  >
                    <span className="hub-row-marker">&gt;</span>
                    <span>{line}</span>
                    <span className="hub-row-status">OK</span>
                  </div>
                ))}
                {bootLineIndex < BOOT_LINES.length && (
                  <span className="hub-screen-cursor animate-pulse" style={{ top: `calc(${bootLineIndex} * var(--hub-row-pitch, 20px))` }}>_</span>
                )}
              </div>
            </div>
          )}

          {/* ── System check ── */}
          {bootPhase === "system-check" && (
            <div>
              <div className="hub-screen-title">
                SYSTEM CHECK
              </div>
              <div className="hub-screen-rows">
                {SYSTEM_CHECK_LINES.map((item, index) => (
                  <div
                    key={item.label}
                    className="hub-screen-row"
                    style={{ visibility: index < checkLineIndex ? "visible" : "hidden" }}
                  >
                    <span className="hub-row-marker">&gt;</span>
                    <span>{item.label}</span>
                    <span className="hub-row-status">{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Access granted ── */}
          {bootPhase === "access-granted" && (
            <div className="hub-screen-message">
              <div className="hub-screen-title text-accent-gold">
                [ ACCESS GRANTED ]
              </div>
            </div>
          )}

          {/* ── Welcome hold ── */}
          {(bootPhase === "welcome-hold" || bootPhase === "camera-push") && (
            <div className="hub-screen-message">
              <div className="hub-screen-title">
                WELCOME, USER.
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Screen overlay — welcome content + navigation ── */}
      <div
        className={cn(
          "hub-screen-body hub-content-body transition-opacity duration-300 ease-out",
          showContent ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-hidden={!showContent}
        inert={!showNav}
      >
        <div className="text-center">
          {/* Title — stagger clip reveal */}
          <h3
            id="hub-welcome"
            tabIndex={-1}
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
              "hub-projected-redundant mt-0.5 text-[11px] leading-snug text-white/70 sm:hidden",
              "transition-all duration-500 delay-100",
              showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            )}
          >
            <span className="text-accent-blue">Creative Developer &amp; Problem Solver</span>
          </p>
          <p
            className={cn(
              "hub-projected-redundant mt-1 text-[11px] font-medium uppercase tracking-wider text-white/50 sm:hidden",
              "transition-all duration-500 delay-150",
              showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            )}
          >
            Choose a section to explore.
          </p>
          <p
            className={cn(
              "hub-projected-subtitle mt-0.5 hidden text-[11px] leading-snug text-white/70 sm:block sm:text-xs",
              "transition-all duration-500 delay-100",
              showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            )}
          >
            <span className="text-accent-blue">Creative Developer &amp; Problem Solver</span>
          </p>
          <p
            className={cn(
              "hub-projected-redundant mt-0.5 hidden text-[11px] leading-snug text-white/70 sm:block sm:text-xs",
              "transition-all duration-500 delay-200",
              showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            )}
          >
            Turning ideas into practical digital experiences.
          </p>
          <p
            className={cn(
              "hub-projected-redundant mt-0.5 hidden text-[10px] font-medium uppercase tracking-wider text-white/50 sm:block sm:text-[10px]",
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
                  href={basePath(link.href)}
                  tabIndex={showNav ? undefined : -1}
                  className={cn(
                    "hub-dash-tile flex min-h-[44px] items-center justify-center rounded-lg",
                    "border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-medium text-white/90",
                    "backdrop-blur-sm transition-colors",
                    "hover:border-white/30 hover:bg-white/20 hover:text-white",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue",
                    "sm:text-xs"
                  )}
                >
                  <span className="hub-dash-bracket mr-1.5 text-accent-blue/50 text-[9px]" aria-hidden="true">[</span>
                  {link.label}
                  <span className="hub-dash-bracket ml-1.5 text-accent-blue/50 text-[9px]" aria-hidden="true">]</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
