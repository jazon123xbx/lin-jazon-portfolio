"use client";

/**
 * ProjectShowcase — single-project showcase for the Projects section.
 *
 * The server section passes plain, serializable project snapshots (see
 * Project.toSnapshot) across the client boundary. One project is active at a
 * time; Previous/Next cycle through the list and the numbered selectors jump
 * directly. A native <dialog> shows the details view.
 *
 * Hash behavior:
 * - On mount the current fragment selects the matching project without
 *   rewriting the URL; unknown fragments and #projects fall back to the
 *   first project, also without rewriting the URL.
 * - User selections (Previous/Next/direct) push "#<project-id>" so browser
 *   history keeps one entry per view, and Back/Forward (popstate/hashchange)
 *   restore the matching project.
 * - "#id" is resolved against the current URL, so the configured base path,
 *   pathname and search are preserved exactly.
 * - Navigation (or any surface) can request a dialog through the
 *   `linos:project-dialog-request` window event (see
 *   lib/project-dialog-event). The request's canonical id is validated here,
 *   "#id" history is kept coherent, and the dialog opens only after the
 *   requested render has committed. This component stays the sole owner of
 *   activeIndex, hash, history and the single native dialog.
 */
import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import type { ProjectSnapshot } from "@/domain/project";
import ProjectArtwork from "@/components/ProjectArtwork";
import ProjectMediaGallery from "@/components/ProjectMediaGallery";
import {
  PROJECT_DIALOG_REQUEST_EVENT,
  isProjectDialogRequestEvent,
} from "@/lib/project-dialog-event";
import { cn } from "@/lib/utils";

interface ProjectShowcaseProps {
  projects: readonly ProjectSnapshot[];
}

const statusColors: Record<ProjectSnapshot["status"], string> = {
  Planning: "bg-text-muted/20 text-text-secondary",
  "In Development": "bg-accent-blue/20 text-accent-blue",
  Completed: "bg-green-500/20 text-green-400",
  "Case Study": "bg-accent-gold/20 text-accent-gold",
};

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue";

