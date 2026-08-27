/**
 * One canonical origin for public SEO URLs.
 *
 * This is intentionally not derived from an incoming request host. The
 * Hostinger site can be reached through proxies and preview hosts, neither of
 * which should ever become a canonical or sitemap URL.
 */
export const CANONICAL_SITE_URL = "https://alsahmm.com";
