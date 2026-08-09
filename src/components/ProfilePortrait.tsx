"use client";

import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { basePath } from "@/lib/base-path";

interface ProfilePortraitProps {
  src: string;
  alt: string;
}

export default function ProfilePortrait({ src, alt }: ProfilePortraitProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);

  function getMountedSnapshot() { return true; }
  function subscribeToMounted() { return () => {}; }
  const mounted = useSyncExternalStore(subscribeToMounted, getMountedSnapshot, () => false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      wasOpenRef.current = true;
      closeButtonRef.current?.focus({ preventScroll: true });
      return;
    }
    if (wasOpenRef.current) {
      triggerRef.current?.focus({ preventScroll: true });
      wasOpenRef.current = false;
    }
  }, [isOpen]);

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
      {/* Portrait trigger button with rectangular 4:5 technical frame */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        className="portrait-trigger relative flex h-56 w-[176px] shrink-0 items-center justify-center overflow-hidden rounded-md border border-[#3c3c44] sm:h-72 sm:w-[224px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue"
        aria-label="Open portrait photo"
      >
        <img
          src={basePath(src)}
          alt={alt}
          className="h-full w-full object-cover object-top"
        />
        {/* Technical frame decorations */}
        <div className="portrait-frame absolute inset-0" aria-hidden="true" />
        {/* Coordinate labels */}
        <span className="absolute bottom-2 left-2 text-[8px] font-mono text-accent-blue/40" aria-hidden="true">
          24.0°N 121.5°E
        </span>
        {/* Edge light */}
        <div className="absolute inset-0 rounded-md shadow-[inset_0_0_20px_rgba(45,127,249,0.1)]" aria-hidden="true" />
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
                src={basePath(src)}
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
