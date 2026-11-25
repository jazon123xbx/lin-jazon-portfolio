"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { featuredProjectLinks, navLinks, siteConfig } from "@/data/portfolio";
import { requestProjectDialog } from "@/lib/project-dialog-event";
import { cn } from "@/lib/utils";
import { basePath } from "@/lib/base-path";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue";

/** Menu items of the React-owned projects disclosure, in DOM order. */
function getProjectMenuItems(): HTMLElement[] {
  const menu = document.getElementById("projects-menu");
  if (!menu) return [];
  return Array.from(menu.querySelectorAll<HTMLElement>("a[role='menuitem']"));
}

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("portfolio-hub");
  // Where ArrowDown/ArrowUp on the trigger should land focus once the menu
  // is visible; consumed by the effect below on the same commit (no timers).
  const pendingMenuFocusRef = useRef<"first" | "last" | null>(null);

  const closeMenus = useCallback(() => {
    setMobileOpen(false);
    setProjectsOpen(false);
  }, []);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
        setProjectsOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // Outside pointer presses close the projects disclosure; presses on the
  // trigger or inside the menu are left to their own handlers.
  useEffect(() => {
    if (!projectsOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!(event.target instanceof Node)) {
        setProjectsOpen(false);
        return;
      }
      const button = document.getElementById("projects-menu-button");
      const menu = document.getElementById("projects-menu");
      if (button?.contains(event.target) || menu?.contains(event.target)) {
        return;
      }
      setProjectsOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [projectsOpen]);

  // Moves focus into the freshly opened menu on the commit that made it
  // visible, per the stored ArrowDown/ArrowUp intent.
  useEffect(() => {
    if (!projectsOpen) return;
    const position = pendingMenuFocusRef.current;
    if (!position) return;
    pendingMenuFocusRef.current = null;

    const items = getProjectMenuItems();
    const target = position === "first" ? items[0] : items[items.length - 1];
    target?.focus({ preventScroll: true });
  }, [projectsOpen]);

  useEffect(() => {
    const sectionIds = ["portfolio-hub", "projects", "capabilities", "about", "contact"];

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry) {
          setActiveSection(visibleEntry.target.id);
        }
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: [0, 0.1, 0.25, 0.5],
      }
    );

    sectionIds.forEach((id) => {
      const section = document.getElementById(id);

      if (section) {
        observer.observe(section);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  /** True when the home sections are present, visible and interactive. */
  const homeSectionsReady = useCallback((): boolean => {
    if (typeof document === "undefined") return false;
    const sections = document.getElementById("home-sections");
    return Boolean(sections && !sections.hidden && !sections.inert);
  }, []);

  /**
   * Selecting a project closes every menu, then either dispatches the dialog
   * request (home sections ready) or lets the canonical "#id" anchor proceed
   * unchanged — never a premature dialog while the sections are inert.
   */
  const handleProjectLinkClick = useCallback(
    (event: ReactMouseEvent<HTMLAnchorElement>, projectId: string) => {
      setMobileOpen(false);
      setProjectsOpen(false);

      if (!homeSectionsReady()) return;
      event.preventDefault();
      requestProjectDialog({ projectId, opener: event.currentTarget });
    },
    [homeSectionsReady]
  );

  // Click toggles natively; ArrowDown/ArrowUp open the menu and move focus
  // into it (first/last) via the pending-focus effect above.
  const handleProjectsButtonKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLButtonElement>) => {
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      event.preventDefault();

      if (projectsOpen) {
        const items = getProjectMenuItems();
        const target =
          event.key === "ArrowUp" ? items[items.length - 1] : items[0];
        target?.focus({ preventScroll: true });
        return;
      }

      pendingMenuFocusRef.current =
        event.key === "ArrowUp" ? "last" : "first";
      setProjectsOpen(true);
    },
    [projectsOpen]
  );

  // Menu-pattern keys while the menu is open: arrows wrap, Home/End jump,
  // Escape restores the trigger, Tab closes while focus moves on naturally.
  const handleProjectsMenuKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLUListElement>) => {
      const items = getProjectMenuItems();
      if (items.length === 0) return;
      const currentIndex = items.findIndex(
        (item) => item === document.activeElement
      );

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          items[(currentIndex + 1) % items.length].focus({ preventScroll: true });
          break;
        case "ArrowUp":
          event.preventDefault();
          items[(currentIndex - 1 + items.length) % items.length].focus({
            preventScroll: true,
          });
          break;
        case "Home":
          event.preventDefault();
          items[0].focus({ preventScroll: true });
          break;
        case "End":
          event.preventDefault();
          items[items.length - 1].focus({ preventScroll: true });
          break;
        case "Escape":
          event.preventDefault();
          setProjectsOpen(false);
          document
            .getElementById("projects-menu-button")
            ?.focus({ preventScroll: true });
          break;
        case "Tab":
          setProjectsOpen(false);
          break;
      }
    },
    []
  );

  const projectsActive = activeSection === "projects";
  const projectsUnderline = projectsActive && (
    <span
      aria-hidden="true"
      className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-accent-blue"
    />
  );

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-bg-primary/80 backdrop-blur-md">
      <nav
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6"
        aria-label="Primary navigation"
      >
        <a
          href={basePath("/#portfolio-hub")}
          onClick={closeMenus}
          className="text-lg font-bold tracking-widest text-text-primary transition-colors hover:text-accent-blue"
        >
          {siteConfig.name}
        </a>

        {/* ── Single shared primary nav list ─────────────────────
            Desktop (md+): inline horizontal flex inside <nav>; Projects is
            a React-owned disclosure (projects-menu-button/projects-menu —
            legacy dropdown.js IDs are never reused).
            Mobile (<md): hidden by default; when mobileOpen, an absolute
            full-width panel below the header bar with the direct Projects
            anchor plus the three featured project actions. */}
        <ul
          id="mobile-navigation"
          className={cn(
            "gap-1",
            mobileOpen
              ? "flex flex-col absolute left-0 right-0 top-full border-t border-border-subtle bg-bg-primary/95 backdrop-blur-md px-6 py-4 z-50"
              : "hidden",
            "md:flex md:flex-row md:relative md:inset-auto md:items-center md:gap-1 md:border-t-0 md:bg-transparent md:backdrop-blur-none md:px-0 md:py-0 md:z-auto"
          )}
        >
          {navLinks.map((link) => {
            // Projects: direct anchor on mobile, disclosure on desktop.
            if (link.href === "/#projects") {
              return (
                <li key={link.href} className="relative">
                  {/* Mobile (<md): direct section anchor, unchanged behavior. */}
                  <a
                    href={basePath(link.href)}
                    onClick={closeMenus}
                    aria-current={projectsActive ? "location" : undefined}
                    className={cn(
                      "relative rounded-md px-4 py-2 text-sm font-medium transition-colors md:hidden",
                      projectsActive
                        ? "text-accent-blue"
                        : "text-text-secondary hover:text-text-primary"
                    )}
                  >
                    Projects
                    {projectsUnderline}
                  </a>

                  {/* Mobile: featured project actions under the anchor. */}
                  {mobileOpen && (
                    <div className="mt-1 flex flex-col items-stretch gap-1 md:hidden">
                      {featuredProjectLinks.map((project) => (
                        <a
                          key={project.id}
                          href={basePath(project.href)}
                          onClick={(event) =>
                            handleProjectLinkClick(event, project.id)
                          }
                          className={cn(
                            "flex h-11 items-center rounded-md px-3 text-sm text-text-secondary transition-colors hover:bg-bg-surface hover:text-text-primary",
                            focusRing
                          )}
                        >
                          {project.title}
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Desktop (md+): button + menu disclosure, React-owned. */}
                  <button
                    type="button"
                    id="projects-menu-button"
                    aria-haspopup="menu"
                    aria-expanded={projectsOpen}
                    aria-controls="projects-menu"
                    onClick={() => setProjectsOpen((open) => !open)}
                    onKeyDown={handleProjectsButtonKeyDown}
                    className={cn(
                      "relative hidden h-11 items-center gap-1.5 rounded-md px-4 text-sm font-medium transition-colors md:inline-flex",
                      projectsActive
                        ? "text-accent-blue"
                        : "text-text-secondary hover:text-text-primary",
                      focusRing
                    )}
                  >
                    Projects
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 12 8"
                      fill="none"
                      className={cn(
                        "h-2 w-3 transition-transform",
                        projectsOpen && "rotate-180"
                      )}
                    >
                      <path
                        d="M1 1.5 6 6.5 11 1.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {projectsUnderline}
                  </button>

                  <ul
                    id="projects-menu"
                    role="menu"
                    hidden={!projectsOpen}
                    onKeyDown={handleProjectsMenuKeyDown}
                    className="absolute right-0 top-full z-50 mt-2 hidden w-60 rounded-lg border border-border-subtle bg-bg-primary/95 p-2 shadow-xl backdrop-blur-md md:block"
                  >
                    {featuredProjectLinks.map((project) => (
                      <li key={project.id} role="none">
                        <a
                          role="menuitem"
                          href={basePath(project.href)}
                          onClick={(event) =>
                            handleProjectLinkClick(event, project.id)
                          }
                          className={cn(
                            "flex h-11 items-center rounded-md px-3 text-sm text-text-secondary transition-colors hover:bg-bg-surface hover:text-text-primary",
                            focusRing
                          )}
                        >
                          {project.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            }

            const sectionId = link.href.replace("/#", "");
            const isActive = activeSection === sectionId;

            return (
              <li key={link.href}>
                <a
                  href={basePath(link.href)}
                  onClick={closeMenus}
                  aria-current={isActive ? "location" : undefined}
                  className={cn(
                    "relative rounded-md px-4 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "text-accent-blue"
                      : "text-text-secondary hover:text-text-primary"
                  )}
                >
                  {link.label}

                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-accent-blue"
                    />
                  )}
                </a>
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-md text-text-secondary transition-colors hover:text-text-primary md:hidden"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            {mobileOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </nav>
    </header>
  );
}
