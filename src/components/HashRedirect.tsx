"use client";

import { useEffect } from "react";
import Link from "next/link";
import { basePath } from "@/lib/base-path";

/**
 * Client-side hash redirect for static export.
 * Renders an accessible fallback Link immediately; uses window.location.replace
 * in an effect to navigate to the section hash on the root page.
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
    <div className="flex min-h-[60vh] items-center justify-center">
      <Link
        href={`/#${section}`}
        className="text-sm font-medium text-accent-blue underline underline-offset-4 hover:text-accent-blue-dim"
      >
        Continue to {label}
      </Link>
    </div>
  );
}
