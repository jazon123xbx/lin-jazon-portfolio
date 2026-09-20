"use client";

import { useEffect, useState, useCallback } from "react";
import { navLinks, siteConfig } from "@/data/portfolio";
import { cn } from "@/lib/utils";
import { basePath } from "@/lib/base-path";

const projectLinks = [
  { label: "TCGC Student Master", href: "/#tcgc-student-master" },
  { label: "Jazon Collective Market", href: "/#jazon-collective-market" },
  { label: "BlazingHeart", href: "/#blazingheart" },
] as const;

const capabilityLinks = [
  { label: "Frontend Development", href: "/#frontend-development", spotlightMod: "MOD-01" },
  { label: "Mobile Development", href: "/#mobile-development", spotlightMod: "MOD-04" },
  { label: "Game Development", href: "/#game-development", spotlightMod: "MOD-05" },
] as const;

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("portfolio-hub");

  const navigateTo = useCallback((href: string) => {
    const id = href.replace("/#", "");
    const target = document.getElementById(id);
    if (!target) return;

    target.scrollIntoView({ behavior: "smooth", block: "start" });

    const prefixed = basePath(href);
    if (window.location.hash === `#${id}`) {
      history.replaceState(null, "", prefixed);
    } else {
      history.pushState(null, "", prefixed);
    }

    setActiveSection(id);
    setMobileOpen(false);
  }, []);

  // LOCKED: Preserve existing scroll-reset block exactly unchanged
  useEffect(() => {
    const prev = history.scrollRestoration;
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    if (window.location.hash) {
      history.replaceState(null, "", basePath("/"));
    }
    return () => {
      history.scrollRestoration = prev;
    };
  }, []);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

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

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-bg-primary/80 backdrop-blur-md">
      <nav
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6"
        aria-label="Primary navigation"
      >
        <a
          href={basePath("/#portfolio-hub")}
          onClick={(e) => { e.preventDefault(); navigateTo("/#portfolio-hub"); }}
          className="text-lg font-bold tracking-widest text-text-primary transition-colors hover:text-accent-blue"
        >
          {siteConfig.name}
        </a>

        {/* ── Single shared primary nav list ─────────────────────
            Desktop (md+): inline horizontal flex inside <nav>.
            Mobile (<md): hidden by default; when mobileOpen, an
            absolute full-width panel below the header bar.
            Exactly one #dropdownBtn / #dropdownMenu exists here. */}
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
            const sectionId = link.href.replace("/#", "");
            const isActive = activeSection === sectionId;

            if (link.label === "Projects") {
              return (
                <li key={link.href} className="dropdown">
                  <button
                    id="dropdownBtn"
                    type="button"
                    aria-expanded="false"
                    aria-haspopup="true"
                    className={cn(
                      "relative flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "text-accent-blue"
                        : "text-text-secondary hover:text-text-primary"
                    )}
                  >
                    Projects
                    <span
                      id="dropdownArrow"
                      className="text-[10px] leading-none"
                      aria-hidden="true"
                    >
                      &#9660;
                    </span>
                  </button>
                  <ul id="dropdownMenu" className="dropdown-menu" role="menu">
                    {projectLinks.map((project) => (
                      <li key={project.href} role="none">
                        <a
                          href={basePath(project.href)}
                          onClick={(e) => {
                            e.preventDefault();
                            navigateTo(project.href);
                          }}
                          role="menuitem"
                          className="block rounded-md px-4 py-2 text-sm font-medium text-text-secondary hover:bg-bg-surface-elevated hover:text-text-primary transition-colors"
                        >
                          {project.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            }

            if (link.label === "Capabilities") {
              return (
                <li key={link.href} className="dropdown">
                  <button
                    id="capabilitiesDropdownBtn"
                    type="button"
                    aria-expanded="false"
                    aria-haspopup="true"
                    className={cn(
                      "relative flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "text-accent-blue"
                        : "text-text-secondary hover:text-text-primary"
                    )}
                  >
                    Capabilities
                    <span
                      id="capabilitiesDropdownArrow"
                      className="text-[10px] leading-none"
                      aria-hidden="true"
                    >
                      &#9660;
                    </span>
                  </button>
                  <ul id="capabilitiesDropdownMenu" className="dropdown-menu" role="menu">
                    {capabilityLinks.map((cap) => (
                      <li key={cap.href} role="none">
                        <a
                          href={basePath(cap.href)}
                          data-spotlight-mod={cap.spotlightMod}
                          onClick={(e) => {
                            e.preventDefault();
                            setActiveSection("capabilities");
                            setMobileOpen(false);
                          }}
                          role="menuitem"
                          className="block rounded-md px-4 py-2 text-sm font-medium text-text-secondary hover:bg-bg-surface-elevated hover:text-text-primary transition-colors"
                        >
                          {cap.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            }

            return (
              <li key={link.href}>
                <a
                  href={basePath(link.href)}
                  onClick={(e) => { e.preventDefault(); navigateTo(link.href); }}
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
