"use client";

import { useRef, useState, type CSSProperties } from "react";
import type { ProjectMedia } from "@/data/portfolio";
import { basePath } from "@/lib/base-path";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue";

function mediaLabel(media: ProjectMedia, index: number): string {
  return media.label?.trim() || `${media.type === "video" ? "Video" : "Image"} ${index + 1}`;
}

type MediaLoadState = "loading" | "loaded" | "error";

function SelectedMedia({ media, state, onStateChange }: {
  media: ProjectMedia;
  state: MediaLoadState;
  onStateChange: (state: MediaLoadState) => void;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const assetRef = useRef<HTMLImageElement | HTMLVideoElement | null>(null);
  const [attempt, setAttempt] = useState(0);
  const geometry: CSSProperties | undefined = media.width && media.height
    ? {
        width: `min(100%, ${media.width}px, calc(var(--gallery-height) * ${media.width / media.height}))`,
        aspectRatio: `${media.width} / ${media.height}`,
      }
    : undefined;

  return (
    <div className="flex min-w-0 justify-center [--gallery-height:min(520px,62dvh)] [@media(max-height:480px)_and_(orientation:landscape)]:[--gallery-height:320px]">
      <div ref={stageRef} tabIndex={-1} role="group" aria-label="Selected gallery media" style={geometry} className={`relative max-w-full overflow-hidden rounded-lg border border-border-subtle bg-bg-primary ${focusRing} ${!geometry && state !== "loaded" ? "min-h-32 min-w-40" : ""}`}>
        {media.type === "video" ? (
          <video
            key={attempt}
            ref={(asset) => { assetRef.current = asset; }}
            src={basePath(media.src)}
            width={media.width}
            height={media.height}
            controls
            preload="metadata"
            aria-label={media.alt}
            onLoadedMetadata={(event) => {
              if (event.currentTarget === assetRef.current) onStateChange("loaded");
            }}
            onError={(event) => {
              if (event.currentTarget === assetRef.current) onStateChange("error");
            }}
            className={`block h-auto max-h-[var(--gallery-height)] max-w-full object-contain ${geometry ? "w-full" : "w-auto"}`}
          />
        ) : (
          <img
            key={attempt}
            ref={(asset) => { assetRef.current = asset; }}
            src={basePath(media.src)}
            alt={media.alt}
            width={media.width}
            height={media.height}
            loading="lazy"
            decoding="async"
            onLoad={(event) => {
              if (event.currentTarget === assetRef.current) onStateChange("loaded");
            }}
            onError={(event) => {
              if (event.currentTarget === assetRef.current) onStateChange("error");
            }}
            className={`block h-auto max-h-[var(--gallery-height)] max-w-full object-contain ${geometry ? "w-full" : "w-auto"} ${state === "error" ? "invisible" : ""}`}
          />
        )}
        {state === "loading" && (
          <span className="pointer-events-none absolute left-2 top-2 rounded bg-bg-surface px-2 py-1 text-xs text-text-secondary">Loading…</span>
        )}
        {state === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-bg-primary p-2 text-center text-xs text-text-secondary">
            <p>Unable to load this media.</p>
            <button
              type="button"
              onClick={() => {
                // Transfer focus before Retry unmounts; never scroll the panel/page.
                stageRef.current?.focus({ preventScroll: true });
                onStateChange("loading");
                setAttempt((current) => current + 1);
              }}
              className={`min-h-11 min-w-11 rounded-md border border-border-subtle px-3 ${focusRing}`}
            >Retry</button>
          </div>
        )}
      </div>
    </div>
  );
}

