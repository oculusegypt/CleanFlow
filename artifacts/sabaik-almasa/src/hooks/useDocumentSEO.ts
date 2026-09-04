import { useEffect } from "react"
import { replaceLegacyCompanyName, useSiteSettings } from "@/context/SiteSettingsContext"
import { getSiteUrl, sitePath, siteUrl } from "@/lib/siteUrl"

interface SEOOptions {
  title: string
  description?: string
  keywords?: string
  canonical?: string
  ogImage?: string
  ogImageAlt?: string
  ogType?: string
  robots?: string
}

function setMeta(attr: string, value: string, attrName = "name") {
  if (!value) return
  let el = document.querySelector(`meta[${attrName}="${attr}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement("meta")
    el.setAttribute(attrName, attr)
    document.head.appendChild(el)
  }
  el.content = value
}

function setCanonical(href: string) {
  let el = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null
  if (!el) { el = document.createElement("link"); el.rel = "canonical"; document.head.appendChild(el) }
  el.href = href
}

export function useDocumentSEO({
  title,
  description,
  keywords,
  canonical,
  ogImage,
  ogImageAlt,
  ogType = "website",
  robots = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
}: SEOOptions) {
  const { companyName, publicUrl, isLoaded } = useSiteSettings()

  useEffect(() => {
    // Keep the static, neutral title from index.html until the configured
    // company name is available. This prevents a visible default-name flash.
    if (!isLoaded) return

    const replaceCompanyName = (value?: string) =>
      value ? replaceLegacyCompanyName(value, companyName) : value
    const resolvedTitle = replaceCompanyName(title) || title
    const resolvedDescription = replaceCompanyName(description)
    const resolvedKeywords = replaceCompanyName(keywords)
    const resolvedOgImageAlt = replaceCompanyName(ogImageAlt)
    const brandName = (companyName || "شركة تنظيف بالرياض").replace(/^(مؤسسة|شركة)\s+/, "").trim() || "شركة تنظيف بالرياض"
    const resolvedCanonical = canonical
      ? siteUrl(sitePath(canonical, publicUrl), publicUrl)
      : ""
    const resolvedOgImage = ogImage
      ? siteUrl(sitePath(ogImage, publicUrl), publicUrl)
      : siteUrl("/brand-icon.png", publicUrl)
    const prevTitle = document.title
    const prevDesc  = document.querySelector('meta[name="description"]')?.getAttribute("content") ?? ""
    const prevCanon = document.querySelector("link[rel='canonical']")?.getAttribute("href") ?? ""

    document.title = resolvedTitle

    // Primary
    if (resolvedDescription) setMeta("description", resolvedDescription)
    if (resolvedKeywords)    setMeta("keywords",     resolvedKeywords)
    setMeta("application-name", brandName)
    // Route-level pages can previously have set noindex (for example a stale
    // SEO landing page). Always restore the normal indexable state when the
    // user navigates to a valid public page.
    setMeta("robots", robots)
    setMeta("googlebot", robots)

    // Open Graph
    setMeta("og:title",       resolvedTitle, "property")
    setMeta("og:type",        ogType,      "property")
    setMeta("og:locale",      "ar_SA",     "property")
    setMeta("og:site_name",   brandName, "property")
    if (resolvedDescription) setMeta("og:description", resolvedDescription, "property")
    if (resolvedCanonical) setMeta("og:url", resolvedCanonical, "property")
    if (resolvedOgImage) {
      setMeta("og:image",             resolvedOgImage,                    "property")
      setMeta("og:image:secure_url",  resolvedOgImage,                    "property")
      setMeta("og:image:alt",         resolvedOgImageAlt || resolvedTitle, "property")
    }

    // Twitter / X
    setMeta("twitter:card",        "summary_large_image")
    setMeta("twitter:title",       resolvedTitle)
    if (resolvedDescription) setMeta("twitter:description", resolvedDescription)
    if (resolvedCanonical) setMeta("twitter:url", resolvedCanonical)
    if (resolvedOgImage) setMeta("twitter:image", resolvedOgImage)
    if (resolvedOgImage) setMeta("twitter:image:alt", resolvedOgImageAlt || resolvedTitle)

    // Canonical link
    if (resolvedCanonical) setCanonical(resolvedCanonical)

    return () => {
      document.title = prevTitle
      if (prevDesc)  setMeta("description", prevDesc)
      if (prevCanon) setCanonical(prevCanon)
    }
  }, [title, description, keywords, canonical, ogImage, ogImageAlt, ogType, robots, companyName, publicUrl, isLoaded])
}
