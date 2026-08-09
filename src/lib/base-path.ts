/**
 * Safely prefix a root-relative public/history path with the configured base
 * path exactly once. Leaves external URLs and non-root paths unchanged.
 *
 * Use only where Next does NOT auto-handle basePath (raw <a> hrefs,
 * imperative history API, next/image src).
 */
export function basePath(href: string): string {
  const raw = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  if (!raw || !href.startsWith("/")) return href;

  // Normalize: strip trailing slash so "/lin-jazon-portfolio/" becomes
  // "/lin-jazon-portfolio" and avoids double-slash in output.
  const base = raw.replace(/\/+$/, "");

  // Already prefixed or equal to the base itself — return unchanged.
  if (href === base || href.startsWith(`${base}/`)) return href;

  return `${base}${href}`;
}
