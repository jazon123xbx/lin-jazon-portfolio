"use client";

import { useEffect } from "react";
import { basePath } from "@/lib/base-path";

/**
 * Client-side hash redirect for static export.
 * Keeps the destination fragment through a full home load. The home entrance
 * defers that destination until the visitor explicitly selects Explore.
 */
export default function HashRedirect({
  section,
  label,
}: {
  section: string;
  label: string;
}) {
  const hash = `#${section}`;
  const href = `${basePath("/")}${hash}`;

  useEffect(() => {
    window.location.replace(href);
  }, [href]);

  return (
    <main className="flex min-h-[60vh] items-center justify-center">
      <a
        href={href}
        className="text-sm font-medium text-accent-blue underline underline-offset-4 hover:text-accent-blue-dim"
      >
        Continue to {label}
      </a>
    </main>
  );
}
