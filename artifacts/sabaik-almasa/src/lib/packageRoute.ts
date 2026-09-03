import type { CleaningPackage } from "@workspace/api-client-react"

const LEGACY_PACKAGE_ROUTE_SLUGS: Record<number, string> = {
  1: "tanzeef-shaqaq",
  2: "tanzeef-filal",
  3: "tanzeef-qosoor",
  4: "tanzeef-qabl-alnaql",
  5: "gaseel-majalis-bukhar",
  6: "jaly-rakham",
  7: "tanzeef-khazanat",
  8: "gaseel-mokeyafat",
  9: "mokafahat-hasharat",
  10: "tanzeef-bad-albenaa",
  11: "tanzeef-wajahat",
  12: "tanzeef-masajid",
  13: "shahadat-salama",
  14: "tarkeeb-anthimat-wiqaya",
  15: "taqreer-fanni-fawri",
  16: "taqreer-fanni-ghayr-fawri",
  17: "aqd-siyana-difaa-madani",
}

function toFallbackSlug(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\u0600-\u06FFa-zA-Z0-9-]/g, "")
}

export function getPackageRouteSlug(packageData: CleaningPackage): string {
  return LEGACY_PACKAGE_ROUTE_SLUGS[packageData.id]
    || packageData.seoSlug
    || toFallbackSlug(packageData.name)
}