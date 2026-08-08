"use client";

import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

interface ProfilePortraitProps {
  src: string;
  alt: string;
}

export default function ProfilePortrait({ src, alt }: ProfilePortraitProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Track client hydration for safe portal rendering
  function getMountedSnapshot() { return true; }
  function subscribeToMounted() { return () => {}; }
  const mounted = useSyncExternalStore(subscribeToMounted, getMountedSnapshot, () => false);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  // Focus management: close button on open, trigger on close
  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    } else {
      triggerRef.current?.focus();
    }
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      {/* Portrait trigger button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        className="portrait-trigger relative flex h-44 w-44 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#3c3c44] ring-2 ring-accent-blue/30 sm:h-56 sm:w-56 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue"
        aria-label="Open portrait photo"
      >
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover object-top"
        />
        {/* Gold accent dot */}
        <div className="absolute right-4 top-4 h-1.5 w-1.5 rounded-full bg-accent-gold/60 sm:right-5 sm:top-5" />
      </button>

      {/* Lightbox */}
      {isOpen &&
        mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6 md:p-8"
            onClick={() => setIsOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Portrait photo lightbox"
          >
            <div className="relative max-w-[90vw] md:max-w-[720px]">
              <img
                src={src}
                alt={alt}
                onClick={(e) => e.stopPropagation()}
                className="max-h-[80vh] max-w-full rounded-xl object-contain border border-[#3c3c44] ring-1 ring-accent-blue/20 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
              />
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute top-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-xl text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue"
                aria-label="Close lightbox"
              >
                ×
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
