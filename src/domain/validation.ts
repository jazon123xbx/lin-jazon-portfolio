/**
 * Small validation helpers shared by the domain classes.
 *
 * WHY: Domain objects are created once at module load. Failing loudly here
 * keeps malformed ids or empty labels out of the UI instead of letting them
 * silently become broken anchors or blank cards.
 */

export function assertNonEmptyText(value: string, field: string): string {
  const text = value.trim();

  if (text.length === 0) {
    throw new Error(`${field} must not be empty.`);
  }

  return text;
}

export function assertSlug(value: string, field: string): string {
  const slug = assertNonEmptyText(value, field);

  // Slugs double as HTML anchors, so keep them predictable and URL-safe.
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error(
      `${field} must be a lowercase slug such as "frontend-development".`
    );
  }

  return slug;
}
