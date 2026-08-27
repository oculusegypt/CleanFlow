import { useEffect } from "react"
import { useLocation } from "wouter"
import { getSiteUrl, sitePath, siteUrl } from "@/lib/siteUrl"
import { useSiteSettings } from "@/context/SiteSettingsContext"

function upsertMeta(attribute: "name" | "property", key: string, value: string) {
  let tag = document.head.querySelector(`meta[${attribute}="${key}"]`) as HTMLMetaElement | null
  if (!tag) {
    tag = document.createElement("meta")
    tag.setAttribute(attribute, key)
    document.head.appendChild(tag)
  }
  tag.content = value
}

export function SiteSEO() {
  const [location] = useLocation()
  const { companyName, description, phoneCall, address, city, region, country, priceRange, socialLinks, publicUrl, isLoaded } = useSiteSettings()

  useEffect(() => {
    if (!isLoaded) return
    const isAdmin = location.startsWith("/admin")
    const legalName = companyName || "مؤسسة السهم كلين"
    const siteName = legalName.replace(/^(مؤسسة|شركة)\s+/, "").trim() || "السهم كلين"
    const defaultTitle = `${siteName} | شركة تنظيف بالرياض`
    const defaultDescription = description || "خدمات تنظيف المنازل والفلل والشقق والمكاتب في الرياض، مع تنظيف ما بعد البناء وجلي الرخام وغسيل المكيفات."
    const siteOrigin = getSiteUrl(publicUrl)
    const canonicalPath = sitePath(location.split(/[?#]/)[0] || "/", publicUrl).replace(/\/+$/, "") || "/"
    const canonical = siteUrl(canonicalPath, publicUrl)
    const image = siteUrl(sitePath("/brand-icon.png", publicUrl), publicUrl)

    if (isAdmin) {
      upsertMeta("name", "robots", "noindex, nofollow, noarchive")
      document.querySelector("link[rel='canonical']")?.remove()
      document.getElementById("site-business-schema")?.remove()
      return
    }
    if (location === "/") document.title = defaultTitle
    upsertMeta("name", "robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1")
    upsertMeta("name", "application-name", siteName)
    upsertMeta("property", "og:title", document.title || defaultTitle)
    upsertMeta("property", "og:description", document.head.querySelector('meta[name="description"]')?.getAttribute("content") || defaultDescription)
    upsertMeta("property", "og:url", canonical)
    upsertMeta("property", "og:type", "website")
    upsertMeta("property", "og:site_name", siteName)
    upsertMeta("property", "og:locale", "ar_SA")
    upsertMeta("property", "og:image", image)
    upsertMeta("property", "og:image:alt", `شعار ${siteName}`)
    upsertMeta("name", "twitter:card", "summary_large_image")
    upsertMeta("name", "twitter:title", document.title || defaultTitle)
    upsertMeta("name", "twitter:description", document.head.querySelector('meta[name="description"]')?.getAttribute("content") || defaultDescription)
    upsertMeta("name", "twitter:image", image)

    let canonicalTag = document.head.querySelector("link[rel='canonical']") as HTMLLinkElement | null
    if (!canonicalTag) {
      canonicalTag = document.createElement("link")
      canonicalTag.rel = "canonical"
      document.head.appendChild(canonicalTag)
    }
    canonicalTag.href = canonical

    let schema = document.getElementById("site-business-schema")
    if (!schema) {
      schema = document.createElement("script")
      schema.id = "site-business-schema"
      ;(schema as HTMLScriptElement).type = "application/ld+json"
      document.head.appendChild(schema)
    }
    schema.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "LocalBusiness",
          "@id": `${siteOrigin}/#business`,
          name: legalName,
          alternateName: [siteName, legalName],
          url: siteUrl("/", publicUrl),
          image,
          logo: image,
          description: defaultDescription,
          ...(phoneCall ? { telephone: phoneCall } : {}),
          ...(priceRange ? { priceRange } : {}),
          areaServed: { "@type": "City", name: city || "الرياض" },
          ...(address || city || region || country ? { address: {
            "@type": "PostalAddress",
            ...(address ? { streetAddress: address } : {}),
            ...(city ? { addressLocality: city } : { addressLocality: "الرياض" }),
            ...(region ? { addressRegion: region } : {}),
            ...(country ? { addressCountry: country } : { addressCountry: "SA" }),
          } } : {}),
          sameAs: Object.values(socialLinks).filter(Boolean),
        },
        {
          "@type": "WebSite",
          "@id": `${siteOrigin}/#website`,
          url: siteUrl("/", publicUrl),
          name: siteName,
          inLanguage: "ar",
           publisher: { "@id": `${getSiteUrl(publicUrl)}/#business` },
        },
      ],
    })
  }, [
    location,
    companyName,
    description,
    phoneCall,
    address,
    city,
    region,
    country,
    priceRange,
    socialLinks,
    publicUrl,
    isLoaded,
  ])

  return null
}