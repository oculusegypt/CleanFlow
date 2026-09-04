import { useEffect, useMemo, useState } from "react"
import { useGetPackages, useGetServices } from "@workspace/api-client-react"
import type { CleaningPackage, Service } from "@workspace/api-client-react"
import ServiceDetail from "@/pages/ServiceDetail"
import PackageDetail from "@/pages/PackageDetail"
import BlogPost from "@/pages/BlogPost"
import SeoPage from "@/pages/SeoPage"
import { useLocation } from "wouter"
import { getPackageRouteSlug } from "@/lib/packageRoute"

type RootResource =
  | { kind: "service"; lookupSlug: string }
  | { kind: "package"; lookupSlug: string }
  | { kind: "blog"; lookupSlug: string }
  | { kind: "page"; lookupSlug: string }
  | { kind: "not-found" }

const API_BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || ""

function normalizeSlug(value: string): string {
  return decodeURIComponent(value)
    .normalize("NFKC")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[إأآ]/g, "ا")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
}

function tokens(value: string): string[] {
  return normalizeSlug(value)
    .split("-")
    .map((token) => token.replace(/^ال(?=.{2,})/, ""))
    .filter((token) => token.length > 1 && !["شركة", "خدمة", "باقة", "في", "من"].includes(token))
}

function matchesAlias(slug: string, aliases: string[], allowRelated = false): boolean {
  const normalized = normalizeSlug(slug)
  if (aliases.some((alias) => normalizeSlug(alias) === normalized)) return true
  if (!allowRelated) return false
  const wanted = tokens(slug)
  if (wanted.length < 2) return false
  return aliases.some((alias) => {
    const candidate = new Set(tokens(alias))
    return wanted.every((token) => candidate.has(token))
  })
}

function findService(services: Service[], slug: string): Service | undefined {
  return services.find((service) =>
    matchesAlias(slug, [
      service.seoSlug || "",
      service.title || "",
      (service.seoTitle || "").split("|")[0],
    ], true),
  )
}

function findPackage(packages: CleaningPackage[], slug: string): CleaningPackage | undefined {
  return packages.find((item) =>
    matchesAlias(slug, [
      getPackageRouteSlug(item),
      item.name || "",
      (item.seoTitle || "").split("|")[0],
    ], true),
  )
}

export default function RootSlugRouter(_props?: { params?: unknown }) {
  const [location] = useLocation()
  const { data: services } = useGetServices()
  const { data: packages } = useGetPackages()
  const [resource, setResource] = useState<RootResource | null>(null)
  const slug = useMemo(
    () => decodeURIComponent(location.replace(/^\/+|\/+$/g, "")),
    [location],
  )

  useEffect(() => {
    if (!slug || !services || !packages) return
    let cancelled = false

    const service = findService(services.filter((item) => item.isActive), slug)
    const packageItem = findPackage(packages, slug)

    if (service) {
      setResource({ kind: "service", lookupSlug: service.seoSlug || String(service.id) })
      return
    }
    if (packageItem) {
      setResource({ kind: "package", lookupSlug: getPackageRouteSlug(packageItem) })
      return
    }

    Promise.all([
      fetch(`${API_BASE}/api/posts/${encodeURIComponent(slug)}`).then((response) => response.ok ? response.json() : null).catch(() => null),
      fetch(`${API_BASE}/api/pages/${encodeURIComponent(slug)}`, { cache: "no-store" }).then((response) => response.ok ? response.json() : null).catch(() => null),
    ]).then(([post, page]) => {
      if (cancelled) return
      if (post) setResource({ kind: "blog", lookupSlug: post.slug || slug })
      else if (page) setResource({ kind: "page", lookupSlug: page.slug || slug })
      else setResource({ kind: "not-found" })
    })

    return () => {
      cancelled = true
    }
  }, [packages, services, slug])

  if (!resource) {
    return <div className="min-h-[50vh] flex items-center justify-center"><div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
  }
  if (resource.kind === "not-found") {
    return <div className="min-h-[50vh] flex items-center justify-center text-gray-500">الصفحة غير موجودة</div>
  }
  if (resource.kind === "service") return <ServiceDetail rootSlug={slug} lookupSlug={resource.lookupSlug} />
  if (resource.kind === "package") return <PackageDetail rootSlug={slug} lookupSlug={resource.lookupSlug} />
  if (resource.kind === "blog") return <BlogPost rootSlug={slug} lookupSlug={resource.lookupSlug} />
  return <SeoPage rootSlug={slug} lookupSlug={resource.lookupSlug} />
}