/**
 * Tiny, dependency-free bridge for "open this project's dialog" requests.
 *
 * Navigation dispatches the request; ProjectShowcase — the sole owner of the
 * dialog, active project, hash and history — listens and decides. This keeps
 * the dialog a single-owner component while letting any surface request it.
 *
 * Client-neutral: no "use client" needed, no provider/context, and every
 * window access is guarded so the module is safe to import anywhere.
 */

/** Stable event name for project dialog open requests. */
export const PROJECT_DIALOG_REQUEST_EVENT = "linos:project-dialog-request";

/** Payload carried by {@link PROJECT_DIALOG_REQUEST_EVENT}. */
export interface ProjectDialogRequestDetail {
  /** Canonical project id; the listener validates it against its own data. */
  projectId: string;
  /** Element that triggered the request, used for focus restoration. */
  opener?: HTMLElement | null;
}

export type ProjectDialogRequestEvent = CustomEvent<ProjectDialogRequestDetail>;

/**
 * Dispatches a project dialog request on `window`. Returns false when there
 * is no window (SSR/prerender) instead of throwing.
 */
export function requestProjectDialog(detail: ProjectDialogRequestDetail): boolean {
  if (typeof window === "undefined") return false;
  const event = new CustomEvent<ProjectDialogRequestDetail>(
    PROJECT_DIALOG_REQUEST_EVENT,
    { detail }
  );
  return window.dispatchEvent(event);
}

/** Type guard narrowing a DOM Event to a project dialog request. */
export function isProjectDialogRequestEvent(
  event: Event
): event is ProjectDialogRequestEvent {
  return (
    event.type === PROJECT_DIALOG_REQUEST_EVENT &&
    event instanceof CustomEvent &&
    typeof (event.detail as ProjectDialogRequestDetail | null)?.projectId ===
      "string"
  );
}