function ScreenshotGallery({ media }: { media: readonly ProjectMedia[] }) {
  const [selection, setSelection] = useState<{ index: number; state: MediaLoadState }>({ index: 0, state: "loading" });
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = Math.min(selection.index, media.length - 1);
  const selected = media[selectedIndex];

  function selectIndex(index: number) {
    setSelection((current) => current.index === index ? current : { index, state: "loading" });
  }

  function move(direction: number) {
    selectIndex((selectedIndex + direction + media.length) % media.length);
  }

  // Scroll only the owning panel, never the page or the selected image.
  function revealKeyboardFocus(button: HTMLButtonElement) {
    if (!button.matches(":focus-visible")) return;
    const panel = button.closest<HTMLElement>("[data-project-dialog-panel]");
    if (!panel) return;
    const bounds = panel.getBoundingClientRect();
    const header = panel.querySelector<HTMLElement>("[data-project-dialog-header]");
    const top = Math.max(bounds.top + 112, (header?.getBoundingClientRect().bottom ?? bounds.top) + 8);
    const target = button.getBoundingClientRect();
    if (target.top < top) panel.scrollTop += target.top - top;
    else if (target.bottom > bounds.bottom - 8) panel.scrollTop += target.bottom - bounds.bottom + 8;
  }

  return (
    <section aria-label="Project Gallery" className="min-w-0 space-y-3">
      <h4 className="ty-sub text-text-primary">Project Gallery</h4>
      <SelectedMedia key={selected.src} media={selected} state={selection.state}
        onStateChange={(state) => setSelection((current) =>
          current.index === selectedIndex && current.state !== state ? { ...current, state } : current
        )} />

      <div className="flex min-w-0 flex-wrap items-center gap-2">
        {media.length > 1 && (
          <button type="button" onClick={() => move(-1)} aria-label="Previous media"
            className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border-subtle text-text-primary hover:border-border-accent ${focusRing}`}>
            <span aria-hidden="true">&#8249;</span>
          </button>
        )}
        <p role="status" aria-live="polite" aria-atomic="true" className="min-w-0 flex-1 break-words text-center text-xs text-text-secondary">
          {selectedIndex + 1} / {media.length} — {mediaLabel(selected, selectedIndex)}
          {selection.state === "loading" ? " — Loading…" : selection.state === "error" ? " — Unavailable. Retry to load this media." : " — Ready."}
        </p>
        {media.length > 1 && (
          <button type="button" onClick={() => move(1)} aria-label="Next media"
            className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border-subtle text-text-primary hover:border-border-accent ${focusRing}`}>
            <span aria-hidden="true">&#8250;</span>
          </button>
        )}
      </div>

      <div role="group" aria-label="Choose gallery media" className="grid grid-cols-4 gap-2 sm:grid-cols-5">
        {media.map((item, index) => {
          const isSelected = index === selectedIndex;
          return (
            <button
              key={item.src}
              type="button"
              ref={(button) => { thumbnailRefs.current[index] = button; }}
              onClick={() => selectIndex(index)}
              onFocus={(event) => revealKeyboardFocus(event.currentTarget)}
              onKeyDown={(event) => {
                let nextIndex: number;
                switch (event.key) {
                  case "ArrowLeft": nextIndex = (index - 1 + media.length) % media.length; break;
                  case "ArrowRight": nextIndex = (index + 1) % media.length; break;
                  case "Home": nextIndex = 0; break;
                  case "End": nextIndex = media.length - 1; break;
                  default: return;
                }
                event.preventDefault();
                selectIndex(nextIndex);
                thumbnailRefs.current[nextIndex]?.focus({ preventScroll: true });
              }}
              aria-label={`View ${index + 1}: ${mediaLabel(item, index)}`}
              aria-current={isSelected ? "true" : undefined}
              className={`relative flex h-14 min-w-11 scroll-mt-28 items-center justify-center rounded-md border-2 p-1 ${focusRing} ${isSelected ? "border-accent-blue" : "border-border-subtle hover:border-border-accent"}`}
            >
              {item.type === "video" ? (
                <span aria-hidden="true" className="text-text-secondary">&#9654;</span>
              ) : (
                <img src={basePath(item.src)} alt="" width={item.width} height={item.height}
                  loading="lazy" decoding="async" className="block h-auto max-h-11 max-w-full object-contain" />
              )}
              <span aria-hidden="true" className="absolute bottom-0 left-0 rounded bg-bg-surface px-1 text-[10px] text-text-primary">{index + 1}</span>
              {isSelected && <span aria-hidden="true" className="absolute right-0 top-0 rounded bg-bg-surface px-1 text-xs text-accent-blue">✓</span>}
            </button>
          );
        })}
      </div>
    </section>
  );
}

interface ProjectMediaGalleryProps {
  media: readonly ProjectMedia[];
}

export default function ProjectMediaGallery({ media }: ProjectMediaGalleryProps) {
  if (media.length === 0) return null;
  return <ScreenshotGallery media={media} />;
}
