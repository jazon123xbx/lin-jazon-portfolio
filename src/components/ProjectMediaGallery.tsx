"use client";

import { useState, useCallback } from "react";
import type { ProjectMedia } from "@/data/portfolio";

/* ── LIN.OS Placeholder ───────────────────────────────────── */

function LinOSPlaceholder() {
  return (
    <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-border-subtle bg-bg-surface">
      <div className="text-center">
        <p className="ty-eyebrow text-accent-blue/60">LIN.OS</p>
        <p className="mt-1 text-[11px] text-text-muted">No media available</p>
      </div>
    </div>
  );
}

/* ── Single media ─────────────────────────────────────────── */

function SingleMedia({ media }: { media: ProjectMedia }) {
  if (media.type === "video") {
    return (
      <div className="overflow-hidden rounded-lg border border-border-subtle">
        <video
          src={media.src}
          controls
          preload="metadata"
          className="aspect-video w-full object-cover"
          aria-label={media.alt}
        />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border-subtle">
      <img
        src={media.src}
        alt={media.alt}
        loading="lazy"
        className="aspect-video w-full object-cover"
      />
    </div>
  );
}

/* ── Multiple media gallery ───────────────────────────────── */

function MultipleMedia({ media }: { media: ProjectMedia[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex(index);
    },
    []
  );

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  }, [media.length]);

  const goNext = useCallback(() => {
    setActiveIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  }, [media.length]);

  return (
    <div className="space-y-3">
      {/* Main display */}
      <div className="relative overflow-hidden rounded-lg border border-border-subtle">
        {media[activeIndex].type === "video" ? (
          <video
            src={media[activeIndex].src}
            controls
            preload="metadata"
            className="aspect-video w-full object-cover"
            aria-label={media[activeIndex].alt}
          />
        ) : (
          <img
            src={media[activeIndex].src}
            alt={media[activeIndex].alt}
            loading="lazy"
            className="aspect-video w-full object-cover"
          />
        )}

        {/* Manual arrows */}
        {media.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue"
              aria-label="Previous media"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue"
              aria-label="Next media"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Index counter */}
        <span className="absolute bottom-3 right-3 rounded bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white/80">
          {activeIndex + 1}/{media.length}
        </span>
      </div>

      {/* Thumbnails */}
      {media.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {media.map((item, index) => (
            <button
              key={item.src}
              type="button"
              onClick={() => goTo(index)}
              className={`shrink-0 overflow-hidden rounded border-2 transition-colors ${
                index === activeIndex
                  ? "border-accent-blue"
                  : "border-border-subtle hover:border-border-accent"
              }`}
              aria-label={`View media ${index + 1}`}
              aria-current={index === activeIndex ? "true" : undefined}
            >
              {item.type === "video" ? (
                <div className="flex h-12 w-16 items-center justify-center bg-bg-surface">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-text-muted">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              ) : (
                <img
                  src={item.src}
                  alt=""
                  loading="lazy"
                  className="h-12 w-16 object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Exported component ────────────────────────────────────── */

interface ProjectMediaGalleryProps {
  media: ProjectMedia[];
}

export default function ProjectMediaGallery({ media }: ProjectMediaGalleryProps) {
  if (media.length === 0) {
    return <LinOSPlaceholder />;
  }

  if (media.length === 1) {
    return <SingleMedia media={media[0]} />;
  }

  return <MultipleMedia media={media} />;
}
