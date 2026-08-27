/**
 * Uploaded/package images are optimized to WebP on the server.
 * Older package records can still contain the original extension, so resolve
 * those known package asset paths before rendering them.
 */
export function resolvePackageImageUrl(value: unknown): string {
  if (typeof value !== "string") return ""

  const url = value.trim()
  if (!url) return ""

  return url.replace(
    /(\/(?:images\/packages|api\/uploads|uploads)\/[^?#]*?)\.(?:jpe?g|png|gif|avif)(?=([?#]|$))/i,
    "$1.webp",
  )
}