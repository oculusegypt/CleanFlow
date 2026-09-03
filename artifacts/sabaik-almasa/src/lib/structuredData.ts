import { getSiteUrl, siteUrl } from "@/lib/siteUrl"
import type { SiteSettings } from "@/context/SiteSettingsContext"

export interface StructuredDataOverrides {
  url?: string
  description?: string
  areaServed?: unknown
  name?: string
}

function absoluteAsset(value: string, origin: string): string {
  if (!value) return `${origin}/brand-icon.png`
  if (/^https?:\/\//i.test(value)) return value
  return `${origin}${value.startsWith("/") ? value : `/${value}`}`
}

export function toInternationalPhone(value: string): string {
  const digits = value.replace(/\D/g, "")
  if (!digits) return ""
  if (digits.startsWith("00")) return `+${digits.slice(2)}`
  if (digits.startsWith("966")) return `+${digits}`
  if (digits.startsWith("0")) return `+966${digits.slice(1)}`
  return `+966${digits}`
}

function validCoordinate(value: string, min: number, max: number): number | undefined {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= min && parsed <= max ? parsed : undefined
}

export function buildLocalBusinessSchema(
  settings: SiteSettings,
  overrides: StructuredDataOverrides = {},
): Record<string, unknown> {
  const origin = getSiteUrl(settings.publicUrl)
  const name = overrides.name || settings.companyName
  const phones = [settings.phoneCall, settings.phoneWhatsapp, ...settings.phones]
    .map(toInternationalPhone)
    .filter((phone, index, all) => phone && all.indexOf(phone) === index)
  const address: Record<string, unknown> = { "@type": "PostalAddress" }

  if (settings.address) address.streetAddress = settings.address
  if (settings.city) address.addressLocality = settings.city
  if (settings.region) address.addressRegion = settings.region
  if (settings.country) address.addressCountry = settings.country
  if (settings.postalCode) address.postalCode = settings.postalCode

  const latitude = validCoordinate(settings.latitude, -90, 90)
  const longitude = validCoordinate(settings.longitude, -180, 180)
  const socialLinks = Object.values(settings.socialLinks)
    .filter((link): link is string => /^https?:\/\//i.test(link))

  const entity: Record<string, unknown> = {
    "@type": ["LocalBusiness", "HousekeepingService"],
    "@id": `${origin}/#business`,
    name,
    url: overrides.url || siteUrl("/", settings.publicUrl),
    logo: absoluteAsset(settings.logoUrl, origin),
    image: absoluteAsset(settings.logoUrl, origin),
    ...(settings.description || overrides.description
      ? { description: overrides.description || settings.description }
      : {}),
    ...(phones.length ? { telephone: phones.length === 1 ? phones[0] : phones } : {}),
    ...(settings.priceRange ? { priceRange: settings.priceRange } : {}),
    ...(settings.paymentMethods ? { paymentAccepted: settings.paymentMethods } : {}),
    ...(Object.keys(address).length > 1 ? { address } : {}),
    ...(latitude !== undefined && longitude !== undefined
      ? { geo: { "@type": "GeoCoordinates", latitude, longitude } }
      : {}),
    ...(settings.email ? { email: settings.email } : {}),
    ...(overrides.areaServed ? { areaServed: overrides.areaServed } : {}),
    ...(socialLinks.length ? { sameAs: socialLinks } : {}),
  }

  return entity
}

export function buildHomepageTitle(companyName: string): string {
  const brand = companyName.trim()
  return brand
    ? `شركة تنظيف بالرياض للمنازل والفلل والمكاتب | ${brand}`
    : "شركة تنظيف بالرياض للمنازل والفلل والمكاتب | خدمات احترافية"
}