/**
 * Generate a URL-safe slug from a title. Used server-side on create —
 * slugs are never exposed as an editable field in the admin forms (§5).
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip combining diacritics
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Ensure a slug is unique by appending -2, -3, ... if taken.
 * `exists` checks whether a candidate slug is already in use.
 */
export async function uniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>
): Promise<string> {
  const root = slugify(base) || "untitled";
  let candidate = root;
  let n = 2;
  while (await exists(candidate)) {
    candidate = `${root}-${n}`;
    n += 1;
  }
  return candidate;
}

/** Format a date for display, e.g. "3 Jul 2026". */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
