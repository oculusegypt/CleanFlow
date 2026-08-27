import { motion } from "framer-motion"
import { useGetServices } from "@workspace/api-client-react"
import { Truck, Factory, Trash2, Leaf, Box, Settings, ShieldCheck, Flame, ClipboardCheck, FileText, Wrench } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useSiteSettings } from "@/context/SiteSettingsContext"
import { ServiceCard } from "@/components/home/services/ServiceCard"

// Map string icons from DB to actual lucide components
const iconMap: Record<string, LucideIcon> = {
  "truck": Truck,
  "factory": Factory,
  "trash2": Trash2,
  "leaf": Leaf,
  "box": Box,
  "settings": Settings,
  "Truck": Truck,
  "Factory": Factory,
  "Trash2": Trash2,
  "Leaf": Leaf,
  "Box": Box,
  "Settings": Settings,
  "ShieldCheck": ShieldCheck,
  "Flame": Flame,
  "ClipboardCheck": ClipboardCheck,
  "FileText": FileText,
  "Wrench": Wrench,
}

function parseImages(raw: any, fallback?: string | null): string[] {
  if (Array.isArray(raw)) {
    const validImages = raw.filter((image): image is string => typeof image === "string" && image.trim().length > 0)
    if (validImages.length > 0) return validImages
  }

  try {
    const arr = JSON.parse(typeof raw === "string" ? raw : "[]")
    if (Array.isArray(arr)) {
      const validImages = arr.filter((image): image is string => typeof image === "string" && image.trim().length > 0)
      if (validImages.length > 0) return validImages
    }
  } catch {}
  return fallback && fallback.trim().length > 0 ? [fallback] : []
}

export function ServicesSection() {
  const { data: services, isLoading, isError, refetch } = useGetServices()
  const { companyName, homepageContent } = useSiteSettings()
  const copy = homepageContent.sections?.services
  const activeServices = services?.filter((service) => service.isActive !== false) ?? []

  if (isLoading) {
    return (
      <section id="services" className="relative overflow-hidden bg-[color:var(--home-mist)] py-20 sm:py-24" dir="rtl" aria-busy="true">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto mb-12 max-w-2xl space-y-4 text-center">
            <div className="mx-auto h-4 w-32 animate-pulse rounded-full bg-[color:var(--home-line)]" />
            <div className="mx-auto h-10 w-72 animate-pulse rounded-xl bg-[color:var(--home-line)]" />
            <div className="mx-auto h-4 w-full max-w-lg animate-pulse rounded-full bg-[color:var(--home-line)]" />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-[31rem] animate-pulse rounded-[1.35rem] border border-[color:var(--home-line)] bg-white/70" data-testid={`skeleton-service-${item}`} />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (isError) {
    return (
      <section id="services" className="bg-[color:var(--home-mist)] py-20 sm:py-24" dir="rtl">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-xl rounded-3xl border border-[color:var(--home-line)] bg-white p-8 text-center shadow-[0_14px_34px_rgba(18,56,75,.07)]">
            <h2 className="text-2xl font-black text-[color:var(--home-ink)]">تعذر تحميل الخدمات</h2>
            <p className="mt-3 text-sm leading-7 text-[color:var(--home-ink-soft)]">حاول تحديث القسم مرة أخرى لعرض الخدمات المتاحة.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-6 min-h-11 rounded-xl bg-[color:var(--home-ink)] px-5 text-sm font-black text-white transition-colors hover:bg-[color:var(--home-water)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--home-gold)] focus-visible:ring-offset-2"
              data-testid="button-retry-services"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="services" className="relative overflow-hidden bg-[color:var(--home-mist)] py-20 sm:py-24" dir="rtl">
      <div className="pointer-events-none absolute -start-24 top-24 h-64 w-64 rounded-full border border-[color:var(--home-water)]/15" />
      <div className="pointer-events-none absolute -end-32 bottom-10 h-80 w-80 rounded-full border border-[color:var(--home-gold)]/15" />
      <div className="container mx-auto px-4 md:px-6">

        <div className="relative z-10 mx-auto mb-12 max-w-3xl text-center sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="home-kicker mb-5">حلول نظافة تصل إليك</span>
            {(copy?.title || copy?.highlight) && (
              <h2 className="home-heading mb-4 text-3xl font-black md:text-4xl">
                {copy?.title} {copy?.highlight && <span className="text-[color:var(--home-gold)]">{copy.highlight}</span>}
              </h2>
            )}
            <div className="home-rule mb-6" />
            {copy?.description && <p className="home-copy mx-auto max-w-2xl text-base leading-8 sm:text-lg">{copy.description}</p>}
          </motion.div>
        </div>

        {activeServices.length > 0 ? (
          <div className="service-grid relative z-10 grid grid-cols-1 gap-x-5 gap-y-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-y-12">
          {activeServices.map((service, index) => {
            const raw = service as any
            const images = parseImages(raw.images, service.imageUrl)
            const Icon = iconMap[service.icon] || Settings
            const demoOffer = [1, 3].includes(index)
              ? {
                  discountPercent: index === 1 ? 20 : 15,
                  originalPrice: index === 1 ? 450 : 300,
                  salePrice: index === 1 ? 360 : 255,
                  expiresAt: "2026-09-30T23:59:59+03:00",
                }
              : undefined

            return (
              <ServiceCard
                key={service.id}
                id={service.id}
                title={service.title}
                description={service.description}
                icon={Icon}
                seoSlug={raw.seoSlug}
                images={images}
                companyName={companyName}
                detailsLabel={copy?.detailsLabel}
                index={index}
                demoOffer={demoOffer}
              />
            )
          })}
          </div>
        ) : (
          <div className="relative z-10 mx-auto max-w-xl rounded-3xl border border-[color:var(--home-line)] bg-white/80 p-10 text-center shadow-[0_14px_34px_rgba(18,56,75,.06)]" data-testid="empty-services">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[color:var(--home-water-soft)] text-[color:var(--home-water)]">
              <Settings size={25} aria-hidden="true" />
            </div>
            <h3 className="mt-5 text-xl font-black text-[color:var(--home-ink)]">الخدمات قيد التحديث</h3>
            <p className="mt-2 text-sm leading-7 text-[color:var(--home-ink-soft)]">سنعود قريباً بقائمة الخدمات المتاحة في الرياض.</p>
          </div>
        )}

      </div>
    </section>
  )
}
