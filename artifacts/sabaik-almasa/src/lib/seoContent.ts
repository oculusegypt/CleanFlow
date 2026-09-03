/**
 * Rich text is rendered below a page-level H1. Convert editor-authored H1
 * elements to H2 so an article cannot accidentally create duplicate H1 tags.
 */
export function normalizeRichTextHeadings(value: string): string {
  return value
    .replace(/<h1(\s[^>]*)?>/gi, "<h2$1>")
    .replace(/<\/h1>/gi, "</h2>")
}