export default function ProjectShowcase({ projects }: ProjectShowcaseProps) {
  const count = projects.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const [dialogSession, setDialogSession] = useState({ key: 0, isOpen: false });
  const initialHashAppliedRef = useRef(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const savedOverflowRef = useRef("");
  // True while this component owns the body overflow inline value, so a
  // rapid close-then-reopen keeps the true base overflow (see openDialogFor).
  const overflowOwnedRef = useRef(false);
  // Pending navigation request: opener in a ref (DOM element), and the
  // requested index/id plus a monotonically increasing sequence in state so
  // the open happens in the effect below, after the requested render has
  // committed. The seq also retriggers for requests targeting the
  // already-active project; consumption is tracked via ref so the effect body
  // never calls setState.
  const pendingOpenerRef = useRef<HTMLElement | null>(null);
  const requestSeqRef = useRef(0);
  const consumedSeqRef = useRef(0);
  const [pendingDialogRequest, setPendingDialogRequest] = useState<{
    index: number;
    projectId: string;
    seq: number;
  } | null>(null);

  /** Selects an index; optionally announces it through the polite live region. */
  const applySelection = useCallback(
    (index: number, announce: boolean) => {
      setActiveIndex((current) => (current === index ? current : index));
      const project = projects[index];
      if (announce && project) {
        setAnnouncement(
          `Showing project ${index + 1} of ${count}: ${project.title}.`
        );
      }
    },
    [projects, count]
  );

  /** Maps the current fragment to a project index, or -1 when it matches none. */
  const readHashIndex = useCallback((): number => {
    let id = "";
    try {
      id = decodeURIComponent(window.location.hash.slice(1));
    } catch {
      return -1; // Malformed fragment: no project match.
    }
    if (!id) return -1;
    return projects.findIndex((project) => project.id === id);
  }, [projects]);

  // Initial fragment: select the hashed project (or the first one) without
  // writing the URL. The ref guard keeps this a one-time, idempotent read.
  useEffect(() => {
    if (initialHashAppliedRef.current) return;
    initialHashAppliedRef.current = true;
    const index = readHashIndex();
    applySelection(index >= 0 ? index : 0, false);
  }, [applySelection, readHashIndex]);

  // History navigation (Back/Forward, external fragment edits) restores the
  // matching project without pushing new entries. Both events can fire for a
  // single navigation; selecting the same index twice is a no-op.
  useEffect(() => {
    function syncFromLocation() {
      // Close an open dialog before the active project changes so focus and
      // body overflow restore against the outgoing DOM.
      if (dialogRef.current?.open) {
        dialogRef.current.close();
      }
      const index = readHashIndex();
      applySelection(index >= 0 ? index : 0, true);
    }

    window.addEventListener("popstate", syncFromLocation);
    window.addEventListener("hashchange", syncFromLocation);

    return () => {
      window.removeEventListener("popstate", syncFromLocation);
      window.removeEventListener("hashchange", syncFromLocation);
    };
  }, [applySelection, readHashIndex]);

  const selectProject = useCallback(
    (index: number) => {
      if (index === activeIndex) return;
      // "#id" resolves against the current URL, preserving base path,
      // pathname and search; the hash is the only thing that changes.
      window.history.pushState(null, "", `#${projects[index].id}`);
      applySelection(index, true);
    },
    [activeIndex, projects, applySelection]
  );

  const handlePrevious = useCallback(() => {
    selectProject((activeIndex - 1 + count) % count);
  }, [activeIndex, count, selectProject]);

  const handleNext = useCallback(() => {
    selectProject((activeIndex + 1) % count);
  }, [activeIndex, count, selectProject]);

  /** Core open path for the single dialog: overflow save + showModal. */
  const openDialogFor = useCallback((opener: HTMLElement | null) => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;

    // React does not render the autofocus attribute, but the dialog focusing
    // steps need it to land focus on the close button when showModal runs.
    closeButtonRef.current?.setAttribute("autofocus", "");

    // Exact body overflow restoration: save the full inline value first.
    // The ownership flag keeps the true base value when a deliberate close
    // (project-switch request) is followed by a reopen before the queued
    // close event has run.
    if (!overflowOwnedRef.current) {
      savedOverflowRef.current = document.body.style.overflow;
      overflowOwnedRef.current = true;
    }
    openerRef.current = opener;
    document.body.style.overflow = "hidden";

    dialog.showModal();
    setDialogSession((current) => ({ key: current.key + 1, isOpen: true }));
  }, []);

  const openDetails = useCallback(() => {
    openDialogFor(
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    );
  }, [openDialogFor]);

  /**
   * Navigation "open this project" requests: validate the canonical id,
   * close the current dialog first when switching, keep "#id" history
   * coherent (never a duplicate entry when the hash already targets the
   * project), then defer opening to the effect below so the dialog opens
   * only after the requested render has committed.
   */
  const handleDialogRequest = useCallback(
    (event: Event) => {
      if (!isProjectDialogRequestEvent(event)) return;
      const detail = event.detail;
      const index = projects.findIndex(
        (project) => project.id === detail.projectId
      );
      if (index < 0) return; // Unknown id: ignore, never open a stale dialog.

      if (dialogRef.current?.open && index !== activeIndex) {
        dialogRef.current.close();
      }

      let currentId = "";
      try {
        currentId = decodeURIComponent(window.location.hash.slice(1));
      } catch {
        currentId = ""; // Malformed fragment: still safe to push the target.
      }
      if (currentId !== detail.projectId) {
        // "#id" resolves against the current URL, preserving base path,
        // pathname and search; the hash is the only thing that changes.
        window.history.pushState(null, "", `#${detail.projectId}`);
      }

      pendingOpenerRef.current = detail.opener ?? null;
      requestSeqRef.current += 1;
      setPendingDialogRequest({
        index,
        projectId: detail.projectId,
        seq: requestSeqRef.current,
      });
      applySelection(index, index !== activeIndex);
    },
    [projects, activeIndex, applySelection]
  );

  useEffect(() => {
    window.addEventListener(PROJECT_DIALOG_REQUEST_EVENT, handleDialogRequest);
    return () => {
      window.removeEventListener(
        PROJECT_DIALOG_REQUEST_EVENT,
        handleDialogRequest
      );
    };
  }, [handleDialogRequest]);

  // Opens the requested dialog only after the requested project's render has
  // committed (the request and its selection share one React batch).
  useEffect(() => {
    if (!pendingDialogRequest) return;
    if (pendingDialogRequest.seq === consumedSeqRef.current) return;
    if (activeIndex !== pendingDialogRequest.index) return; // Not committed yet.

    consumedSeqRef.current = pendingDialogRequest.seq;
    const opener = pendingOpenerRef.current;
    pendingOpenerRef.current = null;
    openDialogFor(opener);
  }, [pendingDialogRequest, activeIndex, openDialogFor]);

  const closeDetails = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  /** Focuses el when it is connected and actually accepts focus. */
  const restoreFocusTo = useCallback((element: HTMLElement | null): boolean => {
    if (!element || !element.isConnected) return false;
    element.focus({ preventScroll: true });
    return document.activeElement === element;
  }, []);

  // Runs for every native close path, including Escape and close().
  const handleDialogClose = useCallback(() => {
    // A deliberate project-switch close can be immediately followed by a
    // reopen; that newer open owns overflow/focus now, so skip stale events.
    if (dialogRef.current?.open) return;

    setDialogSession((current) => ({ ...current, isOpen: false }));
    document.body.style.overflow = savedOverflowRef.current;
    savedOverflowRef.current = "";
    overflowOwnedRef.current = false;

    const opener = openerRef.current;
    openerRef.current = null;
    if (restoreFocusTo(opener)) return;

    // Nav-menu openers are hidden when their menu closes on selection;
    // fall back to the nav trigger, then the active Details button/article.
    if (restoreFocusTo(document.getElementById("projects-menu-button"))) {
      return;
    }

    const detailsButton = document.querySelector<HTMLElement>(
      "article[id] button[aria-haspopup='dialog']"
    );
    if (restoreFocusTo(detailsButton)) return;

    const article = document.querySelector<HTMLElement>("article[id]");
    if (article) {
      // Same dynamic tabindex pattern as the deferred hash handoff.
      if (!article.hasAttribute("tabindex")) {
        article.setAttribute("tabindex", "-1");
      }
      restoreFocusTo(article);
    }
  }, [restoreFocusTo]);

  // Backdrop clicks land on the dialog element itself; content clicks do not.
  const handleDialogClick = useCallback(
    (event: MouseEvent<HTMLDialogElement>) => {
      if (event.target === dialogRef.current) {
        closeDetails();
      }
    },
    [closeDetails]
  );

  if (count === 0) return null;

  const activeIndexSafe = Math.min(Math.max(activeIndex, 0), count - 1);
  const active = projects[activeIndexSafe];

  return (
    // Card + controls share one grid: at lg the Previous/Next icon buttons
    // flank the card in safe side gutters, vertically centered; below lg
    // everything folds into one compact row. The sr-only status and dialog
    // children are out of flow (absolute / display:none) and take no cells.
    <div className="grid grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center gap-x-2 gap-y-4 lg:grid-cols-[3rem_minmax(0,1fr)_3rem] lg:gap-x-6">
      {/* The single active row keeps id and the `group/project` token so the
          deferred hash handoff can focus this exact element. */}
      <article
        id={active.id}
        className="group/project col-span-3 grid grid-cols-1 gap-6 rounded-lg border border-border-subtle bg-bg-surface p-5 transition-all duration-300 hover:border-border-accent hover:bg-bg-surface-elevated sm:p-6 lg:col-span-1 lg:col-start-2 lg:row-start-1 lg:grid-cols-12"
      >
        {/* Artwork first in the DOM: stacked on top below lg, left column at lg. */}
        <div className="lg:col-span-7">
          <ProjectArtwork projectId={active.id} className="aspect-[4/3]" />
        </div>

        <div className="flex flex-col justify-center lg:col-span-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <span className="ty-eyebrow text-text-muted">{active.category}</span>
            <span
              className={cn(
                "ty-chip shrink-0 rounded px-3 py-1",
                statusColors[active.status]
              )}
            >
              {active.status}
            </span>
          </div>

          <h3 className="ty-card-title mb-2 text-text-primary transition-colors duration-300">
            {active.title}
          </h3>
          <p className="ty-body mb-4 text-text-secondary">{active.description}</p>

          <div className="mb-5 flex flex-wrap gap-2">
            {active.tags.map((tag) => (
              <span
                key={tag}
                className="ty-chip rounded border border-border-subtle bg-bg-primary px-2.5 py-1 text-text-secondary"
              >
                {tag}
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={openDetails}
            aria-haspopup="dialog"
            className={cn(
              "inline-flex h-11 items-center justify-center self-start rounded-md bg-accent-blue px-5 text-sm font-medium text-white transition-colors hover:bg-accent-blue-dim",
              focusRing
            )}
          >
            View Project Details
          </button>
        </div>
      </article>

      {/* Showcase controls: 44px icon-only Previous/Next flank the card in
          the lg gutters; below lg they share one compact 3-column row with
          the centered numbered selectors (the single selector group). The
          redundant visible "01 / 03" counter was removed; the polite live
          region below and aria-current remain. */}
      <button
        type="button"
        onClick={handlePrevious}
        aria-label="Previous project"
        className={cn(
          "col-start-1 row-start-2 inline-flex h-11 w-11 items-center justify-center rounded-md border border-border-subtle bg-bg-surface text-lg leading-none text-text-secondary transition-colors hover:border-border-accent hover:text-text-primary lg:row-start-1",
          focusRing
        )}
      >
        <span aria-hidden="true">&#8249;</span>
      </button>

      <div
        role="group"
        aria-label="Select a project"
        className="col-start-2 row-start-2 flex items-center justify-center gap-2 justify-self-center"
      >
        {projects.map((project, index) => (
          <button
            key={project.id}
            type="button"
            onClick={() => selectProject(index)}
            aria-label={`Show project ${index + 1}: ${project.title}`}
            aria-current={index === activeIndexSafe ? "true" : undefined}
            className={cn(
              "inline-flex h-11 w-11 items-center justify-center rounded-md border font-mono text-xs transition-colors",
              index === activeIndexSafe
                ? "border-accent-blue bg-accent-blue/10 text-accent-blue"
                : "border-border-subtle bg-bg-surface text-text-secondary hover:border-border-accent hover:text-text-primary",
              focusRing
            )}
          >
            {String(index + 1).padStart(2, "0")}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={handleNext}
        aria-label="Next project"
        className={cn(
          "col-start-3 row-start-2 inline-flex h-11 w-11 items-center justify-center rounded-md border border-border-subtle bg-bg-surface text-lg leading-none text-text-secondary transition-colors hover:border-border-accent hover:text-text-primary lg:row-start-1",
          focusRing
        )}
      >
        <span aria-hidden="true">&#8250;</span>
      </button>

      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>

      {/* Native modal dialog: Escape, focus containment and background inert
          behavior come from showModal itself. No open/close animation, so the
          reduced-motion presentation is instant. */}
      <dialog
        ref={dialogRef}
        onClose={handleDialogClose}
        onClick={handleDialogClick}
        aria-labelledby="project-dialog-title"
        className="m-auto max-h-none w-[calc(100%-1rem)] max-w-[1120px] overflow-visible bg-transparent p-0 backdrop:bg-black/70 backdrop:backdrop-blur-sm"
      >
        <div data-project-dialog-panel className="max-h-[calc(100dvh-1rem)] overflow-y-auto overscroll-contain scroll-pt-28 rounded-xl border border-border-subtle bg-bg-surface text-left shadow-2xl [scrollbar-color:#4b5563_transparent] [scrollbar-width:thin]">
          <div data-project-dialog-header className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-border-subtle bg-bg-surface p-3 sm:px-5 sm:py-4">
            <div className="min-w-0">
              <span className="ty-eyebrow text-text-muted">{active.category}</span>
              <h3 id="project-dialog-title" className="ty-card-title mt-1 break-words text-text-primary">
                {active.title}
              </h3>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={closeDetails}
              aria-label="Close details"
              className={cn(
                "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border-subtle text-text-secondary transition-colors hover:border-border-accent hover:text-text-primary",
                focusRing
              )}
            >
              <span aria-hidden="true">&#10005;</span>
            </button>
          </div>

          <div className="space-y-5 p-3 sm:p-5">
            {active.media.length === 0 && (
              <ProjectArtwork projectId={active.id} className="aspect-[4/3]" />
            )}

            <dl>
              <div>
                <dt className="ty-eyebrow text-accent-blue">Overview</dt>
                <dd className="ty-body mt-1 text-text-secondary">
                  {active.description}
                </dd>
              </div>
            </dl>

            <div className={cn("grid min-w-0 gap-5", active.media.length > 0 && "lg:grid-cols-[minmax(0,1fr)_240px]")}>

            {dialogSession.isOpen && active.media.length > 0 && (
              <div className="min-w-0">
                <ProjectMediaGallery
                  key={`${active.id}:${dialogSession.key}`}
                  media={active.media}
                />
              </div>
            )}

            <dl className="min-w-0 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <div>
                  <dt className="ty-eyebrow text-accent-blue">Status</dt>
                  <dd className="mt-1">
                    <span
                      className={cn(
                        "ty-chip inline-block rounded px-3 py-1",
                        statusColors[active.status]
                      )}
                    >
                      {active.status}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="ty-eyebrow text-accent-blue">Category</dt>
                  <dd className="mt-1 text-sm text-text-secondary">
                    {active.category}
                  </dd>
                </div>
              </div>

              <div>
                <dt className="ty-eyebrow text-accent-blue">Stack</dt>
                <dd className="mt-2 flex flex-wrap gap-2">
                  {active.tags.map((tag) => (
                    <span
                      key={tag}
                      className="ty-chip rounded border border-border-subtle bg-bg-primary px-2.5 py-1 text-text-secondary"
                    >
                      {tag}
                    </span>
                  ))}
                </dd>
              </div>

            </dl>
            </div>
          </div>
        </div>
      </dialog>
    </div>
  );
}
