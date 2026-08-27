/** The verified production origin used by canonical and social metadata. */
export const CANONICAL_SITE_URL = "https://alsahmm.com"

function normalizeSiteOrigin(value: string | null | undefined): string {
  const candidate = String(value || "").trim()
  if (!candidate) return ""
  try {
    const url = new URL(candidate)
    if (!/^https?:$/.test(url.protocol) || !url.hostname) return ""
    return url.origin.replace(/\/+$/, "")
  } catch {
    return ""
  }
}

export function getSiteUrl(configuredUrl?: string): string {
  const configuredOrigin = normalizeSiteOrigin(configuredUrl)
  if (configuredOrigin) return configuredOrigin

  const buildOrigin = normalizeSiteOrigin(import.meta.env.VITE_PUBLIC_SITE_URL)
  if (buildOrigin === CANONICAL_SITE_URL) return buildOrigin

  return CANONICAL_SITE_URL
}

export function siteUrl(path = "/", configuredUrl?: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`
  const origin = getSiteUrl(configuredUrl)
  return `${origin}${normalized}`
}

/** Keep externally supplied internal URLs on the current public origin. */
export function sitePath(value: string | null | undefined, configuredUrl?: string): string {
  if (!value) return "/"
  try {
    const url = new URL(value)
    // Canonical and internal asset URLs are always re-rooted to the configured
    // public origin, even when the incoming value was created on a preview URL.
    if (/^https?:$/.test(url.protocol)) return `${url.pathname}${url.search}${url.hash}` || "/"
  } catch {
    // Relative values are already suitable for the current origin.
  }
  return value
}