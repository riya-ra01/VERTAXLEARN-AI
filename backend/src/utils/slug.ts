/** Convert a title string to a URL-safe slug. */
export const slugify = (text: string): string =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** Append a short random suffix to guarantee uniqueness. */
export const uniqueSlug = (text: string): string =>
  `${slugify(text)}-${Math.random().toString(36).slice(2, 7)}`;
