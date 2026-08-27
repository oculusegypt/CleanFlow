import { useEffect, useMemo, useState } from "react"
import { Link } from "wouter"
import { motion } from "framer-motion"
import { ArrowLeft, ChevronLeft, ChevronRight, ImageOff, Images, MapPin } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useServiceRequest } from "@/context/ServiceRequestContext"

export interface ServiceCardProps {
  id: number
  title: string
  description: string
  icon: LucideIcon
  seoSlug?: string
  images?: string[]
  companyName?: string
  detailsLabel?: string
  index?: number
  demoOffer?: {
    discountPercent: number
    originalPrice: number
    salePrice: number
    expiresAt: string
  }
}

export function ServiceCard({
  id,
  title,
  description,
  icon: Icon,
  seoSlug,
  images = [],
  companyName,
  detailsLabel,
  index = 0,
  demoOffer,
}: ServiceCardProps) {
  const { openModal } = useServiceRequest()
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({})
  const targetSlug = seoSlug || String(id)
  const detailHref = `/services/${encodeURIComponent(targetSlug)}`
  const availableImages = useMemo(
    () => images.map((src, originalIndex) => ({ src, originalIndex })).filter(({ src, originalIndex }) => Boolean(src) && !imageErrors[originalIndex]),
    [images, imageErrors],
  )
  const activeImage = availableImages[activeImageIndex] ?? availableImages[0]

  useEffect(() => {
    setActiveImageIndex((current) => Math.min(current, Math.max(availableImages.length - 1, 0)))
  }, [availableImages.length])

  const moveImage = (direction: -1 | 1) => {
    if (availableImages.length < 2) return
    setActiveImageIndex((current) => (current + direction + availableImages.length) % availableImages.length)
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="service-card group relative flex h-full min-h-[31rem] flex-col overflow-hidden border-2 border-transparent bg-white transition-all duration-300 hover:-translate-y-1.5 hover:border-[color:var(--home-water)]/45 hover:shadow-[0_22px_52px_rgba(18,56,75,.14)] focus-within:-translate-y-1 focus-within:border-[color:var(--home-water)]/55 focus-within:shadow-[0_22px_52px_rgba(18,56,75,.14)]"
      dir="rtl"
      data-testid={`card-service-${id}`}
    >
      <div className="relative h-56 w-full shrink-0 overflow-hidden bg-[color:var(--home-mist)] sm:h-64">
        {activeImage ? (
          <img
            src={activeImage.src}
            alt={`${title} في الرياض — ${companyName || "السهم كلين"}`}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading={index < 2 ? "eager" : "lazy"}
            onError={(event) => {
              setImageErrors((current) => ({
                ...current,
                [activeImage.originalIndex]: true,
              }))
            }}
            data-testid={`img-service-${id}-${activeImage.originalIndex}`}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_20%_20%,rgba(58,174,165,.18),transparent_34%),linear-gradient(135deg,#e6f5f3,#f4f8f6)] px-6 text-center text-[color:var(--home-ink-soft)]">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[color:var(--home-line)] bg-white/75 text-[color:var(--home-water)] shadow-sm">
              <ImageOff size={28} strokeWidth={1.7} aria-hidden="true" />
            </div>
            <span className="text-sm font-bold">خدمة موثوقة في الرياض</span>
            <span className="text-xs text-[color:var(--home-ink-soft)]/75">تفاصيل واضحة، وتنفيذ بعناية</span>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(18,56,75,.65)] via-transparent to-[rgba(18,56,75,.08)] opacity-90" />

        <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-[rgba(18,56,75,.72)] px-3 py-1.5 text-[11px] font-extrabold text-white shadow-sm backdrop-blur-sm">
            <MapPin size={13} aria-hidden="true" />
            الرياض
          </span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/15 text-sm font-black text-white backdrop-blur-sm">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        {demoOffer && <DemoOfferBadge offer={demoOffer} />}

        {availableImages.length > 1 && (
          <div className="absolute inset-x-4 bottom-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => moveImage(-1)}
              aria-label={`الصورة السابقة لخدمة ${title}`}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-[rgba(18,56,75,.62)] text-white opacity-0 shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-[rgba(18,56,75,.9)] focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white group-hover:opacity-100"
              data-testid={`button-previous-image-${id}`}
            >
              <ChevronRight size={17} aria-hidden="true" />
            </button>
            <div className="flex items-center gap-1.5 rounded-full border border-white/20 bg-[rgba(18,56,75,.52)] px-2.5 py-1.5 backdrop-blur-sm" aria-label={`${availableImages.length} صور للخدمة`}>
              {availableImages.map(({ originalIndex }) => (
                <button
                  key={originalIndex}
                  type="button"
                  onClick={() => setActiveImageIndex(availableImages.findIndex((image) => image.originalIndex === originalIndex))}
                  aria-label={`عرض الصورة ${originalIndex + 1}`}
                  aria-current={activeImage?.originalIndex === originalIndex}
                  className={`h-1.5 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${activeImage?.originalIndex === originalIndex ? "w-5 bg-white" : "w-1.5 bg-white/55 hover:bg-white/85"}`}
                  data-testid={`button-image-dot-${id}-${originalIndex}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => moveImage(1)}
              aria-label={`الصورة التالية لخدمة ${title}`}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-[rgba(18,56,75,.62)] text-white opacity-0 shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-[rgba(18,56,75,.9)] focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white group-hover:opacity-100"
              data-testid={`button-next-image-${id}`}
            >
              <ChevronLeft size={17} aria-hidden="true" />
            </button>
          </div>
        )}
        {availableImages.length === 1 && (
          <span className="absolute bottom-4 start-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-[rgba(18,56,75,.55)] px-2.5 py-1.5 text-[10px] font-bold text-white backdrop-blur-sm">
            <Images size={13} aria-hidden="true" />
            صورة الخدمة
          </span>
        )}
      </div>

      <div className="relative z-10 flex h-full flex-col px-5 pb-5 pt-0 sm:px-6 sm:pb-6">
        <div className="-mt-7 mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border-4 border-white bg-[color:var(--home-water-soft)] text-[color:var(--home-water)] shadow-[0_8px_18px_rgba(18,56,75,.12)] transition-all duration-300 group-hover:scale-105 group-hover:bg-[color:var(--home-water)] group-hover:text-white">
          <Icon size={26} strokeWidth={1.8} aria-hidden="true" />
        </div>

        <h3 className="mb-2.5 text-xl font-black leading-tight tracking-[-.025em] text-[color:var(--home-ink)] transition-colors duration-300 group-hover:text-[color:var(--home-water)]">
          <Link href={detailHref} className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--home-gold)]" data-testid={`link-service-title-${id}`}>
            {title}
          </Link>
        </h3>

        <p className="mb-6 line-clamp-3 flex-1 text-sm leading-7 text-[color:var(--home-ink-soft)]" data-testid={`text-service-description-${id}`}>
          {description}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-[color:var(--home-line)] pt-4">
          <Link
            href={detailHref}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg text-xs font-extrabold text-[color:var(--home-water)] outline-none transition-colors hover:text-[color:var(--home-ink)] focus-visible:ring-2 focus-visible:ring-[color:var(--home-gold)]"
            data-testid={`link-service-details-${id}`}
          >
            {detailsLabel || "تفاصيل الخدمة"}
            <ArrowLeft size={15} aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={() => openModal({ serviceType: title })}
            className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[color:var(--home-ink)] px-4 py-2 text-xs font-black text-white shadow-[0_8px_16px_rgba(18,56,75,.14)] outline-none transition-all duration-200 hover:-translate-y-0.5 hover:bg-[color:var(--home-gold)] focus-visible:ring-2 focus-visible:ring-[color:var(--home-gold)] focus-visible:ring-offset-2 active:translate-y-0"
            data-testid={`button-request-service-${id}`}
          >
            اطلب الخدمة
          </button>
        </div>
      </div>
    </motion.article>
  )
}

function DemoOfferBadge({ offer }: { offer: NonNullable<ServiceCardProps["demoOffer"]> }) {
  const expiresAt = new Date(offer.expiresAt).getTime()
  const [remaining, setRemaining] = useState(() => Number.isFinite(expiresAt) ? Math.max(0, expiresAt - Date.now()) : 0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemaining(Number.isFinite(expiresAt) ? Math.max(0, expiresAt - Date.now()) : 0)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [expiresAt])

  if (!Number.isFinite(remaining) || remaining <= 0) return null
  const totalSeconds = Math.floor(remaining / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return (
    <div className="absolute inset-x-4 bottom-4 z-10 rounded-2xl border border-white/20 bg-[rgba(18,56,75,.92)] px-3 py-2.5 text-white shadow-lg backdrop-blur-md" data-testid={`badge-demo-offer-${offer.discountPercent}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full bg-[color:var(--home-gold)] px-2 py-0.5 text-[10px] font-black text-white">
          خصم تجريبي {offer.discountPercent}%
        </span>
        <span dir="ltr" className="text-[10px] font-black tabular-nums text-[#f6d994]">
          {offer.originalPrice} ر.س → {offer.salePrice} ر.س
        </span>
      </div>
      <div className="mt-1 flex items-center justify-end gap-1 text-[10px] font-bold text-[#d9efeb]">
        <span>ينتهي خلال</span>
        <span dir="ltr" className="tabular-nums">{String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}</span>
      </div>
    </div>
  )
}
